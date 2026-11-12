import React, { useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Swords, Check, ArrowRight, Crosshair } from 'lucide-react';
import { PlayerAggregatedStats } from '../../types/gaming';
import { playHudSelect, playHudClick } from '../../utils/hudSound';

interface PlayerComparisonRadarProps {
  players: PlayerAggregatedStats[];
  onSelectPlayer: (player: PlayerAggregatedStats) => void;
}

export const PlayerComparisonRadar: React.FC<PlayerComparisonRadarProps> = ({
  players,
  onSelectPlayer,
}) => {
  const validPlayers = players.filter((p) => p.totalMatches > 0);

  const [player1Id, setPlayer1Id] = useState<string>(
    validPlayers[0]?.id || ''
  );
  const [player2Id, setPlayer2Id] = useState<string>(
    validPlayers[1]?.id || validPlayers[0]?.id || ''
  );

  const player1 = validPlayers.find((p) => p.id === player1Id) || validPlayers[0];
  const player2 = validPlayers.find((p) => p.id === player2Id) || validPlayers[1] || validPlayers[0];

  if (!player1 || !player2) {
    return (
      <div className="hud-card p-5 flex flex-col items-center justify-center h-80 text-slate-500 font-mono text-xs">
        SELECT MINIMUM 2 ACTIVE OPERATORS FOR RADAR MATRIX.
      </div>
    );
  }

  const radarData = [
    {
      metric: 'Win Rate %',
      [player1.username]: player1.winRate,
      [player2.username]: player2.winRate,
      raw1: `${player1.winRate}%`,
      raw2: `${player2.winRate}%`,
    },
    {
      metric: 'KDA Index',
      [player1.username]: Math.min(100, Math.round(player1.kda * 32)),
      [player2.username]: Math.min(100, Math.round(player2.kda * 32)),
      raw1: `${player1.kda}`,
      raw2: `${player2.kda}`,
    },
    {
      metric: 'Kills/Match',
      [player1.username]: Math.min(100, Math.round(player1.avgKills * 4)),
      [player2.username]: Math.min(100, Math.round(player2.avgKills * 4)),
      raw1: `${player1.avgKills}`,
      raw2: `${player2.avgKills}`,
    },
    {
      metric: 'Assists/Match',
      [player1.username]: Math.min(100, Math.round(player1.avgAssists * 8)),
      [player2.username]: Math.min(100, Math.round(player2.avgAssists * 8)),
      raw1: `${player1.avgAssists}`,
      raw2: `${player2.avgAssists}`,
    },
    {
      metric: 'Headshot %',
      [player1.username]: player1.avgHeadshotPercentage,
      [player2.username]: player2.avgHeadshotPercentage,
      raw1: `${player1.avgHeadshotPercentage}%`,
      raw2: `${player2.avgHeadshotPercentage}%`,
    },
    {
      metric: 'Combat Score',
      [player1.username]: Math.min(100, Math.round(player1.avgScore * 0.18)),
      [player2.username]: Math.min(100, Math.round(player2.avgScore * 0.18)),
      raw1: `${player1.avgScore}`,
      raw2: `${player2.avgScore}`,
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length >= 2) {
      const metricName = payload[0].payload.metric;
      const raw1 = payload[0].payload.raw1;
      const raw2 = payload[0].payload.raw2;
      return (
        <div className="bg-[#050914] border border-cyan-500/60 rounded p-3 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-xs font-mono z-50">
          <div className="font-bold text-white mb-1.5 border-b border-cyan-500/30 pb-1">
            TARGET RADAR: {metricName}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-cyan-400">
              <span>{player1.username}:</span>
              <span className="font-mono font-bold">{raw1}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-purple-400">
              <span>{player2.username}:</span>
              <span className="font-mono font-bold">{raw2}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const comparisons = [
    { label: 'Win Rate', v1: player1.winRate, v2: player2.winRate, unit: '%', isHigherBetter: true },
    { label: 'KDA Ratio', v1: player1.kda, v2: player2.kda, unit: '', isHigherBetter: true },
    { label: 'Avg Kills', v1: player1.avgKills, v2: player2.avgKills, unit: '', isHigherBetter: true },
    { label: 'Avg Deaths', v1: player1.avgDeaths, v2: player2.avgDeaths, unit: '', isHigherBetter: false },
    { label: 'Avg Assists', v1: player1.avgAssists, v2: player2.avgAssists, unit: '', isHigherBetter: true },
    { label: 'Headshot %', v1: player1.avgHeadshotPercentage, v2: player2.avgHeadshotPercentage, unit: '%', isHigherBetter: true },
  ];

  return (
    <div className="hud-card p-5 flex flex-col h-full border-cyan-500/40">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-glow-cyan">
              HEAD-TO-HEAD TACTICAL RADAR MATCHUP
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Select dual combatants to project holographic radar polygon across 6 normalized vectors
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 font-mono">
        {/* Contender 1 Selector */}
        <div className="p-3 rounded bg-[#060b18] border border-cyan-500/40 hud-glow-cyan">
          <label className="text-3xs text-cyan-400 font-bold uppercase tracking-wider block mb-1">
            CONTENDER 01 // PRIMARY [CYAN VECTOR]
          </label>
          <select
            value={player1.id}
            onChange={(e) => {
              playHudSelect();
              setPlayer1Id(e.target.value);
            }}
            className="w-full bg-[#050914] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {validPlayers.map((p) => (
              <option key={`p1-${p.id}`} value={p.id}>
                {p.username} ({p.game} · {p.role} · {p.kda} KDA)
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-3xs text-slate-400">
            <span>{player1.rank} · {player1.country}</span>
            <button
              onClick={() => {
                playHudClick(900);
                onSelectPlayer(player1);
              }}
              className="text-cyan-400 hover:underline flex items-center gap-0.5 font-bold"
            >
              DOSSIER &rarr;
            </button>
          </div>
        </div>

        {/* Contender 2 Selector */}
        <div className="p-3 rounded bg-[#060b18] border border-purple-500/40 hud-glow-purple">
          <label className="text-3xs text-purple-400 font-bold uppercase tracking-wider block mb-1">
            CONTENDER 02 // CHALLENGER [PURPLE VECTOR]
          </label>
          <select
            value={player2.id}
            onChange={(e) => {
              playHudSelect();
              setPlayer2Id(e.target.value);
            }}
            className="w-full bg-[#050914] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
          >
            {validPlayers.map((p) => (
              <option key={`p2-${p.id}`} value={p.id}>
                {p.username} ({p.game} · {p.role} · {p.kda} KDA)
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-3xs text-slate-400">
            <span>{player2.rank} · {player2.country}</span>
            <button
              onClick={() => {
                playHudClick(900);
                onSelectPlayer(player2);
              }}
              className="text-purple-400 hover:underline flex items-center gap-0.5 font-bold"
            >
              DOSSIER &rarr;
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Radar Graphic */}
        <div className="lg:col-span-7 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name={player1.username}
                dataKey={player1.username}
                stroke="#00f3ff"
                fill="#00f3ff"
                fillOpacity={0.35}
                strokeWidth={2.5}
                animationDuration={800}
              />
              <Radar
                name={player2.username}
                dataKey={player2.username}
                stroke="#d946ef"
                fill="#d946ef"
                fillOpacity={0.35}
                strokeWidth={2.5}
                animationDuration={800}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Head-to-Head Metric Scorecard */}
        <div className="lg:col-span-5 bg-[#050914] rounded-lg p-3 border border-slate-800 space-y-2 font-mono">
          <div className="text-3xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1.5 flex justify-between">
            <span className="text-cyan-400 truncate max-w-[90px]">{player1.username}</span>
            <span>TACTICAL DELTA</span>
            <span className="text-purple-400 truncate max-w-[90px] text-right">{player2.username}</span>
          </div>

          {comparisons.map((item) => {
            const isP1Better = item.isHigherBetter ? item.v1 > item.v2 : item.v1 < item.v2;
            const isP2Better = item.isHigherBetter ? item.v2 > item.v1 : item.v2 < item.v1;

            return (
              <div
                key={item.label}
                className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0"
              >
                <div className={`font-mono flex items-center gap-1 ${isP1Better ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                  {isP1Better && <Check className="w-3 h-3 text-cyan-400" />}
                  {item.v1}{item.unit}
                </div>

                <div className="text-slate-400 text-3xs text-center px-1 font-semibold uppercase">
                  {item.label}
                </div>

                <div className={`font-mono flex items-center justify-end gap-1 ${isP2Better ? 'text-purple-400 font-bold' : 'text-slate-400'}`}>
                  {item.v2}{item.unit}
                  {isP2Better && <Check className="w-3 h-3 text-purple-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
