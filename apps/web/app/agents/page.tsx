import { Bot, Plus, Search } from 'lucide-react';

/**
 * Agents page - List and manage AI agents.
 */
export default function AgentsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Agents
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create and manage your AI agents.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          New Agent
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <select className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
          <option>All Status</option>
          <option>Running</option>
          <option>Idle</option>
          <option>Error</option>
        </select>
        <select className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
          <option>All Models</option>
          <option>Claude Opus</option>
          <option>Claude Sonnet</option>
          <option>GPT-4</option>
        </select>
      </div>

      {/* Agents grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AgentCard
          name="Code Assistant"
          description="Helps with coding tasks, code review, and debugging."
          model="Claude Sonnet"
          status="running"
          sessions={2}
          lastActive="Active now"
        />
        <AgentCard
          name="Research Bot"
          description="Conducts web research and summarizes findings."
          model="GPT-4"
          status="idle"
          sessions={0}
          lastActive="5 minutes ago"
        />
        <AgentCard
          name="DevOps Agent"
          description="Manages deployments, monitoring, and infrastructure tasks."
          model="Claude Opus"
          status="running"
          sessions={1}
          lastActive="Active now"
        />
        <AgentCard
          name="Data Analyst"
          description="Analyzes data and generates reports and visualizations."
          model="Claude Sonnet"
          status="offline"
          sessions={0}
          lastActive="2 hours ago"
        />

        {/* New agent card */}
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-8 dark:border-gray-700">
          <button className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">Create New Agent</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentCard({
  name,
  description,
  model,
  status,
  sessions,
  lastActive,
}: {
  name: string;
  description: string;
  model: string;
  status: 'running' | 'idle' | 'error' | 'offline';
  sessions: number;
  lastActive: string;
}) {
  const statusColors = {
    running: 'bg-green-400',
    idle: 'bg-yellow-400',
    error: 'bg-red-400',
    offline: 'bg-gray-400',
  };

  const statusText = {
    running: 'Running',
    idle: 'Idle',
    error: 'Error',
    offline: 'Offline',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <Bot className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-900 ${statusColors[status]}`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{model}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            status === 'running'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : status === 'idle'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              : status === 'error'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {statusText[status]}
        </span>
      </div>

      {/* Description */}
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>

      {/* Stats */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {sessions} active session{sessions !== 1 ? 's' : ''}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {lastActive}
        </div>
      </div>
    </div>
  );
}
