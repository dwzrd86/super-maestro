/**
 * Playbook Types
 *
 * Playbooks are reusable sequences of tasks that agents can execute.
 * Think of them as "recipes" or "workflows" for automated work.
 */

export type TaskType = 'command' | 'prompt' | 'condition' | 'loop' | 'parallel';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

/**
 * PlaybookTask represents a single step in a playbook.
 */
export interface PlaybookTask {
  id: string;
  playbookId: string;

  // Task definition
  name: string;
  description: string | null;
  type: TaskType;

  // Execution order
  order: number;
  parentTaskId: string | null; // For nested tasks (loops, conditions)

  // Task configuration based on type
  config: TaskConfig;

  // Timeout and retry settings
  timeoutSeconds: number | null;
  retryCount: number;
  retryDelaySeconds: number;

  // Conditional execution
  condition: string | null; // Expression to evaluate

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task configuration varies by task type.
 */
export type TaskConfig =
  | CommandTaskConfig
  | PromptTaskConfig
  | ConditionTaskConfig
  | LoopTaskConfig
  | ParallelTaskConfig;

export interface CommandTaskConfig {
  type: 'command';
  command: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
  captureOutput?: boolean;
}

export interface PromptTaskConfig {
  type: 'prompt';
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  outputVariable?: string; // Store result in this variable
}

export interface ConditionTaskConfig {
  type: 'condition';
  expression: string; // e.g., "{{lastExitCode}} === 0"
  trueBranch: string[]; // Task IDs to run if true
  falseBranch: string[]; // Task IDs to run if false
}

export interface LoopTaskConfig {
  type: 'loop';
  iterator: string; // Variable name
  items: string; // Expression returning array, e.g., "{{files}}"
  tasks: string[]; // Task IDs to run for each item
  maxIterations?: number;
}

export interface ParallelTaskConfig {
  type: 'parallel';
  tasks: string[]; // Task IDs to run in parallel
  maxConcurrency?: number;
  failFast?: boolean; // Stop all on first failure
}

/**
 * Playbook is a collection of tasks forming a reusable workflow.
 */
export interface Playbook {
  id: string;
  name: string;
  description: string | null;

  // Version control
  version: string;
  isPublished: boolean;

  // Ownership
  teamId: string;
  createdBy: string;

  // Configuration
  defaultAgentId: string | null;
  variables: PlaybookVariable[];

  // Tasks (ordered)
  tasks: PlaybookTask[];

  // Metadata
  tags: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * PlaybookVariable defines input parameters for a playbook.
 */
export interface PlaybookVariable {
  name: string;
  description: string | null;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue: unknown;
}

/**
 * PlaybookRun represents a single execution of a playbook.
 */
export interface PlaybookRun {
  id: string;
  playbookId: string;
  agentId: string;
  sessionId: string;

  // Input variables
  variables: Record<string, unknown>;

  // Execution state
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentTaskId: string | null;

  // Results
  taskResults: TaskResult[];
  output: Record<string, unknown>;
  error: string | null;

  // Timestamps
  startedAt: Date;
  completedAt: Date | null;
}

/**
 * TaskResult captures the outcome of a single task execution.
 */
export interface TaskResult {
  taskId: string;
  status: TaskStatus;
  startedAt: Date;
  completedAt: Date | null;
  output: unknown;
  error: string | null;
  exitCode: number | null;
  duration: number | null; // milliseconds
}

/**
 * PlaybookCreateInput for creating new playbooks.
 */
export interface PlaybookCreateInput {
  name: string;
  description?: string;
  teamId: string;
  defaultAgentId?: string;
  variables?: PlaybookVariable[];
  tags?: string[];
}
