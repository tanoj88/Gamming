/**
 * @file storage.ts
 * File-backed persistence for Connected Gaming Accounts and Imported CSV data.
 */

import fs from 'fs';
import path from 'path';
import { ConnectedAccount, Player, Match } from '../types/gaming';

interface StorageData {
  connectedAccounts: ConnectedAccount[];
  customPlayers: Player[];
  customMatches: Match[];
  lastSyncTimestamp?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'gaming_database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadData(): StorageData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[Storage] Error reading storage file:', err);
  }
  return {
    connectedAccounts: [],
    customPlayers: [],
    customMatches: [],
  };
}

function saveData(data: StorageData): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Error writing storage file:', err);
  }
}

export const Storage = {
  getAccounts(): ConnectedAccount[] {
    return loadData().connectedAccounts;
  },

  getAccount(id: string): ConnectedAccount | undefined {
    return loadData().connectedAccounts.find((a) => a.id === id);
  },

  saveAccount(account: ConnectedAccount): void {
    const data = loadData();
    const idx = data.connectedAccounts.findIndex((a) => a.id === account.id);
    if (idx >= 0) {
      data.connectedAccounts[idx] = account;
    } else {
      data.connectedAccounts.push(account);
    }
    data.lastSyncTimestamp = new Date().toISOString();
    saveData(data);
  },

  deleteAccount(id: string): boolean {
    const data = loadData();
    const account = data.connectedAccounts.find((a) => a.id === id);
    if (!account) return false;

    data.connectedAccounts = data.connectedAccounts.filter((a) => a.id !== id);

    // Also remove associated custom player & matches if linked
    if (account.syncedPlayerId) {
      data.customPlayers = data.customPlayers.filter(
        (p) => p.id !== account.syncedPlayerId
      );
      data.customMatches = data.customMatches.filter(
        (m) => m.player_id !== account.syncedPlayerId
      );
    }

    saveData(data);
    return true;
  },

  getCustomPlayers(): Player[] {
    return loadData().customPlayers;
  },

  getCustomMatches(): Match[] {
    return loadData().customMatches;
  },

  savePlayerAndMatches(player: Player, matches: Match[]): void {
    const data = loadData();

    // Avoid duplicate player record
    const pIdx = data.customPlayers.findIndex(
      (p) => p.id === player.id || (p.externalId && p.externalId === player.externalId)
    );
    if (pIdx >= 0) {
      data.customPlayers[pIdx] = player;
    } else {
      data.customPlayers.push(player);
    }

    // Replace or append matches for this player
    const existingOtherMatches = data.customMatches.filter(
      (m) => m.player_id !== player.id
    );
    data.customMatches = [...existingOtherMatches, ...matches];

    saveData(data);
  },

  importCsvDataset(players: Player[], matches: Match[]): {
    playersCount: number;
    matchesCount: number;
  } {
    const data = loadData();

    // Merge players without duplicates
    const playerMap = new Map<string, Player>();
    data.customPlayers.forEach((p) => playerMap.set(p.id, p));
    players.forEach((p) => playerMap.set(p.id, p));
    data.customPlayers = Array.from(playerMap.values());

    // Merge matches
    const matchMap = new Map<string, Match>();
    data.customMatches.forEach((m) => matchMap.set(m.match_id, m));
    matches.forEach((m) => matchMap.set(m.match_id, m));
    data.customMatches = Array.from(matchMap.values());

    saveData(data);
    return {
      playersCount: players.length,
      matchesCount: matches.length,
    };
  },

  getLastSync(): string | undefined {
    return loadData().lastSyncTimestamp;
  },
};
