/**
 * @agentforge/shared - Type Exports
 *
 * Central export point for all shared types used across the AgentForge platform.
 */

// Agent types
export type {
  Agent,
  AgentSession,
  AgentStatus,
  AgentModel,
  AgentCreateInput,
  AgentUpdateInput,
  // Synthesis features
  MeshNodeStatus,
  MeshNodeInfo,
  AgentMemoryStats,
  MessagePriority,
  AgentInboxMessage,
  AgentExport,
  AgentTransferRequest,
  AgentTransferStatus,
} from './agent';

// Playbook types
export type {
  Playbook,
  PlaybookTask,
  PlaybookVariable,
  PlaybookRun,
  TaskResult,
  TaskType,
  TaskStatus,
  TaskConfig,
  CommandTaskConfig,
  PromptTaskConfig,
  ConditionTaskConfig,
  LoopTaskConfig,
  ParallelTaskConfig,
  PlaybookCreateInput,
} from './playbook';

// Message types
export type {
  Message,
  MessageRole,
  MessageType,
  MessageMetadata,
  WsMessage,
  WsMessageType,
  SessionJoinPayload,
  SessionCreatePayload,
  TerminalOutputPayload,
  TerminalInputPayload,
  TerminalResizePayload,
  AgentStatusPayload,
  PlaybookProgressPayload,
  ErrorPayload,
} from './message';

// User and Team types
export type {
  User,
  UserRole,
  UserPreferences,
  NotificationSettings,
  EditorSettings,
  Team,
  TeamSettings,
  TeamIntegrations,
  TeamMember,
  TeamInvite,
  CreateTeamInput,
  InviteTeamMemberInput,
} from './user';
