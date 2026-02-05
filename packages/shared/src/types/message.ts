/**
 * Message Types
 *
 * Messages are used for real-time communication between the web dashboard,
 * agent runner, and AI agents. They flow through WebSocket connections.
 */

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';
export type MessageType =
  | 'chat'           // Regular conversation message
  | 'command'        // CLI command to execute
  | 'output'         // Terminal/command output
  | 'error'          // Error message
  | 'status'         // Status update
  | 'tool_call'      // AI requesting to use a tool
  | 'tool_result'    // Result of a tool execution
  | 'heartbeat';     // Keep-alive message

/**
 * Message represents a single communication unit in the system.
 */
export interface Message {
  id: string;
  sessionId: string;

  // Content
  role: MessageRole;
  type: MessageType;
  content: string;

  // Tool-related (for tool_call and tool_result)
  toolName: string | null;
  toolInput: Record<string, unknown> | null;
  toolOutput: unknown | null;

  // Metadata
  metadata: MessageMetadata;

  // Timestamps
  createdAt: Date;
}

/**
 * MessageMetadata contains optional context for messages.
 */
export interface MessageMetadata {
  // Token usage (for AI responses)
  inputTokens?: number;
  outputTokens?: number;

  // Command execution
  exitCode?: number;
  duration?: number; // milliseconds

  // Source identification
  source?: 'web' | 'runner' | 'agent' | 'system';
  agentId?: string;

  // Streaming
  isStreaming?: boolean;
  streamIndex?: number;

  // Custom data
  [key: string]: unknown;
}

/**
 * WebSocket message envelope for real-time communication.
 */
export interface WsMessage<T = unknown> {
  id: string;
  type: WsMessageType;
  payload: T;
  timestamp: Date;
}

export type WsMessageType =
  // Connection lifecycle
  | 'connect'
  | 'disconnect'
  | 'ping'
  | 'pong'
  // Session management
  | 'session:join'
  | 'session:leave'
  | 'session:create'
  | 'session:terminate'
  // Message streaming
  | 'message:send'
  | 'message:received'
  | 'message:chunk'      // For streaming responses
  | 'message:complete'
  // Terminal streaming
  | 'terminal:output'
  | 'terminal:input'
  | 'terminal:resize'
  // Status updates
  | 'agent:status'
  | 'playbook:progress'
  | 'error';

/**
 * Payloads for specific WebSocket message types.
 */
export interface SessionJoinPayload {
  sessionId: string;
  userId: string;
}

export interface SessionCreatePayload {
  agentId: string;
  playbookId?: string;
  variables?: Record<string, unknown>;
}

export interface TerminalOutputPayload {
  sessionId: string;
  data: string;
  timestamp: Date;
}

export interface TerminalInputPayload {
  sessionId: string;
  data: string;
}

export interface TerminalResizePayload {
  sessionId: string;
  cols: number;
  rows: number;
}

export interface AgentStatusPayload {
  agentId: string;
  status: string;
  details?: Record<string, unknown>;
}

export interface PlaybookProgressPayload {
  runId: string;
  playbookId: string;
  currentTaskId: string | null;
  completedTasks: number;
  totalTasks: number;
  status: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}
