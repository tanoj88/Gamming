import React from 'react';
import { Gamepad2, Award, BookOpen, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-800/80 bg-slate-950 text-slate-400 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Attribution */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">
              Gaming Statistics and Player Performance Dashboard
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Made for PBL: Data Visualization
            </div>
          </div>
        </div>

        {/* Analytical Rubric Notes */}
        <div className="flex items-center gap-6 text-xs text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-400" />
            <span>KDA = (Kills + Assists) &divide; max(Deaths, 1)</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">&bull;</span>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Tiers: Pro (&ge;56% WR, &ge;1.7 KDA) · Intermediate · Beginner</span>
          </div>
        </div>

        {/* Timestamp & Environment */}
        <div className="text-xs text-slate-400 text-center md:text-right">
          <div>Client-side telemetry synthesis</div>
          <div className="text-slate-300 font-medium">No external API or credentials needed</div>
        </div>
      </div>
    </footer>
  );
};
