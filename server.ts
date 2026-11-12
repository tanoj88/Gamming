/**
 * @file server.ts
 * Express backend with Vite middleware integration for Gaming Statistics Dashboard.
 * Provides real platform API connectors, CSV ingestion, and account persistence.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Services
import { Storage } from './src/server/storage';
import { fetchSteamProfile } from './src/server/services/steamService';
import { fetchRiotProfile } from './src/server/services/riotService';
import { fetchMinecraftProfile } from './src/server/services/minecraftService';
import { fetchFortniteProfile } from './src/server/services/fortniteService';
import { fetchXboxProfile } from './src/server/services/xboxService';
import { fetchPlaystationProfile } from './src/server/services/playstationService';
import { parseCsvData } from './src/server/services/csvService';
import { GamingPlatform, PlatformInfo } from './src/types/gaming';

dotenv.config();

const PORT = 3000;
const HOST = '0.0.0.0';

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '15mb' }));
  app.use(express.text({ limit: '15mb', type: ['text/*', 'application/csv'] }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // In-memory request caching with 3-minute TTL to reduce redundant platform API calls
  const apiCache = new Map<string, { timestamp: number; data: any }>();
  const CACHE_TTL_MS = 3 * 60 * 1000;

  // 1. Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      storageLastSync: Storage.getLastSync(),
      connectedAccountsCount: Storage.getAccounts().length,
    });
  });

  // 2. List Supported Platforms
  app.get('/api/platforms', (_req: Request, res: Response) => {
    const platforms: PlatformInfo[] = [
      {
        id: 'Steam',
        name: 'Steam (Valve)',
        category: 'PC Gaming',
        description:
          'Steam Web API & community profiles for Counter-Strike 2, Team Fortress 2, and library playtime.',
        authType: 'SteamID64 / Profile URL',
        placeholder: 'e.g. 76561198000000000 or custom vanity URL',
        helpText: 'Accepts 17-digit SteamID64, profile link, or custom vanity name.',
        supportsApiKey: true,
        apiKeyConfigured: !!process.env.STEAM_API_KEY,
        isPublicAvailable: true,
        supportedGames: ['Counter-Strike 2'],
      },
      {
        id: 'Riot Games',
        name: 'Riot Games (Valorant / LoL)',
        category: 'Competitive FPS / MOBA',
        description:
          'Riot Developer API and live Valorant player telemetry indexing combat scores, ranks, and headshots.',
        authType: 'Riot ID (Game#Tag)',
        placeholder: 'e.g. TenZ#NA1 or Aspas#BR1',
        helpText: 'Enter your Riot ID with the hashtag and regional tagline.',
        supportsApiKey: true,
        apiKeyConfigured: !!process.env.RIOT_API_KEY,
        isPublicAvailable: true,
        supportedGames: ['Valorant', 'League of Legends'],
      },
      {
        id: 'Minecraft',
        name: 'Minecraft (Mojang)',
        category: 'Sandbox / PvP',
        description:
          'Official Mojang public authentication service & skin avatar rendering for competitive minigames.',
        authType: 'Public ID / Username',
        placeholder: 'e.g. Technoblade, Dream, or your Java username',
        helpText: 'Public Mojang lookup. No password or API key required.',
        supportsApiKey: false,
        apiKeyConfigured: true,
        isPublicAvailable: true,
        supportedGames: ['Minecraft'],
      },
      {
        id: 'Fortnite',
        name: 'Fortnite (Epic Games)',
        category: 'Battle Royale',
        description:
          'Fortnite-API Battle Royale stats engine tracking victories, K/D ratio, score, and season levels.',
        authType: 'Public ID / Username',
        placeholder: 'e.g. Ninja, Bugha, or your Epic tag',
        helpText: 'Public Battle Royale profile lookup.',
        supportsApiKey: true,
        apiKeyConfigured: !!process.env.FORTNITE_API_KEY,
        isPublicAvailable: true,
        supportedGames: ['Fortnite'],
      },
      {
        id: 'Xbox',
        name: 'Xbox Network (Microsoft)',
        category: 'Console & PC',
        description:
          'Xbox Live Gamertag stats, gamerscore progression, and Apex Legends console telemetry.',
        authType: 'Public ID / Username',
        placeholder: 'e.g. MasterChief or your Xbox Gamertag',
        helpText: 'Enter your public Xbox Live Gamertag.',
        supportsApiKey: true,
        apiKeyConfigured: !!process.env.OPENXBL_API_KEY,
        isPublicAvailable: true,
        supportedGames: ['Apex Legends'],
      },
      {
        id: 'PlayStation',
        name: 'PlayStation Network (Sony)',
        category: 'PlayStation Ecosystem',
        description:
          'PSN Online ID telemetry, trophy tiers, and Overwatch 2 competitive combat stats.',
        authType: 'Public ID / Username',
        placeholder: 'e.g. Kratos or your PSN Online ID',
        helpText: 'Enter your public PlayStation Network Online ID.',
        supportsApiKey: false,
        apiKeyConfigured: true,
        isPublicAvailable: true,
        supportedGames: ['Overwatch 2'],
      },
    ];

    res.json(platforms);
  });

  // 3. Get Connected Accounts
  app.get('/api/accounts', (_req: Request, res: Response) => {
    res.json({
      accounts: Storage.getAccounts(),
      lastSync: Storage.getLastSync(),
    });
  });

  // 4. Connect Account
  app.post('/api/accounts/connect', async (req: Request, res: Response) => {
    try {
      const { platform, identifier } = req.body as {
        platform: GamingPlatform;
        identifier: string;
      };

      if (!platform || !identifier || !identifier.trim()) {
        res.status(400).json({ error: 'Platform and identifier are required.' });
        return;
      }

      const cacheKey = `${platform}:${identifier.trim().toLowerCase()}`;
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        Storage.saveAccount(cached.data.account);
        Storage.savePlayerAndMatches(cached.data.player, cached.data.matches);
        res.json({
          success: true,
          account: cached.data.account,
          player: cached.data.player,
          matchesCount: cached.data.matches.length,
          cached: true,
        });
        return;
      }

      let result: any = null;

      switch (platform) {
        case 'Steam':
          result = await fetchSteamProfile(identifier);
          break;
        case 'Riot Games':
          result = await fetchRiotProfile(identifier);
          break;
        case 'Minecraft':
          result = await fetchMinecraftProfile(identifier);
          break;
        case 'Fortnite':
          result = await fetchFortniteProfile(identifier);
          break;
        case 'Xbox':
          result = await fetchXboxProfile(identifier);
          break;
        case 'PlayStation':
          result = await fetchPlaystationProfile(identifier);
          break;
        default:
          res.status(400).json({ error: `Unsupported platform: ${platform}` });
          return;
      }

      if (result) {
        apiCache.set(cacheKey, { timestamp: Date.now(), data: result });
        Storage.saveAccount(result.account);
        Storage.savePlayerAndMatches(result.player, result.matches);

        res.json({
          success: true,
          account: result.account,
          player: result.player,
          matchesCount: result.matches.length,
        });
      } else {
        res.status(500).json({ error: 'Failed to retrieve profile data from platform.' });
      }
    } catch (err: any) {
      console.error('[API /api/accounts/connect] Error:', err);
      res.status(500).json({
        error: err.message || 'Error occurred while connecting gaming account.',
      });
    }
  });

  // 5. Disconnect Account
  app.delete('/api/accounts/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = Storage.deleteAccount(id);
    if (deleted) {
      res.json({ success: true, message: `Account ${id} disconnected.` });
    } else {
      res.status(404).json({ error: 'Account not found.' });
    }
  });

  // 6. Sync Specific Account
  app.post('/api/accounts/:id/sync', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const account = Storage.getAccount(id);
      if (!account) {
        res.status(404).json({ error: 'Account not found.' });
        return;
      }

      let result: any = null;
      switch (account.platform) {
        case 'Steam':
          result = await fetchSteamProfile(account.identifier);
          break;
        case 'Riot Games':
          result = await fetchRiotProfile(account.identifier);
          break;
        case 'Minecraft':
          result = await fetchMinecraftProfile(account.identifier);
          break;
        case 'Fortnite':
          result = await fetchFortniteProfile(account.identifier);
          break;
        case 'Xbox':
          result = await fetchXboxProfile(account.identifier);
          break;
        case 'PlayStation':
          result = await fetchPlaystationProfile(account.identifier);
          break;
      }

      if (result) {
        Storage.saveAccount(result.account);
        Storage.savePlayerAndMatches(result.player, result.matches);
        res.json({
          success: true,
          account: result.account,
          player: result.player,
          matchesCount: result.matches.length,
        });
      } else {
        res.status(500).json({ error: 'Synchronization failed.' });
      }
    } catch (err: any) {
      console.error('[API /api/accounts/:id/sync] Error:', err);
      res.status(500).json({ error: err.message || 'Error syncing account.' });
    }
  });

  // 7. Sync All Accounts
  app.post('/api/accounts/sync-all', async (_req: Request, res: Response) => {
    try {
      const accounts = Storage.getAccounts();
      const results: any[] = [];

      for (const acc of accounts) {
        try {
          let r: any = null;
          if (acc.platform === 'Steam') r = await fetchSteamProfile(acc.identifier);
          else if (acc.platform === 'Riot Games') r = await fetchRiotProfile(acc.identifier);
          else if (acc.platform === 'Minecraft') r = await fetchMinecraftProfile(acc.identifier);
          else if (acc.platform === 'Fortnite') r = await fetchFortniteProfile(acc.identifier);
          else if (acc.platform === 'Xbox') r = await fetchXboxProfile(acc.identifier);
          else if (acc.platform === 'PlayStation') r = await fetchPlaystationProfile(acc.identifier);

          if (r) {
            Storage.saveAccount(r.account);
            Storage.savePlayerAndMatches(r.player, r.matches);
            results.push({ id: acc.id, status: 'synced', player: r.player.username });
          }
        } catch (subErr) {
          console.warn(`[SyncAll] Failed for account ${acc.id}:`, subErr);
          results.push({ id: acc.id, status: 'error' });
        }
      }

      res.json({
        success: true,
        syncedCount: results.filter((r) => r.status === 'synced').length,
        details: results,
        lastSync: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error executing sync-all.' });
    }
  });

  // 8. Get Custom Players & Matches
  app.get('/api/players', (_req: Request, res: Response) => {
    res.json({
      players: Storage.getCustomPlayers(),
    });
  });

  app.get('/api/matches', (_req: Request, res: Response) => {
    res.json({
      matches: Storage.getCustomMatches(),
    });
  });

  // 9. Manual CSV Upload
  app.post('/api/upload-csv', (req: Request, res: Response) => {
    try {
      let csvContent = '';
      if (typeof req.body === 'string') {
        csvContent = req.body;
      } else if (req.body?.csvText) {
        csvContent = req.body.csvText;
      } else if (typeof req.body === 'object' && req.body !== null) {
        const firstKey = Object.keys(req.body)[0];
        if (firstKey && firstKey.includes('\n')) {
          csvContent = firstKey;
        } else {
          csvContent = String(req.body);
        }
      }

      if (!csvContent || !csvContent.trim()) {
        res.status(400).json({ error: 'Empty CSV content provided.' });
        return;
      }

      const parseResult = parseCsvData(csvContent);
      if (parseResult.errors.length > 0 && parseResult.players.length === 0 && parseResult.matches.length === 0) {
        res.status(400).json({
          error: parseResult.errors[0],
          details: parseResult.errors,
        });
        return;
      }

      const importSummary = Storage.importCsvDataset(parseResult.players, parseResult.matches);

      res.json({
        success: true,
        summary: importSummary,
        parseDetails: parseResult.summary,
        players: parseResult.players,
        matches: parseResult.matches,
      });
    } catch (err: any) {
      console.error('[API /api/upload-csv] Error:', err);
      res.status(500).json({ error: err.message || 'Failed to parse and import CSV file.' });
    }
  });

  // 10. Reset Custom Data (Return to base dataset)
  app.post('/api/reset-data', (_req: Request, res: Response) => {
    const accounts = Storage.getAccounts();
    accounts.forEach((a) => Storage.deleteAccount(a.id));
    res.json({ success: true, message: 'Custom gaming telemetry reset to base profile.' });
  });

  // Mount Vite middleware in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Gaming Server] Running live at http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
});
