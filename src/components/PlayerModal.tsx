import React from 'react';
import {
  X,
  Target,
  Clock,
  Flame,
  Crosshair,
  Percent,
  Terminal,
  Shield,
} from 'lucide-react';
import { PlayerAggregatedStats, Match } from '../types/gaming';
import { playHudClick } from '../utils/hudSound';

interface PlayerModalProps {
  player: PlayerAggregatedStats | null;
  allMatches: Match[];
  onClose: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  player,
  allMatches,
  onClose,
}) => {
  if (!player) return null;

  const playerMatches = allMatches
    .filter((m) => m.player_id === player.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={() => {
        playHudClick(700);
        onClose();
      }}
    >
      <div
        className="bg-[#050914] border-2 border-cyan-500/60 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.3)] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic Top Glow Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 shadow-[0_0_10px_#22d3ee]" />

        {/* Modal Header */}
        <div className="p-5 border-b border-cyan-500/30 bg-[#070c18] flex items-center justify-between font-mono">
          <div className="flex items-center gap-3.5">
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={player.username}
                className="w-12 h-12 rounded bg-[#090f22] border-2 border-cyan-400 object-cover shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-[#090f22] border-2 border-cyan-400 flex items-center justify-center text-cyan-300 font-black text-2xl shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                {player.username.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-3xs text-cyan-400 font-bold tracking-widest uppercase">
                  OPERATOR_DOSSIER //
                </span>
                <h2 className="text-xl font-black text-white tracking-tight uppercase text-glow-cyan">
                  {player.username}
                </h2>
                <span className="text-3xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold">
                  {player.id}
                </span>
                {player.platform && (
                  <span className="text-3xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold">
                    {player.platform}
                  </span>
                )}
                <span className="text-3xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/50 font-bold hud-glow-purple">
                  {player.performanceTier}_TIER
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap font-sans">
                <span className="text-cyan-300 font-mono font-bold">{player.game}</span>
                <span>&bull;</span>
                <span>Role: <strong className="text-slate-200">{player.role}</strong></span>
                <span>&bull;</span>
                <span>Rank: <strong className="text-amber-300 font-mono">{player.rank}</strong></span>
                <span>&bull;</span>
                <span>{player.country} ({player.countryCode})</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playHudClick(600);
              onClose();
            }}
            className="p-2 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-cyan-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 font-mono">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded bg-[#060b18] border border-emerald-500/40">
              <div className="text-3xs text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-1 font-bold">
                <Percent className="w-3 h-3 text-emerald-400" />
                WIN RATIO
              </div>
              <div className="text-2xl font-black text-emerald-400 text-glow-emerald">
                {player.winRate}%
              </div>
              <div className="text-3xs text-slate-400 mt-0.5">
                {player.wins}W - {player.losses}L ({player.totalMatches} MATCHES)
              </div>
            </div>

            <div className="p-3 rounded bg-[#060b18] border border-purple-500/40">
              <div className="text-3xs text-purple-400 uppercase tracking-wider flex items-center gap-1 mb-1 font-bold">
                <Target className="w-3 h-3 text-purple-400" />
                KDA VECTOR
              </div>
              <div className="text-2xl font-black text-purple-300 text-glow-purple">
                {player.kda}
              </div>
              <div className="text-3xs text-slate-400 mt-0.5">
                {player.avgKills}K / {player.avgDeaths}D / {player.avgAssists}A
              </div>
            </div>

            <div className="p-3 rounded bg-[#060b18] border border-cyan-500/40">
              <div className="text-3xs text-cyan-400 uppercase tracking-wider flex items-center gap-1 mb-1 font-bold">
                <Crosshair className="w-3 h-3 text-cyan-400" />
                HEADSHOT HS%
              </div>
              <div className="text-2xl font-black text-cyan-400 text-glow-cyan">
                {player.avgHeadshotPercentage}%
              </div>
              <div className="text-3xs text-slate-400 mt-0.5">
                AVG SCORE: {player.avgScore} PTS
              </div>
            </div>

            <div className="p-3 rounded bg-[#060b18] border border-amber-500/40">
              <div className="text-3xs text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1 font-bold">
                <Clock className="w-3 h-3 text-amber-400" />
                LOGGED HOURS
              </div>
              <div className="text-2xl font-black text-amber-300">
                {player.playtime_hours}h
              </div>
              <div className="text-3xs text-cyan-300 mt-0.5">
                BEST SECTOR: {player.bestMap}
              </div>
            </div>
          </div>

          {/* Match Logs History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-cyan-300">
                <Flame className="w-4 h-4 text-cyan-400" />
                TELEMETRY COMBAT LOGS ({playerMatches.length} MATCHES RECORDED)
              </h3>
              <span className="text-3xs text-slate-500">CHRONO_SORT: DESC</span>
            </div>

            <div className="border border-slate-800 rounded overflow-x-auto max-h-64 bg-[#050812]">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-[#03060f] text-3xs uppercase tracking-wider text-cyan-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">TIMESTAMP</th>
                    <th className="py-2.5 px-3">SECTOR</th>
                    <th className="py-2.5 px-3 text-center">OUTCOME</th>
                    <th className="py-2.5 px-3 text-right">KILLS</th>
                    <th className="py-2.5 px-3 text-right">DEATHS</th>
                    <th className="py-2.5 px-3 text-right">ASSISTS</th>
                    <th className="py-2.5 px-3 text-right">HS%</th>
                    <th className="py-2.5 px-3 text-right">SCORE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {playerMatches.map((m) => (
                    <tr key={m.match_id} className="hover:bg-cyan-950/20">
                      <td className="py-2 px-3 text-slate-400">{m.date}</td>
                      <td className="py-2 px-3 text-slate-200 font-semibold">{m.map}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-3xs font-bold ${
                            m.result === 'Win'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {m.result === 'Win' ? 'VICTORY' : 'DEFEAT'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-cyan-400 font-bold">{m.kills}</td>
                      <td className="py-2 px-3 text-right text-rose-400 font-bold">{m.deaths}</td>
                      <td className="py-2 px-3 text-right text-purple-400">{m.assists}</td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        {m.headshot_percentage}%
                      </td>
                      <td className="py-2 px-3 text-right text-amber-300 font-bold">{m.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-cyan-500/30 bg-[#070c18] flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="text-3xs text-cyan-400">// DSP SENSORS ACTIVE &bull; EVAL COMPLETE</span>
          <button
            onClick={() => {
              playHudClick(600);
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-cyan-950 border border-cyan-500/60 text-cyan-300 hover:bg-cyan-900/60 text-xs font-bold uppercase transition-all hud-glow-cyan"
          >
            TERMINATE DOSSIER
          </button>
        </div>
      </div>
    </div>
  );
};
