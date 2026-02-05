import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PeerRegistry } from '../peer-registry';
import type { PeerInfo } from '../peer-registry';

describe('lib/mesh PeerRegistry', () => {
  let registry: PeerRegistry;

  const peerA = {
    nodeId: 'node-a',
    host: '192.168.1.1',
    port: 8080,
    agents: ['agent-1', 'agent-2'],
  };

  const peerB = {
    nodeId: 'node-b',
    host: '192.168.1.2',
    port: 8081,
    agents: ['agent-3'],
  };

  const peerC = {
    nodeId: 'node-c',
    host: '192.168.1.3',
    port: 8082,
    agents: ['agent-1', 'agent-4'],
    metadata: { region: 'us-west' },
  };

  beforeEach(() => {
    registry = new PeerRegistry();
  });

  describe('constructor', () => {
    it('starts with no peers', () => {
      expect(registry.getAll()).toEqual([]);
    });

    it('uses default staleTimeout of 60000ms', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      registry.register(peerA);
      // Advance time to just under the 60s threshold
      vi.spyOn(Date, 'now').mockReturnValue(now + 59999);
      expect(registry.pruneStale()).toEqual([]);
      // Advance time past the threshold
      vi.spyOn(Date, 'now').mockReturnValue(now + 60001);
      expect(registry.pruneStale()).toEqual(['node-a']);
      vi.restoreAllMocks();
    });

    it('accepts custom staleTimeout', () => {
      const custom = new PeerRegistry({ staleTimeout: 5000 });
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      custom.register(peerA);
      vi.spyOn(Date, 'now').mockReturnValue(now + 5001);
      expect(custom.pruneStale()).toEqual(['node-a']);
      vi.restoreAllMocks();
    });
  });

  describe('register', () => {
    it('adds a new peer with connected status', () => {
      registry.register(peerA);
      const peer = registry.get('node-a');
      expect(peer).toBeDefined();
      expect(peer!.status).toBe('connected');
      expect(peer!.host).toBe('192.168.1.1');
      expect(peer!.port).toBe(8080);
      expect(peer!.agents).toEqual(['agent-1', 'agent-2']);
    });

    it('sets lastSeen to current time', () => {
      const before = Date.now();
      registry.register(peerA);
      const after = Date.now();
      const peer = registry.get('node-a')!;
      expect(peer.lastSeen).toBeGreaterThanOrEqual(before);
      expect(peer.lastSeen).toBeLessThanOrEqual(after);
    });

    it('emits peer:joined for new peers', () => {
      const handler = vi.fn();
      registry.on('peer:joined', handler);
      registry.register(peerA);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ nodeId: 'node-a', status: 'connected' })
      );
    });

    it('emits peer:updated when re-registering existing peer', () => {
      registry.register(peerA);
      const handler = vi.fn();
      registry.on('peer:updated', handler);
      registry.register({ ...peerA, port: 9090 });
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ nodeId: 'node-a', port: 9090 })
      );
    });

    it('does not emit peer:joined when updating existing peer', () => {
      registry.register(peerA);
      const handler = vi.fn();
      registry.on('peer:joined', handler);
      registry.register(peerA);
      expect(handler).not.toHaveBeenCalled();
    });

    it('preserves metadata when provided', () => {
      registry.register(peerC);
      const peer = registry.get('node-c')!;
      expect(peer.metadata).toEqual({ region: 'us-west' });
    });
  });

  describe('disconnect', () => {
    it('marks an existing peer as disconnected', () => {
      registry.register(peerA);
      registry.disconnect('node-a');
      expect(registry.get('node-a')!.status).toBe('disconnected');
    });

    it('emits peer:left event', () => {
      registry.register(peerA);
      const handler = vi.fn();
      registry.on('peer:left', handler);
      registry.disconnect('node-a');
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ nodeId: 'node-a', status: 'disconnected' })
      );
    });

    it('does nothing for non-existent peer', () => {
      const handler = vi.fn();
      registry.on('peer:left', handler);
      registry.disconnect('non-existent');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes a peer from the registry', () => {
      registry.register(peerA);
      registry.remove('node-a');
      expect(registry.get('node-a')).toBeUndefined();
    });

    it('emits peer:removed event', () => {
      registry.register(peerA);
      const handler = vi.fn();
      registry.on('peer:removed', handler);
      registry.remove('node-a');
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ nodeId: 'node-a' })
      );
    });

    it('does nothing for non-existent peer', () => {
      const handler = vi.fn();
      registry.on('peer:removed', handler);
      registry.remove('non-existent');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('returns the peer for a valid nodeId', () => {
      registry.register(peerA);
      const peer = registry.get('node-a');
      expect(peer).toBeDefined();
      expect(peer!.nodeId).toBe('node-a');
    });

    it('returns undefined for unknown nodeId', () => {
      expect(registry.get('unknown')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('returns all registered peers', () => {
      registry.register(peerA);
      registry.register(peerB);
      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all.map((p) => p.nodeId).sort()).toEqual(['node-a', 'node-b']);
    });

    it('includes disconnected peers', () => {
      registry.register(peerA);
      registry.register(peerB);
      registry.disconnect('node-a');
      expect(registry.getAll()).toHaveLength(2);
    });
  });

  describe('getConnected', () => {
    it('returns only connected peers', () => {
      registry.register(peerA);
      registry.register(peerB);
      registry.disconnect('node-a');
      const connected = registry.getConnected();
      expect(connected).toHaveLength(1);
      expect(connected[0].nodeId).toBe('node-b');
    });

    it('returns empty array when no peers are connected', () => {
      registry.register(peerA);
      registry.disconnect('node-a');
      expect(registry.getConnected()).toEqual([]);
    });
  });

  describe('findPeersWithAgent', () => {
    it('finds connected peers hosting a specific agent', () => {
      registry.register(peerA); // has agent-1, agent-2
      registry.register(peerC); // has agent-1, agent-4
      const peers = registry.findPeersWithAgent('agent-1');
      expect(peers).toHaveLength(2);
      expect(peers.map((p) => p.nodeId).sort()).toEqual(['node-a', 'node-c']);
    });

    it('excludes disconnected peers', () => {
      registry.register(peerA);
      registry.register(peerC);
      registry.disconnect('node-a');
      const peers = registry.findPeersWithAgent('agent-1');
      expect(peers).toHaveLength(1);
      expect(peers[0].nodeId).toBe('node-c');
    });

    it('returns empty array when no peer has the agent', () => {
      registry.register(peerA);
      expect(registry.findPeersWithAgent('agent-999')).toEqual([]);
    });
  });

  describe('heartbeat', () => {
    it('updates lastSeen timestamp', () => {
      registry.register(peerA);
      const originalLastSeen = registry.get('node-a')!.lastSeen;
      // Small delay to ensure different timestamp
      const future = originalLastSeen + 1000;
      vi.spyOn(Date, 'now').mockReturnValue(future);
      registry.heartbeat('node-a');
      expect(registry.get('node-a')!.lastSeen).toBe(future);
      vi.restoreAllMocks();
    });

    it('sets status to connected (reconnects disconnected peer)', () => {
      registry.register(peerA);
      registry.disconnect('node-a');
      expect(registry.get('node-a')!.status).toBe('disconnected');
      registry.heartbeat('node-a');
      expect(registry.get('node-a')!.status).toBe('connected');
    });

    it('does nothing for non-existent peer', () => {
      // Should not throw
      expect(() => registry.heartbeat('non-existent')).not.toThrow();
    });
  });

  describe('pruneStale', () => {
    it('marks peers as disconnected when staleTimeout exceeded', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      registry.register(peerA);
      vi.spyOn(Date, 'now').mockReturnValue(now + 60001);
      const stale = registry.pruneStale();
      expect(stale).toEqual(['node-a']);
      expect(registry.get('node-a')!.status).toBe('disconnected');
      vi.restoreAllMocks();
    });

    it('does not prune peers within staleTimeout', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      registry.register(peerA);
      vi.spyOn(Date, 'now').mockReturnValue(now + 30000);
      expect(registry.pruneStale()).toEqual([]);
      expect(registry.get('node-a')!.status).toBe('connected');
      vi.restoreAllMocks();
    });

    it('does not prune already-disconnected peers', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      registry.register(peerA);
      registry.disconnect('node-a');
      vi.spyOn(Date, 'now').mockReturnValue(now + 60001);
      expect(registry.pruneStale()).toEqual([]);
      vi.restoreAllMocks();
    });

    it('emits peer:stale event for each stale peer', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      registry.register(peerA);
      registry.register(peerB);
      const handler = vi.fn();
      registry.on('peer:stale', handler);
      vi.spyOn(Date, 'now').mockReturnValue(now + 60001);
      registry.pruneStale();
      expect(handler).toHaveBeenCalledTimes(2);
      vi.restoreAllMocks();
    });

    it('returns multiple stale peer IDs', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      registry.register(peerA);
      registry.register(peerB);
      vi.spyOn(Date, 'now').mockReturnValue(now + 60001);
      const stale = registry.pruneStale();
      expect(stale.sort()).toEqual(['node-a', 'node-b']);
      vi.restoreAllMocks();
    });
  });

  describe('getStats', () => {
    it('returns zeroes for empty registry', () => {
      expect(registry.getStats()).toEqual({
        total: 0,
        connected: 0,
        disconnected: 0,
        totalAgents: 0,
      });
    });

    it('counts connected and disconnected peers correctly', () => {
      registry.register(peerA);
      registry.register(peerB);
      registry.disconnect('node-b');
      const stats = registry.getStats();
      expect(stats.total).toBe(2);
      expect(stats.connected).toBe(1);
      expect(stats.disconnected).toBe(1);
    });

    it('counts unique agents from connected peers only', () => {
      registry.register(peerA); // agent-1, agent-2
      registry.register(peerC); // agent-1, agent-4
      const stats = registry.getStats();
      // agent-1 (shared), agent-2, agent-4 = 3 unique
      expect(stats.totalAgents).toBe(3);
    });

    it('excludes agents from disconnected peers', () => {
      registry.register(peerA); // agent-1, agent-2
      registry.register(peerB); // agent-3
      registry.disconnect('node-b');
      const stats = registry.getStats();
      expect(stats.totalAgents).toBe(2); // only agent-1, agent-2 from peerA
    });
  });

  describe('serialize / restore', () => {
    it('serializes to a valid JSON string', () => {
      registry.register(peerA);
      const serialized = registry.serialize();
      expect(() => JSON.parse(serialized)).not.toThrow();
    });

    it('restores peers from serialized data', () => {
      registry.register(peerA);
      registry.register(peerB);
      const serialized = registry.serialize();

      const newRegistry = new PeerRegistry();
      newRegistry.restore(serialized);
      expect(newRegistry.getAll()).toHaveLength(2);
    });

    it('marks restored peers as unknown status', () => {
      registry.register(peerA);
      const serialized = registry.serialize();

      const newRegistry = new PeerRegistry();
      newRegistry.restore(serialized);
      const peer = newRegistry.get('node-a');
      expect(peer).toBeDefined();
      expect(peer!.status).toBe('unknown');
    });

    it('preserves peer data through serialize/restore roundtrip', () => {
      registry.register(peerC); // has metadata
      const serialized = registry.serialize();

      const newRegistry = new PeerRegistry();
      newRegistry.restore(serialized);
      const restored = newRegistry.get('node-c')!;
      expect(restored.nodeId).toBe('node-c');
      expect(restored.host).toBe('192.168.1.3');
      expect(restored.port).toBe(8082);
      expect(restored.agents).toEqual(['agent-1', 'agent-4']);
      expect(restored.metadata).toEqual({ region: 'us-west' });
    });
  });
});
