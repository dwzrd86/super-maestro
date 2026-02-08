'use client';

import { Bot, Clock, Play } from 'lucide-react';
import Link from 'next/link';

/**
 * Maestro Kart — Competitive agent benchmarking disguised as a racing game.
 */
export default function KartPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-lg" style={{ color: 'var(--sm-text-primary)' }}>MAESTRO KART</h1>
          <span className="animate-star-pulse rounded-full px-2 py-0.5 font-heading text-[8px]" style={{ background: 'var(--sm-star-yellow)', color: 'var(--sm-text-inverse)' }}>BETA</span>
        </div>
        <p className="mt-2 text-sm" style={{ color: 'var(--sm-text-secondary)' }}>
          Race your agents through coding challenges. Speed. Quality. Style.
        </p>
      </div>

      {/* Quick Race */}
      <div className="game-card flex items-center justify-between p-8" style={{ background: 'linear-gradient(135deg, var(--sm-bg-card) 0%, var(--sm-primary-muted) 100%)', borderColor: 'var(--sm-primary)' }}>
        <div>
          <h2 className="font-heading text-sm" style={{ color: 'var(--sm-primary)' }}>QUICK RACE</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--sm-text-secondary)' }}>Pick agents, pick a track, and race!</p>
        </div>
        <Link href="/kart/setup" className="flex items-center gap-2 rounded-xl px-6 py-3 font-heading text-xs transition-all hover:scale-105" style={{ background: 'var(--sm-primary)', color: 'var(--sm-text-inverse)', boxShadow: '0 0 20px var(--sm-primary)' }}>
          <Play className="h-5 w-5" /> START RACE
        </Link>
      </div>

      {/* Track Selection */}
      <div>
        <h2 className="mb-4 font-heading text-xs" style={{ color: 'var(--sm-text-primary)' }}>SELECT CUP</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TrackCard name="Mushroom Cup" emoji="🍄" description="Simple CRUD tasks" duration="~2 min" difficulty="Easy" color="var(--sm-pipe-green)" />
          <TrackCard name="Flower Cup" emoji="🌸" description="API integration" duration="~5 min" difficulty="Medium" color="var(--sm-info)" />
          <TrackCard name="Star Cup" emoji="⭐" description="Full-stack features" duration="~15 min" difficulty="Hard" color="var(--sm-star-yellow)" />
          <TrackCard name="Special Cup" emoji="👑" description="Architecture challenges" duration="~30 min" difficulty="Expert" color="var(--sm-power-red)" />
        </div>
      </div>

      {/* Leaderboard + Recent Races */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="game-card p-6">
          <h2 className="mb-4 font-heading text-xs" style={{ color: 'var(--sm-text-primary)' }}>LEADERBOARD</h2>
          <div className="space-y-2">
            <LeaderboardRow rank={1} name="DevOps Agent" model="Claude Opus" wins={31} races={38} avgTime="2m 14s" medal="🥇" />
            <LeaderboardRow rank={2} name="Code Assistant" model="Claude Sonnet" wins={23} races={35} avgTime="2m 48s" medal="🥈" />
            <LeaderboardRow rank={3} name="Research Bot" model="GPT-4" wins={12} races={28} avgTime="3m 22s" medal="🥉" />
            <LeaderboardRow rank={4} name="Data Analyst" model="Claude Sonnet" wins={8} races={15} avgTime="4m 05s" />
          </div>
        </div>

        <div className="game-card p-6">
          <h2 className="mb-4 font-heading text-xs" style={{ color: 'var(--sm-text-primary)' }}>RECENT RACES</h2>
          <div className="space-y-3">
            <RaceRow track="Mushroom Cup" emoji="🍄" winner="DevOps Agent" time="1m 52s" racers={3} ago="10 min ago" />
            <RaceRow track="Flower Cup" emoji="🌸" winner="Code Assistant" time="4m 33s" racers={4} ago="1 hour ago" />
            <RaceRow track="Star Cup" emoji="⭐" winner="DevOps Agent" time="12m 18s" racers={2} ago="3 hours ago" />
            <RaceRow track="Mushroom Cup" emoji="🍄" winner="Research Bot" time="2m 05s" racers={3} ago="Yesterday" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackCard({ name, emoji, description, duration, difficulty, color }: { name: string; emoji: string; description: string; duration: string; difficulty: string; color: string }) {
  return (
    <Link href="/kart/setup" className="game-card flex flex-col items-center p-6 text-center transition-all hover:scale-[1.03]">
      <span className="text-4xl">{emoji}</span>
      <h3 className="mt-3 font-heading text-[10px]" style={{ color: 'var(--sm-text-primary)' }}>{name}</h3>
      <p className="mt-1 text-xs" style={{ color: 'var(--sm-text-secondary)' }}>{description}</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[10px]" style={{ color: 'var(--sm-text-muted)' }}>{duration}</span>
        <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: color, color: 'var(--sm-text-inverse)' }}>{difficulty}</span>
      </div>
    </Link>
  );
}

function LeaderboardRow({ rank, name, model, wins, races, avgTime, medal }: { rank: number; name: string; model: string; wins: number; races: number; avgTime: string; medal?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg p-3" style={{ background: 'var(--sm-bg-secondary)', border: '1px solid var(--sm-border-muted)' }}>
      <span className="w-6 text-center text-lg">{medal || `#${rank}`}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4" style={{ color: 'var(--sm-text-muted)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--sm-text-primary)' }}>{name}</span>
          <span className="text-[10px]" style={{ color: 'var(--sm-text-muted)' }}>{model}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--sm-text-secondary)' }}>
        <span>🏆 {wins}/{races}</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{avgTime}</span>
      </div>
    </div>
  );
}

function RaceRow({ track, emoji, winner, time, racers, ago }: { track: string; emoji: string; winner: string; time: string; racers: number; ago: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg p-3" style={{ background: 'var(--sm-bg-secondary)', border: '1px solid var(--sm-border-muted)' }}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{emoji}</span>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--sm-text-primary)' }}>{track}</p>
          <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>Winner: {winner} &middot; {time} &middot; {racers} racers</p>
        </div>
      </div>
      <span className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{ago}</span>
    </div>
  );
}
