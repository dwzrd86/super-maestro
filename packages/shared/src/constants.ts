/**
 * Shared Constants
 *
 * Constants used across the AgentForge platform.
 */

// API Endpoints
export const API_VERSION = 'v1';
export const DEFAULT_API_URL = 'http://localhost:3000/api';

// WebSocket
export const WS_RECONNECT_INTERVAL = 3000;
export const WS_MAX_RECONNECT_ATTEMPTS = 5;
export const WS_HEARTBEAT_INTERVAL = 30000;

// Agent Configuration
export const AGENT_MODELS = [
  { id: 'claude-opus', name: 'Claude Opus', provider: 'anthropic' },
  { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'anthropic' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' },
] as const;

export const DEFAULT_AGENT_CONFIG = {
  model: 'claude-sonnet' as const,
  temperature: 0.7,
  maxTokens: 4096,
} as const;

// Playbook Limits
export const MAX_PLAYBOOK_TASKS = 100;
export const MAX_TASK_TIMEOUT_SECONDS = 3600; // 1 hour
export const DEFAULT_TASK_TIMEOUT_SECONDS = 300; // 5 minutes
export const DEFAULT_RETRY_COUNT = 3;
export const DEFAULT_RETRY_DELAY_SECONDS = 5;

// Session Limits
export const MAX_CONCURRENT_SESSIONS = 10;
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const MAX_MESSAGE_LENGTH = 100000;

// Team Limits (Free Plan)
export const FREE_PLAN_LIMITS = {
  maxAgents: 3,
  maxPlaybooks: 10,
  maxTeamMembers: 3,
  maxConcurrentSessions: 2,
} as const;

// Team Limits (Pro Plan)
export const PRO_PLAN_LIMITS = {
  maxAgents: 25,
  maxPlaybooks: 100,
  maxTeamMembers: 20,
  maxConcurrentSessions: 10,
} as const;

// UI Constants
export const SIDEBAR_WIDTH = 256;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const TERMINAL_MIN_HEIGHT = 200;
export const TERMINAL_DEFAULT_COLS = 120;
export const TERMINAL_DEFAULT_ROWS = 30;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Date Formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const TIME_FORMAT = 'HH:mm:ss';

// Status Colors (for UI)
export const STATUS_COLORS = {
  idle: 'gray',
  running: 'blue',
  paused: 'yellow',
  completed: 'green',
  failed: 'red',
  error: 'red',
  offline: 'gray',
  pending: 'gray',
  active: 'green',
  terminated: 'red',
  skipped: 'gray',
  cancelled: 'orange',
} as const;

// Task Type Icons (for UI)
export const TASK_TYPE_ICONS = {
  command: 'terminal',
  prompt: 'message-square',
  condition: 'git-branch',
  loop: 'repeat',
  parallel: 'layers',
} as const;
