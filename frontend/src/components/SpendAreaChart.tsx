import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Layers } from 'lucide-react';
import type { OverviewData } from '../types/analytics';

interface SpendAreaChartProps {
  overview: OverviewData;
}

export const SpendAreaChart: React.FC<SpendAreaChartProps> = ({ overview }) => {
  const [activeMetric, setActiveMetric] = useState<'total' | 'electricity' | 'grocery'>('total');

  const getMonthKey = (dateStr?: string | null) => {
    if (!dateStr || dateStr.length < 7) return '';
    return dateStr.substring(0, 7);
  };

  const calculateMonthSpend = (targetMonth: string) => {
    let elec = 0;
    let gas = 0;
    let tel = 0;
    let tra = 0;
    let gro = 0;

    for (const e of overview.electricity.history) {
      if (getMonthKey(e.billingMonth) === targetMonth || getMonthKey(e.recordDate) === targetMonth) {
        elec += (e.calculatedMyShare || 0);
      }
    }
    for (const g of overview.gas.history) {
      if (getMonthKey(g.connectedDate) === targetMonth || getMonthKey(g.recordDate) === targetMonth) {
        gas += (g.bookingCost || 0);
      }
    }
    if (overview.gas.active && (getMonthKey(overview.gas.active.connectedDate) === targetMonth || getMonthKey(overview.gas.active.recordDate) === targetMonth)) {
      gas += (overview.gas.active.bookingCost || 0);
    }
    for (const t of overview.telecom.records) {
      if (getMonthKey(t.rechargeDate) === targetMonth) {
        tel += (t.planAmount || 0);
      }
    }
    for (const tr of overview.transport.records) {
      if (getMonthKey(tr.entryDate) === targetMonth) {
        tra += (tr.totalFareCost || 0);
      }
    }
    for (const gr of overview.grocery.records) {
      if (getMonthKey(gr.purchaseDate) === targetMonth) {
        gro += (gr.totalAmount || 0);
      }
    }

    const total = elec + gas + tel + tra + gro;
    return {
      total: Math.round(total),
      electricity: Math.round(elec),
      gas: Math.round(gas),
      telecom: Math.round(tel),
      transport: Math.round(tra),
      grocery: Math.round(gro),
    };
  };

  const now = new Date();
  const currentMonthKey = now.toISOString().substring(0, 7);
  const d1 = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = d1.toISOString().substring(0, 7);
  const d2 = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const prevPrevMonthKey = d2.toISOString().substring(0, 7);

  const formatMonthLabel = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const m1Data = calculateMonthSpend(prevPrevMonthKey);
  const m2Data = calculateMonthSpend(prevMonthKey);
  const m3Data = calculateMonthSpend(currentMonthKey);

  const liveTotal = Math.max(m3Data.total, Math.round(overview.macro.totalMonthlySpend));
  const liveElec = Math.max(m3Data.electricity, Math.round(overview.macro.electricitySpend));
  const liveGroc = Math.max(m3Data.grocery, Math.round(overview.macro.grocerySpend));
  const liveGas = Math.max(m3Data.gas, Math.round(overview.macro.gasSpend));
  const liveTel = Math.max(m3Data.telecom, Math.round(overview.macro.telecomSpend));
  const liveTra = Math.max(m3Data.transport, Math.round(overview.macro.transportSpend));

  const trendData = [
    {
      month: formatMonthLabel(d2),
      ...m1Data,
    },
    {
      month: formatMonthLabel(d1),
      ...m2Data,
    },
    {
      month: `${formatMonthLabel(now)} (Live)`,
      total: liveTotal,
      electricity: liveElec,
      grocery: liveGroc,
      gas: liveGas,
      telecom: liveTel,
      transport: liveTra,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950/95 border border-zinc-700/80 p-3 rounded-lg shadow-2xl backdrop-blur-md">
          <div className="text-xs font-semibold text-zinc-300 mb-2 border-b border-zinc-800 pb-1 font-mono">
            {label}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center space-x-4">
              <span className="text-emerald-400 font-medium">Outflow Total:</span>
              <span className="font-mono text-white font-bold">₹{payload[0]?.value?.toLocaleString()}</span>
            </div>
            {payload[0]?.payload?.electricity && (
              <div className="flex justify-between items-center space-x-4 text-[11px] text-zinc-400">
                <span>Electricity Share:</span>
                <span className="font-mono text-zinc-200">₹{payload[0].payload.electricity}</span>
              </div>
            )}
            {payload[0]?.payload?.grocery && (
              <div className="flex justify-between items-center space-x-4 text-[11px] text-zinc-400">
                <span>Pantry Provisions:</span>
                <span className="font-mono text-zinc-200">₹{payload[0].payload.grocery}</span>
              </div>
            )}
            {payload[0]?.payload?.telecom && (
              <div className="flex justify-between items-center space-x-4 text-[11px] text-zinc-400">
                <span>Family Telecom:</span>
                <span className="font-mono text-zinc-200">₹{payload[0].payload.telecom}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-xl p-5 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5 font-sans">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Household Outflow Trajectory
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified Ledger Trend
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 tracking-tight">
            Historical progression verified against database bills & sub-meter readings
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center space-x-1.5 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveMetric('total')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeMetric === 'total'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Consolidated
          </button>
          <button
            onClick={() => setActiveMetric('electricity')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeMetric === 'electricity'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Electricity Share
          </button>
          <button
            onClick={() => setActiveMetric('grocery')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeMetric === 'grocery'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Groceries
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="elecGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="grocGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
            <XAxis
              dataKey="month"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#27272a' }}
              fontFamily="var(--font-mono)"
            />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#27272a' }}
              tickFormatter={(v) => `₹${v}`}
              fontFamily="var(--font-mono)"
            />
            <Tooltip content={<CustomTooltip />} />

            {activeMetric === 'total' && (
              <Area
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#spendGradient)"
                activeDot={{ r: 5, fill: '#10b981', stroke: '#09090b', strokeWidth: 2 }}
              />
            )}
            {activeMetric === 'electricity' && (
              <Area
                type="monotone"
                dataKey="electricity"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#elecGradient)"
                activeDot={{ r: 5, fill: '#06b6d4', stroke: '#09090b', strokeWidth: 2 }}
              />
            )}
            {activeMetric === 'grocery' && (
              <Area
                type="monotone"
                dataKey="grocery"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#grocGradient)"
                activeDot={{ r: 5, fill: '#f59e0b', stroke: '#09090b', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Current Period: <strong className="text-zinc-200 font-mono">₹{liveTotal.toLocaleString('en-IN')}</strong></span>
          </span>
          {m2Data.total > 0 && (
            <>
              <span className="hidden sm:inline text-zinc-600">|</span>
              <span className="hidden sm:inline text-zinc-400">
                {formatMonthLabel(d1)}: <strong className="text-zinc-200 font-mono">₹{m2Data.total.toLocaleString('en-IN')}</strong>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-1 text-zinc-500 font-mono text-[11px]">
          <Layers className="w-3.5 h-3.5" />
          <span>TNEB Multi-Tier Progressive Tariff Strategy</span>
        </div>
      </div>
    </div>
  );
};
