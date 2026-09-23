import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import type { GasRecordDetail } from '../../types/analytics';
import { Flame, Clock } from 'lucide-react';

interface GasLifespanChartProps {
  history: GasRecordDetail[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      label: string;
      days: number;
      cost: number;
      burnRate: number | string;
      status: string;
    };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl font-mono text-xs space-y-1.5 backdrop-blur-md">
        <div className="font-bold text-white border-b border-zinc-800 pb-1">{data.label}</div>
        <div className="flex justify-between gap-4 text-amber-400">
          <span>Lifespan:</span>
          <span className="font-bold text-white tabular-nums">{data.days} Days</span>
        </div>
        <div className="flex justify-between gap-4 text-zinc-300">
          <span>Cost Paid:</span>
          <span className="font-bold text-white tabular-nums">₹{data.cost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4 text-zinc-400">
          <span>Status:</span>
          <span className={`font-bold tabular-nums ${data.status === 'Active' ? 'text-emerald-400' : 'text-zinc-400'}`}>
            {data.status}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const GasLifespanChart: React.FC<GasLifespanChartProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-2.5 min-h-[260px]">
        <div className="p-3 rounded-full bg-amber-500/10 text-amber-400">
          <Flame className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold text-white">No Cylinder History</div>
        <p className="text-xs text-zinc-500 font-mono max-w-sm">
          Connect your first cylinder to start monitoring lifespan and burn rates.
        </p>
      </div>
    );
  }

  const chartData = [...history]
    .reverse()
    .map((c, i) => {
      let days = 0;
      if (c.finishedDate && c.connectedDate) {
        days = Math.max(
          1,
          Math.floor(
            (new Date(c.finishedDate).getTime() - new Date(c.connectedDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );
      } else if (c.isActive && c.connectedDate) {
        days = Math.max(
          1,
          Math.floor(
            (new Date().getTime() - new Date(c.connectedDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );
      }

      const label = c.isActive
        ? `Cylinder #${i + 1} (In-Use)`
        : `Cylinder #${i + 1}`;

      return {
        label,
        days,
        cost: c.bookingCost,
        burnRate: c.burnRatePerDay ? c.burnRatePerDay.toFixed(3) : 'Active',
        status: c.isActive ? 'Active' : 'Completed',
        isActive: c.isActive,
      };
    });

  return (
    <div className="glass-panel p-5 rounded-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Cylinder Lifespan Comparison
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              Days Lasted per 14.2 kg Cylinder
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span>Active Days Elapsed</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="label" stroke="#71717a" fontSize={10} fontFamily="monospace" />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              fontFamily="monospace"
              tickFormatter={(v) => `${v}d`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="days" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isActive ? '#10b981' : '#f59e0b'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
