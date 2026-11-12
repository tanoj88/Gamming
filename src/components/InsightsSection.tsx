import React from 'react';
import { Lightbulb, Compass, Shield, Clock, Award, Flame, ArrowUpRight, Cpu } from 'lucide-react';
import { InsightItem } from '../types/gaming';
import { playHudClick } from '../utils/hudSound';

interface InsightsSectionProps {
  insights: InsightItem[];
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({ insights }) => {
  const getCategoryIcon = (category: InsightItem['category']) => {
    switch (category) {
      case 'Map':
        return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Role':
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      case 'Playtime':
        return <Clock className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Tier':
        return <Award className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const getCategoryBadgeClass = (category: InsightItem['category']) => {
    switch (category) {
      case 'Map':
        return 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40';
      case 'Role':
        return 'text-purple-300 bg-purple-950/70 border-purple-500/40';
      case 'Playtime':
        return 'text-cyan-300 bg-cyan-950/70 border-cyan-500/40';
      case 'Tier':
        return 'text-amber-300 bg-amber-950/70 border-amber-500/40';
      default:
        return 'text-rose-300 bg-rose-950/70 border-rose-500/40';
    }
  };

  return (
    <section className="hud-card p-5 border-cyan-500/30">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider font-mono flex items-center gap-2 text-glow-cyan">
              DATA-DRIVEN TACTICAL INSIGHTS // DSP TELEMETRY
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live automated pattern synthesis evaluated across active combat parameters
            </p>
          </div>
        </div>
        <span className="text-2xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400">
          STATUS: 5 FINDINGS ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, idx) => (
          <div
            key={insight.id}
            onMouseEnter={() => playHudClick(1200 + idx * 80)}
            className="p-4 rounded-lg bg-[#070c18] border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between group hover:shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-2 font-mono">
                <span
                  className={`text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1.5 ${getCategoryBadgeClass(
                    insight.category
                  )}`}
                >
                  {getCategoryIcon(insight.category)}
                  {insight.category}_FINDING
                </span>

                <div className="text-right">
                  <span className="text-sm font-black font-mono text-cyan-300 tabular-nums">
                    {insight.statValue}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-1.5 flex items-center justify-between">
                <span>{insight.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {insight.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-3xs font-mono text-slate-500">
              <span>METRIC: {insight.metricLabel}</span>
              <span className="text-emerald-400 font-semibold">[VERIFIED]</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
