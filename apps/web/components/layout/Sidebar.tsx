'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  Home,
  PlaySquare,
  Settings,
  Terminal,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Navigation items for the sidebar.
 */
const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Playbooks', href: '/playbooks', icon: PlaySquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

/**
 * Sidebar component - Main navigation for the dashboard.
 *
 * Features:
 * - Logo and brand
 * - Navigation links with active state
 * - User section placeholder
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Logo section */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6 dark:border-gray-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          AgentForge
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Quick actions */}
      <div className="border-t border-gray-200 px-3 py-4 dark:border-gray-800">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
              <Terminal className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Local Runner
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Connected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User section placeholder */}
      <div className="border-t border-gray-200 px-3 py-4 dark:border-gray-800">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              User Name
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              user@example.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
