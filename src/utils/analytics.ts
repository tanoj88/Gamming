import {
  Player,
  Match,
  PlayerAggregatedStats,
  PerformanceTier,
  FilterState,
  WeeklyTrendPoint,
  MapStat,
  RoleStat,
  InsightItem,
} from '../types/gaming';

/**
 * Computes performance tier based on win rate and KDA.
 */
export function determinePerformanceTier(winRate: number, kda: number): PerformanceTier {
  if (winRate >= 56 && kda >= 1.7) {
    return 'Pro';
  }
  if (winRate < 48 || kda < 1.15) {
    return 'Beginner';
  }
  return 'Intermediate';
}

/**
 * Aggregates match statistics for a list of players.
 */
export function aggregatePlayerStats(
  players: Player[],
  matches: Match[]
): PlayerAggregatedStats[] {
  // Map player_id -> matches
  const matchMap = new Map<string, Match[]>();
  for (const match of matches) {
    const list = matchMap.get(match.player_id) || [];
    list.push(match);
    matchMap.set(match.player_id, list);
  }

  return players.map((player) => {
    const pMatches = matchMap.get(player.id) || [];
    const totalMatches = pMatches.length;

    let wins = 0;
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalHs = 0;
    let totalScore = 0;
    const mapWins = new Map<string, { wins: number; total: number }>();

    for (const m of pMatches) {
      if (m.result === 'Win') wins++;
      totalKills += m.kills;
      totalDeaths += m.deaths;
      totalAssists += m.assists;
      totalHs += m.headshot_percentage;
      totalScore += m.score;

      const curr = mapWins.get(m.map) || { wins: 0, total: 0 };
      curr.total++;
      if (m.result === 'Win') curr.wins++;
      mapWins.set(m.map, curr);
    }

    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? Number(((wins / totalMatches) * 100).toFixed(1)) : 0;
    const kda =
      totalMatches > 0
        ? Number(((totalKills + totalAssists) / Math.max(totalDeaths, 1)).toFixed(2))
        : 0;
    const avgScore = totalMatches > 0 ? Math.round(totalScore / totalMatches) : 0;
    const avgKills = totalMatches > 0 ? Number((totalKills / totalMatches).toFixed(1)) : 0;
    const avgDeaths = totalMatches > 0 ? Number((totalDeaths / totalMatches).toFixed(1)) : 0;
    const avgAssists = totalMatches > 0 ? Number((totalAssists / totalMatches).toFixed(1)) : 0;
    const avgHeadshotPercentage =
      totalMatches > 0 ? Number((totalHs / totalMatches).toFixed(1)) : 0;

    let bestMap = 'N/A';
    let bestMapWinRate = -1;
    for (const [mapName, stats] of mapWins.entries()) {
      if (stats.total >= 2) {
        const rate = stats.wins / stats.total;
        if (rate > bestMapWinRate) {
          bestMapWinRate = rate;
          bestMap = mapName;
        }
      }
    }
    if (bestMap === 'N/A' && pMatches.length > 0) {
      bestMap = pMatches[0].map;
    }

    const performanceTier = determinePerformanceTier(winRate, kda);

    return {
      ...player,
      totalMatches,
      wins,
      losses,
      winRate,
      totalKills,
      totalDeaths,
      totalAssists,
      kda,
      avgScore,
      avgKills,
      avgDeaths,
      avgAssists,
      avgHeadshotPercentage,
      performanceTier,
      bestMap,
    };
  });
}

/**
 * Filters players and matches based on user filter controls.
 */
export function filterData(
  allPlayers: Player[],
  allMatches: Match[],
  filters: FilterState
): {
  filteredPlayers: Player[];
  filteredMatches: Match[];
  playerStats: PlayerAggregatedStats[];
} {
  const now = new Date('2026-11-04T12:00:00Z').getTime();

  // 1. Date threshold
  let minTime = 0;
  if (filters.dateRange === '30d') {
    minTime = now - 30 * 24 * 60 * 60 * 1000;
  } else if (filters.dateRange === '90d') {
    minTime = now - 90 * 24 * 60 * 60 * 1000;
  } else if (filters.dateRange === '180d') {
    minTime = now - 180 * 24 * 60 * 60 * 1000;
  }

  // 2. Filter matches by date and map
  let matches = allMatches.filter((m) => {
    if (minTime > 0) {
      const matchTime = new Date(m.date).getTime();
      if (matchTime < minTime) return false;
    }
    if (filters.map !== 'All' && m.map !== filters.map) {
      return false;
    }
    return true;
  });

  // 3. Filter players by Game, Role, Search
  let players = allPlayers.filter((p) => {
    if (filters.game !== 'All' && p.game !== filters.game) return false;
    if (filters.role !== 'All' && p.role !== filters.role) return false;
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchName = p.username.toLowerCase().includes(q);
      const matchCountry = p.country.toLowerCase().includes(q);
      const matchRank = p.rank.toLowerCase().includes(q);
      const matchPlatform = p.platform ? p.platform.toLowerCase().includes(q) : false;
      if (!matchName && !matchCountry && !matchRank && !matchPlatform) return false;
    }
    if (filters.sourceFilter && filters.sourceFilter !== 'All') {
      if (filters.sourceFilter === 'Connected Accounts' && p.source !== 'api' && !p.platform) {
        return false;
      }
      if (filters.sourceFilter === 'CSV Imports' && p.source !== 'csv') {
        return false;
      }
      if (filters.sourceFilter === 'Sample Dataset' && (p.source === 'api' || p.source === 'csv')) {
        return false;
      }
    }
    return true;
  });

  // 4. Align matches with remaining players
  const playerIds = new Set(players.map((p) => p.id));
  matches = matches.filter((m) => playerIds.has(m.player_id));

  // 5. Aggregate stats
  let aggregated = aggregatePlayerStats(players, matches);

  // 6. Tier filter (computed property)
  if (filters.tier !== 'All') {
    aggregated = aggregated.filter((p) => p.performanceTier === filters.tier);
    const validIds = new Set(aggregated.map((p) => p.id));
    players = players.filter((p) => validIds.has(p.id));
    matches = matches.filter((m) => validIds.has(m.player_id));
  }

  return {
    filteredPlayers: players,
    filteredMatches: matches,
    playerStats: aggregated,
  };
}

/**
 * Calculates overall high-level KPI cards.
 */
export function calculateKpis(playerStats: PlayerAggregatedStats[], matches: Match[]) {
  const totalMatches = matches.length;
  const totalPlaytime = playerStats.reduce((sum, p) => sum + p.playtime_hours, 0);

  let totalWins = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;

  for (const m of matches) {
    if (m.result === 'Win') totalWins++;
    totalKills += m.kills;
    totalDeaths += m.deaths;
    totalAssists += m.assists;
  }

  const avgWinRate = totalMatches > 0 ? Number(((totalWins / totalMatches) * 100).toFixed(1)) : 0;
  const avgKda =
    totalMatches > 0
      ? Number(((totalKills + totalAssists) / Math.max(totalDeaths, 1)).toFixed(2))
      : 0;

  // Find top player by composite score: winRate * 0.4 + kda * 20 + avgScore * 0.05
  let topPlayer: PlayerAggregatedStats | null = null;
  let highestRating = -1;

  for (const p of playerStats) {
    if (p.totalMatches >= 3) {
      const rating = p.winRate * 0.4 + p.kda * 25 + p.avgScore * 0.08;
      if (rating > highestRating) {
        highestRating = rating;
        topPlayer = p;
      }
    }
  }

  if (!topPlayer && playerStats.length > 0) {
    topPlayer = [...playerStats].sort((a, b) => b.kda - a.kda)[0];
  }

  return {
    totalMatches,
    avgWinRate,
    avgKda,
    totalPlaytime,
    topPlayer,
    totalPlayers: playerStats.length,
    totalWins,
    totalLosses: totalMatches - totalWins,
  };
}

/**
 * Calculates top 10 players for leaderboard (horizontal bar chart).
 */
export function calculateLeaderboard(playerStats: PlayerAggregatedStats[]) {
  return [...playerStats]
    .filter((p) => p.totalMatches > 0)
    .sort((a, b) => {
      // Sort by KDA primary, then Win Rate
      if (b.kda !== a.kda) return b.kda - a.kda;
      return b.winRate - a.winRate;
    })
    .slice(0, 10)
    .map((p, idx) => ({
      rank: idx + 1,
      id: p.id,
      username: p.username,
      kda: p.kda,
      winRate: p.winRate,
      avgScore: p.avgScore,
      role: p.role,
      tier: p.performanceTier,
      game: p.game,
      matches: p.totalMatches,
    }));
}

/**
 * Calculates win rate vs playtime scatter plot points.
 */
export function calculateScatterData(playerStats: PlayerAggregatedStats[]) {
  return playerStats
    .filter((p) => p.totalMatches > 0)
    .map((p) => ({
      id: p.id,
      username: p.username,
      playtime: p.playtime_hours,
      winRate: p.winRate,
      kda: p.kda,
      score: p.avgScore,
      tier: p.performanceTier,
      role: p.role,
      game: p.game,
    }));
}

/**
 * Calculates weekly trend lines (chronological).
 */
export function calculateWeeklyTrends(matches: Match[]): WeeklyTrendPoint[] {
  if (matches.length === 0) return [];

  // Sort matches by date
  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date));
  const weekBuckets = new Map<
    string,
    { kills: number; deaths: number; assists: number; wins: number; matches: number; score: number }
  >();

  for (const m of sorted) {
    const d = new Date(m.date);
    // Group into 7-day intervals based on start of that week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    const weekKey = `${monday.toLocaleString('default', { month: 'short' })} ${monday.getDate()}`;

    const current = weekBuckets.get(weekKey) || {
      kills: 0,
      deaths: 0,
      assists: 0,
      wins: 0,
      matches: 0,
      score: 0,
    };

    current.kills += m.kills;
    current.deaths += m.deaths;
    current.assists += m.assists;
    current.score += m.score;
    current.matches++;
    if (m.result === 'Win') current.wins++;

    weekBuckets.set(weekKey, current);
  }

  const results: WeeklyTrendPoint[] = [];
  for (const [week, data] of weekBuckets.entries()) {
    const avgKda = Number(
      ((data.kills + data.assists) / Math.max(data.deaths, 1)).toFixed(2)
    );
    const winRate = Number(((data.wins / Math.max(data.matches, 1)) * 100).toFixed(1));
    const avgScore = Math.round(data.score / Math.max(data.matches, 1));

    results.push({
      week,
      avgKda,
      winRate,
      matchCount: data.matches,
      avgScore,
    });
  }

  return results.slice(-12); // Last 12 weeks
}

/**
 * Calculates kills and deaths distribution (histogram bins).
 */
export function calculateKillsDeathsDistribution(matches: Match[]) {
  const bins = [
    { label: '0-5', min: 0, max: 5, killsCount: 0, deathsCount: 0 },
    { label: '6-10', min: 6, max: 10, killsCount: 0, deathsCount: 0 },
    { label: '11-15', min: 11, max: 15, killsCount: 0, deathsCount: 0 },
    { label: '16-20', min: 16, max: 20, killsCount: 0, deathsCount: 0 },
    { label: '21-25', min: 21, max: 25, killsCount: 0, deathsCount: 0 },
    { label: '26-30', min: 26, max: 30, killsCount: 0, deathsCount: 0 },
    { label: '31+', min: 31, max: 999, killsCount: 0, deathsCount: 0 },
  ];

  for (const m of matches) {
    for (const b of bins) {
      if (m.kills >= b.min && m.kills <= b.max) b.killsCount++;
      if (m.deaths >= b.min && m.deaths <= b.max) b.deathsCount++;
    }
  }

  return bins.map((b) => ({
    range: b.label,
    Kills: b.killsCount,
    Deaths: b.deathsCount,
  }));
}

/**
 * Calculates win/loss share for donut chart.
 */
export function calculateWinLossShare(matches: Match[]) {
  let wins = 0;
  let losses = 0;
  for (const m of matches) {
    if (m.result === 'Win') wins++;
    else losses++;
  }
  const total = wins + losses;
  return [
    {
      name: 'Victories',
      value: wins,
      percentage: total > 0 ? Number(((wins / total) * 100).toFixed(1)) : 0,
      fill: '#10b981', // emerald-500
    },
    {
      name: 'Defeats',
      value: losses,
      percentage: total > 0 ? Number(((losses / total) * 100).toFixed(1)) : 0,
      fill: '#f43f5e', // rose-500
    },
  ];
}

/**
 * Calculates map-wise win rate comparison.
 */
export function calculateMapStats(matches: Match[]): MapStat[] {
  const mapMap = new Map<string, { wins: number; total: number; scoreSum: number }>();

  for (const m of matches) {
    const cur = mapMap.get(m.map) || { wins: 0, total: 0, scoreSum: 0 };
    cur.total++;
    cur.scoreSum += m.score;
    if (m.result === 'Win') cur.wins++;
    mapMap.set(m.map, cur);
  }

  const list: MapStat[] = [];
  for (const [map, data] of mapMap.entries()) {
    list.push({
      map,
      matches: data.total,
      wins: data.wins,
      winRate: Number(((data.wins / data.total) * 100).toFixed(1)),
      avgScore: Math.round(data.scoreSum / data.total),
    });
  }

  return list.sort((a, b) => b.winRate - a.winRate);
}

/**
 * Calculates role-wise average statistics (grouped bar chart).
 */
export function calculateRoleStats(playerStats: PlayerAggregatedStats[]): RoleStat[] {
  const roleMap = new Map<
    string,
    {
      players: number;
      totalMatches: number;
      killsSum: number;
      deathsSum: number;
      assistsSum: number;
      kdaSum: number;
      scoreSum: number;
      winRateSum: number;
    }
  >();

  for (const p of playerStats) {
    if (p.totalMatches === 0) continue;
    const cur = roleMap.get(p.role) || {
      players: 0,
      totalMatches: 0,
      killsSum: 0,
      deathsSum: 0,
      assistsSum: 0,
      kdaSum: 0,
      scoreSum: 0,
      winRateSum: 0,
    };

    cur.players++;
    cur.totalMatches += p.totalMatches;
    cur.killsSum += p.avgKills;
    cur.deathsSum += p.avgDeaths;
    cur.assistsSum += p.avgAssists;
    cur.kdaSum += p.kda;
    cur.scoreSum += p.avgScore;
    cur.winRateSum += p.winRate;
    roleMap.set(p.role, cur);
  }

  const results: RoleStat[] = [];
  for (const [role, data] of roleMap.entries()) {
    results.push({
      role,
      matches: data.totalMatches,
      avgKills: Number((data.killsSum / data.players).toFixed(1)),
      avgDeaths: Number((data.deathsSum / data.players).toFixed(1)),
      avgAssists: Number((data.assistsSum / data.players).toFixed(1)),
      avgKda: Number((data.kdaSum / data.players).toFixed(2)),
      avgScore: Math.round(data.scoreSum / data.players),
      winRate: Number((data.winRateSum / data.players).toFixed(1)),
    });
  }

  return results.sort((a, b) => b.avgKda - a.avgKda);
}

/**
 * Pearson correlation coefficient between two number arrays.
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  if (denX === 0 || denY === 0) return 0;
  return Number((num / Math.sqrt(denX * denY)).toFixed(2));
}

/**
 * Calculates correlation heatmap matrix between player metrics.
 */
export function calculateCorrelationMatrix(playerStats: PlayerAggregatedStats[]) {
  const valid = playerStats.filter((p) => p.totalMatches > 0);
  if (valid.length < 2) return null;

  const metrics = [
    { key: 'winRate', label: 'Win Rate %', values: valid.map((p) => p.winRate) },
    { key: 'kda', label: 'KDA Ratio', values: valid.map((p) => p.kda) },
    { key: 'playtime_hours', label: 'Playtime (h)', values: valid.map((p) => p.playtime_hours) },
    { key: 'avgScore', label: 'Avg Score', values: valid.map((p) => p.avgScore) },
    { key: 'avgHeadshotPercentage', label: 'Headshot %', values: valid.map((p) => p.avgHeadshotPercentage) },
    { key: 'avgKills', label: 'Avg Kills', values: valid.map((p) => p.avgKills) },
    { key: 'avgDeaths', label: 'Avg Deaths', values: valid.map((p) => p.avgDeaths) },
    { key: 'avgAssists', label: 'Avg Assists', values: valid.map((p) => p.avgAssists) },
  ];

  const matrix: { x: string; y: string; correlation: number }[][] = [];

  for (let i = 0; i < metrics.length; i++) {
    const row: { x: string; y: string; correlation: number }[] = [];
    for (let j = 0; j < metrics.length; j++) {
      const corr = i === j ? 1 : pearsonCorrelation(metrics[i].values, metrics[j].values);
      row.push({
        x: metrics[i].label,
        y: metrics[j].label,
        correlation: corr,
      });
    }
    matrix.push(row);
  }

  return { labels: metrics.map((m) => m.label), matrix };
}

/**
 * Calculates normalized radar stats for player comparison.
 */
export function getRadarComparison(
  player1: PlayerAggregatedStats,
  player2: PlayerAggregatedStats
) {
  // Normalize metrics to 0-100 scale for intuitive radar display
  return [
    {
      stat: 'Win Rate %',
      [player1.username]: player1.winRate,
      [player2.username]: player2.winRate,
      fullMark: 100,
    },
    {
      stat: 'KDA (x30)',
      [player1.username]: Math.min(100, Math.round(player1.kda * 30)),
      [player2.username]: Math.min(100, Math.round(player2.kda * 30)),
      fullMark: 100,
    },
    {
      stat: 'Kills/Match (x4)',
      [player1.username]: Math.min(100, Math.round(player1.avgKills * 4)),
      [player2.username]: Math.min(100, Math.round(player2.avgKills * 4)),
      fullMark: 100,
    },
    {
      stat: 'Assists/Match (x8)',
      [player1.username]: Math.min(100, Math.round(player1.avgAssists * 8)),
      [player2.username]: Math.min(100, Math.round(player2.avgAssists * 8)),
      fullMark: 100,
    },
    {
      stat: 'Headshot %',
      [player1.username]: player1.avgHeadshotPercentage,
      [player2.username]: player2.avgHeadshotPercentage,
      fullMark: 100,
    },
    {
      stat: 'Score (x0.2)',
      [player1.username]: Math.min(100, Math.round(player1.avgScore * 0.2)),
      [player2.username]: Math.min(100, Math.round(player2.avgScore * 0.2)),
      fullMark: 100,
    },
  ];
}

/**
 * Generates 4 to 5 automated, data-driven insights from the filtered data slice.
 */
export function generateDataDrivenInsights(
  playerStats: PlayerAggregatedStats[],
  matches: Match[],
  mapStats: MapStat[],
  roleStats: RoleStat[]
): InsightItem[] {
  const insights: InsightItem[] = [];

  if (matches.length === 0 || playerStats.length === 0) {
    return [
      {
        id: 'no-data',
        title: 'Insufficient Filter Data',
        description: 'Broaden your active filters to generate statistical observations.',
        statValue: '0 Matches',
        metricLabel: 'Sample Size',
        category: 'General',
        sentiment: 'neutral',
      },
    ];
  }

  // 1. Map Impact Finding
  if (mapStats.length >= 2) {
    const highestMap = mapStats[0];
    const lowestMap = mapStats[mapStats.length - 1];
    const diff = Number((highestMap.winRate - lowestMap.winRate).toFixed(1));
    insights.push({
      id: 'insight-map',
      title: `${highestMap.map} Win Rate Surge`,
      description: `Players competing on ${highestMap.map} achieve a ${highestMap.winRate}% victory rate, outpacing ${lowestMap.map} by +${diff}% across ${highestMap.matches} recorded matches.`,
      statValue: `${highestMap.winRate}%`,
      metricLabel: `${highestMap.map} Win Rate`,
      category: 'Map',
      sentiment: 'positive',
    });
  }

  // 2. Role Efficiency Finding
  if (roleStats.length >= 2) {
    const topRole = roleStats[0];
    insights.push({
      id: 'insight-role',
      title: `${topRole.role} Tactical Dominance`,
      description: `Players maining ${topRole.role} boast the highest aggregate KDA of ${topRole.avgKda} while averaging ${topRole.avgKills} kills and ${topRole.avgScore} combat score.`,
      statValue: `${topRole.avgKda} KDA`,
      metricLabel: `${topRole.role} Efficiency`,
      category: 'Role',
      sentiment: 'positive',
    });
  }

  // 3. Playtime Correlation Finding
  const playtimes = playerStats.map((p) => p.playtime_hours);
  const winRates = playerStats.map((p) => p.winRate);
  const corr = pearsonCorrelation(playtimes, winRates);
  const corrText =
    corr > 0.4
      ? 'Strong positive correlation'
      : corr > 0.15
      ? 'Moderate positive correlation'
      : 'Marginal correlation';

  const veteranPlayers = playerStats.filter((p) => p.playtime_hours > 700);
  const rookiePlayers = playerStats.filter((p) => p.playtime_hours <= 300);

  const avgVetWin =
    veteranPlayers.length > 0
      ? veteranPlayers.reduce((a, b) => a + b.winRate, 0) / veteranPlayers.length
      : 0;
  const avgRookWin =
    rookiePlayers.length > 0
      ? rookiePlayers.reduce((a, b) => a + b.winRate, 0) / rookiePlayers.length
      : 0;
  const winDiff = (avgVetWin - avgRookWin).toFixed(1);

  insights.push({
    id: 'insight-playtime',
    title: 'Experience & Longevity Advantage',
    description: `${corrText} (r = +${corr}) detected between total playtime hours and win rate. Veterans (700h+) win +${winDiff}% more often than rookies.`,
    statValue: `r = +${corr}`,
    metricLabel: 'Pearson Correlation',
    category: 'Playtime',
    sentiment: corr > 0.3 ? 'positive' : 'neutral',
  });

  // 4. Performance Tier Breakdown Finding
  const proPlayers = playerStats.filter((p) => p.performanceTier === 'Pro');
  const begPlayers = playerStats.filter((p) => p.performanceTier === 'Beginner');

  if (proPlayers.length > 0) {
    const proAvgHs = Number(
      (proPlayers.reduce((a, b) => a + b.avgHeadshotPercentage, 0) / proPlayers.length).toFixed(1)
    );
    const begAvgHs =
      begPlayers.length > 0
        ? Number(
            (begPlayers.reduce((a, b) => a + b.avgHeadshotPercentage, 0) / begPlayers.length).toFixed(1)
          )
        : 18;

    insights.push({
      id: 'insight-tier',
      title: 'Headshot Precision & Tier Escalation',
      description: `Pro tier contenders sustain an average headshot rate of ${proAvgHs}%, compared to ${begAvgHs}% among beginners, reflecting refined crosshair placement.`,
      statValue: `${proAvgHs}% HS`,
      metricLabel: 'Pro Tier Precision',
      category: 'Tier',
      sentiment: 'positive',
    });
  }

  // 5. High-Impact MVP Finding
  const sortedByKda = [...playerStats].sort((a, b) => b.kda - a.kda);
  if (sortedByKda.length > 0) {
    const standout = sortedByKda[0];
    insights.push({
      id: 'insight-mvp',
      title: `${standout.username} Outlier Performance`,
      description: `Highest individual KDA of ${standout.kda} held by ${standout.username} (${standout.country}, ${standout.rank}) with a ${standout.winRate}% win rate across ${standout.totalMatches} matches.`,
      statValue: `${standout.kda}`,
      metricLabel: 'Peak Individual KDA',
      category: 'General',
      sentiment: 'positive',
    });
  }

  return insights;
}
