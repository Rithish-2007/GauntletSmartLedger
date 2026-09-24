import React, { useState } from 'react';
import { X, Smartphone, CheckCircle2, Clock, UserCheck } from 'lucide-react';
import { addTelecomRecord } from '../../services/api';
import type { OverviewData } from '../../types/analytics';

interface AddTelecomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: OverviewData) => void;
  existingMembers?: string[];
}

const DEFAULT_MEMBERS = ['Self', 'Dad', 'Mom', 'Sister', 'Brother', 'Wife'];
const OPERATORS = ['Jio', 'Airtel', 'Vi', 'BSNL', 'Other'];
const VALIDITY_PRESETS = [28, 56, 84, 365];

export const AddTelecomModal: React.FC<AddTelecomModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingMembers = [],
}) => {
  const today = new Date().toISOString().split('T')[0];

  const allPresetMembers = Array.from(new Set([...existingMembers, ...DEFAULT_MEMBERS]));

  const [memberName, setMemberName] = useState(allPresetMembers[0] || 'Self');
  const [customName, setCustomName] = useState('');
  const [isCustomMember, setIsCustomMember] = useState(false);
  const [provider, setProvider] = useState('Jio');
  const [amount, setAmount] = useState('299');
  const [rechargeDate, setRechargeDate] = useState(today);
  const [validityDays, setValidityDays] = useState('28');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolvedMember = isCustomMember ? customName.trim() : memberName;
  const numDays = parseInt(validityDays, 10) || 28;
  const numAmount = parseFloat(amount) || 0;

  // Live Expiry Calculation
  const recDateObj = new Date(rechargeDate);
  const expiryDateObj = new Date(recDateObj);
  expiryDateObj.setDate(expiryDateObj.getDate() + numDays);
  const expiryStr = expiryDateObj.toISOString().split('T')[0];

  const now = new Date(today);
  const daysRemaining = Math.floor((expiryDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedMember) {
      setError('Please provide or select a family member name.');
      return;
    }
    if (numAmount <= 0) {
      setError('Please enter a valid recharge amount.');
      return;
    }
    if (numDays <= 0) {
      setError('Validity must be at least 1 day.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updated = await addTelecomRecord({
        memberName: resolvedMember,
        provider,
        amount: numAmount,
        rechargeDate,
        validityDays: numDays,
      });
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record recharge.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans tracking-tight">
                Add Family Member Recharge
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Assign SIM recharges & track validity clocks
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
          <div className="p-3 text-xs font-mono rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Family Member Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Family Member</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomMember(!isCustomMember)}
                className="text-[11px] font-mono text-purple-400 hover:underline"
              >
                {isCustomMember ? '← Pick from list' : '+ Add new member'}
              </button>
            </div>

            {isCustomMember ? (
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter member name (e.g. Grandmom)"
                required
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {allPresetMembers.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMemberName(m)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      memberName === m
                        ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">
              Service Provider
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {OPERATORS.map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setProvider(op)}
                  className={`py-1.5 text-xs font-mono rounded-lg transition-all text-center ${
                    provider === op
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Plan Amount (₹)
              </label>
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="299"
                required
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Recharge Date
              </label>
              <input
                type="date"
                value={rechargeDate}
                onChange={(e) => setRechargeDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Validity Days */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">
              Plan Validity (Days)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {VALIDITY_PRESETS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValidityDays(v.toString())}
                    className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                      validityDays === v.toString()
                        ? 'bg-purple-500 text-white font-bold'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {v}d
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                placeholder="Days"
                className="w-20 px-2 py-1 text-xs font-mono bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-purple-500 text-center"
              />
            </div>
          </div>

          {/* Live Mathematical Prediction Preview */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/30 space-y-1.5 text-xs font-mono">
            <div className="flex items-center space-x-1.5 text-purple-400 font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Calculated Expiry & Countdown</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Assigned Member:</span>
              <span className="font-bold text-white">{resolvedMember || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Calculated Expiry Date:</span>
              <span className="font-bold text-purple-300 tabular-nums">{expiryStr}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Live Runway:</span>
              <span className={`font-bold tabular-nums ${daysRemaining <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {daysRemaining} Days Remaining
              </span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-xs font-mono font-medium rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-bold transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isLoading ? (
                <span>Assigning...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Assign Recharge</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
