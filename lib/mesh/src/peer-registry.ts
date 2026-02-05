/**
 * Peer Registry
 *
 * Tracks known peers in the mesh network.
 */

import { EventEmitter } from 'events';

export type PeerStatus = 'connected' | 'disconnected' | 'unknown';

export interface PeerInfo {
  nodeId: string;
  host: string;
  port: number;
  status: PeerStatus;
  lastSeen: number;
  agents: string[];
  metadata?: Record<string, unknown>;
}

export class PeerRegistry extends EventEmitter {
  private peers: Map<string, PeerInfo> = new Map();
  private readonly staleTimeout: number;

  constructor(options: { staleTimeout?: number } = {}) {
    super();
    this.staleTimeout = options.staleTimeout ?? 60000; // 1 minute
  }

  /**
   * Register or update a peer.
   */
  register(info: Omit<PeerInfo, 'status' | 'lastSeen'>): void {
    const existing = this.peers.get(info.nodeId);
    const peer: PeerInfo = {
      ...info,
      status: 'connected',
      lastSeen: Date.now(),
    };

    this.peers.set(info.nodeId, peer);

    if (!existing) {
      this.emit('peer:joined', peer);
    } else {
      this.emit('peer:updated', peer);
    }
  }

  /**
   * Mark a peer as disconnected.
   */
  disconnect(nodeId: string): void {
    const peer = this.peers.get(nodeId);
    if (peer) {
      peer.status = 'disconnected';
      this.emit('peer:left', peer);
    }
  }

  /**
   * Remove a peer from the registry.
   */
  remove(nodeId: string): void {
    const peer = this.peers.get(nodeId);
    if (peer) {
      this.peers.delete(nodeId);
      this.emit('peer:removed', peer);
    }
  }

  /**
   * Get a peer by node ID.
   */
  get(nodeId: string): PeerInfo | undefined {
    return this.peers.get(nodeId);
  }

  /**
   * Get all peers.
   */
  getAll(): PeerInfo[] {
    return Array.from(this.peers.values());
  }

  /**
   * Get connected peers only.
   */
  getConnected(): PeerInfo[] {
    return this.getAll().filter((p) => p.status === 'connected');
  }

  /**
   * Find peers that have a specific agent.
   */
  findPeersWithAgent(agentId: string): PeerInfo[] {
    return this.getConnected().filter((p) => p.agents.includes(agentId));
  }

  /**
   * Update heartbeat for a peer.
   */
  heartbeat(nodeId: string): void {
    const peer = this.peers.get(nodeId);
    if (peer) {
      peer.lastSeen = Date.now();
      peer.status = 'connected';
    }
  }

  /**
   * Mark stale peers as disconnected.
   */
  pruneStale(): string[] {
    const now = Date.now();
    const stale: string[] = [];

    for (const [nodeId, peer] of this.peers) {
      if (peer.status === 'connected' && now - peer.lastSeen > this.staleTimeout) {
        peer.status = 'disconnected';
        stale.push(nodeId);
        this.emit('peer:stale', peer);
      }
    }

    return stale;
  }

  /**
   * Get statistics about the mesh.
   */
  getStats(): {
    total: number;
    connected: number;
    disconnected: number;
    totalAgents: number;
  } {
    const peers = this.getAll();
    const connected = peers.filter((p) => p.status === 'connected');
    const disconnected = peers.filter((p) => p.status === 'disconnected');

    const agentSet = new Set<string>();
    for (const peer of connected) {
      for (const agent of peer.agents) {
        agentSet.add(agent);
      }
    }

    return {
      total: peers.length,
      connected: connected.length,
      disconnected: disconnected.length,
      totalAgents: agentSet.size,
    };
  }

  /**
   * Serialize registry for persistence.
   */
  serialize(): string {
    return JSON.stringify(Array.from(this.peers.entries()));
  }

  /**
   * Restore registry from serialized data.
   */
  restore(data: string): void {
    const entries = JSON.parse(data) as [string, PeerInfo][];
    for (const [nodeId, info] of entries) {
      // Mark restored peers as unknown until they reconnect
      this.peers.set(nodeId, { ...info, status: 'unknown' });
    }
  }
}
