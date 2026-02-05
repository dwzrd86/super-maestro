/**
 * ConversationStore
 *
 * Manages conversation history with:
 * - Message threading
 * - Role tracking (user, assistant, system)
 * - Metadata for context
 */

import type { AgentDatabase } from './database';
import { v4 as uuid } from 'uuid';

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
  messages?: Message[];
}

export class ConversationStore {
  constructor(private readonly db: AgentDatabase) {}

  /**
   * Create a new conversation.
   */
  async createConversation(title?: string): Promise<Conversation> {
    const id = uuid();
    const now = Date.now();

    await this.db.mutate(`
      ?[id, title, created_at, updated_at, metadata] <- [[
        $id, $title, $now, $now, '{}'
      ]]
      :put conversations { id => title, created_at, updated_at, metadata }
    `, { id, title: title ?? '', now });

    return {
      id,
      title: title ?? '',
      createdAt: new Date(now),
      updatedAt: new Date(now),
      metadata: {},
    };
  }

  /**
   * Get a conversation by ID.
   */
  async getConversation(id: string, includeMessages = false): Promise<Conversation | null> {
    const results = await this.db.query<{
      id: string;
      title: string;
      created_at: number;
      updated_at: number;
      metadata: string;
    }>(`
      ?[id, title, created_at, updated_at, metadata] :=
        *conversations{ id: $id, title, created_at, updated_at, metadata }
    `, { id });

    if (results.length === 0) return null;

    const row = results[0];
    const conversation: Conversation = {
      id: row.id,
      title: row.title,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      metadata: JSON.parse(row.metadata),
    };

    if (includeMessages) {
      conversation.messages = await this.getMessages(id);
    }

    return conversation;
  }

  /**
   * List all conversations.
   */
  async listConversations(limit = 50): Promise<Conversation[]> {
    const results = await this.db.query<{
      id: string;
      title: string;
      created_at: number;
      updated_at: number;
      metadata: string;
    }>(`
      ?[id, title, created_at, updated_at, metadata] :=
        *conversations{ id, title, created_at, updated_at, metadata }
      :order -updated_at
      :limit ${limit}
    `);

    return results.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      metadata: JSON.parse(row.metadata),
    }));
  }

  /**
   * Add a message to a conversation.
   */
  async addMessage(message: Omit<Message, 'id'>): Promise<Message> {
    const id = uuid();
    const timestamp = message.timestamp.getTime();

    await this.db.mutate(`
      ?[id, conversation_id, role, content, timestamp, metadata] <- [[
        $id, $conversation_id, $role, $content, $timestamp, $metadata
      ]]
      :put messages {
        id =>
        conversation_id,
        role,
        content,
        timestamp,
        metadata
      }
    `, {
      id,
      conversation_id: message.conversationId,
      role: message.role,
      content: message.content,
      timestamp,
      metadata: JSON.stringify(message.metadata),
    });

    // Update conversation timestamp
    await this.db.mutate(`
      ?[id, updated_at] <- [[$conversation_id, $now]]
      :update conversations { id => updated_at }
    `, { conversation_id: message.conversationId, now: timestamp });

    return {
      id,
      ...message,
    };
  }

  /**
   * Get messages for a conversation.
   */
  async getMessages(conversationId: string, limit = 100): Promise<Message[]> {
    const results = await this.db.query<{
      id: string;
      conversation_id: string;
      role: string;
      content: string;
      timestamp: number;
      metadata: string;
    }>(`
      ?[id, conversation_id, role, content, timestamp, metadata] :=
        *messages{ id, conversation_id: $conversation_id, role, content, timestamp, metadata }
      :order timestamp
      :limit ${limit}
    `, { conversation_id: conversationId });

    return results.map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      role: row.role as Message['role'],
      content: row.content,
      timestamp: new Date(row.timestamp),
      metadata: JSON.parse(row.metadata),
    }));
  }

  /**
   * Search messages across all conversations.
   */
  async searchMessages(query: string, limit = 20): Promise<Message[]> {
    // Simple substring search for now
    // TODO: Implement full-text search
    const results = await this.db.query<{
      id: string;
      conversation_id: string;
      role: string;
      content: string;
      timestamp: number;
      metadata: string;
    }>(`
      ?[id, conversation_id, role, content, timestamp, metadata] :=
        *messages{ id, conversation_id, role, content, timestamp, metadata },
        contains(content, $query)
      :order -timestamp
      :limit ${limit}
    `, { query });

    return results.map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      role: row.role as Message['role'],
      content: row.content,
      timestamp: new Date(row.timestamp),
      metadata: JSON.parse(row.metadata),
    }));
  }

  /**
   * Delete a conversation and all its messages.
   */
  async deleteConversation(id: string): Promise<void> {
    // Delete messages first
    await this.db.mutate(`
      ?[id] := *messages{ id, conversation_id: $conversation_id }
      :delete messages { id }
    `, { conversation_id: id });

    // Then delete conversation
    await this.db.mutate(`
      ?[id] <- [[$id]]
      :delete conversations { id }
    `, { id });
  }
}
