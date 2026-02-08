'use client';

import { Bot, Check, ChevronLeft, Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function KartSetupPage() {
  const [selectedTrack, setSelectedTrack] = useState('mushroom');
  const [selectedAgents, setSelectedAgents] = useState(['code-assistant', 'devops-agent']);

  const tracks = [
    { id: 'mushroom', name: 'Mushroom Cup', emoji: '🍄', duration: '~2 min', color: 'var(--sm-pipe-green)' },
    { id: 'flower', name: 'Flower Cup', emoji: '🌸', duration: '~5 min', color: 'var(--sm-info)' },
    { id: 'star', name: 'Star Cup', emoji: '⭐', duration: '~15 min', color: 'var(--sm-star-yellow)' },
    { id: 'special', name: 'Special Cup', emoji: '👑', duration: '~30 min', color: 'var(--sm-power-red)' },
  ];

  const agents = [
    { id: 'code-assistant', name: 'Code Assistant', model: 'Claude Sonnet', status: 'running' },
    { id: 'research-bot', name: 'Research Bot', model: 'GPT-4', status: 'idle' },
    { id: 'devops-agent', name: 'DevOps Agent', model: 'Claude Opus', status: 'running' },
    { id: 'data-analyst', name: 'Data Analyst', model: 'Claude Sonnet', status: 'offline' },
  ];

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/kart" className="mb-4 inline-flex items-center gap-1 text-sm transition-colors hover:underline" style={{ color: 'var(--sm-text-muted)' }}>
          <ChevronLeft className="h-4 w-4" /> Back to Kart
        </Link>
        <h1 className="font-heading text-lg" style={{ color: 'var(--sm-text-primary)' }}>RACE SETUP</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--sm-text-secondary)' }}>Choose your track and racers. Minimum 2 agents required.</p>
      </div>

      <div>
        <h2 className="mb-3 font-heading text-xs" style={{ color: 'var(--sm-text-primary)' }}>1. CHOOSE TRACK</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tracks.map((track) => (
            <button key={track.id} onClick={() => setSelectedTrack(track.id)}
              className="game-card flex flex-col items-center p-5 text-center transition-all"
              style={{ borderColor: selectedTrack === track.id ? track.color : undefined, boxShadow: selectedTrack === track.id ? `0 0 12px ${track.color}` : undefined }}>
              <span className="text-3xl">{track.emoji}</span>
              <span className="mt-2 font-heading text-[9px]" style={{ color: 'var(--sm-text-primary)' }}>{track.name}</span>
              <span className="mt-1 text-[10px]" style={{ color: 'var(--sm-text-muted)' }}>{track.duration}</span>
              {selectedTrack === track.id && (
                <div className="mt-2 flex h-5 w-5 items-center justify-center rounded-full" style={{ background: track.color }}>
                  <Check className="h-3 w-3" style={{ color: 'var(--sm-text-inverse)' }} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-heading text-xs" style={{ color: 'var(--sm-text-primary)' }}>2. SELECT RACERS ({selectedAgents.length}/8)</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent) => {
            const isSelected = selectedAgents.includes(agent.id);
            return (
              <button key={agent.id} onClick={() => toggleAgent(agent.id)}
                className={`game-card flex items-center gap-3 p-4 text-left transition-all ${agent.status === 'offline' ? 'opacity-50' : ''}`}
                style={{ borderColor: isSelected ? 'var(--sm-primary)' : undefined, boxShadow: isSelected ? '0 0 12px var(--sm-primary)' : undefined }}
                disabled={agent.status === 'offline'}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--sm-bg-secondary)' }}>
                  <Bot className="h-5 w-5" style={{ color: 'var(--sm-text-muted)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--sm-text-primary)' }}>{agent.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--sm-text-muted)' }}>{agent.model}</p>
                </div>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: 'var(--sm-primary)' }}>
                    <Check className="h-3 w-3" style={{ color: 'var(--sm-text-inverse)' }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="game-card flex items-center justify-between p-6" style={{ borderColor: 'var(--sm-primary)' }}>
        <div>
          <h3 className="text-sm font-medium" style={{ color: 'var(--sm-text-primary)' }}>Race Summary</h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--sm-text-secondary)' }}>
            Track: {tracks.find((t) => t.id === selectedTrack)?.name} &middot; {selectedAgents.length} racers
          </p>
        </div>
        <Link href="/kart/race"
          className={`flex items-center gap-2 rounded-xl px-6 py-3 font-heading text-xs transition-all hover:scale-105 ${selectedAgents.length < 2 ? 'pointer-events-none opacity-40' : ''}`}
          style={{ background: 'var(--sm-primary)', color: 'var(--sm-text-inverse)', boxShadow: selectedAgents.length >= 2 ? '0 0 20px var(--sm-primary)' : 'none' }}>
          <Play className="h-5 w-5" /> START RACE
        </Link>
      </div>
    </div>
  );
}
