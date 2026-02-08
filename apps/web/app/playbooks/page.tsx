'use client';

import { Clock, Flag, GitBranch, Lock, Play, Plus, Search, Star } from 'lucide-react';
import { ProgressPipe } from '@/components/game/ProgressPipe';

/**
 * Worlds — Playbooks reimagined as game worlds with levels.
 */
export default function WorldsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg" style={{ color: 'var(--sm-text-primary)' }}>WORLDS</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--sm-text-secondary)' }}>
            Each world is a playbook. Each level is a task. Complete them all to defeat the boss.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:scale-105" style={{ background: 'var(--sm-primary)', color: 'var(--sm-text-inverse)' }}>
          <Plus className="h-4 w-4" /> New World
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--sm-text-muted)' }} />
          <input type="text" placeholder="Search worlds..." className="w-full rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none" style={{ background: 'var(--sm-bg-card)', border: '2px solid var(--sm-border)', color: 'var(--sm-text-primary)' }} />
        </div>
        <select className="rounded-lg px-4 py-2 text-sm" style={{ background: 'var(--sm-bg-card)', border: '2px solid var(--sm-border)', color: 'var(--sm-text-primary)' }}>
          <option>All Tags</option>
          <option>Deployment</option>
          <option>Testing</option>
          <option>Maintenance</option>
        </select>
      </div>

      <div className="space-y-4">
        <WorldCard number={1} name="Deploy to Production" description="Build, test, and deploy the application to production servers." levels={8} completedLevels={8} avgDuration="3m 45s" lastRun="10 min ago" runs={47} tags={['deployment', 'production']} status="completed" />
        <WorldCard number={2} name="Code Review Pipeline" description="Run linting, type checking, and automated tests on pull requests." levels={5} completedLevels={5} avgDuration="2m 15s" lastRun="Just now" runs={234} tags={['testing', 'ci']} status="completed" />
        <WorldCard number={3} name="Database Backup" description="Create incremental backup of the production database." levels={4} completedLevels={4} avgDuration="1m 30s" lastRun="1 hour ago" runs={128} tags={['maintenance', 'database']} status="completed" />
        <WorldCard number={4} name="Security Scan" description="Run comprehensive security vulnerability scanning." levels={6} completedLevels={3} avgDuration="5m 20s" lastRun="6 hours ago" runs={42} tags={['security']} status="in_progress" />
        <WorldCard number={5} name="Performance Test" description="Run load tests and collect performance metrics." levels={10} completedLevels={0} avgDuration="15m 00s" lastRun="Never" runs={0} tags={['testing', 'performance']} status="locked" />
      </div>
    </div>
  );
}

function WorldCard({
  number, name, description, levels, completedLevels, avgDuration, lastRun, runs, tags, status,
}: {
  number: number; name: string; description: string; levels: number; completedLevels: number;
  avgDuration: string; lastRun: string; runs: number; tags: string[];
  status: 'completed' | 'in_progress' | 'locked';
}) {
  const progress = levels > 0 ? (completedLevels / levels) * 100 : 0;
  const statusConfig: Record<string, { label: string; Icon: typeof Star; color: string }> = {
    completed: { label: 'WORLD CLEAR', Icon: Star, color: 'var(--sm-star-yellow)' },
    in_progress: { label: 'IN PROGRESS', Icon: Flag, color: 'var(--sm-info)' },
    locked: { label: 'LOCKED', Icon: Lock, color: 'var(--sm-text-muted)' },
  };
  const s = statusConfig[status];

  return (
    <div className={`game-card flex items-center justify-between p-6 ${status === 'locked' ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl"
          style={{ background: status === 'completed' ? 'var(--sm-success-bg)' : status === 'in_progress' ? 'var(--sm-info-bg)' : 'var(--sm-bg-secondary)', border: `2px solid ${s.color}` }}>
          <span className="font-heading text-[10px]" style={{ color: 'var(--sm-text-muted)' }}>WORLD</span>
          <span className="font-heading text-sm" style={{ color: s.color }}>{number}</span>
        </div>
        <div className="max-w-lg">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-xs" style={{ color: 'var(--sm-text-primary)' }}>{name}</h3>
            <div className="flex gap-1">
              {tags.map((tag) => (
                <span key={tag} className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--sm-bg-secondary)', color: 'var(--sm-text-muted)' }}>{tag}</span>
              ))}
            </div>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--sm-text-secondary)' }}>{description}</p>
          <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
            <span className="flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" />{levels} levels</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />~{avgDuration}</span>
            <span>{runs} runs</span>
            <span>Last: {lastRun}</span>
          </div>
          <div className="mt-2 w-64">
            <ProgressPipe progress={progress} showPercent={false} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <s.Icon className="h-4 w-4" style={{ color: s.color }} />
          <span className="font-heading text-[8px]" style={{ color: s.color }}>{s.label}</span>
        </div>
        {status !== 'locked' && (
          <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:scale-105" style={{ background: 'var(--sm-primary)', color: 'var(--sm-text-inverse)' }}>
            <Play className="h-4 w-4" />{status === 'completed' ? 'Replay' : 'Play'}
          </button>
        )}
      </div>
    </div>
  );
}
