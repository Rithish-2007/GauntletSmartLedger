import React, { useState } from 'react';
import { X, Trash2, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { deleteAllMockData, seedDemoData } from '../../services/api';
import type { OverviewData } from '../../types/analytics';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: OverviewData) => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<'clear' | 'seed' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClearAll = async () => {
    setIsLoading(true);
    setActionType('clear');
    setError(null);
    try {
      const data = await deleteAllMockData();
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset data');
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const handleSeedDemo = async () => {
    setIsLoading(true);
    setActionType('seed');
    setError(null);
    try {
      const data = await seedDemoData();
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed demo data');
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 font-sans max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Reset Utility Data & Ledger
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Manage database state & baseline records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs font-mono rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Option 1: Clean Zero Wipe */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Wipe to Fresh ₹0 Baseline</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                RECOMMENDED FOR REAL USE
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              Clears all logged electricity bills, LPG cylinders, telecom recharges, fuel fills, and grocery invoices. Returns dashboard to ₹0.00 clean state.
            </p>
            <button
              onClick={handleClearAll}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading && actionType === 'clear' ? (
                <div className="w-4 h-4 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Execute Complete ₹0 Wipe</span>
                </>
              )}
            </button>
          </div>

          {/* Option 2: Re-seed Sample Demo Data */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>Reset & Re-seed Sample Data</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                DEMO PREVIEW
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              Populates realistic sample data across all 5 utility sectors so you can inspect charts, matrices, and depletion graphs immediately.
            </p>
            <button
              onClick={handleSeedDemo}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-mono font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading && actionType === 'seed' ? (
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Sample Demo Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Actions apply immediately to active session</span>
          </span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
