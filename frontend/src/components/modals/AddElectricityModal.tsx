import React, { useState } from 'react';
import { X, Zap, CheckCircle2, Calculator } from 'lucide-react';
import { addElectricityRecord } from '../../services/api';
import type { OverviewData } from '../../types/analytics';

interface AddElectricityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: OverviewData) => void;
}

export const AddElectricityModal: React.FC<AddElectricityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().split('T')[0];

  const [billingMonth, setBillingMonth] = useState(currentMonth);
  const [totalEbAmount, setTotalEbAmount] = useState<string>('1250');
  const [myUnits, setMyUnits] = useState<string>('180');
  const [otherUnits, setOtherUnits] = useState<string>('0');
  const [paidDate, setPaidDate] = useState(today);
  const [isShared, setIsShared] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Live Math Calculations
  const billVal = parseFloat(totalEbAmount) || 0;
  const myUnitsVal = parseFloat(myUnits) || 0;
  const otherUnitsVal = isShared ? (parseFloat(otherUnits) || 0) : 0;
  const totalSubUnits = myUnitsVal + otherUnitsVal;

  let calculatedShare = billVal;
  if (isShared && totalSubUnits > 0) {
    calculatedShare = billVal * (myUnitsVal / totalSubUnits);
  }
  const effectiveRate = myUnitsVal > 0 ? calculatedShare / myUnitsVal : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (myUnitsVal <= 0) {
      setError('Please enter units consumed (greater than 0).');
      return;
    }
    if (billVal < 0) {
      setError('Bill amount cannot be negative.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updated = await addElectricityRecord({
        billingMonth,
        totalEbAmount: billVal,
        myUnits: myUnitsVal,
        otherUnits: isShared ? otherUnitsVal : 0,
        paidDate,
      });
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record electricity bill.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans tracking-tight">
                Log Electricity Bill
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Record your real monthly bill & consumption
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Billing Month</label>
              <input
                type="month"
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Paid Date</label>
              <input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Bill Amount Paid (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={totalEbAmount}
                onChange={(e) => setTotalEbAmount(e.target.value)}
                placeholder="e.g. 1250"
                required
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Units Consumed (kWh)
              </label>
              <input
                type="number"
                step="any"
                min="1"
                value={myUnits}
                onChange={(e) => setMyUnits(e.target.value)}
                placeholder="e.g. 180"
                required
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Shared Sub-meter Toggle */}
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-300">Shared Master Meter with Tenants?</span>
              <button
                type="button"
                onClick={() => setIsShared(!isShared)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  isShared ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    isShared ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {isShared && (
              <div className="pt-2 border-t border-zinc-800">
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Tenant / Other Floor Units (kWh)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={otherUnits}
                  onChange={(e) => setOtherUnits(e.target.value)}
                  placeholder="e.g. 240"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Live Mathematical Formula Preview */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/30 space-y-1.5 text-xs font-mono">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold mb-1">
              <Calculator className="w-3.5 h-3.5" />
              <span>Live Calculated Output</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Your Calculated Share:</span>
              <span className="font-bold text-white tabular-nums">₹{calculatedShare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Effective Rate per Unit:</span>
              <span className="text-cyan-300 tabular-nums">₹{effectiveRate.toFixed(2)} / kWh</span>
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
              className="px-5 py-2 text-xs font-mono font-medium rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isLoading ? (
                <span>Recording...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Electricity Bill</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
