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
import type { TelecomRecordDetail } from '../../types/analytics';
import { Users, Smartphone } from 'lucide-react';

interface TelecomMemberSpendChartProps {
  records: TelecomRecordDetail[];
}

const COLORS = ['#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      name: string;
      spend: number;
      count: number;
    };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl font-mono text-xs space-y-1.5 backdrop-blur-md">
        <div className="font-bold text-white border-b border-zinc-800 pb-1">{data.name}</div>
        <div className="flex justify-between gap-4 text-purple-400">
          <span>Total Spend:</span>
          <span className="font-bold text-white tabular-nums">₹{data.spend.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4 text-zinc-400">
          <span>Active Plans:</span>
          <span className="font-bold text-zinc-200 tabular-nums">{data.count} SIM(s)</span>
        </div>
      </div>
    );
  }
  return null;
};

export const TelecomMemberSpendChart: React.FC<TelecomMemberSpendChartProps> = ({ records }) => {
  if (!records || records.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-2.5 min-h-[260px]">
        <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
          <Smartphone className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold text-white">No Family Recharges Recorded</div>
        <p className="text-xs text-zinc-500 font-mono max-w-sm">
          Add SIM recharges for your family members to track allocation and validity clocks.
        </p>
      </div>
    );
  }

  // Aggregate spend per member
  const memberMap = new Map<string, { spend: number; count: number }>();
  records.forEach((r) => {
    const name = r.familyMemberName || 'Unassigned';
    const curr = memberMap.get(name) || { spend: 0, count: 0 };
    curr.spend += r.planAmount || 0;
    curr.count += 1;
    memberMap.set(name, curr);
  });

  const chartData = Array.from(memberMap.entries()).map(([name, val]) => ({
    name,
    spend: val.spend,
    count: val.count,
  }));

  // Sort descending by spend
  chartData.sort((a, b) => b.spend - a.spend);

  return (
    <div className="glass-panel p-5 rounded-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Spend by Family Member
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              Total Telecom Commitment Assigned Per Person
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          {chartData.length} Members Tracked
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
            <XAxis
              type="number"
              stroke="#71717a"
              fontSize={11}
              fontFamily="monospace"
              tickFormatter={(v) => `₹${v}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#71717a"
              fontSize={11}
              fontFamily="monospace"
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="spend" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
