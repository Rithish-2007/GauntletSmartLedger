import React, { useState } from 'react';
import { X, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { addGroceryRecord } from '../../services/api';
import type { OverviewData } from '../../types/analytics';

interface AddGroceryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: OverviewData) => void;
}

const CATEGORIES = [
  { id: 'ESSENTIAL_STAPLE', label: 'Essential Staples (Grains, Rice, Oil)' },
  { id: 'DAIRY_PRODUCE', label: 'Dairy & Fresh Produce (Milk, Veggies)' },
  { id: 'SNACKS_DISCRETIONARY', label: 'Snacks & Discretionary (Sweets, Beverages)' },
  { id: 'HOUSEHOLD_CLEANING', label: 'Household & Cleaning Supplies' },
];

export const AddGroceryModal: React.FC<AddGroceryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [storeName, setStoreName] = useState('Reliance Fresh');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [amount, setAmount] = useState('650');
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setError('Please enter a valid invoice amount.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updated = await addGroceryRecord({
        storeName: storeName.trim(),
        category,
        amount: numAmount,
        date,
        notes: notes.trim() || undefined,
      });
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record grocery receipt.');
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
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans tracking-tight">
                Add Grocery Invoice
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Log pantry provisions & categorical spend
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
                Store / Vendor Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Local Supermart"
                required
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Invoice Amount (₹)
              </label>
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="650"
                required
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              Receipt Notes / Items (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Rice 10kg, Dal 2kg, Cooking oil"
              className="w-full px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
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
                <span>Recording...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Grocery Receipt</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
