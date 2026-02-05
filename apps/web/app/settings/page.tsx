import { Bell, Key, Palette, Shield, User, Users } from 'lucide-react';

/**
 * Settings page - User and team configuration.
 */
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account and team settings.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Settings navigation */}
        <nav className="w-64 space-y-1">
          <SettingsNavItem icon={User} label="Profile" active />
          <SettingsNavItem icon={Bell} label="Notifications" />
          <SettingsNavItem icon={Key} label="API Keys" />
          <SettingsNavItem icon={Palette} label="Appearance" />
          <SettingsNavItem icon={Users} label="Team" />
          <SettingsNavItem icon={Shield} label="Security" />
        </nav>

        {/* Settings content */}
        <div className="flex-1 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile Settings
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Update your personal information and preferences.
          </p>

          <form className="mt-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Change Avatar
              </button>
            </div>

            {/* Name */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="User Name"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="user@example.com"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Timezone
              </label>
              <select className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800">
                <option>America/New_York (EST)</option>
                <option>America/Chicago (CST)</option>
                <option>America/Denver (MST)</option>
                <option>America/Los_Angeles (PST)</option>
                <option>Europe/London (GMT)</option>
                <option>Europe/Paris (CET)</option>
              </select>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme Preference
              </label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Light
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Dark
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="theme"
                    value="system"
                    defaultChecked
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    System
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-800">
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SettingsNavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
