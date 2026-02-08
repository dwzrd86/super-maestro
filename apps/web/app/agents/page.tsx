'use client';

import { Bot, Plus, Search, Star, Zap } from 'lucide-react';

/**
 * Player Select — Choose and manage your AI agents.
 * Styled as a character selection screen.
 */
export default function PlayerSelectPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg" style={{ color: 'var(--sm-text-primary)' }}>
            PLAYER SELECT
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--sm-text-secondary)' }}>
            Choose your agents. Equip power-ups. Enter the arena.
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:scale-105"
          style={{ background: 'var(--sm-primary)', color: 'var(--sm-text-inverse)' }}
        >
          <Plus className="h-4 w-4" />
          New Player
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--sm-text-muted)' }} />
          <input
            type="text"
            placeholder="Search players..."
            className="w-full rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none"
            style={{ background: 'var(--sm-bg-card)', border: '2px solid var(--sm-border)', color: 'var(--sm-text-primary)' }}
          />
        </div>
        <select className="rounded-lg px-4 py-2 text-sm" style={{ background: 'var(--sm-bg-card)', border: '2px solid var(--sm-border)', color: 'var(--sm-text-primary)' }}>
          <option>All Status</option>
          <option>Running</option>
          <option>Idle</option>
          <option>Error</option>
        </select>
        <select className="rounded-lg px-4 py-2 text-sm" style={{ background: 'var(--sm-bg-card)', border: '2px solid var(--sm-border)', color: 'var(--sm-text-primary)' }}>
          <option>All Models</option>
          <option>Claude Opus</option>
          <option>Claude Sonnet</option>
          <option>GPT-4</option>
        </select>
      </div>

      {/* Player Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PlayerCard name="Code Assistant" description="Master coder. Debugging expert. Ship-quality craftsman." model="Claude Sonnet" status="running" sessions={2} lastActive="Active now" powerUps={[{ name: 'Speed', icon: '⚡' }, { name: 'Debug', icon: '🔍' }]} wins={23} level={7} />
        <PlayerCard name="Research Bot" description="Web crawler. Knowledge synthesizer. Truth seeker." model="GPT-4" status="idle" sessions={0} lastActive="5 min ago" powerUps={[{ name: 'Search', icon: '🔎' }]} wins={12} level={4} />
        <PlayerCard name="DevOps Agent" description="Deployment ninja. Infrastructure guardian. CI/CD master." model="Claude Opus" status="running" sessions={1} lastActive="Active now" powerUps={[{ name: 'Shield', icon: '🛡️' }, { name: 'Deploy', icon: '🚀' }, { name: 'Monitor', icon: '📊' }]} wins={31} level={9} />
        <PlayerCard name="Data Analyst" description="Pattern finder. Insight generator. Visualization artist." model="Claude Sonnet" status="offline" sessions={0} lastActive="2 hours ago" powerUps={[{ name: 'Chart', icon: '📈' }]} wins={8} level={3} />

        {/* New player card */}
        <div className="flex items-center justify-center rounded-xl p-8" style={{ border: '3px dashed var(--sm-border)' }}>
          <button className="flex flex-col items-center gap-3 transition-transform hover:scale-110">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: 'var(--sm-bg-card)' }}>
              <Plus className="h-7 w-7" style={{ color: 'var(--sm-text-muted)' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--sm-text-muted)' }}>Create New Player</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({
  name, description, model, status, sessions, lastActive, powerUps, wins, level,
}: {
  name: string; description: string; model: string;
  status: 'running' | 'idle' | 'error' | 'offline';
  sessions: number; lastActive: string;
  powerUps: Array<{ name: string; icon: string }>;
  wins: number; level: number;
}) {
  const statusLabels: Record<string, { text: string; color: string; bg: string }> = {
    running: { text: 'RACING', color: 'var(--sm-success)', bg: 'var(--sm-success-bg)' },
    idle: { text: 'READY', color: 'var(--sm-warning)', bg: 'var(--sm-warning-bg)' },
    error: { text: 'CRASHED', color: 'var(--sm-error)', bg: 'var(--sm-error-bg)' },
    offline: { text: 'OFFLINE', color: 'var(--sm-text-muted)', bg: 'var(--sm-bg-secondary)' },
  };
  const s = statusLabels[status];

  return (
    <div className="game-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: 'var(--sm-bg-secondary)' }}>
              <Bot className="h-7 w-7" style={{ color: 'var(--sm-text-muted)' }} />
            </div>
            <div
              className={`status-dot absolute -bottom-0.5 -right-0.5 border-2 ${
                status === 'running' ? 'status-running' : status === 'idle' ? 'status-idle' : status === 'error' ? 'status-error' : 'status-offline'
              }`}
              style={{ borderColor: 'var(--sm-bg-card)' }}
            />
          </div>
          <div>
            <h3 className="font-heading text-[11px]" style={{ color: 'var(--sm-text-primary)' }}>{name}</h3>
            <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{model}</p>
          </div>
        </div>
        <span className="rounded-full px-2 py-0.5 font-heading text-[8px]" style={{ background: s.bg, color: s.color }}>{s.text}</span>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm" style={{ color: 'var(--sm-text-secondary)' }}>{description}</p>

      {/* Player Stats */}
      <div className="mt-4 flex items-center gap-4 rounded-lg p-2" style={{ background: 'var(--sm-bg-secondary)' }}>
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5" style={{ color: 'var(--sm-star-yellow)' }} />
          <span className="text-xs" style={{ color: 'var(--sm-text-secondary)' }}>Lv.{level}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs" style={{ color: 'var(--sm-coin-gold)' }}>🏆</span>
          <span className="text-xs" style={{ color: 'var(--sm-text-secondary)' }}>{wins} wins</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-3.5 w-3.5" style={{ color: 'var(--sm-pipe-green)' }} />
          <span className="text-xs" style={{ color: 'var(--sm-text-secondary)' }}>{sessions} active</span>
        </div>
      </div>

      {/* Equipped Power-Ups */}
      <div className="mt-3">
        <p className="mb-1.5 text-[10px] uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)' }}>Power-ups</p>
        <div className="flex gap-1.5">
          {powerUps.map((p) => (
            <div key={p.name} className="flex items-center gap-1 rounded px-1.5 py-0.5" style={{ background: 'var(--sm-bg-secondary)', border: '1px solid var(--sm-border)' }}>
              <span className="text-xs">{p.icon}</span>
              <span className="text-[10px]" style={{ color: 'var(--sm-text-secondary)' }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--sm-border-muted)' }}>
        <span className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{lastActive}</span>
        <button className="rounded-lg px-3 py-1 text-xs font-medium transition-all hover:scale-105" style={{ background: 'var(--sm-primary)', color: 'var(--sm-text-inverse)' }}>
          Select
        </button>
      </div>
    </div>
  );
}
