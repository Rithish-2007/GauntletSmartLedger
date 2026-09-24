import React, { useState } from 'react';
import { TraditionalTnebCalculator } from '../components/TraditionalTnebCalculator';
import { AddElectricityModal } from '../components/modals/AddElectricityModal';
import { ElectricityTrendChart } from '../components/charts/ElectricityTrendChart';
import { deleteElectricityRecord } from '../services/api';
import type { OverviewData } from '../types/analytics';
import { Zap, Receipt, CheckCircle2, History, Plus, Trash2 } from 'lucide-react';

interface ElectricityPageProps {
  overview: OverviewData;
  onRefresh?: () => void;
}

export const ElectricityPage: React.FC<ElectricityPageProps> = ({ overview, onRefresh }) => {
  const { electricity } = overview;
  const latest = electricity.latest;
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (recordId: number) => {
    if (!window.confirm('Are you sure you want to delete this electricity record?')) return;
    setDeletingId(recordId);
    try {
      await deleteElectricityRecord(recordId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const effectiveUnitRate = latest && latest.mySubmeterUnits > 0
    ? (latest.calculatedMyShare || latest.totalEbAmount) / latest.mySubmeterUnits
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-zinc-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-3 h-3" />
              <span>DOMESTIC TNEB TARIFF</span>
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Bi-Monthly Household Slabs & Subsidy Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 font-sans">
            Household Electricity & TNEB Tariff Management
          </h1>
        </div>

        {/* Controls: Quick Stats & Add Action */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono w-full sm:w-auto">
          <div className="flex-1 min-w-[130px] bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">LATEST CONSUMPTION</span>
            <span className="text-base font-bold text-cyan-400 font-mono tabular-nums">
              {latest ? `${latest.mySubmeterUnits} kWh` : '0 kWh'}
            </span>
          </div>
          <div className="flex-1 min-w-[130px] bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">LATEST BILL PAID</span>
            <span className="text-base font-bold text-white font-mono tabular-nums">
              ₹{latest?.totalEbAmount ? latest.totalEbAmount.toFixed(2) : '0.00'}
            </span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Bill</span>
          </button>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      <ElectricityTrendChart history={electricity.history} />

      {/* Main Grid: Historical Table + Details & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Latest Bill Card & Historical Ledger */}
        <div className="lg:col-span-5 space-y-6">
          {/* Latest Bill Breakdown Card */}
          {latest ? (
            <div className="glass-panel p-5 rounded-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Active Bill Breakdown ({latest.billingMonth})
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  PAID
                </span>
              </div>

              <div className="space-y-3 mt-4 text-xs font-mono">
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Billing Cycle</span>
                  <span className="text-white font-bold">{latest.billingMonth}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Total Units Consumed</span>
                  <span className="text-cyan-300 font-bold tabular-nums">{latest.mySubmeterUnits} kWh</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Payment Date</span>
                  <span className="text-zinc-300">{latest.paidDate || 'Recorded'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Effective Tariff Rate</span>
                  <span className="text-white font-bold tabular-nums">
                    ₹{effectiveUnitRate.toFixed(2)} / kWh
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 bg-cyan-950/20 px-3 rounded-lg border border-cyan-800/30">
                  <span className="text-cyan-300 font-semibold">Total Bill Amount Paid</span>
                  <span className="text-base font-extrabold text-white tabular-nums">
                    ₹{(latest.totalEbAmount || latest.calculatedMyShare).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-5 rounded-xl text-center space-y-2 text-zinc-400 font-mono text-xs">
              <p>No active bill breakdown recorded.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-cyan-400 hover:underline font-bold"
              >
                + Log your first bill
              </button>
            </div>
          )}

          {/* Historical Billing Ledger Table */}
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Billing Cycle Ledger History
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {electricity.history.length} Record(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[11px]">
                    <th className="pb-2">Month</th>
                    <th className="pb-2">Units</th>
                    <th className="pb-2">Bill Paid</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {electricity.history.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-zinc-500 font-mono text-xs">
                        No billing cycle records logged. Click "Log Bill" above.
                      </td>
                    </tr>
                  ) : (
                    electricity.history.map((rec) => (
                      <tr key={rec.recordId} className="hover:bg-zinc-900/40">
                        <td className="py-2.5 font-semibold text-white">{rec.billingMonth}</td>
                        <td className="py-2.5 text-cyan-400">{rec.mySubmeterUnits} kWh</td>
                        <td className="py-2.5 font-bold text-white">₹{(rec.totalEbAmount || rec.calculatedMyShare).toFixed(2)}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleDelete(rec.recordId)}
                            disabled={deletingId === rec.recordId}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Traditional TNEB Domestic Slab Calculator */}
        <div className="lg:col-span-7">
          <TraditionalTnebCalculator />
        </div>
      </div>

      {/* Modal Dialog */}
      <AddElectricityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};
