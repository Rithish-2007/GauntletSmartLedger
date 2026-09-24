import React, { useState } from 'react';
import { TelecomMatrix } from '../components/TelecomMatrix';
import { TelecomMemberSpendChart } from '../components/charts/TelecomMemberSpendChart';
import { AddTelecomModal } from '../components/modals/AddTelecomModal';
import { deleteTelecomRecord } from '../services/api';
import type { OverviewData } from '../types/analytics';
import { Smartphone, Signal, Calendar, ExternalLink, Wifi, Plus } from 'lucide-react';

interface TelecomPageProps {
  overview: OverviewData;
  onRefresh?: () => void;
}

export const TelecomPage: React.FC<TelecomPageProps> = ({ overview, onRefresh }) => {
  const { telecom, macro } = overview;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleDelete = async (recordId: number) => {
    if (!confirm('Are you sure you want to remove this family telecom record?')) return;
    try {
      await deleteTelecomRecord(recordId);
      onRefresh?.();
    } catch (err) {
      console.error('Failed to delete telecom record', err);
      alert('Failed to delete record. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-zinc-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Smartphone className="w-3 h-3" />
              <span>FAMILY MATRIX</span>
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Multi-Carrier SIM Validity Watchdog
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 font-sans">
            Family Telecom & Connectivity Management
          </h1>
        </div>

        {/* Action Button & Quick KPI stats */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-xs hover:from-purple-600 hover:to-indigo-700 transition shadow-lg shadow-purple-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recharge</span>
          </button>
          <div className="flex-1 min-w-[130px] bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">TOTAL COMMITMENT</span>
            <span className="text-base font-bold text-white font-mono tabular-nums">
              ₹{macro.telecomSpend.toFixed(2)}/mo
            </span>
          </div>
          <div className="flex-1 min-w-[130px] bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">ATTENTION REQUIRED</span>
            <span className={`text-base font-bold font-mono tabular-nums ${telecom.expiringSoonCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {telecom.expiringSoonCount + telecom.expiredCount} SIMs
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Member Spend Chart */}
      <TelecomMemberSpendChart records={telecom.records} />

      {/* Main Grid: Matrix on Left + Operator Gateways & Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Full Matrix */}
        <div className="lg:col-span-7">
          <TelecomMatrix records={telecom.records} onDelete={handleDelete} />
        </div>

        {/* Right Column: Operator Gateways & Expiry Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct Recharge Gateways */}
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800/80 mb-3">
              <Signal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Direct Operator Portals
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <a
                href="https://www.jio.com/selfcare/recharge/mobility/"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-lg bg-blue-950/20 hover:bg-blue-950/40 border border-blue-800/30 flex items-center justify-between transition-all group"
              >
                <div>
                  <div className="font-bold text-blue-400">Jio Selfcare</div>
                  <div className="text-[10px] text-zinc-500">5G Unlimited</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400" />
              </a>

              <a
                href="https://www.airtel.in/recharge-online"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 border border-rose-800/30 flex items-center justify-between transition-all group"
              >
                <div>
                  <div className="font-bold text-rose-400">Airtel Thanks</div>
                  <div className="text-[10px] text-zinc-500">True 5G Plus</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400" />
              </a>

              <a
                href="https://portal2.bsnl.in/myportal/quickrecharge.do"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-lg bg-amber-950/20 hover:bg-amber-950/40 border border-amber-800/30 flex items-center justify-between transition-all group"
              >
                <div>
                  <div className="font-bold text-amber-400">BSNL Portal</div>
                  <div className="text-[10px] text-zinc-500">National Roaming</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400" />
              </a>

              <a
                href="https://www.myvi.in/prepaid/online-mobile-recharge"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-lg bg-purple-950/20 hover:bg-purple-950/40 border border-purple-800/30 flex items-center justify-between transition-all group"
              >
                <div>
                  <div className="font-bold text-purple-400">Vi (Vodafone)</div>
                  <div className="text-[10px] text-zinc-500">Weekend Rollover</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400" />
              </a>
            </div>
          </div>

          {/* Expiration Timeline Table */}
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800/80 mb-3">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Validity Expiration Timeline
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {telecom.records.length === 0 ? (
                <div className="py-6 text-center text-zinc-500 font-mono text-xs">
                  No active family subscription plans on record.
                </div>
              ) : (
                telecom.records.map((sim) => (
                  <div
                    key={sim.recordId}
                    className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800"
                  >
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">{sim.familyMemberName}</span>
                      <span className="text-[10px] text-zinc-500">({sim.serviceProvider})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-200 font-bold">{sim.expiryDate}</span>
                      <span className="text-[10px] text-zinc-500 block">₹{sim.planAmount} ({sim.validityDays}d)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AddTelecomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          onRefresh?.();
        }}
      />
    </div>
  );
};
