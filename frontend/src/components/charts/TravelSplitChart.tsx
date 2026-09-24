import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { TransportRecordDetail } from '../../types/analytics';
import { Navigation, Fuel, Ticket } from 'lucide-react';

interface TravelSplitChartProps {
  records: TransportRecordDetail[];
}

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
        <span className="text-cyan-400 font-bold tabular-nums">₹{data.value.toFixed(2)}</span>
      </div>
    );
  }
  return null;
};

export const TravelSplitChart: React.FC<TravelSplitChartProps> = ({ records }) => {
  let fuelSpend = 0;
  let ticketSpend = 0;

  records.forEach((r) => {
    if (r.commuteType === 'FUEL') {
      fuelSpend += r.totalFareCost || 0;
    } else {
      ticketSpend += r.totalFareCost || 0;
    }
  });

  const total = fuelSpend + ticketSpend;

  if (total === 0) {
    return (
      <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-2.5 min-h-[260px]">
        <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
          <Navigation className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold text-white">No Travel Logs Recorded</div>
        <p className="text-xs text-zinc-500 font-mono max-w-sm">
          Log your vehicle fuel refills or ticket bookings to analyze mobility allocation.
        </p>
      </div>
    );
  }

  const fuelPct = total > 0 ? (fuelSpend / total) * 100 : 0;
  const ticketPct = total > 0 ? (ticketSpend / total) * 100 : 0;

  const data = [
    { name: 'Vehicle Fuel', value: fuelSpend, color: '#f59e0b' },
    { name: 'Ticket Bookings', value: ticketSpend, color: '#3b82f6' },
  ].filter((d) => d.value > 0);

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-xl space-y-4 min-w-0 w-full">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Fuel vs. Ticket Allocation
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              Vehicle Refills compared to Transit Bookings
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-white tabular-nums">
          Total ₹{total.toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center min-w-0">
        {/* Donut Chart */}
        <div className="sm:col-span-6 h-48 w-full min-w-0 flex items-center justify-center">
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

        {/* Legend KPI Cards */}
        <div className="sm:col-span-6 space-y-2.5 font-mono text-xs">
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Fuel className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-semibold text-white">Fuel Fill-ups</div>
                <div className="text-[10px] text-zinc-400">{fuelPct.toFixed(1)}% of total</div>
              </div>
            </div>
            <span className="text-sm font-bold text-amber-300 tabular-nums">
              ₹{fuelSpend.toFixed(2)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket className="w-4 h-4 text-blue-400" />
              <div>
                <div className="font-semibold text-white">Ticket Bookings</div>
                <div className="text-[10px] text-zinc-400">{ticketPct.toFixed(1)}% of total</div>
              </div>
            </div>
            <span className="text-sm font-bold text-blue-300 tabular-nums">
              ₹{ticketSpend.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
