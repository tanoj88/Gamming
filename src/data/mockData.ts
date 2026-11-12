/**
 * @file mockData.ts
 * Dataset generator for Gaming Statistics and Player Performance Dashboard.
 * 
 * Generates ~300 realistic players and ~2,000 matches across competitive titles:
 * - Valorant
 * - Counter-Strike 2
 * - Apex Legends
 * - Overwatch 2
 * 
 * Statistical Design & Realistic Correlations:
 * 1. Skill parameter based on rank tier (Bronze -> Radiant/Pro). Higher skill yields:
 *    - Higher win rate (from ~40% at lowest rank to ~70% at top rank)
 *    - Higher KDA ratio (0.8 -> 2.6+)
 *    - Higher headshot percentage (12% -> 44%)
 *    - Higher round/match score
 * 2. Role-specific variations:
 *    - Entry/Duelist/DPS: +kills, +deaths, +headshots, lower assists
 *    - Controller/Support/Anchor: +assists, -deaths, strategic clutch scores
 *    - Sniper/AWPer: highest headshot %, moderate kills, lower deaths
 * 3. Map variance:
 *    - Each map has subtle tactical biases (e.g., defense favored, sniper corridor)
 * 4. Temporal distribution:
 *    - Matches are distributed over the past 180 days (6 months) with weekly clusters.
 */

import { Player, Match, GameTitle } from '../types/gaming';

// Seeded PRNG (Linear Congruential Generator) for reproducible realistic data
let seed = 424242;
function random(): number {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

function gaussianRandom(mean = 0, stdev = 1): number {
  const u = 1 - random();
  const v = random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

export const GAMES: GameTitle[] = [
  'Valorant',
  'Counter-Strike 2',
  'Apex Legends',
  'Overwatch 2',
  'Fortnite',
  'Minecraft',
];

export const GAME_ROLES: Record<GameTitle, string[]> = {
  Valorant: ['Duelist', 'Initiator', 'Controller', 'Sentinel'],
  'Counter-Strike 2': ['Entry Fragger', 'AWPer / Sniper', 'Support', 'Lurker', 'In-Game Leader'],
  'Apex Legends': ['Skirmisher', 'Recon', 'Assault', 'Support', 'Controller'],
  'Overwatch 2': ['Tank', 'Damage (DPS)', 'Support', 'Flex Specialist'],
  Fortnite: ['Assault', 'Builder', 'Scout', 'Support'],
  Minecraft: ['PVP Specialist', 'Bedwars Rusher', 'Skywars Archer', 'Defender'],
  'League of Legends': ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
};

export const GAME_MAPS: Record<GameTitle, string[]> = {
  Valorant: ['Ascent', 'Haven', 'Bind', 'Split', 'Lotus', 'Sunset'],
  'Counter-Strike 2': ['Mirage', 'Inferno', 'Dust II', 'Nuke', 'Ancient', 'Anubis'],
  'Apex Legends': ["World's Edge", 'Olympus', 'Storm Point', 'Kings Canyon'],
  'Overwatch 2': ["King's Row", 'Circuit Royal', 'Esperança', 'Midtown', 'Colosseo'],
  Fortnite: ['Tilted Towers', 'Pleasant Park', 'Mega City', 'Retail Row', 'Loot Lake'],
  Minecraft: ['Bedwars Arena', 'Skywars Ruins', 'Colosseum', 'Nether Fortress'],
  'League of Legends': ["Summoner's Rift", 'Howling Abyss'],
};

export const ALL_MAPS = Array.from(new Set(Object.values(GAME_MAPS).flat()));

export const RANKS = [
  { name: 'Bronze', tier: 1, baseSkill: 0.25 },
  { name: 'Silver', tier: 2, baseSkill: 0.35 },
  { name: 'Gold', tier: 3, baseSkill: 0.48 },
  { name: 'Platinum', tier: 4, baseSkill: 0.60 },
  { name: 'Diamond', tier: 5, baseSkill: 0.72 },
  { name: 'Master', tier: 6, baseSkill: 0.83 },
  { name: 'Grandmaster', tier: 7, baseSkill: 0.91 },
  { name: 'Pro / Radiant', tier: 8, baseSkill: 0.98 },
];

export const COUNTRIES = [
  { name: 'United States', code: 'US' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Japan', code: 'JP' },
  { name: 'Germany', code: 'DE' },
  { name: 'Canada', code: 'CA' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'France', code: 'FR' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Singapore', code: 'SG' },
  { name: 'Australia', code: 'AU' },
];

const USERNAME_PREFIXES = [
  'Viper', 'Ghost', 'Shadow', 'Apex', 'Nova', 'Cyber', 'Frost', 'Blaze', 'Pulse', 'Zenith',
  'Nexus', 'Echo', 'Phantom', 'Volt', 'Rogue', 'Titan', 'Onyx', 'Storm', 'Raven', 'Aero',
  'Spectre', 'Quantum', 'Glitch', 'Blitz', 'Astral', 'Zero', 'Krypton', 'Havoc', 'Vortex', 'Synapse'
];

const USERNAME_SUFFIXES = [
  'X', '99', 'Shot', 'God', 'Pro', 'Strike', 'Blade', 'Fox', 'Wolf', 'Prime',
  'Clutch', 'Ace', 'Ops', 'Aim', 'Vibe', 'Fury', 'Core', 'Rush', 'Sync', 'Shift',
  'Knight', 'Slayer', 'Ghost', 'Zero', 'Hawk', 'Flow', 'Spark', 'Pulse', 'Edge', 'Byte'
];

/**
 * Generates 300 unique players with realistic rank distributions,
 * country representation, and playtime.
 */
export function generatePlayers(count = 300): Player[] {
  const players: Player[] = [];
  const usedUsernames = new Set<string>();

  for (let i = 1; i <= count; i++) {
    const game = pickRandom(GAMES);
    const roles = GAME_ROLES[game];
    const role = pickRandom(roles);

    // Realistic rank distribution (bell curve centered around Gold/Platinum)
    const rankIndexRoll = Math.floor(Math.min(7, Math.max(0, gaussianRandom(3.4, 1.8))));
    const rankObj = RANKS[rankIndexRoll];

    const country = pickRandom(COUNTRIES);

    // Playtime strongly correlates with rank
    const basePlaytime = 80 + rankObj.tier * 220;
    const playtime = Math.round(Math.max(45, gaussianRandom(basePlaytime, 150)));

    // Generate unique cool gamer tag
    let username = '';
    let attempts = 0;
    do {
      const prefix = pickRandom(USERNAME_PREFIXES);
      const suffix = pickRandom(USERNAME_SUFFIXES);
      const num = attempts > 5 ? randomInt(10, 999) : '';
      username = `${prefix}${suffix}${num}`;
      attempts++;
    } while (usedUsernames.has(username));
    usedUsernames.add(username);

    players.push({
      id: `p-${i.toString().padStart(3, '0')}`,
      username,
      game,
      role,
      rank: rankObj.name,
      rankTier: rankObj.tier,
      country: country.name,
      countryCode: country.code,
      playtime_hours: playtime,
      avatarSeed: (i * 37) % 1000,
    });
  }

  return players;
}

/**
 * Generates ~2,000 realistic matches associated with the generated players.
 * Simulates believable variance per role, map, and player skill.
 */
export function generateMatches(players: Player[], targetMatchCount = 2000): Match[] {
  const matches: Match[] = [];
  const playersMap = new Map(players.map(p => [p.id, p]));

  // Reference date: last 180 days from current date
  const now = new Date('2026-11-04T12:00:00Z');

  // Map tactical modifiers (win probability tilt, e.g., defense vs attack favored)
  const mapWinModifier: Record<string, number> = {
    'Ascent': 0.04,
    'Haven': -0.02,
    'Bind': 0.03,
    'Split': -0.01,
    'Lotus': 0.01,
    'Sunset': 0.02,
    'Mirage': 0.02,
    'Inferno': -0.03,
    'Dust II': 0.05,
    'Nuke': -0.04,
    'Ancient': 0.01,
    'Anubis': -0.02,
    "World's Edge": 0.03,
    'Olympus': 0.01,
    'Storm Point': -0.02,
    'Kings Canyon': 0.04,
    "King's Row": 0.05,
    'Circuit Royal': -0.02,
    'Esperança': 0.02,
    'Midtown': -0.01,
    'Colosseo': 0.03,
  };

  // Higher rank players play more frequently
  const matchWeights = players.map(p => ({
    player: p,
    weight: Math.max(1, p.rankTier * 2 + Math.floor(p.playtime_hours / 400)),
  }));

  const totalWeight = matchWeights.reduce((acc, curr) => acc + curr.weight, 0);

  function samplePlayer(): Player {
    let roll = random() * totalWeight;
    for (const item of matchWeights) {
      roll -= item.weight;
      if (roll <= 0) return item.player;
    }
    return matchWeights[0].player;
  }

  for (let m = 1; m <= targetMatchCount; m++) {
    const player = samplePlayer();
    const gameMaps = GAME_MAPS[player.game];
    const map = pickRandom(gameMaps);

    // Date distribution across 180 days with slight weekend weight
    const daysAgo = Math.floor(random() * 180);
    const matchDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dateStr = matchDate.toISOString().split('T')[0];

    // Skill level between 0.15 and 0.95
    const rankInfo = RANKS.find(r => r.tier === player.rankTier) || RANKS[2];
    const skill = rankInfo.baseSkill + (random() - 0.5) * 0.15;

    // Role modifiers
    const isEntry = player.role.includes('Duelist') || player.role.includes('Entry') || player.role.includes('DPS') || player.role.includes('Assault');
    const isSniper = player.role.includes('AWPer') || player.role.includes('Sniper') || player.role.includes('Recon');
    const isSupport = player.role.includes('Support') || player.role.includes('Controller') || player.role.includes('Medic') || player.role.includes('Tank');

    // 1. Win / Loss calculation
    const mapBonus = mapWinModifier[map] || 0;
    // Win probability is governed by skill + map bonus + random noise
    const winProbability = Math.min(0.85, Math.max(0.25, 0.35 + skill * 0.35 + mapBonus));
    const isWin = random() < winProbability;
    const result: 'Win' | 'Loss' = isWin ? 'Win' : 'Loss';

    // 2. Kills, Deaths, Assists
    let baseKillsMean = 14 + skill * 12;
    if (isEntry) baseKillsMean += 3.5;
    if (isSupport) baseKillsMean -= 2.5;
    if (isWin) baseKillsMean += 2.0;

    const kills = Math.max(2, Math.round(gaussianRandom(baseKillsMean, 4.2)));

    let baseDeathsMean = 16 - skill * 6;
    if (isEntry) baseDeathsMean += 2.0;
    if (isSniper) baseDeathsMean -= 2.5;
    if (isWin) baseDeathsMean -= 3.0;

    const deaths = Math.max(1, Math.round(gaussianRandom(baseDeathsMean, 3.5)));

    let baseAssistsMean = 5 + skill * 4;
    if (isSupport) baseAssistsMean += 5.5;
    if (isEntry) baseAssistsMean -= 1.5;

    const assists = Math.max(0, Math.round(gaussianRandom(baseAssistsMean, 2.8)));

    // 3. Headshot Percentage (10% to 55%)
    let baseHs = 15 + skill * 22;
    if (isSniper) baseHs += 8;
    if (isEntry) baseHs += 3;
    const hs = Math.min(68, Math.max(8, Math.round(gaussianRandom(baseHs, 5.5))));

    // 4. Match Score
    const baseScore = Math.round(
      kills * 20 + assists * 8 - deaths * 5 + (isWin ? 100 : 30) + skill * 120 + hs * 1.5
    );
    const score = Math.max(50, Math.min(990, baseScore + randomInt(-20, 25)));

    matches.push({
      match_id: `m-${m.toString().padStart(5, '0')}`,
      player_id: player.id,
      date: dateStr,
      map,
      kills,
      deaths,
      assists,
      headshot_percentage: hs,
      score,
      result,
    });
  }

  // Sort matches chronologically
  matches.sort((a, b) => a.date.localeCompare(b.date));

  return matches;
}

// Generate the initial dataset once
export const INITIAL_PLAYERS: Player[] = generatePlayers(300);
export const INITIAL_MATCHES: Match[] = generateMatches(INITIAL_PLAYERS, 2000);
