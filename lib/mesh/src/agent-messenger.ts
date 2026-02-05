/**
 * AgentMessenger
 *
 * High-level agent-to-agent messaging abstraction.
 * Supports:
 * - Direct messaging between agents
 * - Priority-based delivery
 * - Message queuing for offline agents
 * - Cross-node message routing
 */

import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import type { MeshNode } from './node';
import { MeshMessage } from './message';

export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface AgentMessage {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  content: string;
  priority: MessagePriority;
  timestamp: number;
  metadata?: Record<string, unknown>;
  read: boolean;
}

export class AgentMessenger extends EventEmitter {
  private readonly node: MeshNode;
  private inbox: Map<string, AgentMessage[]> = new Map(); // agentId -> messages
  private outbox: Map<string, AgentMessage[]> = new Map(); // agentId -> pending messages

  constructor(node: MeshNode) {
    super();
    this.node = node;

    // Handle incoming agent messages
    this.node.on('agent:message', (message) => {
      this.handleIncomingMessage(message);
    });
  }

  /**
   * Send a message from one agent to another.
   */
  async send(
    fromAgentId: string,
    toAgentId: string,
    content: string,
    options: {
      priority?: MessagePriority;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: uuid(),
      fromAgentId,
      toAgentId,
      content,
      priority: options.priority ?? 'normal',
      timestamp: Date.now(),
      metadata: options.metadata,
      read: false,
    };

    // Check if recipient is local
    const localAgents = this.node.getLocalAgents();
    if (localAgents.includes(toAgentId)) {
      // Deliver locally
      this.deliverLocally(message);
    } else {
      // Find peer that has the agent
      const peers = this.node.getPeerRegistry().findPeersWithAgent(toAgentId);

      if (peers.length > 0) {
        // Send to first available peer
        const meshMessage = new MeshMessage({
          type: 'agent:message',
          payload: {
            fromAgentId: message.fromAgentId,
            toAgentId: message.toAgentId,
            content: message.content,
            priority: message.priority,
            metadata: message.metadata,
          },
          sourceNodeId: this.node.nodeId,
          targetNodeId: peers[0].nodeId,
        });

        const sent = this.node.send(peers[0].nodeId, meshMessage);
        if (!sent) {
          // Queue for later
          this.queueOutgoing(message);
        }
      } else {
        // No peer found, queue for later
        this.queueOutgoing(message);
      }
    }

    return message;
  }

  /**
   * Get inbox for an agent.
   */
  getInbox(agentId: string): AgentMessage[] {
    return this.inbox.get(agentId) ?? [];
  }

  /**
   * Get unread messages for an agent.
   */
  getUnread(agentId: string): AgentMessage[] {
    return this.getInbox(agentId).filter((m) => !m.read);
  }

  /**
   * Mark a message as read.
   */
  markRead(agentId: string, messageId: string): void {
    const messages = this.inbox.get(agentId);
    if (messages) {
      const message = messages.find((m) => m.id === messageId);
      if (message) {
        message.read = true;
      }
    }
  }

  /**
   * Mark all messages as read for an agent.
   */
  markAllRead(agentId: string): void {
    const messages = this.inbox.get(agentId);
    if (messages) {
      for (const message of messages) {
        message.read = true;
      }
    }
  }

  /**
   * Delete a message from inbox.
   */
  delete(agentId: string, messageId: string): void {
    const messages = this.inbox.get(agentId);
    if (messages) {
      const index = messages.findIndex((m) => m.id === messageId);
      if (index !== -1) {
        messages.splice(index, 1);
      }
    }
  }

  /**
   * Clear inbox for an agent.
   */
  clearInbox(agentId: string): void {
    this.inbox.delete(agentId);
  }

  /**
   * Get outbox (pending messages) for an agent.
   */
  getOutbox(agentId: string): AgentMessage[] {
    return this.outbox.get(agentId) ?? [];
  }

  /**
   * Retry sending pending messages.
   */
  async retryPending(): Promise<number> {
    let sent = 0;

    for (const [agentId, messages] of this.outbox) {
      const remaining: AgentMessage[] = [];

      for (const message of messages) {
        const peers = this.node.getPeerRegistry().findPeersWithAgent(message.toAgentId);

        if (peers.length > 0) {
          const meshMessage = new MeshMessage({
            type: 'agent:message',
            payload: {
              fromAgentId: message.fromAgentId,
              toAgentId: message.toAgentId,
              content: message.content,
              priority: message.priority,
              metadata: message.metadata,
            },
            sourceNodeId: this.node.nodeId,
            targetNodeId: peers[0].nodeId,
          });

          if (this.node.send(peers[0].nodeId, meshMessage)) {
            sent++;
            continue;
          }
        }

        // Still can't send, keep in outbox
        remaining.push(message);
      }

      if (remaining.length > 0) {
        this.outbox.set(agentId, remaining);
      } else {
        this.outbox.delete(agentId);
      }
    }

    return sent;
  }

  private handleIncomingMessage(meshMessage: MeshMessage<'agent:message'>): void {
    const { fromAgentId, toAgentId, content, priority, metadata } = meshMessage.payload;

    const message: AgentMessage = {
      id: uuid(),
      fromAgentId,
      toAgentId,
      content,
      priority,
      timestamp: meshMessage.timestamp,
      metadata,
      read: false,
    };

    // Check if recipient is local
    const localAgents = this.node.getLocalAgents();
    if (localAgents.includes(toAgentId)) {
      this.deliverLocally(message);
    } else {
      // Not our agent, ignore (or could forward in future)
      console.warn(`[messenger] Received message for unknown agent: ${toAgentId}`);
    }
  }

  private deliverLocally(message: AgentMessage): void {
    const messages = this.inbox.get(message.toAgentId) ?? [];
    messages.push(message);

    // Sort by priority and timestamp
    messages.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    this.inbox.set(message.toAgentId, messages);
    this.emit('message', message);
    this.emit(`message:${message.toAgentId}`, message);
  }

  private queueOutgoing(message: AgentMessage): void {
    const messages = this.outbox.get(message.fromAgentId) ?? [];
    messages.push(message);
    this.outbox.set(message.fromAgentId, messages);
    this.emit('queued', message);
  }
}
