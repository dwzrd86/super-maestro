/**
 * AgentDatabase
 *
 * Manages a per-agent CozoDB instance with:
 * - Automatic schema initialization
 * - Connection pooling
 * - Query execution with type safety
 */

import { CozoDb } from 'cozo-node';
import { initializeSchema } from './schema';
import * as fs from 'fs';
import * as path from 'path';

export interface AgentDatabaseOptions {
  /** Agent ID - used for database file naming */
  agentId: string;

  /** Base directory for storing agent databases */
  baseDir: string;

  /** Whether to create database if it doesn't exist */
  createIfMissing?: boolean;
}

export class AgentDatabase {
  private db: CozoDb | null = null;
  private readonly agentId: string;
  private readonly dbPath: string;
  private initialized = false;

  constructor(options: AgentDatabaseOptions) {
    this.agentId = options.agentId;

    // Create agent-specific directory
    const agentDir = path.join(options.baseDir, options.agentId);
    if (options.createIfMissing !== false) {
      fs.mkdirSync(agentDir, { recursive: true });
    }

    this.dbPath = path.join(agentDir, 'memory.db');
  }

  /**
   * Open the database connection and initialize schema if needed.
   */
  async open(): Promise<void> {
    if (this.db) return;

    // CozoDb constructor is synchronous
    this.db = new CozoDb('sqlite', this.dbPath);

    if (!this.initialized) {
      await initializeSchema(this.db);
      this.initialized = true;
    }
  }

  /**
   * Close the database connection.
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Execute a CozoScript query.
   */
  async query<T = unknown>(script: string, params?: Record<string, unknown>): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not open. Call open() first.');
    }

    const result = await this.db.run(script, params ?? {});

    if (!result.ok) {
      throw new Error(`CozoDB query failed: ${JSON.stringify(result)}`);
    }

    // Convert result rows to objects
    const { headers, rows } = result;
    return rows.map((row: unknown[]) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((header: string, i: number) => {
        obj[header] = row[i];
      });
      return obj as T;
    });
  }

  /**
   * Execute a CozoScript mutation (insert/update/delete).
   */
  async mutate(script: string, params?: Record<string, unknown>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not open. Call open() first.');
    }

    const result = await this.db.run(script, params ?? {});

    if (!result.ok) {
      throw new Error(`CozoDB mutation failed: ${JSON.stringify(result)}`);
    }
  }

  /**
   * Get the underlying CozoDb instance for advanced operations.
   */
  getDb(): CozoDb {
    if (!this.db) {
      throw new Error('Database not open. Call open() first.');
    }
    return this.db;
  }

  /**
   * Get the agent ID this database belongs to.
   */
  getAgentId(): string {
    return this.agentId;
  }

  /**
   * Get the database file path.
   */
  getPath(): string {
    return this.dbPath;
  }
}
