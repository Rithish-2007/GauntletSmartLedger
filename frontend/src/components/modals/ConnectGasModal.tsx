import React, { useState } from 'react';
import { X, Flame, CheckCircle2, Calendar } from 'lucide-react';
import { connectLpgCylinder } from '../../services/api';
import type { OverviewData } from '../../types/analytics';

interface ConnectGasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: OverviewData) => void;
}

export const ConnectGasModal: React.FC<ConnectGasModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [bookingCost, setBookingCost] = useState('850');
  const [cylinderWeightKg, setCylinderWeightKg] = useState('14.2');
  const [connectedDate, setConnectedDate] = useState(today);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const costVal = parseFloat(bookingCost) || 0;
  const weightVal = parseFloat(cylinderWeightKg) || 14.2;

  // Approximate days based on domestic baseline ~0.45 kg/day
  const estDays = Math.round(weightVal / 0.45);
  const estDepleteDate = new Date(connectedDate);
  estDepleteDate.setDate(estDepleteDate.getDate() + estDays);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (costVal <= 0) {
      setError('Please enter a valid cylinder booking cost.');
      return;
    }
    if (weightVal <= 0) {
      setError('Cylinder weight must be greater than 0 kg.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updated = await connectLpgCylinder(weightVal, costVal, connectedDate);
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect new cylinder.');
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
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans tracking-tight">
                Connect LPG Cylinder
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Log new cylinder refill & start tracking burn rate
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Booking Cost (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={bookingCost}
                onChange={(e) => setBookingCost(e.target.value)}
                placeholder="850"
                required
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Net Gas Weight (kg)
              </label>
              <input
                type="number"
                step="any"
                min="1"
                value={cylinderWeightKg}
                onChange={(e) => setCylinderWeightKg(e.target.value)}
                placeholder="14.2"
                required
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              Installation / Started Date
            </label>
            <input
              type="date"
              value={connectedDate}
              onChange={(e) => setConnectedDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Live Mathematical Prediction Preview */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30 space-y-1.5 text-xs font-mono">
            <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Telemetry Projection</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Estimated Duration:</span>
              <span className="font-bold text-white tabular-nums">~{estDays} Days</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Estimated Depletion:</span>
              <span className="text-amber-300 tabular-nums">
                {estDepleteDate.toISOString().split('T')[0]}
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
              className="px-5 py-2 text-xs font-mono font-medium rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isLoading ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connect Cylinder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
