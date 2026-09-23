import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { ElectricityRecordDetail } from '../../types/analytics';
import { Zap, TrendingUp } from 'lucide-react';

interface ElectricityTrendChartProps {
  history: ElectricityRecordDetail[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: {
      month: string;
      units: number;
      bill: number;
      rate: number;
    };
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl font-mono text-xs space-y-1.5 backdrop-blur-md">
        <div className="font-bold text-white border-b border-zinc-800 pb-1">{data.month}</div>
        <div className="flex justify-between gap-4 text-cyan-400">
          <span>Units Used:</span>
          <span className="font-bold text-white tabular-nums">{data.units} kWh</span>
        </div>
        <div className="flex justify-between gap-4 text-emerald-400">
          <span>Bill Paid:</span>
          <span className="font-bold text-white tabular-nums">₹{data.bill.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4 text-zinc-400">
          <span>Effective Rate:</span>
          <span className="font-bold text-cyan-300 tabular-nums">₹{data.rate.toFixed(2)}/kWh</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ElectricityTrendChart: React.FC<ElectricityTrendChartProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-2.5 min-h-[260px]">
        <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400">
          <Zap className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold text-white">No Electricity History Recorded</div>
        <p className="text-xs text-zinc-500 font-mono max-w-sm">
          Log your monthly electricity bills to track consumption trends and rate fluctuations.
        </p>
      </div>
    );
  }

  // Reverse so older months appear on left, newer on right
  const chartData = [...history]
    .reverse()
    .map((r) => {
      const units = r.mySubmeterUnits || r.masterEbUnits || 0;
      const bill = r.calculatedMyShare || r.totalEbAmount || 0;
      const rate = units > 0 ? bill / units : 0;
      return {
        month: r.billingMonth,
        units,
        bill,
        rate,
      };
    });

  return (
    <div className="glass-panel p-5 rounded-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Consumption & Bill Trajectory
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              Monthly Units (kWh) vs. Total Bill Amount (₹)
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
            <span>Units (kWh)</span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
            <span>Bill (₹)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="elecBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#0891b2" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="month" stroke="#71717a" fontSize={11} fontFamily="monospace" />
            <YAxis yAxisId="left" stroke="#71717a" fontSize={11} fontFamily="monospace" />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#71717a"
              fontSize={11}
              fontFamily="monospace"
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="left"
              dataKey="units"
              fill="url(#elecBarGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="bill"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#34d399' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
