import React, { useState } from 'react';
import {
  RotateCcw,
  Download,
  Terminal,
  Volume2,
  VolumeX,
  Scan,
  Crosshair,
  Activity,
  Link2,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { FilterState, ConnectedAccount } from '../types/gaming';
import {
  isHudSoundEnabled,
  setHudSoundEnabled,
  playHudClick,
  playHudSelect,
  playHudConfirm,
} from '../utils/hudSound';

interface HeaderProps {
  filters: FilterState;
  onResetFilters: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  totalFilteredPlayers: number;
  totalFilteredMatches: number;
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
  onOpenConnectModal: () => void;
  onOpenCsvModal: () => void;
  connectedAccounts: ConnectedAccount[];
  lastSyncTimestamp?: string;
  onSyncAll: () => Promise<void>;
  isSyncingAll?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onResetFilters,
  onExportCsv,
  onExportJson,
  totalFilteredPlayers,
  totalFilteredMatches,
  scanlinesEnabled,
  onToggleScanlines,
  onOpenConnectModal,
  onOpenCsvModal,
  connectedAccounts,
  lastSyncTimestamp,
  onSyncAll,
  isSyncingAll = false,
}) => {
  const [soundOn, setSoundOn] = useState(isHudSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setHudSoundEnabled(next);
    if (next) playHudSelect();
  };

  const isFiltered =
    filters.game !== 'All' ||
    filters.role !== 'All' ||
    filters.map !== 'All' ||
    filters.dateRange !== 'all' ||
    filters.tier !== 'All' ||
    filters.searchQuery !== '';

  return (
    <header className="border-b border-cyan-500/30 bg-[#050914]/90 backdrop-blur-md sticky top-0 z-30 shadow-[0_4px_25px_-5px_rgba(6,182,212,0.15)]">
      {/* Top Tron Glowing Cyber Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand & Tactical HUD Title */}
          <div className="flex items-start gap-3.5">
            <div className="relative p-2.5 rounded-lg bg-slate-950 border border-cyan-500/50 text-cyan-400 shrink-0 hud-glow-cyan">
              <Crosshair className="w-6 h-6 animate-spin-slow text-cyan-400" />
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-300" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-300" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-2xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 tracking-wider">
                  COMBAT_HUD // V3.0 AUTOMATED
                </span>
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white uppercase text-glow-cyan">
                  Gaming Statistics &amp; Player Performance Dashboard
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="text-cyan-400">&gt;</span>
                <span>Automated API Feeds &bull; Steam &bull; Riot &bull; Minecraft &bull; Fortnite &bull; Console</span>
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Connect Gaming Accounts Button */}
            <button
              onClick={() => {
                playHudSelect();
                onOpenConnectModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded transition-all hud-glow-cyan shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5 text-slate-950" />
              <span>Connect Accounts</span>
              {connectedAccounts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-950 text-cyan-300 text-3xs font-extrabold">
                  {connectedAccounts.length}
                </span>
              )}
            </button>

            {/* Import CSV Data Button */}
            <button
              onClick={() => {
                playHudSelect();
                onOpenCsvModal();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 rounded transition-all cursor-pointer"
              title="Upload custom player or match CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import CSV</span>
            </button>

            {/* Quick Sync Button if accounts exist */}
            {connectedAccounts.length > 0 && (
              <button
                onClick={() => {
                  playHudClick(1000);
                  onSyncAll();
                }}
                disabled={isSyncingAll}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium text-purple-300 bg-purple-950/60 border border-purple-500/40 rounded hover:bg-purple-900/60 transition-all cursor-pointer"
                title="Fetch Latest Statistics across all accounts"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync All</span>
              </button>
            )}

            {/* Reset Active Filters */}
            {isFiltered && (
              <button
                onClick={() => {
                  playHudSelect();
                  onResetFilters();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium text-amber-300 bg-amber-500/10 border border-amber-500/40 rounded hover:bg-amber-500/20 transition-all hud-glow-amber cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-1.5 text-xs font-mono rounded border transition-all cursor-pointer ${
                soundOn
                  ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 hud-glow-cyan'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Toggle HUD sound effects"
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Scanlines Toggle */}
            <button
              onClick={() => {
                playHudClick(900);
                onToggleScanlines();
              }}
              className={`p-1.5 text-xs font-mono rounded border transition-all cursor-pointer ${
                scanlinesEnabled
                  ? 'bg-purple-950/70 border-purple-500/50 text-purple-300 hud-glow-purple'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Toggle Tron CRT scanlines overlay"
            >
              <Scan className="w-3.5 h-3.5" />
            </button>

            {/* Export CSV & JSON */}
            <button
              onClick={() => {
                playHudConfirm();
                onExportCsv();
              }}
              className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-300 text-slate-300 transition-all cursor-pointer"
              title="Export filtered dataset to CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            <button
              onClick={() => {
                playHudConfirm();
                onExportJson();
              }}
              className="p-1.5 rounded bg-cyan-950/70 border border-cyan-500/60 hover:bg-cyan-900/60 text-cyan-300 transition-all cursor-pointer"
              title="Export filtered dataset to JSON"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* HUD Sub-Bar with Live Telemetry Gauges */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2 font-mono">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              RADAR SLICE:
            </span>
            <span className="text-white font-bold tabular-nums">
              [{totalFilteredPlayers} PLAYERS]
            </span>
            <span className="text-slate-600">//</span>
            <span className="text-purple-400 font-bold tabular-nums">
              [{totalFilteredMatches} COMBAT MATCHES]
            </span>
          </div>

          <div className="flex items-center gap-3 text-2xs text-slate-400">
            {connectedAccounts.length > 0 ? (
              <span className="flex items-center gap-1 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
                API FEEDS: {connectedAccounts.length} ACTIVE
                {lastSyncTimestamp && ` (SYNCED ${new Date(lastSyncTimestamp).toLocaleTimeString()})`}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                API CONNECTORS: READY (STANDBY)
              </span>
            )}
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">PBL: DATA VISUALIZATION</span>
          </div>
        </div>
      </div>
    </header>
  );
};
