import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Map, Compass, Crosshair } from 'lucide-react';
import { MapStat } from '../../types/gaming';

interface MapWinRateChartProps {
  data: MapStat[];
}

export const MapWinRateChart: React.FC<MapWinRateChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="hud-card p-5 flex flex-col items-center justify-center h-80 text-slate-500 font-mono text-xs">
        NO MAP TELEMETRY AVAILABLE.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as MapStat;
      return (
        <div className="bg-[#050914] border border-cyan-500/60 rounded p-3 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-xs font-mono z-50">
          <div className="font-bold text-white mb-1.5 flex items-center gap-1.5 border-b border-cyan-500/30 pb-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>SECTOR: {label}</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span>WIN RATE:</span>
              <span className="text-emerald-400 font-bold">{item.winRate}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>MATCHES:</span>
              <span className="text-white font-medium">{item.matches}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>AVG SCORE:</span>
              <span className="text-cyan-400 font-medium">{item.avgScore}</span>
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
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-glow-cyan">
              SECTOR / MAP WIN RATE MATRIX
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Battlefield tactical win percentage calibrated against 50% neutral parity
          </p>
        </div>
      </div>

      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#162032" />
            <XAxis
              dataKey="map"
              stroke="#64748b"
              fontSize={11}
              angle={-25}
              textAnchor="end"
              interval={0}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[30, 75]}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={50}
              stroke="#38bdf8"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: '50% NEUTRAL PARITY',
                position: 'insideTopRight',
                fill: '#38bdf8',
                fontSize: 9,
              }}
            />
            <Bar
              dataKey="winRate"
              name="Win Rate %"
              radius={[3, 3, 0, 0]}
              animationDuration={800}
            >
              {data.map((entry) => {
                const isAbove50 = entry.winRate >= 50;
                return (
                  <Cell
                    key={`map-cell-${entry.map}`}
                    fill={isAbove50 ? '#06b6d4' : '#475569'}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-3xs font-mono text-slate-400">
        <span className="text-cyan-300">
          PRIME SECTOR: {data[0]?.map} ({data[0]?.winRate}%)
        </span>
        <span className="text-slate-400">{data.length} SECTORS PROFILED</span>
      </div>
    </div>
  );
};
