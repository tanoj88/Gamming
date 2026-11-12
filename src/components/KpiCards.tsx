import React from 'react';
import {
  Swords,
  Trophy,
  Target,
  Crown,
  Clock,
  TrendingUp,
  Percent,
  ChevronRight,
  Crosshair,
  Shield,
  Zap,
} from 'lucide-react';
import { PlayerAggregatedStats } from '../types/gaming';
import { playHudSelect, playHudClick } from '../utils/hudSound';

interface KpiCardsProps {
  totalMatches: number;
  avgWinRate: number;
  avgKda: number;
  totalPlaytime: number;
  topPlayer: PlayerAggregatedStats | null;
  totalPlayers: number;
  totalWins: number;
  totalLosses: number;
  onSelectPlayer: (player: PlayerAggregatedStats) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalMatches,
  avgWinRate,
  avgKda,
  totalPlaytime,
  topPlayer,
  totalPlayers,
  totalWins,
  totalLosses,
  onSelectPlayer,
}) => {
  const avgPlaytimePerPlayer =
    totalPlayers > 0 ? Math.round(totalPlaytime / totalPlayers) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Matches */}
      <div className="hud-card p-4.5 group overflow-hidden border-cyan-500/30 hover:border-cyan-400">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span className="font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            TOTAL MATCHES
          </span>
          <span className="text-3xs text-slate-500">MTR_01</span>
        </div>

        <div className="text-3xl font-black text-white font-mono tabular-nums tracking-tight text-glow-cyan">
          {totalMatches.toLocaleString()}
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold tabular-nums">{totalWins} VICT</span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400 font-bold tabular-nums">{totalLosses} DEFT</span>
          </div>
          <span className="text-slate-500 text-3xs">LOGGED</span>
        </div>

        {/* Tron Neon Dual-Bar */}
        <div className="w-full bg-slate-900 h-2 rounded-sm mt-2 overflow-hidden flex border border-slate-800">
          <div
            className="bg-emerald-400 h-full shadow-[0_0_8px_#34d399] transition-all duration-500"
            style={{ width: `${totalMatches > 0 ? (totalWins / totalMatches) * 100 : 50}%` }}
          />
          <div
            className="bg-rose-500 h-full shadow-[0_0_8px_#f43f5e] transition-all duration-500"
            style={{ width: `${totalMatches > 0 ? (totalLosses / totalMatches) * 100 : 50}%` }}
          />
        </div>
      </div>

      {/* 2. Average Win Rate */}
      <div className="hud-card p-4.5 group overflow-hidden border-emerald-500/30 hover:border-emerald-400">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span className="font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-emerald-400" />
            AVG WIN RATE
          </span>
          <span className="text-3xs text-slate-500">MTR_02</span>
        </div>

        <div className="text-3xl font-black text-emerald-400 font-mono tabular-nums tracking-tight text-glow-emerald">
          {avgWinRate}%
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1 text-2xs">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            PARITY: 50.0%
          </span>
          <span className={avgWinRate >= 50 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {avgWinRate >= 50 ? `+${(avgWinRate - 50).toFixed(1)}%` : `${(avgWinRate - 50).toFixed(1)}%`}
          </span>
        </div>

        {/* Tron Neon Fill */}
        <div className="w-full bg-slate-900 h-2 rounded-sm mt-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full shadow-[0_0_8px_#10b981] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, avgWinRate))}%` }}
          />
        </div>
      </div>

      {/* 3. Average KDA */}
      <div className="hud-card p-4.5 group overflow-hidden border-purple-500/30 hover:border-purple-400">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span className="font-bold tracking-wider text-purple-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-purple-400" />
            AVERAGE KDA
          </span>
          <span className="text-3xs text-slate-500">MTR_03</span>
        </div>

        <div className="text-3xl font-black text-purple-300 font-mono tabular-nums tracking-tight text-glow-purple">
          {avgKda}
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 text-3xs">(K+A) / DEATHS</span>
          <span className="text-purple-300 font-bold text-2xs">
            {avgKda >= 1.5 ? 'PRO_SPEC' : avgKda >= 1.1 ? 'NOMINAL' : 'CALIBRATING'}
          </span>
        </div>

        {/* Tron Neon Fill */}
        <div className="w-full bg-slate-900 h-2 rounded-sm mt-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full shadow-[0_0_8px_#c084fc] transition-all duration-500"
            style={{ width: `${Math.min(100, (avgKda / 3.0) * 100)}%` }}
          />
        </div>
      </div>

      {/* 4. Top MVP Player */}
      <div className="hud-card p-4.5 group overflow-hidden border-amber-500/30 hover:border-amber-400">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span className="font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            MVP CONTENDER
          </span>
          <span className="text-3xs text-slate-500">MTR_04</span>
        </div>

        {topPlayer ? (
          <div>
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xl sm:text-2xl font-black text-amber-300 truncate tracking-tight font-mono">
                {topPlayer.username}
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold shrink-0">
                {topPlayer.kda} KDA
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="text-slate-300 truncate text-2xs">
                {topPlayer.rank} · {topPlayer.role}
              </span>
              <button
                onClick={() => {
                  playHudSelect();
                  onSelectPlayer(topPlayer);
                }}
                className="text-amber-400 hover:text-amber-300 font-bold hover:underline text-2xs flex items-center"
              >
                DOSSIER <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-1.5 text-3xs font-mono text-slate-400 flex items-center justify-between">
              <span>{topPlayer.winRate}% WIN RATE</span>
              <span className="text-cyan-400">{topPlayer.totalMatches} MATCHES</span>
            </div>
          </div>
        ) : (
          <div className="text-slate-500 text-xs font-mono mt-3">NO MATCHING OPERATOR</div>
        )}
      </div>

      {/* 5. Total Playtime */}
      <div className="hud-card p-4.5 group overflow-hidden border-cyan-500/30 hover:border-cyan-400">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span className="font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            TOTAL PLAYTIME
          </span>
          <span className="text-3xs text-slate-500">MTR_05</span>
        </div>

        <div className="text-3xl font-black text-cyan-300 font-mono tabular-nums tracking-tight text-glow-cyan">
          {totalPlaytime.toLocaleString()}h
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 text-3xs">AVG PER OPERATOR</span>
          <span className="text-cyan-400 font-bold tabular-nums text-2xs">
            ~{avgPlaytimePerPlayer} HRS
          </span>
        </div>

        {/* Tron Neon Fill */}
        <div className="w-full bg-slate-900 h-2 rounded-sm mt-2 overflow-hidden border border-slate-800">
          <div
            className="bg-cyan-400 h-full shadow-[0_0_8px_#22d3ee] transition-all duration-500"
            style={{ width: `${Math.min(100, (avgPlaytimePerPlayer / 1200) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
