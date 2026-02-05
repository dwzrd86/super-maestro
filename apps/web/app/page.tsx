import { Activity, Bot, PlaySquare, Terminal } from 'lucide-react';

/**
 * Dashboard page - Overview of agents, playbooks, and recent activity.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your AI agents and automation workflows.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Agents"
          value="3"
          subtitle="2 running, 1 idle"
          icon={<Bot className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Playbooks"
          value="12"
          subtitle="3 running now"
          icon={<PlaySquare className="h-6 w-6" />}
          color="purple"
        />
        <StatCard
          title="Active Sessions"
          value="5"
          subtitle="Across 3 agents"
          icon={<Terminal className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Tasks Today"
          value="47"
          subtitle="94% success rate"
          icon={<Activity className="h-6 w-6" />}
          color="orange"
        />
      </div>

      {/* Recent activity section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent agents */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Agents
          </h2>
          <div className="mt-4 space-y-4">
            <AgentRow
              name="Code Assistant"
              status="running"
              model="Claude Sonnet"
              lastActive="Active now"
            />
            <AgentRow
              name="Research Bot"
              status="idle"
              model="GPT-4"
              lastActive="5 minutes ago"
            />
            <AgentRow
              name="DevOps Agent"
              status="running"
              model="Claude Opus"
              lastActive="Active now"
            />
          </div>
          <a
            href="/agents"
            className="mt-4 inline-block text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all agents &rarr;
          </a>
        </div>

        {/* Recent playbook runs */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Playbook Runs
          </h2>
          <div className="mt-4 space-y-4">
            <PlaybookRow
              name="Deploy to Production"
              status="completed"
              duration="2m 34s"
              time="10 minutes ago"
            />
            <PlaybookRow
              name="Code Review Pipeline"
              status="running"
              duration="1m 12s"
              time="Started just now"
            />
            <PlaybookRow
              name="Database Backup"
              status="completed"
              duration="45s"
              time="1 hour ago"
            />
          </div>
          <a
            href="/playbooks"
            className="mt-4 inline-block text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all playbooks &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

// Helper components

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

function AgentRow({
  name,
  status,
  model,
  lastActive,
}: {
  name: string;
  status: 'running' | 'idle' | 'error';
  model: string;
  lastActive: string;
}) {
  const statusColors = {
    running: 'bg-green-400',
    idle: 'bg-gray-400',
    error: 'bg-red-400',
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <Bot className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${statusColors[status]}`}
          />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{model}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{lastActive}</p>
    </div>
  );
}

function PlaybookRow({
  name,
  status,
  duration,
  time,
}: {
  name: string;
  status: 'running' | 'completed' | 'failed';
  duration: string;
  time: string;
}) {
  const statusColors = {
    running: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    completed: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    failed: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
          <PlaySquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {duration} &middot; {time}
          </p>
        </div>
      </div>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[status]}`}
      >
        {status}
      </span>
    </div>
  );
}
