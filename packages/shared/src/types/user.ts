/**
 * User and Team Types
 *
 * User management and team collaboration types.
 */

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * User represents an authenticated user in the system.
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;

  // Settings
  preferences: UserPreferences;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

/**
 * UserPreferences for customization.
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  notifications: NotificationSettings;
  editor: EditorSettings;
}

export interface NotificationSettings {
  email: boolean;
  desktop: boolean;
  slack: boolean;
  onAgentError: boolean;
  onPlaybookComplete: boolean;
  onTeamInvite: boolean;
}

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
}

/**
 * Team represents a group of users working together.
 */
export interface Team {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier
  description: string | null;
  avatarUrl: string | null;

  // Ownership
  ownerId: string;

  // Settings
  settings: TeamSettings;

  // Billing (optional)
  plan: 'free' | 'pro' | 'enterprise';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TeamSettings for team-wide configuration.
 */
export interface TeamSettings {
  // Agent defaults
  defaultModel: string;
  defaultMaxTokens: number;

  // Security
  allowedModels: string[];
  maxAgents: number;
  maxPlaybooks: number;
  maxConcurrentSessions: number;

  // Integrations
  integrations: TeamIntegrations;
}

export interface TeamIntegrations {
  slack?: {
    webhookUrl: string;
    channel: string;
  };
  github?: {
    installationId: string;
    repositories: string[];
  };
  openai?: {
    apiKey: string;
  };
  anthropic?: {
    apiKey: string;
  };
}

/**
 * TeamMember represents a user's membership in a team.
 */
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: UserRole;

  // Denormalized user info for convenience
  user?: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>;

  // Invitation
  invitedBy: string | null;
  invitedAt: Date | null;

  // Timestamps
  joinedAt: Date;
  updatedAt: Date;
}

/**
 * TeamInvite for pending invitations.
 */
export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: UserRole;

  // Invite metadata
  invitedBy: string;
  token: string;
  expiresAt: Date;

  // Status
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';

  // Timestamps
  createdAt: Date;
  acceptedAt: Date | null;
}

/**
 * CreateTeamInput for creating new teams.
 */
export interface CreateTeamInput {
  name: string;
  slug?: string;
  description?: string;
}

/**
 * InviteTeamMemberInput for inviting users.
 */
export interface InviteTeamMemberInput {
  email: string;
  role: UserRole;
}
