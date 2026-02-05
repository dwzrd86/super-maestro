/**
 * MemoryStore
 *
 * Manages semantic memory entries with:
 * - Vector embeddings for similarity search
 * - Importance decay over time
 * - Access tracking for relevance
 */

import type { AgentDatabase } from './database';

export interface MemoryEntry {
  id: string;
  content: string;
  embedding?: number[];
  category: string;
  importance: number;
  createdAt: Date;
  accessedAt: Date;
  accessCount: number;
  metadata: Record<string, unknown>;
}

export interface SearchOptions {
  /** Query embedding for similarity search */
  embedding?: number[];

  /** Text query for keyword search */
  query?: string;

  /** Filter by category */
  category?: string;

  /** Minimum importance threshold */
  minImportance?: number;

  /** Maximum results to return */
  limit?: number;

  /** Use hybrid search (embedding + keyword) */
  hybrid?: boolean;
}

export interface SearchResult {
  entry: MemoryEntry;
  score: number;
}

export class MemoryStore {
  constructor(private readonly db: AgentDatabase) {}

  /**
   * Store a new memory entry.
   */
  async store(entry: Omit<MemoryEntry, 'accessedAt' | 'accessCount'>): Promise<void> {
    const now = Date.now();
    const embedding = entry.embedding ?? new Array(384).fill(0);

    await this.db.mutate(`
      ?[id, content, embedding, category, importance, created_at, accessed_at, access_count, metadata] <- [[
        $id,
        $content,
        $embedding,
        $category,
        $importance,
        $created_at,
        $created_at,
        0,
        $metadata
      ]]
      :put memory_entries {
        id =>
        content,
        embedding,
        category,
        importance,
        created_at,
        accessed_at,
        access_count,
        metadata
      }
    `, {
      id: entry.id,
      content: entry.content,
      embedding,
      category: entry.category,
      importance: entry.importance,
      created_at: entry.createdAt.getTime(),
      metadata: JSON.stringify(entry.metadata),
    });
  }

  /**
   * Search memory entries.
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const limit = options.limit ?? 10;

    // TODO: Implement vector similarity search when embedding provided
    // For now, use simple query

    let script = `
      ?[id, content, category, importance, created_at, accessed_at, access_count, metadata] :=
        *memory_entries{ id, content, category, importance, created_at, accessed_at, access_count, metadata }
    `;

    if (options.category) {
      script += `, category == $category`;
    }

    if (options.minImportance !== undefined) {
      script += `, importance >= $min_importance`;
    }

    script += `
      :order -importance
      :limit ${limit}
    `;

    const results = await this.db.query<{
      id: string;
      content: string;
      category: string;
      importance: number;
      created_at: number;
      accessed_at: number;
      access_count: number;
      metadata: string;
    }>(script, {
      category: options.category,
      min_importance: options.minImportance,
    });

    return results.map((row) => ({
      entry: {
        id: row.id,
        content: row.content,
        category: row.category,
        importance: row.importance,
        createdAt: new Date(row.created_at),
        accessedAt: new Date(row.accessed_at),
        accessCount: row.access_count,
        metadata: JSON.parse(row.metadata),
      },
      score: row.importance, // Simple scoring for now
    }));
  }

  /**
   * Update access statistics for a memory entry.
   */
  async recordAccess(id: string): Promise<void> {
    const now = Date.now();

    await this.db.mutate(`
      ?[id, accessed_at, access_count] :=
        *memory_entries{ id: $id, access_count: old_count },
        accessed_at = $now,
        access_count = old_count + 1

      :update memory_entries { id => accessed_at, access_count }
    `, { id, now });
  }

  /**
   * Delete a memory entry.
   */
  async delete(id: string): Promise<void> {
    await this.db.mutate(`
      ?[id] <- [[$id]]
      :delete memory_entries { id }
    `, { id });
  }

  /**
   * Apply importance decay to all entries.
   * Called periodically by the agent subconscious.
   */
  async applyDecay(decayFactor: number = 0.99): Promise<void> {
    await this.db.mutate(`
      ?[id, importance] :=
        *memory_entries{ id, importance: old_importance },
        importance = old_importance * $decay

      :update memory_entries { id => importance }
    `, { decay: decayFactor });
  }
}
