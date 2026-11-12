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
import { ShieldAlert, Shield } from 'lucide-react';
import { RoleStat } from '../../types/gaming';

interface RoleStatsGroupedChartProps {
  data: RoleStat[];
}

export const RoleStatsGroupedChart: React.FC<RoleStatsGroupedChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="hud-card p-5 flex flex-col items-center justify-center h-80 text-slate-500 font-mono text-xs">
        NO ROLE CLASSIFICATIONS AVAILABLE.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const roleItem = data.find((d) => d.role === label);
      return (
        <div className="bg-[#050914] border border-purple-500/60 rounded p-3 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-xs font-mono z-50">
          <div className="font-bold text-white mb-1.5 border-b border-purple-500/30 pb-1">
            CLASS: {label}
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex items-center justify-between gap-4 text-cyan-400">
              <span>AVG KILLS:</span>
              <span className="font-mono font-bold">{payload[0]?.value}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-rose-400">
              <span>AVG DEATHS:</span>
              <span className="font-mono font-bold">{payload[1]?.value}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-purple-400">
              <span>AVG ASSISTS:</span>
              <span className="font-mono font-bold">{payload[2]?.value}</span>
            </div>
            {roleItem && (
              <>
                <div className="flex items-center justify-between gap-4 text-amber-300 pt-1 border-t border-slate-800">
                  <span>AGGREGATE KDA:</span>
                  <span className="font-mono font-bold">{roleItem.avgKda}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-emerald-400">
                  <span>WIN RATE:</span>
                  <span className="font-mono font-bold">{roleItem.winRate}%</span>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="hud-card p-5 flex flex-col h-full border-purple-500/30">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-glow-purple">
              ROLE SPECIALIZATION COMBAT STATS
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Grouped combat telemetry across battlefield specializations
          </p>
        </div>
      </div>

      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 15, left: -15, bottom: 20 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#162032" />
            <XAxis
              dataKey="role"
              stroke="#64748b"
              fontSize={11}
              angle={-20}
              textAnchor="end"
              interval={0}
              tickLine={false}
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />
            <Bar
              dataKey="avgKills"
              name="Avg Kills"
              fill="#06b6d4"
              radius={[2, 2, 0, 0]}
              animationDuration={800}
            />
            <Bar
              dataKey="avgDeaths"
              name="Avg Deaths"
              fill="#f43f5e"
              radius={[2, 2, 0, 0]}
              animationDuration={800}
            />
            <Bar
              dataKey="avgAssists"
              name="Avg Assists"
              fill="#a855f7"
              radius={[2, 2, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-3xs font-mono text-slate-400">
        <span className="text-purple-300">
          MAX KDA CLASS: {data[0]?.role} ({data[0]?.avgKda})
        </span>
        <span className="text-slate-400">{data.length} ROLES COMPARED</span>
      </div>
    </div>
  );
};
