/**
 * Mesh Message Types
 *
 * Defines the protocol for mesh communication.
 */

import { v4 as uuid } from 'uuid';

export type MeshMessageType =
  // Discovery
  | 'discover'
  | 'announce'
  | 'heartbeat'
  // Agent operations
  | 'agent:list'
  | 'agent:info'
  | 'agent:message'
  | 'agent:transfer'
  // Task operations
  | 'task:assign'
  | 'task:status'
  | 'task:result'
  // System
  | 'error'
  | 'ack';

export interface MeshMessagePayload {
  // Discovery payloads
  discover: { nodeId: string };
  announce: { nodeId: string; host: string; port: number; agents: string[] };
  heartbeat: { nodeId: string; timestamp: number };

  // Agent payloads
  'agent:list': { nodeId: string };
  'agent:info': { agentId: string };
  'agent:message': {
    fromAgentId: string;
    toAgentId: string;
    content: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    metadata?: Record<string, unknown>;
  };
  'agent:transfer': {
    agentId: string;
    targetNodeId: string;
    data: string; // Base64 encoded agent export
  };

  // Task payloads
  'task:assign': {
    taskId: string;
    agentId: string;
    type: string;
    payload: unknown;
  };
  'task:status': {
    taskId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress?: number;
  };
  'task:result': {
    taskId: string;
    success: boolean;
    result?: unknown;
    error?: string;
  };

  // System payloads
  error: { code: string; message: string };
  ack: { messageId: string };
}

export class MeshMessage<T extends MeshMessageType = MeshMessageType> {
  readonly id: string;
  readonly type: T;
  readonly payload: MeshMessagePayload[T];
  readonly sourceNodeId: string;
  readonly targetNodeId?: string;
  readonly timestamp: number;

  constructor(options: {
    type: T;
    payload: MeshMessagePayload[T];
    sourceNodeId: string;
    targetNodeId?: string;
    id?: string;
    timestamp?: number;
  }) {
    this.id = options.id ?? uuid();
    this.type = options.type;
    this.payload = options.payload;
    this.sourceNodeId = options.sourceNodeId;
    this.targetNodeId = options.targetNodeId;
    this.timestamp = options.timestamp ?? Date.now();
  }

  /**
   * Serialize message for transmission.
   */
  serialize(): string {
    return JSON.stringify({
      id: this.id,
      type: this.type,
      payload: this.payload,
      sourceNodeId: this.sourceNodeId,
      targetNodeId: this.targetNodeId,
      timestamp: this.timestamp,
    });
  }

  /**
   * Deserialize message from string.
   */
  static deserialize(data: string): MeshMessage {
    const parsed = JSON.parse(data);
    return new MeshMessage({
      id: parsed.id,
      type: parsed.type,
      payload: parsed.payload,
      sourceNodeId: parsed.sourceNodeId,
      targetNodeId: parsed.targetNodeId,
      timestamp: parsed.timestamp,
    });
  }

  /**
   * Create an acknowledgment for this message.
   */
  createAck(sourceNodeId: string): MeshMessage<'ack'> {
    return new MeshMessage({
      type: 'ack',
      payload: { messageId: this.id },
      sourceNodeId,
      targetNodeId: this.sourceNodeId,
    });
  }

  /**
   * Create an error response for this message.
   */
  createError(sourceNodeId: string, code: string, message: string): MeshMessage<'error'> {
    return new MeshMessage({
      type: 'error',
      payload: { code, message },
      sourceNodeId,
      targetNodeId: this.sourceNodeId,
    });
  }
}
