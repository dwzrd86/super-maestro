-- AgentForge Initial Schema
-- Creates the core tables for agents, playbooks, sessions, and teams.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TEAMS
-- ============================================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    avatar_url TEXT,
    owner_id UUID NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_teams_owner ON teams(owner_id);

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- ============================================================
-- TEAM MEMBERS
-- ============================================================

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    invited_by UUID REFERENCES user_profiles(id),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- ============================================================
-- AGENTS
-- ============================================================

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    model TEXT NOT NULL DEFAULT 'claude-sonnet',
    system_prompt TEXT,
    temperature REAL NOT NULL DEFAULT 0.7,
    max_tokens INTEGER NOT NULL DEFAULT 4096,
    status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'paused', 'error', 'offline')),
    last_active_at TIMESTAMPTZ,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    tags TEXT[] NOT NULL DEFAULT '{}',
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agents_team ON agents(team_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_created_by ON agents(created_by);

-- ============================================================
-- AGENT SESSIONS
-- ============================================================

CREATE TABLE agent_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tmux_session_name TEXT,
    pid INTEGER,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'terminated')),
    exit_code INTEGER,
    working_directory TEXT,
    environment JSONB NOT NULL DEFAULT '{}',
    playbook_id UUID,
    current_task_index INTEGER,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE INDEX idx_agent_sessions_agent ON agent_sessions(agent_id);
CREATE INDEX idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX idx_agent_sessions_playbook ON agent_sessions(playbook_id);

-- ============================================================
-- PLAYBOOKS
-- ============================================================

CREATE TABLE playbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    version TEXT NOT NULL DEFAULT '1.0.0',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    default_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    variables JSONB NOT NULL DEFAULT '[]',
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_playbooks_team ON playbooks(team_id);
CREATE INDEX idx_playbooks_created_by ON playbooks(created_by);

-- Add foreign key for agent_sessions after playbooks is created
ALTER TABLE agent_sessions
    ADD CONSTRAINT fk_agent_sessions_playbook
    FOREIGN KEY (playbook_id) REFERENCES playbooks(id) ON DELETE SET NULL;

-- ============================================================
-- PLAYBOOK TASKS
-- ============================================================

CREATE TABLE playbook_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playbook_id UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('command', 'prompt', 'condition', 'loop', 'parallel')),
    "order" INTEGER NOT NULL,
    parent_task_id UUID REFERENCES playbook_tasks(id) ON DELETE CASCADE,
    config JSONB NOT NULL DEFAULT '{}',
    timeout_seconds INTEGER,
    retry_count INTEGER NOT NULL DEFAULT 0,
    retry_delay_seconds INTEGER NOT NULL DEFAULT 5,
    condition TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_playbook_tasks_playbook ON playbook_tasks(playbook_id);
CREATE INDEX idx_playbook_tasks_order ON playbook_tasks(playbook_id, "order");

-- ============================================================
-- PLAYBOOK RUNS
-- ============================================================

CREATE TABLE playbook_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playbook_id UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    session_id UUID REFERENCES agent_sessions(id) ON DELETE SET NULL,
    variables JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    current_task_id UUID REFERENCES playbook_tasks(id),
    task_results JSONB NOT NULL DEFAULT '[]',
    output JSONB NOT NULL DEFAULT '{}',
    error TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_playbook_runs_playbook ON playbook_runs(playbook_id);
CREATE INDEX idx_playbook_runs_agent ON playbook_runs(agent_id);
CREATE INDEX idx_playbook_runs_status ON playbook_runs(status);

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
    type TEXT NOT NULL DEFAULT 'chat' CHECK (type IN ('chat', 'command', 'output', 'error', 'status', 'tool_call', 'tool_result', 'heartbeat')),
    content TEXT NOT NULL,
    tool_name TEXT,
    tool_input JSONB,
    tool_output JSONB,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_created ON messages(session_id, created_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- User profiles: users can only access their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Teams: members can view their teams
CREATE POLICY "Team members can view teams"
    ON teams FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = teams.id
            AND team_members.user_id = auth.uid()
        )
    );

-- Team members: can view members of their teams
CREATE POLICY "Team members can view team members"
    ON team_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members AS tm
            WHERE tm.team_id = team_members.team_id
            AND tm.user_id = auth.uid()
        )
    );

-- Agents: team members can view agents
CREATE POLICY "Team members can view agents"
    ON agents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = agents.team_id
            AND team_members.user_id = auth.uid()
        )
    );

-- Playbooks: team members can view playbooks
CREATE POLICY "Team members can view playbooks"
    ON playbooks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = playbooks.team_id
            AND team_members.user_id = auth.uid()
        )
    );

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playbooks_updated_at
    BEFORE UPDATE ON playbooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playbook_tasks_updated_at
    BEFORE UPDATE ON playbook_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
