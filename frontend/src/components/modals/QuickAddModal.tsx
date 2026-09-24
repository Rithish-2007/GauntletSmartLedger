import React, { useState } from 'react';
import { X, Zap, Flame, Smartphone, Navigation, ShoppingBag, Plus } from 'lucide-react';
import { AddElectricityModal } from './AddElectricityModal';
import { ConnectGasModal } from './ConnectGasModal';
import { AddTelecomModal } from './AddTelecomModal';
import { AddTravelModal } from './AddTravelModal';
import { AddGroceryModal } from './AddGroceryModal';
import type { OverviewData } from '../../types/analytics';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: OverviewData) => void;
  existingTelecomMembers?: string[];
}

type CategoryType = 'electricity' | 'gas' | 'telecom' | 'travel' | 'grocery' | null;

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingTelecomMembers = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);

  if (!isOpen) return null;

  const handleChildSuccess = (data: OverviewData) => {
    setSelectedCategory(null);
    onSuccess(data);
    onClose();
  };

  if (selectedCategory === 'electricity') {
    return (
      <AddElectricityModal
        isOpen={true}
        onClose={() => setSelectedCategory(null)}
        onSuccess={handleChildSuccess}
      />
    );
  }

  if (selectedCategory === 'gas') {
    return (
      <ConnectGasModal
        isOpen={true}
        onClose={() => setSelectedCategory(null)}
        onSuccess={handleChildSuccess}
      />
    );
  }

  if (selectedCategory === 'telecom') {
    return (
      <AddTelecomModal
        isOpen={true}
        onClose={() => setSelectedCategory(null)}
        onSuccess={handleChildSuccess}
        existingMembers={existingTelecomMembers}
      />
    );
  }

  if (selectedCategory === 'travel') {
    return (
      <AddTravelModal
        isOpen={true}
        onClose={() => setSelectedCategory(null)}
        onSuccess={handleChildSuccess}
      />
    );
  }

  if (selectedCategory === 'grocery') {
    return (
      <AddGroceryModal
        isOpen={true}
        onClose={() => setSelectedCategory(null)}
        onSuccess={handleChildSuccess}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans tracking-tight">
                Quick Add Expense
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Select utility category to record entry
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

        {/* Categories List */}
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          <button
            onClick={() => setSelectedCategory('electricity')}
            className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-cyan-950/20 border border-zinc-800/80 hover:border-cyan-500/40 text-left flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white font-sans">Electricity Bill</div>
                <div className="text-[11px] text-zinc-400 font-mono">Units & monthly bill paid</div>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Add →
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('gas')}
            className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-amber-950/20 border border-zinc-800/80 hover:border-amber-500/40 text-left flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white font-sans">LPG Cylinder</div>
                <div className="text-[11px] text-zinc-400 font-mono">Connect cylinder & cost</div>
              </div>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Add →
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('telecom')}
            className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-purple-950/20 border border-zinc-800/80 hover:border-purple-500/40 text-left flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white font-sans">Telecom Recharge</div>
                <div className="text-[11px] text-zinc-400 font-mono">Assign SIM recharge to member</div>
              </div>
            </div>
            <span className="text-xs font-mono text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Add →
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('travel')}
            className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-blue-950/20 border border-zinc-800/80 hover:border-blue-500/40 text-left flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white font-sans">Travel & Fuel</div>
                <div className="text-[11px] text-zinc-400 font-mono">Petrol/Diesel or Ticket Fare</div>
              </div>
            </div>
            <span className="text-xs font-mono text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Add →
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('grocery')}
            className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-emerald-950/20 border border-zinc-800/80 hover:border-emerald-500/40 text-left flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white font-sans">Grocery & Provisions</div>
                <div className="text-[11px] text-zinc-400 font-mono">Invoice receipts & provisions</div>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Add →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
