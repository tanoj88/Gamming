/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { INITIAL_PLAYERS, INITIAL_MATCHES } from './data/mockData';
import { FilterState, PlayerAggregatedStats, Player, Match, ConnectedAccount } from './types/gaming';
import {
  filterData,
  calculateKpis,
  calculateLeaderboard,
  calculateScatterData,
  calculateWeeklyTrends,
  calculateKillsDeathsDistribution,
  calculateWinLossShare,
  calculateMapStats,
  calculateRoleStats,
  generateDataDrivenInsights,
} from './utils/analytics';
import { ApiClient } from './utils/apiClient';

// Components
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { FiltersBar } from './components/FiltersBar';
import { InsightsSection } from './components/InsightsSection';
import { TopPlayersLeaderboard } from './components/charts/TopPlayersLeaderboard';
import { WinRateVsPlaytimeChart } from './components/charts/WinRateVsPlaytimeChart';
import { PerformanceTrendChart } from './components/charts/PerformanceTrendChart';
import { KillsDeathsDistributionChart } from './components/charts/KillsDeathsDistributionChart';
import { WinLossDonutChart } from './components/charts/WinLossDonutChart';
import { MapWinRateChart } from './components/charts/MapWinRateChart';
import { RoleStatsGroupedChart } from './components/charts/RoleStatsGroupedChart';
import { PlayerComparisonRadar } from './components/charts/PlayerComparisonRadar';
import { CorrelationHeatmap } from './components/charts/CorrelationHeatmap';
import { PlayerTable } from './components/PlayerTable';
import { PlayerModal } from './components/PlayerModal';
import { ConnectAccountsModal } from './components/ConnectAccountsModal';
import { CsvUploadModal } from './components/CsvUploadModal';
import { Footer } from './components/Footer';

const INITIAL_FILTERS: FilterState = {
  game: 'All',
  role: 'All',
  map: 'All',
  dateRange: 'all',
  searchQuery: '',
  tier: 'All',
  sourceFilter: 'All',
};

export default function App() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerAggregatedStats | null>(null);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);

  // Live Connected Accounts & Custom Imported Telemetry
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [customPlayers, setCustomPlayers] = useState<Player[]>([]);
  const [customMatches, setCustomMatches] = useState<Match[]>([]);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | undefined>(undefined);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Modal Dialogs
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Load custom data and connected accounts from backend storage
  const reloadData = useCallback(async () => {
    try {
      const [accData, pData, mData] = await Promise.all([
        ApiClient.getAccounts().catch(() => ({ accounts: [], lastSync: undefined })),
        ApiClient.getCustomPlayers().catch(() => []),
        ApiClient.getCustomMatches().catch(() => []),
      ]);

      setConnectedAccounts(accData.accounts || []);
      setLastSyncTimestamp(accData.lastSync);
      setCustomPlayers(pData || []);
      setCustomMatches(mData || []);
    } catch (err) {
      console.warn('[App] Backend telemetry sync notice:', err);
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Merge custom API-connected and CSV-imported records with seeded baseline
  const allPlayers = useMemo(() => {
    return [...customPlayers, ...INITIAL_PLAYERS];
  }, [customPlayers]);

  const allMatches = useMemo(() => {
    return [...customMatches, ...INITIAL_MATCHES];
  }, [customMatches]);

  // Filter dataset based on current filter controls
  const { filteredPlayers, filteredMatches, playerStats } = useMemo(() => {
    return filterData(allPlayers, allMatches, filters);
  }, [allPlayers, allMatches, filters]);

  // High-level KPI aggregations
  const kpis = useMemo(() => {
    return calculateKpis(playerStats, filteredMatches);
  }, [playerStats, filteredMatches]);

  // Chart datasets
  const leaderboardData = useMemo(() => calculateLeaderboard(playerStats), [playerStats]);
  const scatterData = useMemo(() => calculateScatterData(playerStats), [playerStats]);
  const weeklyTrendsData = useMemo(() => calculateWeeklyTrends(filteredMatches), [filteredMatches]);
  const killsDeathsDistribution = useMemo(
    () => calculateKillsDeathsDistribution(filteredMatches),
    [filteredMatches]
  );
  const winLossShare = useMemo(() => calculateWinLossShare(filteredMatches), [filteredMatches]);
  const mapStats = useMemo(() => calculateMapStats(filteredMatches), [filteredMatches]);
  const roleStats = useMemo(() => calculateRoleStats(playerStats), [playerStats]);

  // Automated 4 to 5 data-driven insights
  const insights = useMemo(() => {
    return generateDataDrivenInsights(playerStats, filteredMatches, mapStats, roleStats);
  }, [playerStats, filteredMatches, mapStats, roleStats]);

  // Handlers
  const handleResetFilters = () => setFilters(INITIAL_FILTERS);

  const handleSelectPlayerById = (id: string) => {
    const p = playerStats.find((item) => item.id === id);
    if (p) setSelectedPlayer(p);
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      await ApiClient.syncAllAccounts();
      await reloadData();
    } catch (err) {
      console.error('Failed to sync all accounts:', err);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Export handlers
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Username',
      'Game',
      'Role',
      'Rank',
      'Tier',
      'Country',
      'Playtime_Hours',
      'Total_Matches',
      'Wins',
      'Losses',
      'Win_Rate_Pct',
      'KDA_Ratio',
      'Avg_Kills',
      'Avg_Deaths',
      'Avg_Assists',
      'Headshot_Pct',
      'Avg_Score',
      'Best_Map',
      'Data_Source',
    ];

    const rows = playerStats.map((p) => [
      p.id,
      `"${p.username}"`,
      `"${p.game}"`,
      `"${p.role}"`,
      `"${p.rank}"`,
      `"${p.performanceTier}"`,
      `"${p.country}"`,
      p.playtime_hours,
      p.totalMatches,
      p.wins,
      p.losses,
      p.winRate,
      p.kda,
      p.avgKills,
      p.avgDeaths,
      p.avgAssists,
      p.avgHeadshotPercentage,
      p.avgScore,
      `"${p.bestMap}"`,
      `"${p.platform || p.source || 'sample'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gaming_stats_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            appliedFilters: filters,
            kpis,
            connectedAccountsCount: connectedAccounts.length,
            players: playerStats,
            totalMatches: filteredMatches.length,
          },
          null,
          2
        )
      );
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `gaming_stats_telemetry_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-x-hidden">
      {/* Optional CRT Tron Scanlines Overlay */}
      {scanlinesEnabled && (
        <div className="fixed inset-0 hud-scanlines pointer-events-none z-50 opacity-35" />
      )}

      {/* Top Tron HUD Header */}
      <Header
        filters={filters}
        onResetFilters={handleResetFilters}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        totalFilteredPlayers={playerStats.length}
        totalFilteredMatches={filteredMatches.length}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={() => setScanlinesEnabled((prev) => !prev)}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        connectedAccounts={connectedAccounts}
        lastSyncTimestamp={lastSyncTimestamp}
        onSyncAll={handleSyncAll}
        isSyncingAll={isSyncingAll}
      />

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full relative z-10">
        {/* Interactive Tactical Filters Bar */}
        <section aria-label="Tactical Filters">
          <FiltersBar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </section>

        {/* Telemetry KPI HUD Cards */}
        <section aria-label="Key Performance Indicators">
          <KpiCards
            totalMatches={kpis.totalMatches}
            avgWinRate={kpis.avgWinRate}
            avgKda={kpis.avgKda}
            totalPlaytime={kpis.totalPlaytime}
            topPlayer={kpis.topPlayer}
            totalPlayers={kpis.totalPlayers}
            totalWins={kpis.totalWins}
            totalLosses={kpis.totalLosses}
            onSelectPlayer={setSelectedPlayer}
          />
        </section>

        {/* Data-Driven Insights Section */}
        <InsightsSection insights={insights} />

        {/* Section Title */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2 text-glow-cyan">
            <span>&bull;</span>
            <span>HOLOGRAPHIC BATTLE TELEMETRY &amp; MULTI-DIMENSIONAL MATRICES</span>
          </h2>
          <span className="text-3xs font-mono text-slate-500">
            FEEDS: {connectedAccounts.length} LIVE API | {customPlayers.length} CUSTOM NODES
          </span>
        </div>

        {/* Charts Row 1: Top 10 Leaderboard & Win Rate vs Playtime */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopPlayersLeaderboard
            data={leaderboardData}
            onSelectPlayerById={handleSelectPlayerById}
          />
          <WinRateVsPlaytimeChart
            data={scatterData}
            onSelectPlayerById={handleSelectPlayerById}
          />
        </section>

        {/* Charts Row 2: Performance Trend & Kills/Deaths Distribution */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceTrendChart data={weeklyTrendsData} />
          <KillsDeathsDistributionChart data={killsDeathsDistribution} />
        </section>

        {/* Charts Row 3: Win/Loss Donut & Map-wise Win Rate */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <WinLossDonutChart
              data={winLossShare}
              totalMatches={kpis.totalMatches}
            />
          </div>
          <div className="lg:col-span-8">
            <MapWinRateChart data={mapStats} />
          </div>
        </section>

        {/* Charts Row 4: Role-wise Average Stats & Correlation Heatmap */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RoleStatsGroupedChart data={roleStats} />
          <CorrelationHeatmap playerStats={playerStats} />
        </section>

        {/* Charts Row 5: Player Comparison Radar */}
        <section>
          <PlayerComparisonRadar
            players={playerStats}
            onSelectPlayer={setSelectedPlayer}
          />
        </section>

        {/* Sortable & Searchable Player Table */}
        <section aria-label="Player Rosters Table">
          <PlayerTable
            players={playerStats}
            onSelectPlayer={setSelectedPlayer}
          />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Player Profile Dossier Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          allMatches={allMatches}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {/* Connect Gaming Accounts Modal */}
      <ConnectAccountsModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onAccountsUpdated={reloadData}
        connectedAccounts={connectedAccounts}
        lastSyncTimestamp={lastSyncTimestamp}
      />

      {/* CSV Import Modal */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onUploadSuccess={reloadData}
      />
    </div>
  );
}
