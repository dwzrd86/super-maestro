import { Clock, GitBranch, Play, PlaySquare, Plus, Search } from 'lucide-react';

/**
 * Playbooks page - Create and manage automation playbooks.
 */
export default function PlaybooksPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Playbooks
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Reusable automation workflows for your agents.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          New Playbook
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search playbooks..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <select className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
          <option>All Tags</option>
          <option>Deployment</option>
          <option>Testing</option>
          <option>Maintenance</option>
        </select>
      </div>

      {/* Playbooks list */}
      <div className="space-y-4">
        <PlaybookRow
          name="Deploy to Production"
          description="Build, test, and deploy the application to production servers."
          tasks={8}
          avgDuration="3m 45s"
          lastRun="10 minutes ago"
          runs={47}
          tags={['deployment', 'production']}
        />
        <PlaybookRow
          name="Code Review Pipeline"
          description="Run linting, type checking, and automated tests on pull requests."
          tasks={5}
          avgDuration="2m 15s"
          lastRun="Just now"
          runs={234}
          tags={['testing', 'ci']}
        />
        <PlaybookRow
          name="Database Backup"
          description="Create incremental backup of the production database."
          tasks={4}
          avgDuration="1m 30s"
          lastRun="1 hour ago"
          runs={128}
          tags={['maintenance', 'database']}
        />
        <PlaybookRow
          name="Security Scan"
          description="Run comprehensive security vulnerability scanning."
          tasks={6}
          avgDuration="5m 20s"
          lastRun="6 hours ago"
          runs={42}
          tags={['security']}
        />
        <PlaybookRow
          name="Performance Test"
          description="Run load tests and collect performance metrics."
          tasks={10}
          avgDuration="15m 00s"
          lastRun="1 day ago"
          runs={18}
          tags={['testing', 'performance']}
        />
      </div>
    </div>
  );
}

function PlaybookRow({
  name,
  description,
  tasks,
  avgDuration,
  lastRun,
  runs,
  tags,
}: {
  name: string;
  description: string;
  tasks: number;
  avgDuration: string;
  lastRun: string;
  runs: number;
  tags: string[];
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <PlaySquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {name}
            </h3>
            <div className="flex gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <GitBranch className="h-4 w-4" />
              {tasks} tasks
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              ~{avgDuration}
            </span>
            <span>{runs} runs</span>
            <span>Last run {lastRun}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
          Edit
        </button>
        <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Play className="h-4 w-4" />
          Run
        </button>
      </div>
    </div>
  );
}
