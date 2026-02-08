-- Super Maestro — Game Mechanics Tables
-- Achievements, Kart Races, and Race Results

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_key TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, achievement_key)
);

CREATE INDEX idx_achievements_agent ON achievements(agent_id);
CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_achievements_key ON achievements(achievement_key);

-- ============================================================
-- KART RACES
-- ============================================================

CREATE TABLE kart_races (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_name TEXT NOT NULL,
    track_difficulty TEXT NOT NULL CHECK (track_difficulty IN ('mushroom', 'flower', 'star', 'special')),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'countdown', 'racing', 'finished', 'cancelled')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kart_races_team ON kart_races(team_id);
CREATE INDEX idx_kart_races_status ON kart_races(status);

-- ============================================================
-- KART RACE RESULTS
-- ============================================================

CREATE TABLE kart_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    race_id UUID NOT NULL REFERENCES kart_races(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    position INTEGER,
    completion_time INTERVAL,
    quality_score NUMERIC(5,2),
    style_score NUMERIC(5,2),
    items_used INTEGER NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    tasks_total INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'racing', 'finished', 'crashed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kart_results_race ON kart_results(race_id);
CREATE INDEX idx_kart_results_agent ON kart_results(agent_id);
CREATE INDEX idx_kart_results_position ON kart_results(race_id, position);

-- ============================================================
-- RLS for game tables
-- ============================================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE kart_races ENABLE ROW LEVEL SECURITY;
ALTER TABLE kart_results ENABLE ROW LEVEL SECURITY;

-- Achievements: users can view their own team's achievements
CREATE POLICY "Team members can view achievements"
    ON achievements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM agents a
            JOIN team_members tm ON tm.team_id = a.team_id
            WHERE a.id = achievements.agent_id
            AND tm.user_id = auth.uid()
        )
    );

-- Kart races: team members can view races
CREATE POLICY "Team members can view kart races"
    ON kart_races FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = kart_races.team_id
            AND team_members.user_id = auth.uid()
        )
    );

-- Kart results: viewable through race access
CREATE POLICY "Team members can view kart results"
    ON kart_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM kart_races kr
            JOIN team_members tm ON tm.team_id = kr.team_id
            WHERE kr.id = kart_results.race_id
            AND tm.user_id = auth.uid()
        )
    );
