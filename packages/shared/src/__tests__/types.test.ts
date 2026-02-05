import { describe, it, expect } from 'vitest';
import type {
  // Agent types
  Agent,
  AgentSession,
  AgentStatus,
  AgentModel,
  AgentCreateInput,
  AgentUpdateInput,
  MeshNodeStatus,
  MeshNodeInfo,
  AgentMemoryStats,
  MessagePriority,
  AgentInboxMessage,
  AgentExport,
  AgentTransferRequest,
  AgentTransferStatus,
  // Message types
  Message,
  MessageRole,
  MessageType,
  MessageMetadata,
  WsMessage,
  WsMessageType,
  SessionJoinPayload,
  SessionCreatePayload,
  ErrorPayload,
  // User types
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
  // Playbook types
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
} from '../types';

import {
  API_VERSION,
  DEFAULT_API_URL,
  AGENT_MODELS,
  DEFAULT_AGENT_CONFIG,
  MAX_PLAYBOOK_TASKS,
  FREE_PLAN_LIMITS,
  PRO_PLAN_LIMITS,
  STATUS_COLORS,
  TASK_TYPE_ICONS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../constants';

describe('packages/shared type exports', () => {
  describe('Agent types', () => {
    it('Agent interface has expected shape', () => {
      const agent: Agent = {
        id: 'agent-1',
        name: 'Test Agent',
        description: null,
        model: 'claude-sonnet',
        systemPrompt: null,
        temperature: 0.7,
        maxTokens: 4096,
        status: 'idle',
        lastActiveAt: null,
        teamId: 'team-1',
        createdBy: 'user-1',
        tags: ['test'],
        config: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        memoryEnabled: false,
        unreadMessageCount: 0,
      };

      expect(agent.id).toBe('agent-1');
      expect(agent.name).toBe('Test Agent');
      expect(agent.model).toBe('claude-sonnet');
      expect(agent.status).toBe('idle');
      expect(agent.memoryEnabled).toBe(false);
      expect(agent.tags).toEqual(['test']);
    });

    it('AgentStatus union includes all expected values', () => {
      const statuses: AgentStatus[] = ['idle', 'running', 'paused', 'error', 'offline'];
      expect(statuses).toHaveLength(5);
    });

    it('AgentModel union includes all expected values', () => {
      const models: AgentModel[] = ['claude-opus', 'claude-sonnet', 'gpt-4', 'gemini-pro', 'custom'];
      expect(models).toHaveLength(5);
    });

    it('AgentCreateInput has required fields', () => {
      const input: AgentCreateInput = {
        name: 'New Agent',
        model: 'claude-sonnet',
        teamId: 'team-1',
      };
      expect(input.name).toBe('New Agent');
      expect(input.model).toBe('claude-sonnet');
      expect(input.teamId).toBe('team-1');
    });

    it('AgentSession interface has expected shape', () => {
      const session: AgentSession = {
        id: 'session-1',
        agentId: 'agent-1',
        tmuxSessionName: null,
        pid: null,
        status: 'active',
        exitCode: null,
        workingDirectory: null,
        environment: {},
        playbookId: null,
        currentTaskIndex: null,
        startedAt: new Date(),
        endedAt: null,
      };
      expect(session.status).toBe('active');
      expect(session.environment).toEqual({});
    });

    it('MeshNodeInfo interface has expected shape', () => {
      const node: MeshNodeInfo = {
        nodeId: 'node-1',
        host: 'localhost',
        port: 8080,
        status: 'connected',
        lastSeen: new Date(),
      };
      expect(node.nodeId).toBe('node-1');
      expect(node.status).toBe('connected');
    });

    it('AgentInboxMessage interface has expected shape', () => {
      const msg: AgentInboxMessage = {
        id: 'msg-1',
        fromAgentId: 'agent-2',
        fromAgentName: 'Helper',
        content: 'Hello',
        priority: 'normal',
        timestamp: new Date(),
        read: false,
      };
      expect(msg.priority).toBe('normal');
      expect(msg.read).toBe(false);
    });

    it('AgentTransferRequest interface has expected shape', () => {
      const req: AgentTransferRequest = {
        agentId: 'agent-1',
        targetNodeId: 'node-2',
        includeMemory: true,
        includeSessions: false,
      };
      expect(req.includeMemory).toBe(true);
    });
  });

  describe('Message types', () => {
    it('Message interface has expected shape', () => {
      const msg: Message = {
        id: 'msg-1',
        sessionId: 'session-1',
        role: 'user',
        type: 'chat',
        content: 'Hello',
        toolName: null,
        toolInput: null,
        toolOutput: null,
        metadata: {},
        createdAt: new Date(),
      };
      expect(msg.role).toBe('user');
      expect(msg.type).toBe('chat');
    });

    it('MessageRole union includes all expected values', () => {
      const roles: MessageRole[] = ['system', 'user', 'assistant', 'tool'];
      expect(roles).toHaveLength(4);
    });

    it('MessageType union includes all expected values', () => {
      const types: MessageType[] = [
        'chat', 'command', 'output', 'error',
        'status', 'tool_call', 'tool_result', 'heartbeat',
      ];
      expect(types).toHaveLength(8);
    });

    it('WsMessage generic interface has expected shape', () => {
      const ws: WsMessage<string> = {
        id: 'ws-1',
        type: 'ping',
        payload: 'data',
        timestamp: new Date(),
      };
      expect(ws.type).toBe('ping');
      expect(ws.payload).toBe('data');
    });

    it('SessionJoinPayload has expected fields', () => {
      const payload: SessionJoinPayload = {
        sessionId: 's-1',
        userId: 'u-1',
      };
      expect(payload.sessionId).toBe('s-1');
    });

    it('ErrorPayload has expected fields', () => {
      const err: ErrorPayload = {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      };
      expect(err.code).toBe('NOT_FOUND');
    });
  });

  describe('User types', () => {
    it('User interface has expected shape', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
        preferences: {
          theme: 'dark',
          timezone: 'America/Los_Angeles',
          notifications: {
            email: true,
            desktop: true,
            slack: false,
            onAgentError: true,
            onPlaybookComplete: true,
            onTeamInvite: true,
          },
          editor: {
            fontSize: 14,
            fontFamily: 'monospace',
            tabSize: 2,
            wordWrap: true,
            minimap: false,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };
      expect(user.email).toBe('test@example.com');
      expect(user.preferences.theme).toBe('dark');
      expect(user.preferences.notifications.email).toBe(true);
      expect(user.preferences.editor.fontSize).toBe(14);
    });

    it('UserRole union includes all expected values', () => {
      const roles: UserRole[] = ['owner', 'admin', 'member', 'viewer'];
      expect(roles).toHaveLength(4);
    });

    it('Team interface has expected shape', () => {
      const team: Team = {
        id: 'team-1',
        name: 'Test Team',
        slug: 'test-team',
        description: null,
        avatarUrl: null,
        ownerId: 'user-1',
        settings: {
          defaultModel: 'claude-sonnet',
          defaultMaxTokens: 4096,
          allowedModels: ['claude-sonnet'],
          maxAgents: 10,
          maxPlaybooks: 50,
          maxConcurrentSessions: 5,
          integrations: {},
        },
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(team.slug).toBe('test-team');
      expect(team.plan).toBe('free');
      expect(team.settings.maxAgents).toBe(10);
    });

    it('CreateTeamInput has required fields', () => {
      const input: CreateTeamInput = { name: 'My Team' };
      expect(input.name).toBe('My Team');
    });

    it('InviteTeamMemberInput has required fields', () => {
      const input: InviteTeamMemberInput = {
        email: 'invite@example.com',
        role: 'member',
      };
      expect(input.email).toBe('invite@example.com');
      expect(input.role).toBe('member');
    });
  });

  describe('Playbook types', () => {
    it('TaskType union includes all expected values', () => {
      const types: TaskType[] = ['command', 'prompt', 'condition', 'loop', 'parallel'];
      expect(types).toHaveLength(5);
    });

    it('TaskStatus union includes all expected values', () => {
      const statuses: TaskStatus[] = ['pending', 'running', 'completed', 'failed', 'skipped'];
      expect(statuses).toHaveLength(5);
    });

    it('CommandTaskConfig has expected shape', () => {
      const config: CommandTaskConfig = {
        type: 'command',
        command: 'echo hello',
      };
      expect(config.type).toBe('command');
      expect(config.command).toBe('echo hello');
    });

    it('PromptTaskConfig has expected shape', () => {
      const config: PromptTaskConfig = {
        type: 'prompt',
        prompt: 'Summarize this',
      };
      expect(config.type).toBe('prompt');
    });

    it('PlaybookVariable has expected shape', () => {
      const variable: PlaybookVariable = {
        name: 'input_file',
        description: 'Path to input',
        type: 'string',
        required: true,
        defaultValue: null,
      };
      expect(variable.name).toBe('input_file');
      expect(variable.required).toBe(true);
    });

    it('PlaybookCreateInput has required fields', () => {
      const input: PlaybookCreateInput = {
        name: 'Deploy Workflow',
        teamId: 'team-1',
      };
      expect(input.name).toBe('Deploy Workflow');
    });

    it('TaskResult has expected shape', () => {
      const result: TaskResult = {
        taskId: 'task-1',
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        output: 'success',
        error: null,
        exitCode: 0,
        duration: 1500,
      };
      expect(result.status).toBe('completed');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Constants exports', () => {
    it('API constants are defined', () => {
      expect(API_VERSION).toBe('v1');
      expect(DEFAULT_API_URL).toBe('http://localhost:3000/api');
    });

    it('AGENT_MODELS contains expected providers', () => {
      expect(AGENT_MODELS).toHaveLength(4);
      const providers = AGENT_MODELS.map(m => m.provider);
      expect(providers).toContain('anthropic');
      expect(providers).toContain('openai');
      expect(providers).toContain('google');
    });

    it('DEFAULT_AGENT_CONFIG has expected defaults', () => {
      expect(DEFAULT_AGENT_CONFIG.model).toBe('claude-sonnet');
      expect(DEFAULT_AGENT_CONFIG.temperature).toBe(0.7);
      expect(DEFAULT_AGENT_CONFIG.maxTokens).toBe(4096);
    });

    it('Plan limits are defined with expected constraints', () => {
      expect(FREE_PLAN_LIMITS.maxAgents).toBe(3);
      expect(PRO_PLAN_LIMITS.maxAgents).toBe(25);
      expect(PRO_PLAN_LIMITS.maxAgents).toBeGreaterThan(FREE_PLAN_LIMITS.maxAgents);
    });

    it('Pagination defaults are reasonable', () => {
      expect(DEFAULT_PAGE_SIZE).toBe(20);
      expect(MAX_PAGE_SIZE).toBe(100);
      expect(MAX_PAGE_SIZE).toBeGreaterThan(DEFAULT_PAGE_SIZE);
    });

    it('STATUS_COLORS covers key statuses', () => {
      expect(STATUS_COLORS.idle).toBe('gray');
      expect(STATUS_COLORS.running).toBe('blue');
      expect(STATUS_COLORS.failed).toBe('red');
      expect(STATUS_COLORS.completed).toBe('green');
    });

    it('TASK_TYPE_ICONS covers all task types', () => {
      expect(TASK_TYPE_ICONS.command).toBe('terminal');
      expect(TASK_TYPE_ICONS.prompt).toBe('message-square');
      expect(TASK_TYPE_ICONS.condition).toBe('git-branch');
      expect(TASK_TYPE_ICONS.loop).toBe('repeat');
      expect(TASK_TYPE_ICONS.parallel).toBe('layers');
    });

    it('MAX_PLAYBOOK_TASKS is reasonable', () => {
      expect(MAX_PLAYBOOK_TASKS).toBe(100);
    });
  });
});
