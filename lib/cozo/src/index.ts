/**
 * @agentforge/cozo
 *
 * CozoDB integration for persistent agent memory.
 * Each agent gets its own embedded database for:
 * - Conversation history with semantic search
 * - Code graph relationships
 * - Agent subconscious (background memory maintenance)
 */

export { AgentDatabase, type AgentDatabaseOptions } from './database';
export { MemoryStore, type MemoryEntry, type SearchOptions, type SearchResult } from './memory';
export { ConversationStore, type Message, type Conversation } from './conversation';
export { CodeGraphStore, type CodeNode, type CodeRelation } from './code-graph';
export { initializeSchema, SCHEMA_VERSION } from './schema';
