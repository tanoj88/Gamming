import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Trophy, Flame, Crosshair } from 'lucide-react';
import { playHudSelect, playHudClick } from '../../utils/hudSound';

interface TopPlayersLeaderboardProps {
  data: {
    rank: number;
    id: string;
    username: string;
    kda: number;
    winRate: number;
    avgScore: number;
    role: string;
    tier: string;
    game: string;
    matches: number;
  }[];
  onSelectPlayerById: (id: string) => void;
}

export const TopPlayersLeaderboard: React.FC<TopPlayersLeaderboardProps> = ({
  data,
  onSelectPlayerById,
}) => {
  const [metric, setMetric] = useState<'kda' | 'winRate'>('kda');

  if (data.length === 0) {
    return (
      <div className="hud-card p-5 flex flex-col items-center justify-center h-80 text-slate-500 font-mono text-xs">
        NO TARGET OPERATORS MATCH ACTIVE FILTER CRITERIA.
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b[metric] - a[metric]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#050914] border border-cyan-500/60 rounded p-3 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-xs font-mono z-50">
          <div className="flex items-center gap-2 mb-1.5 font-bold text-white border-b border-cyan-500/30 pb-1">
            <span className="text-cyan-400">#{item.rank}</span>
            <span>{item.username}</span>
            <span className="text-slate-400 font-normal">[{item.game}]</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
            <div>Role: <span className="text-white font-medium">{item.role}</span></div>
            <div>Tier: <span className="text-purple-300 font-medium">{item.tier}</span></div>
            <div>KDA: <span className="text-cyan-400 font-bold">{item.kda}</span></div>
            <div>Win Rate: <span className="text-emerald-400 font-bold">{item.winRate}%</span></div>
            <div>Avg Score: <span className="text-amber-400">{item.avgScore}</span></div>
            <div>Matches: <span className="text-white">{item.matches}</span></div>
          </div>
          <div className="mt-2 text-3xs text-cyan-400 italic">&gt; Click bar to initialize dossier</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="hud-card p-5 flex flex-col h-full border-cyan-500/30">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-glow-cyan">
              TOP 10 OPERATOR LEADERBOARD
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Combatants ranked by tactical battle performance index
          </p>
        </div>

        {/* Metric Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono">
          <button
            onClick={() => {
              playHudSelect();
              setMetric('kda');
            }}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              metric === 'kda'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 hud-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            KDA RATIO
          </button>
          <button
            onClick={() => {
              playHudSelect();
              setMetric('winRate');
            }}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              metric === 'winRate'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            WIN RATE %
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                playHudClick(1000);
                onSelectPlayerById(state.activePayload[0].payload.id);
              }
            }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke="#162032" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              domain={metric === 'winRate' ? [0, 100] : [0, 'dataMax + 0.5']}
              tickFormatter={(v) => (metric === 'winRate' ? `${v}%` : `${v}`)}
            />
            <YAxis
              type="category"
              dataKey="username"
              stroke="#94a3b8"
              fontSize={11}
              width={75}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34, 211, 238, 0.08)' }} />
            <Bar
              dataKey={metric}
              radius={[0, 3, 3, 0]}
              animationDuration={800}
              className="cursor-pointer"
            >
              {sortedData.map((entry, index) => {
                let fill = '#06b6d4';
                if (index === 0) fill = '#f59e0b';
                else if (index === 1) fill = '#38bdf8';
                else if (index === 2) fill = '#a855f7';
                else if (metric === 'winRate') fill = '#10b981';
                return <Cell key={`cell-${entry.id}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-3xs font-mono text-slate-400">
        <span className="flex items-center gap-1 text-amber-300">
          <Flame className="w-3 h-3 text-amber-400" />
          RANK_01: {sortedData[0]?.username} ({sortedData[0]?.[metric]}{metric === 'winRate' ? '%' : ' KDA'})
        </span>
        <span className="text-cyan-400">&gt; INTERACTIVE: SELECT BAR FOR TELEMETRY</span>
      </div>
    </div>
  );
};
