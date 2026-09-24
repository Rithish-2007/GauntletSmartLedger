import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, ShoppingBag, Smartphone, Flame, Zap, Navigation } from 'lucide-react';
import type { OverviewData } from '../types/analytics';

interface AllocationDonutChartProps {
  overview: OverviewData;
}

const COLORS = [
  '#f59e0b', // Grocery (Amber)
  '#a855f7', // Telecom (Purple)
  '#f97316', // Gas (Orange)
  '#10b981', // Electricity (Emerald)
  '#3b82f6', // Transport (Blue)
];

const ICONS: Record<string, React.ReactNode> = {
  Grocery: <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />,
  Telecom: <Smartphone className="w-3.5 h-3.5 text-purple-400" />,
  Gas: <Flame className="w-3.5 h-3.5 text-orange-400" />,
  Electricity: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
  Transport: <Navigation className="w-3.5 h-3.5 text-blue-400" />,
};

export const AllocationDonutChart: React.FC<AllocationDonutChartProps> = ({ overview }) => {
  const { macro } = overview;

  const totalSpend = macro.totalMonthlySpend;
  const calcPercent = (val: number) => (totalSpend > 0 ? Number(((val / totalSpend) * 100).toFixed(1)) : 0);

  const data = [
    { name: 'Grocery', value: macro.grocerySpend, percent: calcPercent(macro.grocerySpend), color: COLORS[0] },
    { name: 'Telecom', value: macro.telecomSpend, percent: calcPercent(macro.telecomSpend), color: COLORS[1] },
    { name: 'Gas', value: macro.gasSpend, percent: calcPercent(macro.gasSpend), color: COLORS[2] },
    { name: 'Electricity', value: macro.electricitySpend, percent: calcPercent(macro.electricitySpend), color: COLORS[3] },
    { name: 'Transport', value: macro.transportSpend, percent: calcPercent(macro.transportSpend), color: COLORS[4] },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-zinc-950/95 border border-zinc-700/80 p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <div className="text-zinc-300 font-semibold mb-1">{item.name}</div>
          <div className="text-white font-bold">₹{item.value.toFixed(2)}</div>
          <div className="text-zinc-400 text-[11px]">{item.payload.percent}% of total</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-xl p-4 sm:p-5 relative flex flex-col justify-between min-w-0 w-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-purple-400" />
              Capital Allocation Ring
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            Pillar Split
          </span>
        </div>

        {/* Donut chart with centered text */}
        <div className="relative h-48 sm:h-52 w-full my-2 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={86}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Total Run-rate</span>
            <span className="text-xl font-bold text-white font-mono tracking-tight">
              ₹{Math.round(macro.totalMonthlySpend).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Active Cycle</span>
          </div>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/80">
        {data.length === 0 ? (
          <div className="py-4 text-center text-xs text-zinc-500 font-mono">
            Zero active outflows recorded. Ledger is completely clear.
          </div>
        ) : (
          data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-zinc-900 border border-zinc-800">
                  {ICONS[item.name]}
                </span>
                <span className="text-zinc-300 font-medium">{item.name}</span>
              </div>
              <div className="flex items-center space-x-3 font-mono">
                <span className="text-zinc-400 text-[11px]">{item.percent}%</span>
                <span className="text-white font-semibold">₹{item.value.toFixed(0)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
