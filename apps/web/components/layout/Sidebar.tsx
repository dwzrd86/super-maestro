'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  Flag,
  Home,
  PlaySquare,
  Settings,
  Terminal,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/branding/Logo';
import { ThemeToggle } from '@/components/branding/ThemeToggle';
import { CoinCounter } from '@/components/game/CoinCounter';
import { LivesCounter } from '@/components/game/LivesCounter';

/**
 * Navigation items — using game metaphors from the vision doc.
 */
const navigation = [
  { name: 'World Map', href: '/', icon: Home },
  { name: 'Player Select', href: '/agents', icon: Bot },
  { name: 'Worlds', href: '/playbooks', icon: Flag },
  { name: 'Kart', href: '/kart', icon: Trophy },
  { name: 'Settings', href: '/settings', icon: Settings },
];

/**
 * Sidebar — Super Maestro branded navigation with game HUD elements.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-full w-64 flex-col"
      style={{
        background: 'var(--sm-bg-sidebar)',
        borderRight: '2px solid var(--sm-border)',
      }}
    >
      {/* Logo section */}
      <div
        className="flex h-16 items-center gap-3 px-5"
        style={{ borderBottom: '2px solid var(--sm-border)' }}
      >
        <Logo size={32} />
        <div className="flex flex-col">
          <span
            className="font-heading text-[10px] leading-tight"
            style={{ color: 'var(--sm-text-primary)' }}
          >
            SUPER
          </span>
          <span
            className="font-heading text-[10px] leading-tight"
            style={{ color: 'var(--sm-star-yellow)' }}
          >
            MAESTRO
          </span>
        </div>
      </div>

      {/* Game HUD — Coins & Lives */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid var(--sm-border-muted)' }}
      >
        <CoinCounter count={1247} label="tokens" />
        <LivesCounter current={3} max={5} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive ? 'pixel-border-active' : ''
              )}
              style={{
                background: isActive ? 'var(--sm-primary-muted)' : 'transparent',
                color: isActive ? 'var(--sm-primary)' : 'var(--sm-text-secondary)',
              }}
            >
              <item.icon
                className="h-5 w-5 transition-transform group-hover:scale-110"
                style={{
                  color: isActive ? 'var(--sm-primary)' : 'var(--sm-text-muted)',
                }}
              />
              <span>{item.name}</span>
              {item.name === 'Kart' && (
                <span
                  className="ml-auto rounded-full px-1.5 py-0.5 font-heading text-[8px]"
                  style={{
                    background: 'var(--sm-star-yellow)',
                    color: 'var(--sm-text-inverse)',
                  }}
                >
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Runner Status */}
      <div
        className="px-3 py-3"
        style={{ borderTop: '1px solid var(--sm-border)' }}
      >
        <div
          className="flex items-center gap-3 rounded-lg p-3"
          style={{ background: 'var(--sm-bg-secondary)' }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ background: 'var(--sm-info-bg)' }}
          >
            <Terminal className="h-5 w-5" style={{ color: 'var(--sm-info)' }} />
          </div>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--sm-text-primary)' }}
            >
              Local Runner
            </p>
            <div className="flex items-center gap-1.5">
              <div className="status-dot status-running" />
              <p className="text-xs" style={{ color: 'var(--sm-success)' }}>
                Connected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div
        className="px-3 py-3"
        style={{ borderTop: '1px solid var(--sm-border)' }}
      >
        <div className="flex items-center justify-between px-2">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
