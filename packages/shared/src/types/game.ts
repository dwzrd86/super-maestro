/**
 * Super Maestro — Game Mechanic Types
 *
 * Maps gaming concepts to agent orchestration features.
 */

// === Power-Ups (Agent Skills/Capabilities) ===

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: 'speed' | 'quality' | 'defense' | 'special';
  effect: string;
  rarity: 'common' | 'rare' | 'legendary';
}

// === Achievements ===

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: 'agent' | 'playbook' | 'kart' | 'social' | 'system';
  unlockedAt?: string; // ISO date
}

// === Worlds & Levels (Projects & Tasks) ===

export interface World {
  id: string;
  number: number;
  name: string;
  description: string;
  levels: Level[];
  completed: boolean;
  bossDefeated: boolean;
}

export interface Level {
  id: string;
  worldId: string;
  number: number;
  name: string;
  description: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'failed';
  tasks: number;
  completedTasks: number;
  isBoss: boolean;
}

// === Maestro Kart ===

export type TrackDifficulty = 'mushroom' | 'flower' | 'star' | 'special';

export interface Track {
  id: string;
  name: string;
  difficulty: TrackDifficulty;
  description: string;
  estimatedDuration: string;
  challengeType: string;
}

export interface KartRace {
  id: string;
  trackId: string;
  trackName: string;
  status: 'setup' | 'countdown' | 'racing' | 'finished';
  startedAt?: string;
  completedAt?: string;
  racers: KartRacer[];
}

export interface KartRacer {
  agentId: string;
  agentName: string;
  model: string;
  position: number;
  progress: number; // 0-100
  completionTime?: number; // ms
  qualityScore?: number;
  itemsUsed: number;
  status: 'waiting' | 'racing' | 'finished' | 'crashed';
}

// === Coins (Token/Cost Tracking) ===

export interface CoinBalance {
  total: number;
  earned: number;
  spent: number;
  dailyEarned: number;
}

// === Lives (Retry Budget) ===

export interface LivesConfig {
  maxLives: number;
  currentLives: number;
  lastRefill: string;
}

// === Player Stats ===

export interface PlayerStats {
  worldsCompleted: number;
  totalWorlds: number;
  levelsCompleted: number;
  totalLevels: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  kartWins: number;
  kartRaces: number;
  coinsEarned: number;
  agentsActive: number;
  playbooksRun: number;
  successRate: number;
}

// === Leaderboard ===

export interface LeaderboardEntry {
  rank: number;
  agentId: string;
  agentName: string;
  model: string;
  wins: number;
  races: number;
  avgSpeed: number;
  avgQuality: number;
  bestTime?: number;
}
