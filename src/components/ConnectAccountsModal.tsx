import React, { useState, useEffect } from 'react';
import {
  X,
  Link2,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Gamepad2,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  KeyRound,
  Terminal,
} from 'lucide-react';
import { ConnectedAccount, GamingPlatform, PlatformInfo } from '../types/gaming';
import { ApiClient } from '../utils/apiClient';
import { playHudClick, playHudSelect, playHudConfirm } from '../utils/hudSound';

interface ConnectAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountsUpdated: () => void;
  connectedAccounts: ConnectedAccount[];
  lastSyncTimestamp?: string;
}

export const ConnectAccountsModal: React.FC<ConnectAccountsModalProps> = ({
  isOpen,
  onClose,
  onAccountsUpdated,
  connectedAccounts,
  lastSyncTimestamp,
}) => {
  const [activeTab, setActiveTab] = useState<'connected' | 'connect' | 'platforms'>('connect');
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<GamingPlatform>('Steam');
  const [identifierInput, setIdentifierInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncAllLoading, setSyncAllLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Quick preset test handles for live testing
  const presets: Record<GamingPlatform, { label: string; value: string }[]> = {
    Steam: [
      { label: 's1mple (Vanity)', value: 's1mple' },
      { label: 'Official SteamID64', value: '76561198034202275' },
    ],
    'Riot Games': [
      { label: 'TenZ#NA1', value: 'TenZ#NA1' },
      { label: 'Aspas#BR1', value: 'Aspas#BR1' },
      { label: 'Demon1#NA1', value: 'Demon1#NA1' },
    ],
    Minecraft: [
      { label: 'Technoblade', value: 'Technoblade' },
      { label: 'Dream', value: 'Dream' },
      { label: 'MumboJumbo', value: 'MumboJumbo' },
    ],
    Fortnite: [
      { label: 'Ninja', value: 'Ninja' },
      { label: 'Bugha', value: 'Bugha' },
      { label: 'Mongraal', value: 'Mongraal' },
    ],
    Xbox: [
      { label: 'MasterChief', value: 'MasterChief' },
      { label: 'MajorNelson', value: 'MajorNelson' },
    ],
    PlayStation: [
      { label: 'KratosPSN', value: 'KratosPSN' },
      { label: 'GhostOfTsushima', value: 'GhostOfTsushima' },
    ],
  };

  useEffect(() => {
    if (isOpen) {
      ApiClient.getPlatforms()
        .then(setPlatforms)
        .catch((err) => console.error('Failed to load platforms:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPlatformInfo = platforms.find((p) => p.id === selectedPlatform);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierInput.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);
    playHudClick(900);

    try {
      const res = await ApiClient.connectAccount(selectedPlatform, identifierInput.trim());
      playHudConfirm();
      setStatusMessage({
        type: 'success',
        text: `Connected ${res.account.displayName} (${selectedPlatform})! Synchronized ${res.matchesCount} match records.`,
      });
      setIdentifierInput('');
      onAccountsUpdated();
      setActiveTab('connected');
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to connect gaming account.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncSingle = async (account: ConnectedAccount) => {
    setSyncingId(account.id);
    playHudClick(1000);
    try {
      await ApiClient.syncAccount(account.id);
      playHudConfirm();
      onAccountsUpdated();
      setStatusMessage({
        type: 'success',
        text: `Refreshed statistics for ${account.displayName}!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || `Failed to sync ${account.displayName}.`,
      });
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncAllLoading(true);
    playHudClick(1000);
    try {
      const res = await ApiClient.syncAllAccounts();
      playHudConfirm();
      onAccountsUpdated();
      setStatusMessage({
        type: 'success',
        text: `Synchronized ${res.syncedCount} connected gaming accounts!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to sync accounts.',
      });
    } finally {
      setSyncAllLoading(false);
    }
  };

  const handleDisconnect = async (account: ConnectedAccount) => {
    if (!confirm(`Disconnect account ${account.displayName} (${account.platform})?`)) return;
    playHudClick(700);
    try {
      await ApiClient.disconnectAccount(account.id);
      onAccountsUpdated();
      setStatusMessage({
        type: 'success',
        text: `Disconnected ${account.displayName}.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to disconnect account.',
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#050914] border-2 border-cyan-500/60 rounded-xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.3)] flex flex-col relative font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 shadow-[0_0_12px_#22d3ee]" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/30 bg-[#070c18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-400 hud-glow-cyan shrink-0">
              <Link2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-3xs text-cyan-400 font-bold uppercase tracking-widest">
                  API TELEMETRY ENGINE //
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase text-glow-cyan">
                  CONNECT GAMING ACCOUNTS
                </h2>
                <span className="text-3xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                  {connectedAccounts.length} LINKED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Automatically retrieve real player ranks, KDA, win rates, and matches directly from gaming platform APIs.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playHudClick(600);
              onClose();
            }}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-cyan-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-[#040711] px-4 sm:px-5 gap-2 text-xs">
          <button
            onClick={() => {
              playHudSelect();
              setActiveTab('connect');
            }}
            className={`py-3 px-3.5 border-b-2 font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'border-cyan-400 text-cyan-300 text-glow-cyan'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Connect New Account
          </button>

          <button
            onClick={() => {
              playHudSelect();
              setActiveTab('connected');
            }}
            className={`py-3 px-3.5 border-b-2 font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'connected'
                ? 'border-cyan-400 text-cyan-300 text-glow-cyan'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected Accounts ({connectedAccounts.length})
          </button>

          <button
            onClick={() => {
              playHudSelect();
              setActiveTab('platforms');
            }}
            className={`py-3 px-3.5 border-b-2 font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'platforms'
                ? 'border-cyan-400 text-cyan-300 text-glow-cyan'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Supported Platforms
          </button>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div
            className={`px-5 py-2.5 text-xs flex items-center justify-between border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: CONNECT NEW ACCOUNT */}
          {activeTab === 'connect' && (
            <div className="space-y-5">
              {/* Step 1: Select Platform */}
              <div>
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                  1. SELECT TARGET GAMING PLATFORM
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      'Steam',
                      'Riot Games',
                      'Minecraft',
                      'Fortnite',
                      'Xbox',
                      'PlayStation',
                    ] as GamingPlatform[]
                  ).map((plat) => {
                    const isSelected = selectedPlatform === plat;
                    return (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => {
                          playHudSelect();
                          setSelectedPlatform(plat);
                        }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-cyan-950/70 border-cyan-400 text-white hud-glow-cyan'
                            : 'bg-[#060b18] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{plat}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />}
                        </div>
                        <div className="text-3xs text-slate-500 font-sans truncate">
                          {plat === 'Steam' && 'CS2, TF2, Games'}
                          {plat === 'Riot Games' && 'Valorant, LoL'}
                          {plat === 'Minecraft' && 'Mojang Java, PvP'}
                          {plat === 'Fortnite' && 'Battle Royale'}
                          {plat === 'Xbox' && 'Gamertag, Apex'}
                          {plat === 'PlayStation' && 'PSN, Overwatch 2'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Input Identifier */}
              <form onSubmit={handleConnect} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      2. ENTER GAMING IDENTIFIER / USERNAME
                    </label>
                    <span className="text-3xs text-slate-400 font-sans">
                      Format: {currentPlatformInfo?.authType || 'Public Identifier'}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={identifierInput}
                      onChange={(e) => setIdentifierInput(e.target.value)}
                      placeholder={
                        currentPlatformInfo?.placeholder ||
                        'Enter your username, SteamID, or Gamertag'
                      }
                      className="w-full bg-[#03060f] border border-cyan-500/40 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-3xs text-slate-400 font-sans mt-1.5 leading-relaxed">
                    {currentPlatformInfo?.helpText}
                  </p>
                </div>

                {/* Quick Test Presets */}
                {presets[selectedPlatform] && (
                  <div className="p-2.5 rounded bg-[#060a16] border border-slate-800 text-xs">
                    <span className="text-3xs text-slate-400 block mb-1.5 uppercase font-bold">
                      QUICK TEST PRESETS (CLICK TO AUTO-FILL):
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {presets[selectedPlatform].map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => {
                            playHudClick(800);
                            setIdentifierInput(preset.value);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-300 text-3xs text-slate-300 font-mono transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-3xs text-slate-500">
                    Client credentials safely managed on backend proxy.
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !identifierInput.trim()}
                    className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider transition-all hud-glow-cyan flex items-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Querying Platform API...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verify &amp; Import Player Data
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: CONNECTED ACCOUNTS */}
          {activeTab === 'connected' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider text-glow-cyan">
                    ACTIVE TELEMETRY FEEDS ({connectedAccounts.length})
                  </h3>
                  <p className="text-3xs text-slate-400 font-sans mt-0.5">
                    Last automatic synchronization:{' '}
                    {lastSyncTimestamp ? new Date(lastSyncTimestamp).toLocaleString() : 'Just now'}
                  </p>
                </div>

                {connectedAccounts.length > 0 && (
                  <button
                    onClick={handleSyncAll}
                    disabled={syncAllLoading}
                    className="px-3 py-1.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60 text-xs font-bold uppercase transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncAllLoading ? 'animate-spin' : ''}`} />
                    Sync All Accounts
                  </button>
                )}
              </div>

              {connectedAccounts.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <Gamepad2 className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-xs">No external gaming accounts connected yet.</p>
                  <button
                    onClick={() => setActiveTab('connect')}
                    className="px-4 py-2 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60 text-xs font-bold uppercase"
                  >
                    + Connect Your First Account
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {connectedAccounts.map((account) => {
                    const isSyncing = syncingId === account.id;

                    return (
                      <div
                        key={account.id}
                        className="p-3.5 rounded-lg bg-[#060a16] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              account.avatarUrl ||
                              `https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg`
                            }
                            alt={account.displayName}
                            className="w-10 h-10 rounded-lg border border-cyan-500/30 object-cover bg-slate-900 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">
                                {account.displayName}
                              </span>
                              <span className="text-3xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                                {account.platform}
                              </span>
                              <span className="text-3xs px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                                ACTIVE
                              </span>
                            </div>
                            <div className="text-3xs text-slate-400 mt-1 font-sans flex items-center gap-2">
                              <span>ID: {account.identifier}</span>
                              <span>&bull;</span>
                              <span>Synced: {new Date(account.lastSyncedAt).toLocaleTimeString()}</span>
                              {account.platformMeta?.rank && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-amber-300 font-mono">
                                    {account.platformMeta.rank}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleSyncSingle(account)}
                            disabled={isSyncing}
                            className="p-1.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/40 transition-colors"
                            title="Fetch Latest Statistics"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                          </button>

                          <button
                            onClick={() => handleDisconnect(account)}
                            className="p-1.5 rounded bg-slate-900 border border-slate-700 text-rose-400 hover:border-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Disconnect Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUPPORTED PLATFORMS */}
          {activeTab === 'platforms' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-300 font-sans leading-relaxed">
                The platform integrates with official developer APIs and public statistics endpoints.
                Credentials such as <code className="text-cyan-300">STEAM_API_KEY</code> and{' '}
                <code className="text-cyan-300">RIOT_API_KEY</code> are maintained securely in
                the backend environment.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {platforms.map((plat) => (
                  <div
                    key={plat.id}
                    className="p-3.5 rounded-lg bg-[#060a16] border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-cyan-400" />
                          {plat.name}
                        </span>
                        <span
                          className={`text-3xs px-1.5 py-0.5 rounded font-bold ${
                            plat.isPublicAvailable
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {plat.isPublicAvailable ? 'AVAILABLE' : 'KEY REQUIRED'}
                        </span>
                      </div>
                      <p className="text-3xs text-slate-400 font-sans leading-relaxed mb-2">
                        {plat.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-3xs text-slate-500">
                      <span>Auth: {plat.authType}</span>
                      <span className="text-cyan-400">{plat.supportedGames.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-cyan-500/30 bg-[#070c18] flex items-center justify-between text-xs text-slate-400">
          <span className="text-3xs text-cyan-400 font-mono">
            // ZERO FAKE DATA &bull; DIRECT PLATFORM SYNC
          </span>
          <button
            onClick={() => {
              playHudClick(600);
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-slate-900 border border-slate-700 text-white hover:border-cyan-400 transition-colors uppercase font-bold text-xs"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
