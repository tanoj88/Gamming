import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Crosshair } from 'lucide-react';

interface KillsDeathsDistributionChartProps {
  data: {
    range: string;
    Kills: number;
    Deaths: number;
  }[];
}

export const KillsDeathsDistributionChart: React.FC<KillsDeathsDistributionChartProps> = ({
  data,
}) => {
  if (data.length === 0) {
    return (
      <div className="hud-card p-5 flex flex-col items-center justify-center h-80 text-slate-500 font-mono text-xs">
        NO FREQUENCY BINS MATCH CURRENT RADAR CONSTRAINTS.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#050914] border border-cyan-500/60 rounded p-3 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-xs font-mono z-50">
          <div className="font-bold text-white mb-1.5 border-b border-cyan-500/30 pb-1">
            VOLUME BRACKET: {label}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-cyan-400">
              <span>Matches with {label} Kills:</span>
              <span className="font-mono font-bold">{payload[0]?.value}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-rose-400">
              <span>Matches with {label} Deaths:</span>
              <span className="font-mono font-bold">{payload[1]?.value}</span>
            </div>
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
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-glow-cyan">
              COMBAT ENGAGEMENT HISTOGRAM
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Binned frequency matrix showing kill volume distribution vs. death frequency
          </p>
        </div>
      </div>

      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#162032" />
            <XAxis
              dataKey="range"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              label={{
                value: 'COUNT BRACKETS (PER MATCH)',
                position: 'insideBottom',
                offset: -4,
                fill: '#64748b',
                fontSize: 10,
              }}
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="square"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />
            <Bar
              dataKey="Kills"
              name="Kills Volume"
              fill="#06b6d4"
              radius={[2, 2, 0, 0]}
              animationDuration={800}
            />
            <Bar
              dataKey="Deaths"
              name="Deaths Volume"
              fill="#f43f5e"
              radius={[2, 2, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-3xs font-mono text-slate-400">
        <span>BIN_WIDTH: 5 UNITS // GAUSSIAN FREQ</span>
        <span className="text-cyan-400">PEAK VOL: 16-20 KILLS BRACKET</span>
      </div>
    </div>
  );
};
