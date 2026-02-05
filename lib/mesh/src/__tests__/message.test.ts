import { describe, it, expect } from 'vitest';
import { MeshMessage } from '../message';

describe('lib/mesh MeshMessage', () => {
  const baseOptions = {
    type: 'discover' as const,
    payload: { nodeId: 'node-1' },
    sourceNodeId: 'source-node',
  };

  describe('construction', () => {
    it('assigns a UUID id when none provided', () => {
      const msg = new MeshMessage(baseOptions);
      expect(msg.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('uses provided id when given', () => {
      const msg = new MeshMessage({ ...baseOptions, id: 'custom-id' });
      expect(msg.id).toBe('custom-id');
    });

    it('assigns a numeric timestamp when none provided', () => {
      const before = Date.now();
      const msg = new MeshMessage(baseOptions);
      const after = Date.now();
      expect(msg.timestamp).toBeGreaterThanOrEqual(before);
      expect(msg.timestamp).toBeLessThanOrEqual(after);
    });

    it('uses provided timestamp when given', () => {
      const msg = new MeshMessage({ ...baseOptions, timestamp: 1234567890 });
      expect(msg.timestamp).toBe(1234567890);
    });

    it('stores type and payload correctly', () => {
      const msg = new MeshMessage(baseOptions);
      expect(msg.type).toBe('discover');
      expect(msg.payload).toEqual({ nodeId: 'node-1' });
    });

    it('stores sourceNodeId', () => {
      const msg = new MeshMessage(baseOptions);
      expect(msg.sourceNodeId).toBe('source-node');
    });

    it('stores targetNodeId when provided', () => {
      const msg = new MeshMessage({ ...baseOptions, targetNodeId: 'target-node' });
      expect(msg.targetNodeId).toBe('target-node');
    });

    it('leaves targetNodeId undefined when not provided', () => {
      const msg = new MeshMessage(baseOptions);
      expect(msg.targetNodeId).toBeUndefined();
    });
  });

  describe('serialize', () => {
    it('returns a valid JSON string', () => {
      const msg = new MeshMessage(baseOptions);
      const serialized = msg.serialize();
      expect(() => JSON.parse(serialized)).not.toThrow();
    });

    it('includes all message fields', () => {
      const msg = new MeshMessage({
        ...baseOptions,
        id: 'test-id',
        targetNodeId: 'target-node',
        timestamp: 9999,
      });
      const parsed = JSON.parse(msg.serialize());
      expect(parsed).toEqual({
        id: 'test-id',
        type: 'discover',
        payload: { nodeId: 'node-1' },
        sourceNodeId: 'source-node',
        targetNodeId: 'target-node',
        timestamp: 9999,
      });
    });

    it('omits undefined targetNodeId from serialized output', () => {
      const msg = new MeshMessage(baseOptions);
      const serialized = msg.serialize();
      const parsed = JSON.parse(serialized);
      expect(parsed.targetNodeId).toBeUndefined();
    });
  });

  describe('deserialize', () => {
    it('reconstructs a MeshMessage from a JSON string', () => {
      const json = JSON.stringify({
        id: 'deser-id',
        type: 'heartbeat',
        payload: { nodeId: 'hb-node', timestamp: 100 },
        sourceNodeId: 'src',
        targetNodeId: 'tgt',
        timestamp: 555,
      });
      const msg = MeshMessage.deserialize(json);
      expect(msg).toBeInstanceOf(MeshMessage);
      expect(msg.id).toBe('deser-id');
      expect(msg.type).toBe('heartbeat');
      expect(msg.payload).toEqual({ nodeId: 'hb-node', timestamp: 100 });
      expect(msg.sourceNodeId).toBe('src');
      expect(msg.targetNodeId).toBe('tgt');
      expect(msg.timestamp).toBe(555);
    });

    it('throws on invalid JSON', () => {
      expect(() => MeshMessage.deserialize('not json')).toThrow();
    });
  });

  describe('serialize/deserialize roundtrip', () => {
    it('preserves discover message through roundtrip', () => {
      const original = new MeshMessage({
        type: 'discover',
        payload: { nodeId: 'node-abc' },
        sourceNodeId: 'src-1',
        id: 'rt-1',
        timestamp: 1000,
      });
      const restored = MeshMessage.deserialize(original.serialize());
      expect(restored.id).toBe(original.id);
      expect(restored.type).toBe(original.type);
      expect(restored.payload).toEqual(original.payload);
      expect(restored.sourceNodeId).toBe(original.sourceNodeId);
      expect(restored.timestamp).toBe(original.timestamp);
    });

    it('preserves announce message with complex payload', () => {
      const original = new MeshMessage({
        type: 'announce' as const,
        payload: { nodeId: 'n1', host: '192.168.1.1', port: 8080, agents: ['a1', 'a2'] },
        sourceNodeId: 'src-2',
        targetNodeId: 'tgt-2',
        id: 'rt-2',
        timestamp: 2000,
      });
      const restored = MeshMessage.deserialize(original.serialize());
      expect(restored.id).toBe(original.id);
      expect(restored.type).toBe(original.type);
      expect(restored.payload).toEqual(original.payload);
      expect(restored.sourceNodeId).toBe(original.sourceNodeId);
      expect(restored.targetNodeId).toBe(original.targetNodeId);
      expect(restored.timestamp).toBe(original.timestamp);
    });

    it('preserves agent:message with metadata', () => {
      const original = new MeshMessage({
        type: 'agent:message' as const,
        payload: {
          fromAgentId: 'agent-a',
          toAgentId: 'agent-b',
          content: 'Hello agent!',
          priority: 'high' as const,
          metadata: { key: 'value', nested: { deep: true } },
        },
        sourceNodeId: 'src-3',
        targetNodeId: 'tgt-3',
        id: 'rt-3',
        timestamp: 3000,
      });
      const restored = MeshMessage.deserialize(original.serialize());
      expect(restored.payload).toEqual(original.payload);
    });

    it('preserves task:result with nested result data', () => {
      const original = new MeshMessage({
        type: 'task:result' as const,
        payload: {
          taskId: 'task-1',
          success: true,
          result: { data: [1, 2, 3], summary: 'ok' },
        },
        sourceNodeId: 'src-4',
        id: 'rt-4',
        timestamp: 4000,
      });
      const restored = MeshMessage.deserialize(original.serialize());
      expect(restored.payload).toEqual(original.payload);
    });

    it('preserves error message through roundtrip', () => {
      const original = new MeshMessage({
        type: 'error' as const,
        payload: { code: 'E_TIMEOUT', message: 'Connection timed out' },
        sourceNodeId: 'src-5',
        targetNodeId: 'tgt-5',
        id: 'rt-5',
        timestamp: 5000,
      });
      const restored = MeshMessage.deserialize(original.serialize());
      expect(restored.type).toBe('error');
      expect(restored.payload).toEqual({ code: 'E_TIMEOUT', message: 'Connection timed out' });
    });
  });

  describe('createAck', () => {
    it('returns a MeshMessage of type ack', () => {
      const original = new MeshMessage({ ...baseOptions, id: 'orig-id' });
      const ack = original.createAck('ack-source');
      expect(ack).toBeInstanceOf(MeshMessage);
      expect(ack.type).toBe('ack');
    });

    it('references the original message id in payload', () => {
      const original = new MeshMessage({ ...baseOptions, id: 'orig-id' });
      const ack = original.createAck('ack-source');
      expect(ack.payload).toEqual({ messageId: 'orig-id' });
    });

    it('sets sourceNodeId to the provided value', () => {
      const original = new MeshMessage(baseOptions);
      const ack = original.createAck('ack-node');
      expect(ack.sourceNodeId).toBe('ack-node');
    });

    it('sets targetNodeId to the original sourceNodeId', () => {
      const original = new MeshMessage(baseOptions);
      const ack = original.createAck('ack-node');
      expect(ack.targetNodeId).toBe(baseOptions.sourceNodeId);
    });
  });

  describe('createError', () => {
    it('returns a MeshMessage of type error', () => {
      const original = new MeshMessage(baseOptions);
      const err = original.createError('err-source', 'E_FAIL', 'Something failed');
      expect(err).toBeInstanceOf(MeshMessage);
      expect(err.type).toBe('error');
    });

    it('includes the error code and message in payload', () => {
      const original = new MeshMessage(baseOptions);
      const err = original.createError('err-source', 'E_PARSE', 'Bad data');
      expect(err.payload).toEqual({ code: 'E_PARSE', message: 'Bad data' });
    });

    it('sets sourceNodeId to the provided value', () => {
      const original = new MeshMessage(baseOptions);
      const err = original.createError('err-node', 'E_FAIL', 'fail');
      expect(err.sourceNodeId).toBe('err-node');
    });

    it('sets targetNodeId to the original sourceNodeId', () => {
      const original = new MeshMessage(baseOptions);
      const err = original.createError('err-node', 'E_FAIL', 'fail');
      expect(err.targetNodeId).toBe(baseOptions.sourceNodeId);
    });
  });
});
