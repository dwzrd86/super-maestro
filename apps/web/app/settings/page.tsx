'use client';

import { Bell, Key, Palette, Shield, User, Users } from 'lucide-react';
import { ThemeToggle } from '@/components/branding/ThemeToggle';

/**
 * Settings — User and team configuration with theme selection.
 */
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-lg" style={{ color: 'var(--sm-text-primary)' }}>SETTINGS</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--sm-text-secondary)' }}>Manage your account, team, and theme.</p>
      </div>

      <div className="flex gap-8">
        <nav className="w-64 space-y-1">
          <SettingsNavItem icon={User} label="Profile" active />
          <SettingsNavItem icon={Bell} label="Notifications" />
          <SettingsNavItem icon={Key} label="API Keys" />
          <SettingsNavItem icon={Palette} label="Appearance" />
          <SettingsNavItem icon={Users} label="Team" />
          <SettingsNavItem icon={Shield} label="Security" />
        </nav>

        <div className="game-card flex-1 p-6">
          <h2 className="font-heading text-xs" style={{ color: 'var(--sm-text-primary)' }}>PROFILE</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--sm-text-secondary)' }}>Update your personal information and preferences.</p>

          <form className="mt-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full" style={{ background: 'var(--sm-bg-secondary)' }} />
              <button type="button" className="rounded-lg px-4 py-2 text-sm font-medium" style={{ border: '2px solid var(--sm-border)', color: 'var(--sm-text-secondary)' }}>
                Change Avatar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--sm-text-secondary)' }}>Full Name</label>
                <input type="text" defaultValue="User Name" className="mt-1 w-full rounded-lg px-4 py-2 text-sm focus:outline-none" style={{ background: 'var(--sm-bg-secondary)', border: '2px solid var(--sm-border)', color: 'var(--sm-text-primary)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--sm-text-secondary)' }}>Email</label>
                <input type="email" defaultValue="user@example.com" className="mt-1 w-full rounded-lg px-4 py-2 text-sm focus:outline-none" style={{ background: 'var(--sm-bg-secondary)', border: '2px solid var(--sm-border)', color: 'var(--sm-text-primary)' }} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--sm-text-secondary)' }}>Theme</label>
              <div className="mt-2">
                <ThemeToggle />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6" style={{ borderTop: '1px solid var(--sm-border)' }}>
              <button type="button" className="rounded-lg px-4 py-2 text-sm font-medium" style={{ border: '2px solid var(--sm-border)', color: 'var(--sm-text-secondary)' }}>Cancel</button>
              <button type="submit" className="rounded-lg px-4 py-2 text-sm font-medium" style={{ background: 'var(--sm-primary)', color: 'var(--sm-text-inverse)' }}>Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SettingsNavItem({ icon: Icon, label, active = false }: { icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean }) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      style={{
        background: active ? 'var(--sm-primary-muted)' : 'transparent',
        color: active ? 'var(--sm-primary)' : 'var(--sm-text-secondary)',
      }}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
