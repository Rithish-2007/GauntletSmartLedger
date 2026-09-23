import React, { useState } from 'react';
import type { OverviewData } from '../types/analytics';
import { ShoppingBag, Plus, Trash2, Calendar, Store, Sliders, CheckCircle2, X } from 'lucide-react';
import { GroceryCategoryChart } from '../components/charts/GroceryCategoryChart';
import { AddGroceryModal } from '../components/modals/AddGroceryModal';
import { deleteGroceryRecord, getPantryCeiling, setPantryCeiling } from '../services/api';

interface PantryPageProps {
  overview: OverviewData;
  onRefresh?: () => void;
}

export const PantryPage: React.FC<PantryPageProps> = ({ overview, onRefresh }) => {
  const { grocery } = overview;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [ceiling, setCeiling] = useState<number>(() => getPantryCeiling());
  const [isCeilingModalOpen, setIsCeilingModalOpen] = useState(false);
  const [tempCeiling, setTempCeiling] = useState<string>(String(ceiling));

  const totalSpend = grocery.totalMonthlySpend;
  const pct = ceiling > 0 ? Math.min(100, (totalSpend / ceiling) * 100) : 0;

  // Dynamic category calculations
  const categoryTotals: Record<string, number> = {};
  for (const record of grocery.records) {
    const cat = record.category || 'OTHER';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (record.totalAmount || 0);
  }

  const handleDelete = async (recordId: number) => {
    if (!confirm('Are you sure you want to remove this grocery invoice?')) return;
    try {
      setIsDeleting(recordId);
      await deleteGroceryRecord(recordId);
      onRefresh?.();
    } catch (err) {
      console.error('Failed to delete grocery record', err);
      alert('Failed to delete invoice. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSaveCeiling = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempCeiling);
    if (!isNaN(val) && val > 0) {
      setPantryCeiling(val);
      setCeiling(val);
      setIsCeilingModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-zinc-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShoppingBag className="w-3 h-3" />
              <span>PANTRY PROVISIONS</span>
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Essential Staples vs Discretionary Provisions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 font-sans">
            Pantry Groceries & Household Provisions
          </h1>
        </div>

        {/* Action Button & Quick KPI stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-xs hover:from-amber-600 hover:to-orange-700 transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Grocery Invoice</span>
          </button>
          <div className="bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">TOTAL EXPENSE</span>
            <span className="text-base font-bold text-white font-mono tabular-nums">
              ₹{totalSpend.toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => {
              setTempCeiling(String(ceiling));
              setIsCeilingModalOpen(true);
            }}
            className="bg-zinc-900/80 hover:bg-zinc-800/90 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-amber-500/40 text-left transition cursor-pointer group"
            title="Click to customize monthly budget ceiling"
          >
            <span className="text-zinc-500 block text-[10px] flex items-center justify-between gap-1">
              <span>BUDGET CEILING</span>
              <Sliders className="w-2.5 h-2.5 text-zinc-400 group-hover:text-amber-400" />
            </span>
            <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
              ₹{ceiling.toLocaleString('en-IN')}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Category Distribution Chart */}
      <GroceryCategoryChart records={grocery.records} />

      {/* Main Grid: Receipts Table + Category Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Receipts Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Itemized Grocery Invoices & Provision Receipts
              </h3>
              <span className="text-[11px] font-mono text-zinc-500">
                {grocery.records.length} Recorded Invoices
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[11px]">
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Store</th>
                    <th className="pb-2.5">Category</th>
                    <th className="pb-2.5">Provisions Notes</th>
                    <th className="pb-2.5 text-right">Invoice Amount</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {grocery.records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono text-xs">
                        No grocery invoices logged yet. Click "Add Grocery Invoice" to record purchases.
                      </td>
                    </tr>
                  ) : (
                    grocery.records.map((g) => (
                      <tr key={g.recordId} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{g.purchaseDate}</span>
                          </div>
                        </td>
                        <td className="py-3 font-semibold text-white">
                          <div className="flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-amber-400" />
                            <span>{g.storeName}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="inline-flex text-[10px] px-2 py-0.5 rounded font-mono bg-zinc-800 text-amber-300 border border-zinc-700">
                            {g.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-400 truncate max-w-xs">{g.receiptNotes || 'Provisions'}</td>
                        <td className="py-3 text-right font-bold text-white tabular-nums text-sm">
                          ₹{g.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDelete(g.recordId)}
                            disabled={isDeleting === g.recordId}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            title="Delete grocery invoice"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Right Column: Category Distribution & Budget Progress */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Pantry Budget Adherence
              </h3>
              <button
                onClick={() => {
                  setTempCeiling(String(ceiling));
                  setIsCeilingModalOpen(true);
                }}
                className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3 h-3" />
                <span>Adjust Ceiling</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Monthly Budget Absorbed</span>
                  <span className={`font-bold ${pct > 90 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>₹0</span>
                  <span>Ceiling: ₹{ceiling.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Categorical breakdown dynamically computed */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                {Object.keys(categoryTotals).length === 0 ? (
                  <div className="text-zinc-500 text-[11px] py-2">No category spend recorded yet.</div>
                ) : (
                  Object.entries(categoryTotals).map(([cat, amount]) => {
                    const share = totalSpend > 0 ? ((amount / totalSpend) * 100).toFixed(1) : '0';
                    return (
                      <div key={cat} className="flex justify-between items-center py-1">
                        <span className="text-zinc-400 capitalize">{cat.replace(/_/g, ' ').toLowerCase()}</span>
                        <span className="text-white font-bold">
                          ₹{amount.toFixed(2)} ({share}%)
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-3 bg-zinc-900/80 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 font-sans">
                <span
                  className={`font-semibold block mb-0.5 ${
                    totalSpend > ceiling ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {totalSpend > ceiling ? 'Budget Alert: Ceiling Exceeded' : 'Budget Status: Nominal'}
                </span>
                Remaining runway:{' '}
                <strong className="text-white font-mono">
                  ₹{Math.max(0, ceiling - totalSpend).toFixed(2)}
                </strong>
                .
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ceiling Adjustment Modal */}
      {isCeilingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Set Monthly Pantry Ceiling</h3>
              </div>
              <button
                onClick={() => setIsCeilingModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCeiling} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Monthly Budget Ceiling (₹)</label>
                <input
                  type="number"
                  step="100"
                  min="500"
                  value={tempCeiling}
                  onChange={(e) => setTempCeiling(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500 font-bold"
                  required
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[3000, 5000, 8000, 10000, 15000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTempCeiling(String(preset))}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                      tempCeiling === String(preset)
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    ₹{preset.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCeilingModalOpen(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg transition flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Ceiling</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AddGroceryModal
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
