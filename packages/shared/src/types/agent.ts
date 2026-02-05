/**
 * Agent Types
 *
 * Defines the core agent model and related types for AI agent management.
 * Extended with synthesis features: CozoDB memory, peer mesh, and messaging.
 */

export type AgentStatus = 'idle' | 'running' | 'paused' | 'error' | 'offline';
export type AgentModel = 'claude-opus' | 'claude-sonnet' | 'gpt-4' | 'gemini-pro' | 'custom';

// Mesh network types
export type MeshNodeStatus = 'connected' | 'disconnected' | 'unknown';

export interface MeshNodeInfo {
  nodeId: string;
  host: string;
  port: number;
  status: MeshNodeStatus;
  lastSeen: Date;
}

// Agent memory types
export interface AgentMemoryStats {
  conversationCount: number;
  messageCount: number;
  memoryEntryCount: number;
  codeNodeCount: number;
  lastIndexedAt: Date | null;
}

// Agent messaging types
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface AgentInboxMessage {
  id: string;
  fromAgentId: string;
  fromAgentName: string;
  content: string;
  priority: MessagePriority;
  timestamp: Date;
  read: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Agent represents an AI assistant instance that can execute tasks.
 */
export interface Agent {
  id: string;
  name: string;
  description: string | null;

  // Configuration
  model: AgentModel;
  systemPrompt: string | null;
  temperature: number;
  maxTokens: number;

  // Runtime state
  status: AgentStatus;
  lastActiveAt: Date | null;

  // Ownership
  teamId: string;
  createdBy: string;

  // Metadata
  tags: string[];
  config: Record<string, unknown>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // === SYNTHESIS FEATURES ===

  // Memory (CozoDB integration)
  memoryEnabled: boolean;
  memoryStats?: AgentMemoryStats;

  // Mesh network
  meshNodeId?: string;
  meshNode?: MeshNodeInfo;

  // Agent messaging
  unreadMessageCount: number;
}

/**
 * AgentSession represents an active execution session for an agent.
 * Maps to a tmux session or terminal process.
 */
export interface AgentSession {
  id: string;
  agentId: string;

  // Session identification
  tmuxSessionName: string | null;
  pid: number | null;

  // State
  status: 'active' | 'completed' | 'failed' | 'terminated';
  exitCode: number | null;

  // Execution context
  workingDirectory: string | null;
  environment: Record<string, string>;

  // Playbook execution (optional)
  playbookId: string | null;
  currentTaskIndex: number | null;

  // Timestamps
  startedAt: Date;
  endedAt: Date | null;
}

/**
 * AgentCreateInput for creating new agents.
 */
export interface AgentCreateInput {
  name: string;
  description?: string;
  model: AgentModel;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  teamId: string;
  tags?: string[];
  config?: Record<string, unknown>;
}

/**
 * AgentUpdateInput for updating existing agents.
 */
export interface AgentUpdateInput {
  name?: string;
  description?: string | null;
  model?: AgentModel;
  systemPrompt?: string | null;
  temperature?: number;
  maxTokens?: number;
  status?: AgentStatus;
  tags?: string[];
  config?: Record<string, unknown>;
  memoryEnabled?: boolean;
}

// === SYNTHESIS FEATURE TYPES ===

/**
 * AgentExport represents a portable agent package.
 * Used for transferring agents between mesh nodes.
 */
export interface AgentExport {
  version: string;
  exportedAt: Date;
  agent: Omit<Agent, 'memoryStats' | 'meshNode' | 'unreadMessageCount'>;
  sessions: AgentSession[];
  memory?: {
    conversations: unknown[];
    memoryEntries: unknown[];
    codeGraph: unknown[];
  };
}

/**
 * AgentTransferRequest for moving agents between nodes.
 */
export interface AgentTransferRequest {
  agentId: string;
  targetNodeId: string;
  includeMemory: boolean;
  includeSessions: boolean;
}

/**
 * AgentTransferStatus tracks transfer progress.
 */
export interface AgentTransferStatus {
  id: string;
  agentId: string;
  targetNodeId: string;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
  progress: number;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}
