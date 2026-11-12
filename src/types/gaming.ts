export type GameTitle =
  | 'Valorant'
  | 'Counter-Strike 2'
  | 'Apex Legends'
  | 'Overwatch 2'
  | 'Minecraft'
  | 'Fortnite'
  | 'League of Legends';

export type PerformanceTier = 'Beginner' | 'Intermediate' | 'Pro';

export type GamingPlatform =
  | 'Steam'
  | 'Riot Games'
  | 'Fortnite'
  | 'Minecraft'
  | 'Xbox'
  | 'PlayStation';

export interface ConnectedAccount {
  id: string;
  platform: GamingPlatform;
  identifier: string; // e.g. "GamerGod", "76561198000000000", "TenZ#NA1"
  displayName: string;
  avatarUrl?: string;
  connectedAt: string; // ISO date
  lastSyncedAt: string; // ISO date
  status: 'active' | 'syncing' | 'error';
  errorMessage?: string;
  rawStats?: Record<string, any>;
  syncedPlayerId: string;
  platformMeta?: {
    level?: number;
    rank?: string;
    gamesOwned?: number;
    achievementsCount?: number;
    profileUrl?: string;
  };
}

export interface PlatformInfo {
  id: GamingPlatform;
  name: string;
  category: string;
  description: string;
  authType: 'Public ID / Username' | 'SteamID64 / Profile URL' | 'Riot ID (Game#Tag)';
  placeholder: string;
  helpText: string;
  supportsApiKey: boolean;
  apiKeyConfigured: boolean;
  isPublicAvailable: boolean;
  supportedGames: string[];
}

export interface Player {
  id: string;
  username: string;
  game: GameTitle;
  role: string;
  rank: string;
  rankTier: number; // 1-8 for sorting
  country: string;
  countryCode: string;
  playtime_hours: number;
  avatarSeed: number;
  avatarUrl?: string;
  source?: 'api' | 'csv' | 'sample';
  platform?: GamingPlatform;
  externalId?: string;
  lastUpdated?: string;
}

export interface Match {
  match_id: string;
  player_id: string;
  date: string; // ISO date YYYY-MM-DD
  map: string;
  kills: number;
  deaths: number;
  assists: number;
  headshot_percentage: number;
  score: number;
  result: 'Win' | 'Loss';
}

export interface PlayerAggregatedStats extends Player {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number; // percentage 0-100
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  kda: number; // (kills + assists) / max(deaths, 1)
  avgScore: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgHeadshotPercentage: number;
  performanceTier: PerformanceTier;
  bestMap: string;
}

export interface FilterState {
  game: 'All' | GameTitle;
  role: string;
  map: string;
  dateRange: 'all' | '30d' | '90d' | '180d';
  searchQuery: string;
  tier: 'All' | PerformanceTier;
  sourceFilter?: 'All' | 'Connected Accounts' | 'CSV Imports' | 'Sample Dataset';
}

export interface WeeklyTrendPoint {
  week: string; // e.g., 'W1', 'Aug 12'
  avgKda: number;
  winRate: number;
  matchCount: number;
  avgScore: number;
}

export interface MapStat {
  map: string;
  matches: number;
  wins: number;
  winRate: number;
  avgScore: number;
}

export interface RoleStat {
  role: string;
  matches: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKda: number;
  avgScore: number;
  winRate: number;
}

export interface InsightItem {
  id: string;
  title: string;
  description: string;
  statValue: string;
  metricLabel: string;
  category: 'Map' | 'Role' | 'Playtime' | 'Tier' | 'General';
  sentiment: 'positive' | 'negative' | 'neutral';
}
