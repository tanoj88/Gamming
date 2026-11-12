/**
 * @file apiClient.ts
 * Frontend client for communicating with the full-stack Gaming Analytics server.
 */

import { ConnectedAccount, PlatformInfo, Player, Match, GamingPlatform } from '../types/gaming';

export interface ConnectAccountResponse {
  success: boolean;
  account: ConnectedAccount;
  player: Player;
  matchesCount: number;
  cached?: boolean;
}

export interface CsvUploadResponse {
  success: boolean;
  summary: {
    playersCount: number;
    matchesCount: number;
  };
  parseDetails: {
    playersFound: number;
    matchesFound: number;
    ignoredRows: number;
  };
  players: Player[];
  matches: Match[];
}

export const ApiClient = {
  async getPlatforms(): Promise<PlatformInfo[]> {
    const res = await fetch('/api/platforms');
    if (!res.ok) throw new Error('Failed to fetch platform capabilities.');
    return res.json();
  },

  async getAccounts(): Promise<{ accounts: ConnectedAccount[]; lastSync?: string }> {
    const res = await fetch('/api/accounts');
    if (!res.ok) throw new Error('Failed to load connected accounts.');
    return res.json();
  },

  async connectAccount(
    platform: GamingPlatform,
    identifier: string
  ): Promise<ConnectAccountResponse> {
    const res = await fetch('/api/accounts/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, identifier }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to connect gaming account.');
    }
    return data;
  },

  async disconnectAccount(id: string): Promise<void> {
    const res = await fetch(`/api/accounts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to disconnect account.');
    }
  },

  async syncAccount(id: string): Promise<ConnectAccountResponse> {
    const res = await fetch(`/api/accounts/${encodeURIComponent(id)}/sync`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sync account.');
    }
    return data;
  },

  async syncAllAccounts(): Promise<{ syncedCount: number; lastSync: string }> {
    const res = await fetch('/api/accounts/sync-all', {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sync all accounts.');
    }
    return data;
  },

  async getCustomPlayers(): Promise<Player[]> {
    const res = await fetch('/api/players');
    if (!res.ok) return [];
    const data = await res.json();
    return data.players || [];
  },

  async getCustomMatches(): Promise<Match[]> {
    const res = await fetch('/api/matches');
    if (!res.ok) return [];
    const data = await res.json();
    return data.matches || [];
  },

  async uploadCsv(csvText: string): Promise<CsvUploadResponse> {
    const res = await fetch('/api/upload-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: csvText,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to upload CSV file.');
    }
    return data;
  },

  async resetData(): Promise<void> {
    await fetch('/api/reset-data', { method: 'POST' });
  },
};
