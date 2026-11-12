import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, ShieldCheck } from 'lucide-react';

interface WinLossDonutChartProps {
  data: {
    name: string;
    value: number;
    percentage: number;
    fill: string;
  }[];
  totalMatches: number;
}

export const WinLossDonutChart: React.FC<WinLossDonutChartProps> = ({ data, totalMatches }) => {
  if (totalMatches === 0) {
    return (
      <div className="hud-card p-5 flex flex-col items-center justify-center h-80 text-slate-500 font-mono text-xs">
        NO MATCHES AVAILABLE FOR WIN/LOSS SPLIT.
      </div>
    );
  }

  const winItem = data.find((d) => d.name === 'Victories') || data[0];
  const winPct = winItem ? winItem.percentage : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#050914] border border-cyan-500/60 rounded p-2.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-xs font-mono z-50">
          <div className="font-bold text-white mb-1 flex items-center gap-1.5 border-b border-slate-800 pb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shadow-[0_0_6px]"
              style={{ backgroundColor: item.fill, boxShadow: `0 0 8px ${item.fill}` }}
            />
            <span>{item.name}</span>
          </div>
          <div className="space-y-0.5 text-slate-300">
            <div>Matches: <span className="font-mono text-white font-bold">{item.value.toLocaleString()}</span></div>
            <div>Share: <span className="font-mono text-cyan-400 font-bold">{item.percentage}%</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="hud-card p-5 flex flex-col h-full border-cyan-500/30">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-glow-emerald">
              WIN / LOSS SHARE
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Victory vs. defeat split
          </p>
        </div>
      </div>

      <div className="h-72 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="48%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={5}
              dataKey="value"
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  stroke="#050811"
                  strokeWidth={3}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Glowing HUD Donut Display */}
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none -mt-4 font-mono">
          <div className="text-2xl font-black text-white tabular-nums tracking-tight text-glow-cyan">
            {winPct}%
          </div>
          <div className="text-3xs text-emerald-400 uppercase tracking-widest font-bold">
            PARITY INDEX
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-3xs font-mono text-slate-400">
        <span className="flex items-center gap-1 text-slate-300">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          {data[0]?.value}W / {data[1]?.value}L
        </span>
        <span className="text-cyan-400">{totalMatches} LOGS EVAL</span>
      </div>
    </div>
  );
};
