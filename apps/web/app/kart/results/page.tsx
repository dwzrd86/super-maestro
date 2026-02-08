'use client';

import Link from 'next/link';

export default function KartResultsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-lg" style={{ color: 'var(--sm-text-primary)' }}>RESULTS</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--sm-text-secondary)' }}>Race history and all-time leaderboard.</p>
      </div>

      <div className="game-card p-6">
        <h2 className="mb-4 font-heading text-xs" style={{ color: 'var(--sm-star-yellow)' }}>GRAND PRIX STANDINGS</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-xl p-6" style={{ background: 'var(--sm-bg-secondary)' }}>
            <span className="text-3xl">🥇</span>
            <p className="mt-2 font-heading text-xs" style={{ color: 'var(--sm-star-yellow)' }}>1st Place</p>
            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--sm-text-primary)' }}>DevOps Agent</p>
            <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>31 wins / 38 races</p>
          </div>
          <div className="flex flex-col items-center rounded-xl p-6" style={{ background: 'var(--sm-bg-secondary)' }}>
            <span className="text-3xl">🥈</span>
            <p className="mt-2 font-heading text-xs" style={{ color: 'var(--sm-text-secondary)' }}>2nd Place</p>
            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--sm-text-primary)' }}>Code Assistant</p>
            <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>23 wins / 35 races</p>
          </div>
          <div className="flex flex-col items-center rounded-xl p-6" style={{ background: 'var(--sm-bg-secondary)' }}>
            <span className="text-3xl">🥉</span>
            <p className="mt-2 font-heading text-xs" style={{ color: 'var(--sm-power-red)' }}>3rd Place</p>
            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--sm-text-primary)' }}>Research Bot</p>
            <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>12 wins / 28 races</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link href="/kart" className="rounded-lg px-6 py-2 text-sm font-medium" style={{ background: 'var(--sm-primary)', color: 'var(--sm-text-inverse)' }}>
          Back to Kart
        </Link>
      </div>
    </div>
  );
}
