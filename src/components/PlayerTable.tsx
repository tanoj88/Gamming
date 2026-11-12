import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Terminal,
} from 'lucide-react';
import { PlayerAggregatedStats, PerformanceTier } from '../types/gaming';
import { playHudClick, playHudSelect } from '../utils/hudSound';

interface PlayerTableProps {
  players: PlayerAggregatedStats[];
  onSelectPlayer: (player: PlayerAggregatedStats) => void;
}

type SortField =
  | 'username'
  | 'game'
  | 'role'
  | 'rankTier'
  | 'performanceTier'
  | 'totalMatches'
  | 'winRate'
  | 'kda'
  | 'avgHeadshotPercentage'
  | 'avgScore'
  | 'playtime_hours';

export const PlayerTable: React.FC<PlayerTableProps> = ({ players, onSelectPlayer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'All' | PerformanceTier>('All');
  const [sortField, setSortField] = useState<SortField>('kda');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSort = (field: SortField) => {
    playHudClick(850);
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const processedPlayers = useMemo(() => {
    let result = [...players];

    if (tierFilter !== 'All') {
      result = result.filter((p) => p.performanceTier === tierFilter);
    }

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.username.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.rank.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.game.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [players, tierFilter, searchTerm, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(processedPlayers.length / rowsPerPage));
  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedPlayers.slice(start, start + rowsPerPage);
  }, [processedPlayers, currentPage, rowsPerPage]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600 inline ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-cyan-400 inline ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-cyan-400 inline ml-1" />
    );
  };

  const getTierBadge = (tier: PerformanceTier) => {
    switch (tier) {
      case 'Pro':
        return (
          <span className="px-2 py-0.5 rounded text-3xs font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/50 hud-glow-cyan">
            PRO_TIER
          </span>
        );
      case 'Intermediate':
        return (
          <span className="px-2 py-0.5 rounded text-3xs font-bold font-mono bg-purple-950 text-purple-300 border border-purple-500/50 hud-glow-purple">
            INTERMEDIATE
          </span>
        );
      case 'Beginner':
        return (
          <span className="px-2 py-0.5 rounded text-3xs font-bold font-mono bg-amber-950 text-amber-300 border border-amber-500/50">
            BEGINNER
          </span>
        );
    }
  };

  return (
    <div className="hud-card p-5 border-cyan-500/30">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider font-mono flex items-center gap-2 text-glow-cyan">
            <Terminal className="w-5 h-5 text-cyan-400" />
            OPERATOR ROSTER REGISTRY // DATABASE VIEW
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Queryable telemetry roster indexing {processedPlayers.length} active combat profiles
          </p>
        </div>

        {/* Tier Tabs & Local Search */}
        <div className="flex items-center gap-3 flex-wrap font-mono">
          {/* Tier segmented buttons */}
          <div className="flex items-center p-0.5 bg-[#050914] border border-cyan-500/30 rounded text-xs">
            {(['All', 'Pro', 'Intermediate', 'Beginner'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => {
                  playHudSelect();
                  setTierFilter(tier);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-2xs font-bold uppercase transition-all ${
                  tierFilter === tier
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 hud-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          {/* Quick Table Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter roster..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#050914] border border-slate-700 rounded pl-7 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-40"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-800 rounded bg-[#060a16]">
        <table className="w-full text-left text-xs text-slate-300 font-mono">
          <thead className="bg-[#040711] text-3xs uppercase tracking-wider text-cyan-400 border-b border-slate-800 font-bold">
            <tr>
              <th
                onClick={() => handleSort('username')}
                className="py-3 px-3.5 cursor-pointer hover:text-white"
              >
                OPERATOR {renderSortIcon('username')}
              </th>
              <th
                onClick={() => handleSort('game')}
                className="py-3 px-3 cursor-pointer hover:text-white"
              >
                TITLE {renderSortIcon('game')}
              </th>
              <th
                onClick={() => handleSort('role')}
                className="py-3 px-3 cursor-pointer hover:text-white"
              >
                SPEC {renderSortIcon('role')}
              </th>
              <th
                onClick={() => handleSort('rankTier')}
                className="py-3 px-3 cursor-pointer hover:text-white"
              >
                RANK {renderSortIcon('rankTier')}
              </th>
              <th
                onClick={() => handleSort('performanceTier')}
                className="py-3 px-3 cursor-pointer hover:text-white"
              >
                TIER {renderSortIcon('performanceTier')}
              </th>
              <th
                onClick={() => handleSort('totalMatches')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                MATCHES {renderSortIcon('totalMatches')}
              </th>
              <th
                onClick={() => handleSort('winRate')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                WIN_RATE {renderSortIcon('winRate')}
              </th>
              <th
                onClick={() => handleSort('kda')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                KDA {renderSortIcon('kda')}
              </th>
              <th
                onClick={() => handleSort('avgHeadshotPercentage')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                HS% {renderSortIcon('avgHeadshotPercentage')}
              </th>
              <th
                onClick={() => handleSort('avgScore')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                AVG_SCORE {renderSortIcon('avgScore')}
              </th>
              <th
                onClick={() => handleSort('playtime_hours')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                HOURS {renderSortIcon('playtime_hours')}
              </th>
              <th className="py-3 px-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedPlayers.length > 0 ? (
              paginatedPlayers.map((player) => (
                <tr
                  key={player.id}
                  onClick={() => {
                    playHudSelect();
                    onSelectPlayer(player);
                  }}
                  className="hover:bg-cyan-950/30 transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-2.5">
                      {player.avatarUrl ? (
                        <img
                          src={player.avatarUrl}
                          alt={player.username}
                          className="w-7 h-7 rounded border border-cyan-500/40 object-cover bg-slate-900 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded bg-[#090f20] border border-cyan-500/30 flex items-center justify-center font-bold text-xs text-cyan-400 shrink-0 group-hover:border-cyan-400">
                          {player.username.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5 flex-wrap">
                          <span className="truncate max-w-[120px]">{player.username}</span>
                          <span className="text-3xs px-1 rounded bg-slate-900 text-slate-400 font-normal border border-slate-700">
                            {player.countryCode}
                          </span>
                          {player.platform && (
                            <span className="text-3xs px-1 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30">
                              {player.platform}
                            </span>
                          )}
                          {player.source === 'csv' && (
                            <span className="text-3xs px-1 rounded bg-purple-950 text-purple-300 font-bold border border-purple-500/30">
                              CSV
                            </span>
                          )}
                        </div>
                        <div className="text-3xs text-slate-400 font-sans">
                          {player.country} · Best: {player.bestMap}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-slate-300 font-medium">
                    {player.game}
                  </td>

                  <td className="py-2.5 px-3 text-slate-400 font-sans">
                    {player.role}
                  </td>

                  <td className="py-2.5 px-3">
                    <span className="text-slate-200 font-bold">{player.rank}</span>
                  </td>

                  <td className="py-2.5 px-3">
                    {getTierBadge(player.performanceTier)}
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-300 font-bold">
                    {player.totalMatches}
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums">
                    <span
                      className={`font-bold ${
                        player.winRate >= 55
                          ? 'text-emerald-400 text-glow-emerald'
                          : player.winRate >= 48
                          ? 'text-cyan-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {player.winRate}%
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums">
                    <span
                      className={`font-bold ${
                        player.kda >= 1.8
                          ? 'text-cyan-300 text-glow-cyan'
                          : player.kda >= 1.2
                          ? 'text-purple-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {player.kda}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">
                    {player.avgHeadshotPercentage}%
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums text-amber-300 font-bold">
                    {player.avgScore}
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">
                    {player.playtime_hours}h
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playHudSelect();
                        onSelectPlayer(player);
                      }}
                      className="p-1 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Inspect Dossier"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="py-8 text-center text-slate-500 text-xs font-mono">
                  NO OPERATOR PROFILES LOCATED WITH APPLIED CONSTRAINTS.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span>ROWS PER PAGE:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              playHudClick(700);
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-[#050914] border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-slate-600">|</span>
          <span>
            OPERATORS{' '}
            <strong className="text-cyan-400">
              {processedPlayers.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}
            </strong>{' '}
            TO{' '}
            <strong className="text-cyan-400">
              {Math.min(currentPage * rowsPerPage, processedPlayers.length)}
            </strong>{' '}
            OF <strong className="text-cyan-400">{processedPlayers.length}</strong>
          </span>
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              playHudClick(800);
              setCurrentPage((p) => Math.max(1, p - 1));
            }}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-700 hover:border-cyan-500/40 hover:bg-cyan-950/30 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-mono text-slate-300 text-2xs">
            PAGE {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => {
              playHudClick(800);
              setCurrentPage((p) => Math.min(totalPages, p + 1));
            }}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-700 hover:border-cyan-500/40 hover:bg-cyan-950/30 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
