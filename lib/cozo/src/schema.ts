/**
 * CozoDB Schema
 *
 * Defines the database schema for agent memory:
 * - Messages (conversation history)
 * - Memory entries (semantic search)
 * - Code graph (AST relationships)
 * - Agent state (subconscious)
 */

import type { CozoDb } from 'cozo-node';

export const SCHEMA_VERSION = '1.0.0';

/**
 * Initialize the CozoDB schema for an agent database.
 */
export async function initializeSchema(db: CozoDb): Promise<void> {
  // Check if schema already exists
  const existsCheck = await db.run(`
    ?[name] := *relation_info{ name }
    :limit 1
  `);

  // If relations exist, assume schema is initialized
  if (existsCheck.ok && existsCheck.rows.length > 0) {
    return;
  }

  // Create schema relations
  const schemas = [
    // Messages - conversation history
    `
    :create messages {
      id: String =>
      conversation_id: String,
      role: String,
      content: String,
      timestamp: Float,
      metadata: String default '{}'
    }
    `,

    // Conversations - groups of messages
    `
    :create conversations {
      id: String =>
      title: String default '',
      created_at: Float,
      updated_at: Float,
      metadata: String default '{}'
    }
    `,

    // Memory entries - for semantic search
    `
    :create memory_entries {
      id: String =>
      content: String,
      embedding: [Float; 384],
      category: String default 'general',
      importance: Float default 0.5,
      created_at: Float,
      accessed_at: Float,
      access_count: Int default 0,
      metadata: String default '{}'
    }
    `,

    // Code graph nodes - files, functions, classes, etc.
    `
    :create code_nodes {
      id: String =>
      path: String,
      name: String,
      kind: String,
      language: String,
      start_line: Int,
      end_line: Int,
      content_hash: String,
      metadata: String default '{}'
    }
    `,

    // Code graph edges - relationships between nodes
    `
    :create code_edges {
      source_id: String,
      target_id: String,
      relation: String =>
      metadata: String default '{}'
    }
    `,

    // Agent state - subconscious memory
    `
    :create agent_state {
      key: String =>
      value: String,
      updated_at: Float
    }
    `,

    // Schema version tracking
    `
    :create schema_info {
      key: String =>
      value: String
    }
    `,
  ];

  for (const schema of schemas) {
    const result = await db.run(schema);
    if (!result.ok) {
      throw new Error(`Failed to create schema: ${JSON.stringify(result)}`);
    }
  }

  // Record schema version
  await db.run(`
    ?[key, value] <- [['version', $version]]
    :put schema_info { key => value }
  `, { version: SCHEMA_VERSION });
}

/**
 * Get the current schema version.
 */
export async function getSchemaVersion(db: CozoDb): Promise<string | null> {
  const result = await db.run(`
    ?[value] := *schema_info{ key: 'version', value }
  `);

  if (result.ok && result.rows.length > 0) {
    return result.rows[0][0] as string;
  }

  return null;
}
