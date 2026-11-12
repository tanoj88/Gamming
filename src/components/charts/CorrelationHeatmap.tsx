import React, { useState } from 'react';
import { Network, Info, Sparkles, Binary } from 'lucide-react';
import { calculateCorrelationMatrix } from '../../utils/analytics';
import { PlayerAggregatedStats } from '../../types/gaming';
import { playHudClick } from '../../utils/hudSound';

interface CorrelationHeatmapProps {
  playerStats: PlayerAggregatedStats[];
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ playerStats }) => {
  const result = calculateCorrelationMatrix(playerStats);
  const [hoveredCell, setHoveredCell] = useState<{
    x: string;
    y: string;
    r: number;
  } | null>(null);

  if (!result || result.matrix.length === 0) {
    return (
      <div className="hud-card p-5 flex flex-col items-center justify-center h-80 text-slate-500 font-mono text-xs">
        INSUFFICIENT TELEMETRY TO ASSEMBLE CORRELATION TENSOR.
      </div>
    );
  }

  const { labels, matrix } = result;

  const getCellColor = (r: number) => {
    if (r === 1) return 'bg-cyan-500/80 text-white font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]';
    if (r >= 0.6) return 'bg-cyan-500/60 text-cyan-100';
    if (r >= 0.3) return 'bg-cyan-600/35 text-cyan-200';
    if (r >= 0.1) return 'bg-cyan-800/20 text-cyan-300';
    if (r > -0.1) return 'bg-slate-900/80 text-slate-400';
    if (r > -0.3) return 'bg-rose-950/40 text-rose-300';
    if (r > -0.6) return 'bg-rose-900/50 text-rose-200';
    return 'bg-rose-700/70 text-white font-bold shadow-[0_0_8px_rgba(244,63,94,0.4)]';
  };

  const getExplanation = (x: string, y: string, r: number) => {
    if (x === y) return `Identical metric self-correlation (r = 1.00). Perfect linear vector match.`;
    if (r > 0.5)
      return `Strong positive correlation (r = +${r.toFixed(2)}): Escalations in ${x} directly amplify ${y}.`;
    if (r > 0.2)
      return `Moderate positive correlation (r = +${r.toFixed(2)}): Noticeable statistical coupling between ${x} and ${y}.`;
    if (r >= -0.2)
      return `Near-zero orthogonal independence (r = ${r.toFixed(2)}): No direct linear coupling between ${x} and ${y}.`;
    if (r >= -0.5)
      return `Moderate inverse correlation (r = ${r.toFixed(2)}): Higher ${x} correlates with degraded ${y}.`;
    return `Strong inverse correlation (r = ${r.toFixed(2)}): High-contrast antagonist vectors between ${x} and ${y}.`;
  };

  return (
    <div className="hud-card p-5 flex flex-col h-full border-cyan-500/30">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2 pb-2 border-b border-slate-800/80 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <Binary className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-glow-cyan">
              STATISTICAL CORRELATION TENSOR // MATRIX
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Pearson linear correlation coefficient (r) between combat telemetry vectors
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-3xs text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-700 inline-block shadow-[0_0_4px_#be123c]" />
            -1.0 (INVERSE)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-900 inline-block border border-slate-700" />
            0.0
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-cyan-500 inline-block shadow-[0_0_4px_#06b6d4]" />
            +1.0 (COUPLED)
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 font-mono">
        <div className="min-w-[500px]">
          {/* Header Row */}
          <div className="grid grid-cols-9 gap-1 text-3xs font-bold text-cyan-400 pb-1 border-b border-slate-800">
            <div className="text-left text-slate-500">VECTOR</div>
            {labels.map((label) => (
              <div key={`col-${label}`} className="text-center truncate px-1" title={label}>
                {label.split(' ')[0]}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {matrix.map((row, i) => (
            <div key={`row-${labels[i]}`} className="grid grid-cols-9 gap-1 py-1 items-center">
              <div className="text-3xs font-bold text-slate-300 truncate pr-1" title={labels[i]}>
                {labels[i]}
              </div>

              {row.map((cell) => {
                const isHovered =
                  hoveredCell?.x === cell.x && hoveredCell?.y === cell.y;

                return (
                  <button
                    key={`cell-${cell.x}-${cell.y}`}
                    onMouseEnter={() => {
                      playHudClick(900 + Math.abs(cell.correlation) * 500);
                      setHoveredCell({ x: cell.x, y: cell.y, r: cell.correlation });
                    }}
                    onClick={() => {
                      playHudClick(1200);
                      setHoveredCell({ x: cell.x, y: cell.y, r: cell.correlation });
                    }}
                    className={`h-8 rounded flex items-center justify-center font-mono text-3xs transition-all cursor-pointer ${getCellColor(
                      cell.correlation
                    )} ${isHovered ? 'ring-2 ring-cyan-400 scale-105 z-10' : 'hover:opacity-90'}`}
                  >
                    {cell.correlation > 0 && cell.correlation < 1 ? `+${cell.correlation}` : cell.correlation}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* HUD Telemetry Takeaway Card */}
      <div className="mt-3 p-3 rounded bg-[#050914] border border-cyan-500/30 text-xs font-mono">
        {hoveredCell ? (
          <div>
            <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {hoveredCell.x} &times; {hoveredCell.y}
              </span>
              <span className="text-3xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold">
                PEARSON r = {hoveredCell.r > 0 && hoveredCell.r < 1 ? `+${hoveredCell.r}` : hoveredCell.r}
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed font-sans">
              {getExplanation(hoveredCell.x, hoveredCell.y, hoveredCell.r)}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Hover or click any cell above to stream mathematical vector correlation and tactical takeaway.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
