import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeProvider } from '@/components/branding/ThemeProvider';

export const metadata: Metadata = {
  title: 'Super Maestro — AI Agent Orchestration Platform',
  description: "It's-a me, your AI agent orchestrator! Manage, monitor, and orchestrate AI agents with the power of retro gaming.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar navigation */}
            <Sidebar />

            {/* Main content area */}
            <main
              className="flex-1 overflow-auto"
              style={{ background: 'var(--sm-bg-primary)' }}
            >
              <div className="mx-auto max-w-7xl px-6 py-8">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
