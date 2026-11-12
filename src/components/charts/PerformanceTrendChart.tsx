import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { WeeklyTrendPoint } from '../../types/gaming';

interface PerformanceTrendChartProps {
  data: WeeklyTrendPoint[];
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="hud-card p-5 flex flex-col items-center justify-center h-80 text-slate-500 font-mono text-xs">
        NO CHRONOLOGICAL TELEMETRY LOGS AVAILABLE.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const matchCount = payload[0]?.payload?.matchCount || 0;
      return (
        <div className="bg-[#050914] border border-cyan-500/60 rounded p-3 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-xs font-mono z-50">
          <div className="font-bold text-white mb-1.5 border-b border-cyan-500/30 pb-1">
            SECTOR CYCLE: {label}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-cyan-400">
              <span>AVG KDA:</span>
              <span className="font-mono font-bold">{payload[0]?.value}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-emerald-400">
              <span>WIN RATE:</span>
              <span className="font-mono font-bold">{payload[1]?.value}%</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-400 pt-1 border-t border-slate-800">
              <span>MATCH LOGS:</span>
              <span className="font-mono text-slate-300">{matchCount}</span>
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
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-glow-emerald">
              CHRONO-TRAJECTORY // COMBAT TREND
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Weekly progression tracking dual KDA efficiency vector against aggregate victory rate
          </p>
        </div>
      </div>

      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 15, right: 25, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#162032" />
            <XAxis
              dataKey="week"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />
            {/* Left Axis: KDA */}
            <YAxis
              yAxisId="left"
              stroke="#06b6d4"
              fontSize={11}
              domain={['auto', 'auto']}
              tickFormatter={(v) => Number(v).toFixed(1)}
              label={{
                value: 'KDA RATIO',
                angle: -90,
                position: 'insideLeft',
                fill: '#06b6d4',
                fontSize: 10,
              }}
            />
            {/* Right Axis: Win Rate % */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              fontSize={11}
              domain={[30, 80]}
              tickFormatter={(v) => `${v}%`}
              label={{
                value: 'WIN RATE %',
                angle: 90,
                position: 'insideRight',
                fill: '#10b981',
                fontSize: 10,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgKda"
              name="Avg KDA"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ r: 3.5, fill: '#06b6d4', stroke: '#22d3ee', strokeWidth: 1 }}
              activeDot={{ r: 6, stroke: '#22d3ee', strokeWidth: 3 }}
              animationDuration={800}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="winRate"
              name="Win Rate %"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 3.5, fill: '#10b981', stroke: '#34d399', strokeWidth: 1 }}
              activeDot={{ r: 6, stroke: '#34d399', strokeWidth: 3 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-3xs font-mono text-slate-400">
        <span>DUAL-VECTOR NEON OSCILLATION</span>
        <span className="text-cyan-400">12 WEEKLY CHUNKS ANALYZED</span>
      </div>
    </div>
  );
};
