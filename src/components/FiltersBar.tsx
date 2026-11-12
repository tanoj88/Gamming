import React from 'react';
import { Search, X, Calendar, Gamepad, Shield, MapPin, Award, SlidersHorizontal, Crosshair, Database } from 'lucide-react';
import { FilterState, GameTitle, PerformanceTier } from '../types/gaming';
import { GAMES, GAME_ROLES, GAME_MAPS, ALL_MAPS } from '../data/mockData';
import { playHudClick, playHudSelect } from '../utils/hudSound';

interface FiltersBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({ filters, onChange, onReset }) => {
  // Compute available roles based on selected game
  const availableRoles = React.useMemo(() => {
    if (filters.game === 'All') {
      const allRoles = Object.values(GAME_ROLES).flat();
      return Array.from(new Set(allRoles)).sort();
    }
    return GAME_ROLES[filters.game] || [];
  }, [filters.game]);

  // Compute available maps based on selected game
  const availableMaps = React.useMemo(() => {
    if (filters.game === 'All') {
      return ALL_MAPS.sort();
    }
    return GAME_MAPS[filters.game] || [];
  }, [filters.game]);

  const handleGameChange = (game: 'All' | GameTitle) => {
    playHudSelect();
    onChange({
      ...filters,
      game,
      role: 'All',
      map: 'All',
    });
  };

  const isFiltered =
    filters.game !== 'All' ||
    filters.role !== 'All' ||
    filters.map !== 'All' ||
    filters.dateRange !== 'all' ||
    filters.tier !== 'All' ||
    (filters.sourceFilter && filters.sourceFilter !== 'All') ||
    filters.searchQuery !== '';

  return (
    <div className="hud-card p-4.5 border-cyan-500/40 shadow-[0_0_20px_-5px_rgba(6,182,212,0.12)] font-mono">
      {/* HUD Header Label */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80 text-2xs text-slate-400">
        <span className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          TACTICAL TELEMETRY FILTERS // RADAR MATRIX
        </span>
        <span className="text-slate-500">PARAM_ID: FLTR_GRID</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Selectors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 flex-1 text-xs">
          {/* Game Selector */}
          <div>
            <label className="text-cyan-400 text-2xs font-bold uppercase mb-1.5 flex items-center gap-1.5 tracking-wider">
              <Gamepad className="w-3 h-3 text-cyan-400" />
              TITLE
            </label>
            <select
              value={filters.game}
              onChange={(e) => handleGameChange(e.target.value as 'All' | GameTitle)}
              className="w-full bg-[#050914] border border-cyan-500/40 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 cursor-pointer transition-colors"
            >
              <option value="All">All Games</option>
              {GAMES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Data Source Filter (New!) */}
          <div>
            <label className="text-emerald-400 text-2xs font-bold uppercase mb-1.5 flex items-center gap-1.5 tracking-wider">
              <Database className="w-3 h-3 text-emerald-400" />
              DATA FEED
            </label>
            <select
              value={filters.sourceFilter || 'All'}
              onChange={(e) => {
                playHudClick(800);
                onChange({ ...filters, sourceFilter: e.target.value as any });
              }}
              className="w-full bg-[#050914] border border-emerald-500/40 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 cursor-pointer transition-colors"
            >
              <option value="All">All Sources</option>
              <option value="Connected Accounts">Connected (API)</option>
              <option value="CSV Imports">CSV Imports</option>
              <option value="Sample Dataset">Sample Dataset</option>
            </select>
          </div>

          {/* Role Selector */}
          <div>
            <label className="text-purple-400 text-2xs font-bold uppercase mb-1.5 flex items-center gap-1.5 tracking-wider">
              <Shield className="w-3 h-3 text-purple-400" />
              ROLE / SPEC
            </label>
            <select
              value={filters.role}
              onChange={(e) => {
                playHudClick(800);
                onChange({ ...filters, role: e.target.value });
              }}
              className="w-full bg-[#050914] border border-purple-500/40 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 cursor-pointer transition-colors"
            >
              <option value="All">All Roles</option>
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Map Selector */}
          <div>
            <label className="text-cyan-400 text-2xs font-bold uppercase mb-1.5 flex items-center gap-1.5 tracking-wider">
              <MapPin className="w-3 h-3 text-cyan-400" />
              SECTOR / MAP
            </label>
            <select
              value={filters.map}
              onChange={(e) => {
                playHudClick(850);
                onChange({ ...filters, map: e.target.value });
              }}
              className="w-full bg-[#050914] border border-cyan-500/40 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 cursor-pointer transition-colors"
            >
              <option value="All">All Sectors</option>
              {availableMaps.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Selector */}
          <div>
            <label className="text-amber-400 text-2xs font-bold uppercase mb-1.5 flex items-center gap-1.5 tracking-wider">
              <Award className="w-3 h-3 text-amber-400" />
              COMBAT TIER
            </label>
            <select
              value={filters.tier}
              onChange={(e) => {
                playHudClick(900);
                onChange({ ...filters, tier: e.target.value as 'All' | PerformanceTier });
              }}
              className="w-full bg-[#050914] border border-amber-500/40 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 cursor-pointer transition-colors"
            >
              <option value="All">All Tiers</option>
              <option value="Pro">Pro (WR &ge;56%, KDA &ge;1.7)</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Beginner">Beginner (WR &lt;48%, KDA &lt;1.15)</option>
            </select>
          </div>

          {/* Date Range Selector */}
          <div>
            <label className="text-cyan-400 text-2xs font-bold uppercase mb-1.5 flex items-center gap-1.5 tracking-wider">
              <Calendar className="w-3 h-3 text-cyan-400" />
              TIME WINDOW
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => {
                playHudClick(750);
                onChange({
                  ...filters,
                  dateRange: e.target.value as 'all' | '30d' | '90d' | '180d',
                });
              }}
              className="w-full bg-[#050914] border border-cyan-500/40 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 cursor-pointer transition-colors"
            >
              <option value="all">Full History (180D)</option>
              <option value="180d">Past 6 Months</option>
              <option value="90d">Past 90 Days</option>
              <option value="30d">Past 30 Days</option>
            </select>
          </div>
        </div>

        {/* Player Lookup Search */}
        <div className="w-full lg:w-72 shrink-0">
          <label className="text-slate-300 text-2xs font-bold uppercase mb-1.5 flex items-center gap-1.5 tracking-wider">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            TARGET LOOKUP
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Username, platform, rank..."
              value={filters.searchQuery}
              onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
              className="w-full bg-[#050914] border border-slate-700 rounded pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {filters.searchQuery && (
              <button
                onClick={() => {
                  playHudClick(600);
                  onChange({ ...filters, searchQuery: '' });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {isFiltered && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 text-2xs">ACTIVE_CONSTRAINTS:</span>
            {filters.game !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-2xs">
                GAME: {filters.game}
                <button onClick={() => onChange({ ...filters, game: 'All' })}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.sourceFilter && filters.sourceFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-2xs">
                FEED: {filters.sourceFilter}
                <button onClick={() => onChange({ ...filters, sourceFilter: 'All' })}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.role !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/40 text-purple-300 text-2xs">
                ROLE: {filters.role}
                <button onClick={() => onChange({ ...filters, role: 'All' })}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.map !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-2xs">
                SECTOR: {filters.map}
                <button onClick={() => onChange({ ...filters, map: 'All' })}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.tier !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 text-2xs">
                TIER: {filters.tier}
                <button onClick={() => onChange({ ...filters, tier: 'All' })}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.dateRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-2xs">
                WINDOW: {filters.dateRange}
                <button onClick={() => onChange({ ...filters, dateRange: 'all' })}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-2xs">
                QUERY: "{filters.searchQuery}"
                <button onClick={() => onChange({ ...filters, searchQuery: '' })}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={() => {
              playHudClick(600);
              onReset();
            }}
            className="text-amber-400 hover:text-amber-300 text-2xs underline cursor-pointer"
          >
            DISARM ALL FILTERS
          </button>
        </div>
      )}
    </div>
  );
};
