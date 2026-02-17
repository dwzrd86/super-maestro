'use client';

import { Bot } from 'lucide-react';
import { useState, useEffect } from 'react';

type RacerStatus = 'racing' | 'finished';
interface Racer { id: string; name: string; model: string; progress: number; status: RacerStatus; }

export default function KartRacePage() {
  const [racers, setRacers] = useState<Racer[]>([
    { id: 'devops', name: 'DevOps Agent', model: 'Claude Opus', progress: 0, status: 'racing' },
    { id: 'code', name: 'Code Assistant', model: 'Claude Sonnet', progress: 0, status: 'racing' },
    { id: 'research', name: 'Research Bot', model: 'GPT-4', progress: 0, status: 'racing' },
  ]);
  const [elapsed, setElapsed] = useState(0);
  const [raceStatus, setRaceStatus] = useState<'countdown' | 'racing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (raceStatus !== 'countdown') return;
    if (countdown <= 0) { setRaceStatus('racing'); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, raceStatus]);

  useEffect(() => {
    if (raceStatus !== 'racing') return;
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
      setRacers((prev) => {
        const updated = prev.map((r) => {
          if (r.progress >= 100) return { ...r, status: 'finished' as const };
          const baseSpeed = r.id === 'devops' ? 3.2 : r.id === 'code' ? 2.8 : 2.4;
          const randomness = Math.random() * 2 - 0.5;
          const newProgress = Math.min(100, r.progress + baseSpeed + randomness);
          return { ...r, progress: newProgress, status: newProgress >= 100 ? 'finished' as const : 'racing' as const };
        });
        if (updated.every((r) => r.progress >= 100)) setRaceStatus('finished');
        return updated;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [raceStatus]);

  const sorted = [...racers].sort((a, b) => b.progress - a.progress);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-heading text-lg" style={{ color: 'var(--sm-text-primary)' }}>
          {raceStatus === 'countdown' ? (countdown > 0 ? countdown.toString() : 'GO!') : raceStatus === 'finished' ? 'RACE COMPLETE!' : 'MUSHROOM CUP'}
        </h1>
        {raceStatus === 'racing' && (
          <p className="mt-2 font-heading text-xs" style={{ color: 'var(--sm-text-muted)' }}>
            Time: {Math.floor(elapsed / 2)}:{String((elapsed % 2) * 30).padStart(2, '0')}
          </p>
        )}
      </div>

      {raceStatus === 'countdown' && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-achievement-pop font-heading text-6xl" style={{ color: countdown > 0 ? 'var(--sm-star-yellow)' : 'var(--sm-pipe-green)' }} key={countdown}>
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        </div>
      )}

      {raceStatus !== 'countdown' && (
        <div className="space-y-6">
          {sorted.map((racer, index) => (
            <div key={racer.id} className="game-card p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg font-heading text-sm"
                  style={{ background: index === 0 ? 'var(--sm-star-yellow)' : index === 1 ? 'var(--sm-text-secondary)' : 'var(--sm-bg-secondary)', color: index < 2 ? 'var(--sm-text-inverse)' : 'var(--sm-text-muted)' }}>
                  P{index + 1}
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" style={{ color: 'var(--sm-text-muted)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--sm-text-primary)' }}>{racer.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--sm-text-muted)' }}>{racer.model}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative h-8 overflow-hidden rounded-lg kart-track">
                    <div className="kart-racer absolute left-0 top-0 flex h-full items-center" style={{ left: `${Math.min(racer.progress, 95)}%` }}>
                      <span className="text-xl">{racer.status === 'finished' ? '🏁' : '🏎️'}</span>
                    </div>
                  </div>
                </div>
                <span className="w-16 text-right font-heading text-xs" style={{ color: racer.status === 'finished' ? 'var(--sm-star-yellow)' : 'var(--sm-text-secondary)' }}>
                  {Math.round(racer.progress)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {raceStatus === 'finished' && (
        <div className="game-card p-6 text-center" style={{ borderColor: 'var(--sm-star-yellow)' }}>
          <div className="text-4xl">🏆</div>
          <h2 className="mt-2 font-heading text-sm" style={{ color: 'var(--sm-star-yellow)' }}>{sorted[0]?.name} WINS!</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--sm-text-secondary)' }}>
            Time: {Math.floor(elapsed / 2)}:{String((elapsed % 2) * 30).padStart(2, '0')}
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <a href="/kart/setup" className="rounded-lg px-4 py-2 text-sm font-medium" style={{ border: '2px solid var(--sm-border)', color: 'var(--sm-text-secondary)' }}>New Race</a>
            <a href="/kart" className="rounded-lg px-4 py-2 text-sm font-medium" style={{ background: 'var(--sm-primary)', color: 'var(--sm-text-inverse)' }}>Back to Kart</a>
          </div>
        </div>
      )}
    </div>
  );
}
