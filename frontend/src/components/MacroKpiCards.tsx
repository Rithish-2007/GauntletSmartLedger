import React from 'react';
import { IndianRupee, Zap, Flame, Smartphone, Navigation, AlertCircle } from 'lucide-react';
import type { OverviewData } from '../types/analytics';

interface MacroKpiCardsProps {
  overview: OverviewData;
}

export const MacroKpiCards: React.FC<MacroKpiCardsProps> = ({ overview }) => {
  const { macro, electricity, gas, telecom, transport } = overview;
  const totalEntries =
    transport.records.length +
    telecom.records.length +
    overview.grocery.records.length +
    electricity.history.length +
    gas.history.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Total Monthly Outflow */}
      <div className="glass-panel rounded-xl p-3.5 sm:p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">Total Household Spend</span>
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight tabular-nums font-mono truncate">
            ₹{macro.totalMonthlySpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className={`font-mono ${macro.totalMonthlySpend > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {macro.totalMonthlySpend > 0 ? 'Live Outflow' : 'No Outflows'}
          </span>
          <span className="text-zinc-500 font-mono">
            {totalEntries > 0 ? `${totalEntries} entries` : 'Empty ledger'}
          </span>
        </div>
      </div>

      {/* 2. Household Electricity */}
      <div className="glass-panel rounded-xl p-3.5 sm:p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">Household Electricity</span>
          <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight tabular-nums font-mono">
            ₹{macro.electricitySpend.toFixed(2)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-cyan-400 font-mono">
            {electricity.latest ? `${electricity.latest.mySubmeterUnits} kWh billed` : '0 kWh'}
          </span>
          <span className="text-zinc-500 font-mono">
            {electricity.latest ? `${electricity.latest.billingMonth}` : 'No bills logged'}
          </span>
        </div>
      </div>

      {/* 3. LPG Cylinder Reserve */}
      <div className="glass-panel rounded-xl p-3.5 sm:p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">LPG Cylinder</span>
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums font-mono ${gas.active ? 'text-white' : 'text-zinc-500'}`}>
            {gas.active
              ? (gas.forecast?.burnRateKgPerDay && gas.forecast.burnRateKgPerDay > 0
                  ? gas.forecast.daysRemaining
                  : `Day ${Math.max(1, Math.floor((new Date().getTime() - new Date(gas.active.connectedDate).getTime()) / (1000 * 3600 * 24)))}`)
              : '0'}
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            {gas.active
              ? (gas.forecast?.burnRateKgPerDay && gas.forecast.burnRateKgPerDay > 0 ? 'Days Left' : 'In-Use')
              : 'Days (None)'}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-amber-400 font-mono">
            {gas.active
              ? (gas.forecast?.burnRateKgPerDay && gas.forecast.burnRateKgPerDay > 0
                  ? `${gas.forecast.burnRateKgPerDay.toFixed(2)} kg/d`
                  : 'Active Cycle')
              : 'No Active Unit'}
          </span>
          <span className="text-zinc-500 font-mono">
            {gas.active ? `${gas.active.cylinderWeightKg} kg` : '0 kg'}
          </span>
        </div>
      </div>

      {/* 4. Family Telecom Matrix */}
      <div className="glass-panel rounded-xl p-3.5 sm:p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all pointer-events-none"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">Family Telecom</span>
          <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
            <Smartphone className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight tabular-nums font-mono">
            {telecom.records.length}
          </span>
          <span className="text-xs text-zinc-400 font-medium">Active Plans</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          {telecom.records.length === 0 ? (
            <span className="text-zinc-500 font-mono">No SIMs registered</span>
          ) : telecom.expiringSoonCount > 0 ? (
            <span className="text-rose-400 font-mono flex items-center">
              <AlertCircle className="w-3 h-3 mr-0.5" /> {telecom.expiringSoonCount} Expiring
            </span>
          ) : (
            <span className="text-emerald-400 font-mono">All Healthy</span>
          )}
          <span className="text-zinc-500 font-mono">₹{macro.telecomSpend.toFixed(2)} /mo</span>
        </div>
      </div>

      {/* 5. Transit & Mobility */}
      <div className="glass-panel rounded-xl p-3.5 sm:p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">Transit & Fuel</span>
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
            <Navigation className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight tabular-nums font-mono">
            ₹{transport.totalMonthlySpend.toFixed(2)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-blue-400 font-mono">
            {transport.records.length} {transport.records.length === 1 ? 'Entry' : 'Entries'}
          </span>
          <span className="text-zinc-500 font-mono">Fuel + Tickets</span>
        </div>
      </div>
    </div>
  );
};
