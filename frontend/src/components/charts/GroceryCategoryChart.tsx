import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { GroceryRecordDetail } from '../../types/analytics';
import { ShoppingBag, ShieldCheck, Cookie } from 'lucide-react';

interface GroceryCategoryChartProps {
  records: GroceryRecordDetail[];
}

const CATEGORY_COLORS: Record<string, string> = {
  ESSENTIAL_STAPLE: '#10b981',
  DAIRY_PRODUCE: '#06b6d4',
  SNACKS_DISCRETIONARY: '#f59e0b',
  HOUSEHOLD_CLEANING: '#a855f7',
};

const CATEGORY_LABELS: Record<string, string> = {
  ESSENTIAL_STAPLE: 'Essential Staples',
  DAIRY_PRODUCE: 'Dairy & Fresh Produce',
  SNACKS_DISCRETIONARY: 'Discretionary Snacks',
  HOUSEHOLD_CLEANING: 'Household & Cleaning',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="p-2.5 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl font-mono text-xs backdrop-blur-md">
        <span className="font-bold text-white">{data.name}: </span>
        <span className="text-emerald-400 font-bold tabular-nums">₹{data.value.toFixed(2)}</span>
      </div>
    );
  }
  return null;
};

export const GroceryCategoryChart: React.FC<GroceryCategoryChartProps> = ({ records }) => {
  let totalSpend = 0;
  let discretionarySpend = 0;
  const categoryMap = new Map<string, number>();

  records.forEach((r) => {
    const amt = r.totalAmount || 0;
    totalSpend += amt;
    if (r.category === 'SNACKS_DISCRETIONARY') {
      discretionarySpend += amt;
    }
    const curr = categoryMap.get(r.category) || 0;
    categoryMap.set(r.category, curr + amt);
  });

  if (totalSpend === 0) {
    return (
      <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-2.5 min-h-[260px]">
        <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold text-white">No Grocery Invoices Logged</div>
        <p className="text-xs text-zinc-500 font-mono max-w-sm">
          Add grocery invoices to track categorical provision distribution and pantry budget.
        </p>
      </div>
    );
  }

  const essentialSpend = totalSpend - discretionarySpend;
  const essentialPct = totalSpend > 0 ? (essentialSpend / totalSpend) * 100 : 0;
  const discretionaryPct = totalSpend > 0 ? (discretionarySpend / totalSpend) * 100 : 0;

  const data = Array.from(categoryMap.entries()).map(([cat, amt]) => ({
    name: CATEGORY_LABELS[cat] || cat.replace('_', ' '),
    value: amt,
    color: CATEGORY_COLORS[cat] || '#71717a',
  }));

  return (
    <div className="glass-panel p-5 rounded-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Pantry Category Breakdown
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              Essential Provisions vs. Discretionary Outflow
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-white tabular-nums">
          Total ₹{totalSpend.toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Donut Chart */}
        <div className="sm:col-span-6 h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Essential vs Discretionary Cards */}
        <div className="sm:col-span-6 space-y-2.5 font-mono text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold text-white">Essential Staples</div>
                <div className="text-[10px] text-zinc-400">{essentialPct.toFixed(1)}% of grocery</div>
              </div>
            </div>
            <span className="text-sm font-bold text-emerald-300 tabular-nums">
              ₹{essentialSpend.toFixed(2)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cookie className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-semibold text-white">Discretionary Snacks</div>
                <div className="text-[10px] text-zinc-400">{discretionaryPct.toFixed(1)}% of grocery</div>
              </div>
            </div>
            <span className="text-sm font-bold text-amber-300 tabular-nums">
              ₹{discretionarySpend.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
