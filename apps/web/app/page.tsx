'use client';

import {
  Bot,
  Flag,
  Star,
  Terminal,
  Zap,
} from 'lucide-react';
import { ProgressPipe } from '@/components/game/ProgressPipe';
import { AchievementBadge } from '@/components/game/AchievementToast';
import { PowerUpBadge } from '@/components/game/PowerUpBadge';

/**
 * Super Maestro World Map — The main dashboard.
 * Shows game-styled stats, world progress, recent activity, and achievements.
 */
export default function WorldMapPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1
          className="font-heading text-lg"
          style={{ color: 'var(--sm-text-primary)' }}
        >
          WORLD MAP
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--sm-text-secondary)' }}>
          Your command center. Track agents, worlds, and achievements.
        </p>
      </div>

      {/* Stats cards — Game HUD style */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Players"
          value="3"
          subtitle="2 racing, 1 idle"
          icon={<Bot className="h-6 w-6" />}
          color="var(--sm-info)"
          bgColor="var(--sm-info-bg)"
        />
        <StatCard
          title="Worlds"
          value="12"
          subtitle="3 in progress"
          icon={<Flag className="h-6 w-6" />}
          color="var(--sm-accent)"
          bgColor="var(--sm-warning-bg)"
        />
        <StatCard
          title="Active Sessions"
          value="5"
          subtitle="Across 3 agents"
          icon={<Terminal className="h-6 w-6" />}
          color="var(--sm-pipe-green)"
          bgColor="var(--sm-success-bg)"
        />
        <StatCard
          title="Tasks Today"
          value="47"
          subtitle="94% success rate"
          icon={<Zap className="h-6 w-6" />}
          color="var(--sm-star-yellow)"
          bgColor="var(--sm-warning-bg)"
        />
      </div>

      {/* World Progress + Power-Ups */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* World Progress — takes 2 columns */}
        <div className="game-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="font-heading text-xs"
              style={{ color: 'var(--sm-text-primary)' }}
            >
              WORLD PROGRESS
            </h2>
            <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
              3/12 complete
            </span>
          </div>

          <div className="space-y-4">
            <WorldProgressRow worldNumber={1} name="Deploy to Production" levels={8} completedLevels={8} status="completed" />
            <WorldProgressRow worldNumber={2} name="Code Review Pipeline" levels={5} completedLevels={5} status="completed" />
            <WorldProgressRow worldNumber={3} name="Database Backup" levels={4} completedLevels={4} status="completed" />
            <WorldProgressRow worldNumber={4} name="Security Scan" levels={6} completedLevels={3} status="in_progress" />
            <WorldProgressRow worldNumber={5} name="Performance Test" levels={10} completedLevels={0} status="locked" />
          </div>
        </div>

        {/* Power-Ups (Skills) */}
        <div className="game-card p-6">
          <h2
            className="mb-4 font-heading text-xs"
            style={{ color: 'var(--sm-text-primary)' }}
          >
            POWER-UPS
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <PowerUpBadge name="Speed Boost" icon="⚡" rarity="common" equipped />
            <PowerUpBadge name="Code Shield" icon="🛡️" rarity="rare" />
            <PowerUpBadge name="Star Power" icon="⭐" rarity="legendary" equipped />
            <PowerUpBadge name="Debug Lens" icon="🔍" rarity="common" />
            <PowerUpBadge name="Pipe Link" icon="🟢" rarity="rare" equipped />
            <PowerUpBadge name="1-UP" icon="💚" rarity="legendary" />
          </div>
        </div>
      </div>

      {/* Recent Activity + Achievements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Players */}
        <div className="game-card p-6">
          <h2
            className="mb-4 font-heading text-xs"
            style={{ color: 'var(--sm-text-primary)' }}
          >
            ACTIVE PLAYERS
          </h2>
          <div className="space-y-3">
            <PlayerRow name="Code Assistant" status="running" model="Claude Sonnet" activity="Active now" />
            <PlayerRow name="Research Bot" status="idle" model="GPT-4" activity="5 minutes ago" />
            <PlayerRow name="DevOps Agent" status="running" model="Claude Opus" activity="Active now" />
          </div>
          <a
            href="/agents"
            className="mt-4 inline-block text-sm transition-colors hover:underline"
            style={{ color: 'var(--sm-primary)' }}
          >
            Player Select &rarr;
          </a>
        </div>

        {/* Achievements Showcase */}
        <div className="game-card p-6">
          <h2
            className="mb-4 font-heading text-xs"
            style={{ color: 'var(--sm-text-primary)' }}
          >
            ACHIEVEMENTS
          </h2>
          <div className="grid grid-cols-5 gap-2">
            <AchievementBadge icon="🍄" name="First Mushroom" unlocked />
            <AchievementBadge icon="⭐" name="Star Power" unlocked />
            <AchievementBadge icon="🟢" name="Pipe Dreams" unlocked />
            <AchievementBadge icon="🏁" name="World Complete" unlocked />
            <AchievementBadge icon="⚡" name="Speedrunner" unlocked />
            <AchievementBadge icon="💚" name="No Deaths" />
            <AchievementBadge icon="👑" name="Boss Defeated" />
            <AchievementBadge icon="🏎️" name="Kartographer" />
            <AchievementBadge icon="🏆" name="Grand Prix" />
            <AchievementBadge icon="🌐" name="Mesh Network" />
          </div>
          <div className="mt-3">
            <ProgressPipe progress={50} label="Completion" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* === Helper Components === */

function StatCard({
  title, value, subtitle, icon, color, bgColor,
}: {
  title: string; value: string; subtitle: string; icon: React.ReactNode; color: string; bgColor: string;
}) {
  return (
    <div className="game-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--sm-text-muted)' }}>{title}</p>
          <p className="mt-1 font-heading text-lg" style={{ color: 'var(--sm-text-primary)' }}>{value}</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--sm-text-secondary)' }}>{subtitle}</p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: bgColor, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function WorldProgressRow({
  worldNumber, name, levels, completedLevels, status,
}: {
  worldNumber: number; name: string; levels: number; completedLevels: number;
  status: 'completed' | 'in_progress' | 'locked';
}) {
  const progress = levels > 0 ? (completedLevels / levels) * 100 : 0;

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg font-heading text-xs ${
          status === 'locked' ? 'opacity-40' : ''
        }`}
        style={{
          background: status === 'completed' ? 'var(--sm-success-bg)' : status === 'in_progress' ? 'var(--sm-info-bg)' : 'var(--sm-bg-secondary)',
          color: status === 'completed' ? 'var(--sm-success)' : status === 'in_progress' ? 'var(--sm-info)' : 'var(--sm-text-muted)',
          border: `1px solid ${status === 'completed' ? 'var(--sm-success)' : status === 'in_progress' ? 'var(--sm-info)' : 'var(--sm-border)'}`,
        }}
      >
        {worldNumber}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${status === 'locked' ? 'opacity-40' : ''}`} style={{ color: 'var(--sm-text-primary)' }}>
            {name}
          </span>
          <span className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
            {completedLevels}/{levels}
          </span>
        </div>
        <div className="mt-1">
          <ProgressPipe progress={progress} showPercent={false} />
        </div>
      </div>
      {status === 'completed' && (
        <Star className="h-4 w-4" style={{ color: 'var(--sm-star-yellow)' }} />
      )}
    </div>
  );
}

function PlayerRow({
  name, status, model, activity,
}: {
  name: string; status: 'running' | 'idle' | 'error'; model: string; activity: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-lg p-3"
      style={{ background: 'var(--sm-bg-secondary)', border: '1px solid var(--sm-border-muted)' }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--sm-bg-card)' }}>
            <Bot className="h-5 w-5" style={{ color: 'var(--sm-text-muted)' }} />
          </div>
          <div
            className={`status-dot absolute -bottom-0.5 -right-0.5 border-2 ${
              status === 'running' ? 'status-running' : status === 'idle' ? 'status-idle' : 'status-error'
            }`}
            style={{ borderColor: 'var(--sm-bg-secondary)' }}
          />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--sm-text-primary)' }}>{name}</p>
          <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{model}</p>
        </div>
      </div>
      <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{activity}</p>
    </div>
  );
}
