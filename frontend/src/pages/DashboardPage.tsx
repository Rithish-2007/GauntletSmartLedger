import React from 'react';
import { MacroKpiCards } from '../components/MacroKpiCards';
import { SpendAreaChart } from '../components/SpendAreaChart';
import { AllocationDonutChart } from '../components/AllocationDonutChart';
import type { OverviewData } from '../types/analytics';
import { Zap, Flame, Smartphone, Navigation, ShoppingBag, ArrowUpRight, ShieldCheck, Plus } from 'lucide-react';

interface DashboardPageProps {
  overview: OverviewData;
  onNavigate: (page: 'dashboard' | 'electricity' | 'gas' | 'telecom' | 'mobility' | 'pantry') => void;
  onOpenQuickAdd?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ overview, onNavigate, onOpenQuickAdd }) => {
  const { macro, electricity, gas, telecom, transport, grocery } = overview;

  return (
    <div className="space-y-6">
      {/* Title & System Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-zinc-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>EXECUTIVE COMMAND</span>
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Consolidated Multi-Utility Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 font-sans">
            Household Utility Financial Overview
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {onOpenQuickAdd && (
            <button
              onClick={onOpenQuickAdd}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs hover:from-emerald-600 hover:to-teal-700 transition shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer font-mono"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          )}
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-zinc-400 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Non-Linear Slabs</span>
          </div>
        </div>
      </div>

      {/* 1. Macro KPI Bento Cards */}
      <MacroKpiCards overview={overview} />

      {/* 2. Primary Charts Grid (Spend Trajectory & Capital Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-8 min-w-0">
          <SpendAreaChart overview={overview} />
        </div>
        <div className="lg:col-span-4 min-w-0">
          <AllocationDonutChart overview={overview} />
        </div>
      </div>

      {/* 3. Quick-Access Dedicated Utility Modules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-300 font-sans tracking-tight">
            Dedicated Utility Systems
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">Click to inspect deep telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Module 1: Electricity */}
          <button
            onClick={() => onNavigate('electricity')}
            className="glass-panel p-4 rounded-xl text-left group hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Zap className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                Electricity
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                TNEB Sub-Meter split, {electricity.latest?.mySubmeterUnits || 0} kWh share (₹{macro.electricitySpend.toFixed(0)})
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-800/80 text-[10px] font-mono text-cyan-400 font-medium flex items-center justify-between">
              <span>Simulator Ready</span>
              <span>Open →</span>
            </div>
          </button>

          {/* Module 2: Gas */}
          <button
            onClick={() => onNavigate('gas')}
            className="glass-panel p-4 rounded-xl text-left group hover:border-amber-500/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
              </div>
              <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                LPG Gas
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                {gas.active
                  ? `Active cylinder connected (${gas.active.cylinderWeightKg} kg)${gas.forecast?.daysRemaining !== undefined ? ` • ${gas.forecast.daysRemaining} days left` : ''}${gas.forecast?.burnRateKgPerDay ? ` (${gas.forecast.burnRateKgPerDay.toFixed(2)} kg/d)` : ''}`
                  : 'No active cylinder connected • Click to add'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-800/80 text-[10px] font-mono text-amber-400 font-medium flex items-center justify-between">
              <span>Depletion Arc</span>
              <span>Open →</span>
            </div>
          </button>

          {/* Module 3: Telecom */}
          <button
            onClick={() => onNavigate('telecom')}
            className="glass-panel p-4 rounded-xl text-left group hover:border-purple-500/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
              </div>
              <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                Family Telecom
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                {telecom.records.length} active SIM cards, {telecom.expiringSoonCount} expiring soon
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-800/80 text-[10px] font-mono text-purple-400 font-medium flex items-center justify-between">
              <span>Validity Matrix</span>
              <span>Open →</span>
            </div>
          </button>

          {/* Module 4: Mobility */}
          <button
            onClick={() => onNavigate('mobility')}
            className="glass-panel p-4 rounded-xl text-left group hover:border-blue-500/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Navigation className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                Mobility & Fuel
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                {transport.records.length} commute logs, 18.0 km/L mileage (₹{transport.totalMonthlySpend.toFixed(0)})
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-800/80 text-[10px] font-mono text-blue-400 font-medium flex items-center justify-between">
              <span>Mileage Log</span>
              <span>Open →</span>
            </div>
          </button>

          {/* Module 5: Pantry */}
          <button
            onClick={() => onNavigate('pantry')}
            className="glass-panel p-4 rounded-xl text-left group hover:border-amber-500/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
              </div>
              <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                Pantry Provisions
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                {grocery.records.length} receipts, ₹{grocery.totalMonthlySpend.toFixed(0)} of ₹3,000 budget
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-800/80 text-[10px] font-mono text-amber-400 font-medium flex items-center justify-between">
              <span>Receipt Tracker</span>
              <span>Open →</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
