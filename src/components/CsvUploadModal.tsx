import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { ApiClient } from '../utils/apiClient';
import { playHudClick, playHudConfirm } from '../utils/hudSound';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    playHudClick(800);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content || '');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    playHudClick(800);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content || '');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!csvText.trim()) return;

    setIsUploading(true);
    setStatusMessage(null);
    playHudClick(900);

    try {
      const res = await ApiClient.uploadCsv(csvText);
      playHudConfirm();
      setStatusMessage({
        type: 'success',
        text: `Successfully ingested CSV! Added ${res.summary.playersCount} player(s) and ${res.summary.matchesCount} match record(s).`,
      });
      setCsvText('');
      setFileName('');
      onUploadSuccess();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to process CSV file.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSamplePlayers = () => {
    const sample = `id,username,game,role,rank,country,playtime_hours
p-custom-01,ShadowApex,Valorant,Duelist,Pro / Radiant,United States,820
p-custom-02,FrostByte,Counter-Strike 2,AWPer / Sniper,Master,Sweden,710
p-custom-03,VortexNova,Apex Legends,Skirmisher,Diamond,Canada,490`;
    downloadSampleFile(sample, 'sample_players.csv');
  };

  const handleDownloadSampleMatches = () => {
    const sample = `match_id,player_id,date,map,kills,deaths,assists,headshot_percentage,score,result
m-custom-01,p-custom-01,2026-11-01,Ascent,24,11,6,38,580,Win
m-custom-02,p-custom-01,2026-11-03,Haven,19,15,4,29,420,Loss
m-custom-03,p-custom-02,2026-11-02,Mirage,26,10,3,45,610,Win`;
    downloadSampleFile(sample, 'sample_matches.csv');
  };

  function downloadSampleFile(content: string, filename: string) {
    playHudClick(700);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#050914] border-2 border-cyan-500/60 rounded-xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.3)] flex flex-col relative font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 shadow-[0_0_12px_#22d3ee]" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/30 bg-[#070c18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-400 hud-glow-cyan shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-3xs text-cyan-400 font-bold uppercase tracking-widest">
                  CSV FALLBACK INGESTION //
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase text-glow-cyan">
                  IMPORT CSV GAMING DATA
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Upload custom player rosters or match logs when API access is unavailable or offline.
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
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-cyan-500/40 rounded-xl p-6 text-center hover:border-cyan-400 hover:bg-cyan-950/20 transition-all cursor-pointer group"
          >
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
              <Upload className="w-8 h-8 mx-auto text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white uppercase">
                {fileName ? fileName : 'DRAG & DROP CSV FILE HERE OR CLICK TO BROWSE'}
              </div>
              <div className="text-3xs text-slate-400 font-sans">
                Supports player rosters or match battle logs with UTF-8 encoding.
              </div>
            </label>
          </div>

          {/* Raw Text Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-2xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                OR PASTE RAW CSV CONTENT DIRECTLY
              </label>
              {csvText && (
                <button
                  onClick={() => {
                    setCsvText('');
                    setFileName('');
                  }}
                  className="text-3xs text-slate-500 hover:text-slate-300 underline"
                >
                  Clear Content
                </button>
              )}
            </div>
            <textarea
              rows={5}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="id,username,game,role,rank,country,playtime_hours..."
              className="w-full bg-[#03060f] border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* Download Templates */}
          <div className="p-3 rounded-lg bg-[#060a16] border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-3xs text-slate-400 uppercase font-bold">
              DOWNLOAD FORMAT TEMPLATES:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSamplePlayers}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-3xs text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                Player Roster CSV
              </button>
              <button
                type="button"
                onClick={handleDownloadSampleMatches}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-3xs text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                Match Logs CSV
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyan-500/30 bg-[#070c18] flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors uppercase font-bold text-xs"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isUploading || !csvText.trim()}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider transition-all hud-glow-cyan flex items-center gap-2 cursor-pointer"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Ingesting Dataset...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Commit to Dashboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
