import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Hourglass, Info, Target } from 'lucide-react';
import { PerformanceTier } from '../../types/gaming';
import { playHudClick } from '../../utils/hudSound';

interface ScatterItem {
  id: string;
  username: string;
  playtime: number;
  winRate: number;
  kda: number;
  score: number;
  tier: PerformanceTier;
  role: string;
  game: string;
}

interface WinRateVsPlaytimeChartProps {
  data: ScatterItem[];
  onSelectPlayerById: (id: string) => void;
}

export const WinRateVsPlaytimeChart: React.FC<WinRateVsPlaytimeChartProps> = ({
  data,
  onSelectPlayerById,
}) => {
  if (data.length === 0) {
    return (
      <div className="hud-card p-5 flex flex-col items-center justify-center h-80 text-slate-500 font-mono text-xs">
        NO SCATTER MATRIX DATA AVAILABLE FOR ACTIVE FILTERS.
      </div>
    );
  }

  const avgWinRate = data.reduce((sum, d) => sum + d.winRate, 0) / data.length;
  const avgPlaytime = data.reduce((sum, d) => sum + d.playtime, 0) / data.length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload as ScatterItem;
      return (
        <div className="bg-[#050914] border border-cyan-500/60 rounded p-3 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-xs font-mono z-50">
          <div className="font-bold text-white mb-1 flex items-center justify-between gap-3 border-b border-cyan-500/30 pb-1">
            <span className="text-cyan-400">{p.username}</span>
            <span className="text-3xs px-1.5 py-0.5 rounded bg-slate-900 text-purple-300 font-bold border border-purple-500/40">
              {p.tier}
            </span>
          </div>
          <div className="space-y-0.5 text-slate-300">
            <div>Playtime: <span className="font-mono text-cyan-300 font-bold">{p.playtime} hrs</span></div>
            <div>Win Rate: <span className="font-mono text-emerald-400 font-bold">{p.winRate}%</span></div>
            <div>KDA: <span className="font-mono text-purple-300">{p.kda}</span></div>
            <div>Role: <span className="text-slate-200">{p.role}</span> [{p.game}]</div>
          </div>
          <div className="mt-1.5 text-3xs text-cyan-400 italic">&gt; Click node to initialize dossier</div>
        </div>
      );
    }
    return null;
  };

  const getTierColor = (tier: PerformanceTier) => {
    switch (tier) {
      case 'Pro':
        return '#00f3ff'; // electric cyan
      case 'Intermediate':
        return '#c084fc'; // neon purple
      case 'Beginner':
        return '#f59e0b'; // amber
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="hud-card p-5 flex flex-col h-full border-cyan-500/30">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-glow-cyan">
              WIN RATE VS. PLAYTIME MATRIX
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Combat mastery scatter telemetry across accumulated flight/match hours
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-2xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f3ff] inline-block" />
            PRO
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc] inline-block" />
            INTERMEDIATE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] inline-block" />
            BEGINNER
          </span>
        </div>
      </div>

      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 15, right: 25, bottom: 20, left: 10 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                const item = state.activePayload[0].payload as ScatterItem;
                if (item?.id) {
                  playHudClick(1100);
                  onSelectPlayerById(item.id);
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke="#162032" />
            <XAxis
              type="number"
              dataKey="playtime"
              name="Playtime"
              unit="h"
              stroke="#64748b"
              fontSize={11}
              domain={[0, 'dataMax + 100']}
              label={{
                value: 'Playtime Hours (h)',
                position: 'insideBottom',
                offset: -10,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="winRate"
              name="Win Rate"
              unit="%"
              stroke="#64748b"
              fontSize={11}
              domain={[20, 90]}
              label={{
                value: 'Win Rate %',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <ZAxis type="number" range={[45, 120]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            
            {/* Reference Benchmarks */}
            <ReferenceLine
              y={avgWinRate}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
            />
            <ReferenceLine
              x={avgPlaytime}
              stroke="#64748b"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />

            <Scatter name="Players" data={data} animationDuration={600} className="cursor-pointer">
              {data.map((entry) => (
                <Cell
                  key={`point-${entry.id}`}
                  fill={getTierColor(entry.tier)}
                  fillOpacity={0.8}
                  stroke={getTierColor(entry.tier)}
                  strokeWidth={1.5}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-3xs font-mono text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <Info className="w-3 h-3 text-cyan-400" />
          EMERALD VECTOR = MEAN WIN RATE ({avgWinRate.toFixed(1)}%)
        </span>
        <span className="text-cyan-300">SCATTER_NODES: {data.length}</span>
      </div>
    </div>
  );
};
