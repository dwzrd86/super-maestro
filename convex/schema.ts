import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const plan = v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise'));
const teamRole = v.union(v.literal('owner'), v.literal('admin'), v.literal('member'), v.literal('viewer'));
const agentStatus = v.union(
  v.literal('idle'),
  v.literal('running'),
  v.literal('paused'),
  v.literal('error'),
  v.literal('offline'),
);
const sessionStatus = v.union(
  v.literal('active'),
  v.literal('completed'),
  v.literal('failed'),
  v.literal('terminated'),
);
const taskType = v.union(
  v.literal('command'),
  v.literal('prompt'),
  v.literal('condition'),
  v.literal('loop'),
  v.literal('parallel'),
);
const runStatus = v.union(
  v.literal('pending'),
  v.literal('running'),
  v.literal('completed'),
  v.literal('failed'),
  v.literal('cancelled'),
);
const messageRole = v.union(
  v.literal('system'),
  v.literal('user'),
  v.literal('assistant'),
  v.literal('tool'),
);
const messageType = v.union(
  v.literal('chat'),
  v.literal('command'),
  v.literal('output'),
  v.literal('error'),
  v.literal('status'),
  v.literal('tool_call'),
  v.literal('tool_result'),
  v.literal('heartbeat'),
);

export default defineSchema({
  teams: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    owner_id: v.id('user_profiles'),
    plan,
    settings: v.any(),
    updated_at: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_owner', ['owner_id']),

  user_profiles: defineTable({
    auth_subject: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    preferences: v.any(),
    updated_at: v.number(),
    last_login_at: v.optional(v.number()),
  })
    .index('by_auth_subject', ['auth_subject'])
    .index('by_email', ['email']),

  team_members: defineTable({
    team_id: v.id('teams'),
    user_id: v.id('user_profiles'),
    role: teamRole,
    invited_by: v.optional(v.id('user_profiles')),
    invited_at: v.optional(v.number()),
    joined_at: v.number(),
    updated_at: v.number(),
  })
    .index('by_team', ['team_id'])
    .index('by_user', ['user_id'])
    .index('by_team_user', ['team_id', 'user_id']),

  agents: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    model: v.string(),
    system_prompt: v.optional(v.string()),
    temperature: v.number(),
    max_tokens: v.number(),
    status: agentStatus,
    last_active_at: v.optional(v.number()),
    team_id: v.id('teams'),
    created_by: v.id('user_profiles'),
    tags: v.array(v.string()),
    config: v.any(),
    updated_at: v.number(),
  })
    .index('by_team', ['team_id'])
    .index('by_status', ['status'])
    .index('by_created_by', ['created_by']),

  agent_sessions: defineTable({
    agent_id: v.id('agents'),
    tmux_session_name: v.optional(v.string()),
    pid: v.optional(v.number()),
    status: sessionStatus,
    exit_code: v.optional(v.number()),
    working_directory: v.optional(v.string()),
    environment: v.any(),
    playbook_id: v.optional(v.id('playbooks')),
    current_task_index: v.optional(v.number()),
    started_at: v.number(),
    ended_at: v.optional(v.number()),
  })
    .index('by_agent', ['agent_id'])
    .index('by_status', ['status'])
    .index('by_playbook', ['playbook_id']),

  playbooks: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    version: v.string(),
    is_published: v.boolean(),
    team_id: v.id('teams'),
    created_by: v.id('user_profiles'),
    default_agent_id: v.optional(v.id('agents')),
    variables: v.any(),
    tags: v.array(v.string()),
    updated_at: v.number(),
  })
    .index('by_team', ['team_id'])
    .index('by_created_by', ['created_by']),

  playbook_tasks: defineTable({
    playbook_id: v.id('playbooks'),
    name: v.string(),
    description: v.optional(v.string()),
    type: taskType,
    order: v.number(),
    parent_task_id: v.optional(v.id('playbook_tasks')),
    config: v.any(),
    timeout_seconds: v.optional(v.number()),
    retry_count: v.number(),
    retry_delay_seconds: v.number(),
    condition: v.optional(v.string()),
    updated_at: v.number(),
  })
    .index('by_playbook', ['playbook_id'])
    .index('by_playbook_order', ['playbook_id', 'order']),

  playbook_runs: defineTable({
    playbook_id: v.id('playbooks'),
    agent_id: v.id('agents'),
    session_id: v.optional(v.id('agent_sessions')),
    variables: v.any(),
    status: runStatus,
    current_task_id: v.optional(v.id('playbook_tasks')),
    task_results: v.any(),
    output: v.any(),
    error: v.optional(v.string()),
    started_at: v.number(),
    completed_at: v.optional(v.number()),
  })
    .index('by_playbook', ['playbook_id'])
    .index('by_agent', ['agent_id'])
    .index('by_status', ['status']),

  messages: defineTable({
    session_id: v.id('agent_sessions'),
    role: messageRole,
    type: messageType,
    content: v.string(),
    tool_name: v.optional(v.string()),
    tool_input: v.optional(v.any()),
    tool_output: v.optional(v.any()),
    metadata: v.any(),
  })
    .index('by_session', ['session_id'])
    .index('by_session_created', ['session_id', '_creationTime']),
});
