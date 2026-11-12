/**
 * @file csvService.ts
 * Parser and validator for manual CSV uploads (players & matches).
 */

import { Player, Match, GameTitle } from '../../types/gaming';

export interface CsvParseResult {
  players: Player[];
  matches: Match[];
  errors: string[];
  summary: {
    playersFound: number;
    matchesFound: number;
    ignoredRows: number;
  };
}

function parseCsvLines(csvText: string): string[][] {
  const lines: string[][] = [];
  const rawLines = csvText.split(/\r?\n/);

  for (const line of rawLines) {
    if (!line.trim()) continue;
    // Simple regex parser handling quotes
    const row: string[] = [];
    let insideQuotes = false;
    let currentCell = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    row.push(currentCell.trim());
    lines.push(row);
  }

  return lines;
}

export function parseCsvData(csvText: string): CsvParseResult {
  const rows = parseCsvLines(csvText);
  const errors: string[] = [];
  const players: Player[] = [];
  const matches: Match[] = [];

  if (rows.length < 2) {
    return {
      players: [],
      matches: [],
      errors: ['CSV file is empty or missing headers.'],
      summary: { playersFound: 0, matchesFound: 0, ignoredRows: 0 },
    };
  }

  const header = rows[0].map((h) => h.toLowerCase().replace(/[\s_-]+/g, ''));
  const dataRows = rows.slice(1);

  // Check if header resembles Match CSV
  const hasMatchId = header.includes('matchid') || header.includes('match');
  const hasResult = header.includes('result') || header.includes('outcome');

  // Check if header resembles Player CSV
  const hasUsername = header.includes('username') || header.includes('player') || header.includes('name');
  const hasPlaytime = header.includes('playtimehours') || header.includes('playtime') || header.includes('hours');

  if (hasMatchId || (hasResult && header.includes('playerid'))) {
    // Treat as Match CSV
    const matchIdIdx = header.findIndex((h) => h.includes('matchid') || h === 'match');
    const playerIdIdx = header.findIndex((h) => h.includes('playerid') || h === 'player');
    const dateIdx = header.findIndex((h) => h === 'date' || h.includes('timestamp'));
    const mapIdx = header.findIndex((h) => h === 'map' || h.includes('sector'));
    const killsIdx = header.findIndex((h) => h === 'kills' || h === 'k');
    const deathsIdx = header.findIndex((h) => h === 'deaths' || h === 'd');
    const assistsIdx = header.findIndex((h) => h === 'assists' || h === 'a');
    const hsIdx = header.findIndex((h) => h.includes('headshot') || h === 'hs');
    const scoreIdx = header.findIndex((h) => h === 'score' || h === 'points');
    const resultIdx = header.findIndex((h) => h === 'result' || h === 'outcome');

    dataRows.forEach((row, i) => {
      const match_id = row[matchIdIdx] || `m-csv-${Date.now()}-${i}`;
      const player_id = row[playerIdIdx] || 'p-csv-user';
      const date = row[dateIdx] || new Date().toISOString().split('T')[0];
      const map = row[mapIdx] || 'Ascent';
      const kills = parseInt(row[killsIdx], 10) || 0;
      const deaths = parseInt(row[deathsIdx], 10) || 1;
      const assists = parseInt(row[assistsIdx], 10) || 0;
      const headshot_percentage = parseInt(row[hsIdx], 10) || 20;
      const score = parseInt(row[scoreIdx], 10) || kills * 20;
      const rawRes = (row[resultIdx] || 'Win').toLowerCase();
      const result: 'Win' | 'Loss' = rawRes.includes('w') || rawRes === 'win' || rawRes === 'victory' ? 'Win' : 'Loss';

      matches.push({
        match_id,
        player_id,
        date,
        map,
        kills,
        deaths,
        assists,
        headshot_percentage,
        score,
        result,
      });
    });
  } else if (hasUsername || hasPlaytime) {
    // Treat as Player CSV
    const idIdx = header.findIndex((h) => h === 'id' || h === 'playerid');
    const userIdx = header.findIndex((h) => h === 'username' || h === 'player' || h === 'name');
    const gameIdx = header.findIndex((h) => h === 'game' || h === 'title');
    const roleIdx = header.findIndex((h) => h === 'role' || h === 'class');
    const rankIdx = header.findIndex((h) => h === 'rank' || h === 'tier');
    const countryIdx = header.findIndex((h) => h === 'country' || h === 'region');
    const playtimeIdx = header.findIndex((h) => h.includes('playtime') || h.includes('hours'));

    dataRows.forEach((row, i) => {
      const username = row[userIdx] || `Player_${i + 1}`;
      const id = row[idIdx] || `p-csv-${Buffer.from(username).toString('hex').slice(0, 8)}`;
      const game = (row[gameIdx] as GameTitle) || 'Valorant';
      const role = row[roleIdx] || 'Duelist';
      const rank = row[rankIdx] || 'Gold';
      const country = row[countryIdx] || 'United States';
      const playtime_hours = parseInt(row[playtimeIdx], 10) || 150;

      players.push({
        id,
        username,
        game,
        role,
        rank,
        rankTier: 4,
        country,
        countryCode: country.slice(0, 2).toUpperCase(),
        playtime_hours,
        avatarSeed: (i * 47) % 1000,
        source: 'csv',
        lastUpdated: new Date().toISOString(),
      });
    });
  } else {
    errors.push(
      'Unrecognized CSV format. Headers should include player columns (username, game, role, rank) or match columns (match_id, player_id, kills, deaths, result).'
    );
  }

  return {
    players,
    matches,
    errors,
    summary: {
      playersFound: players.length,
      matchesFound: matches.length,
      ignoredRows: dataRows.length - (players.length + matches.length),
    },
  };
}
