import React, { useState, useMemo } from 'react';
import { Sliders, Zap, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { calculateTraditionalTnebBreakdown } from '../services/api';

export const TraditionalTnebCalculator: React.FC = () => {
  const [units, setUnits] = useState<number>(240);

  const breakdown = useMemo(() => calculateTraditionalTnebBreakdown(units), [units]);

  const handlePreset = (val: number) => {
    setUnits(val);
  };

  return (
    <div className="glass-panel rounded-xl p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800/80 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
              Traditional Domestic TNEB Tariff Calculator
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              Bi-monthly progressive domestic slabs (0–100U Free Subsidy)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setUnits(240)}
            className="flex items-center space-x-1 text-[10px] font-mono px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
            title="Reset slider back to standard 240 kWh"
          >
            <RotateCcw className="w-2.5 h-2.5 text-amber-400" />
            <span>Reset (240U)</span>
          </button>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Real-time Tariff
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Left Column: Interactive Slider & Quick Presets */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Slider */}
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Household Consumption
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-cyan-400 font-mono tabular-nums">
                  {units}
                </span>
                <span className="text-zinc-400 text-xs font-mono">kWh / units</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />

            {/* Slider Markers */}
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0U (₹0)</span>
              <span>100U (Free Tier)</span>
              <span>500U</span>
              <span>1000U</span>
            </div>

            {/* Quick Simulation Presets */}
            <div className="pt-2 border-t border-zinc-800/60">
              <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1.5">
                Quick Simulation Scenarios:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
                <button
                  onClick={() => handlePreset(90)}
                  className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                    units === 90
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="text-[11px]">90 kWh</div>
                  <div className="text-[9px] text-emerald-400">100% Free</div>
                </button>
                <button
                  onClick={() => handlePreset(180)}
                  className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                    units === 180
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="text-[11px]">180 kWh</div>
                  <div className="text-[9px] text-cyan-400">Nominal</div>
                </button>
                <button
                  onClick={() => handlePreset(350)}
                  className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                    units === 350
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="text-[11px]">350 kWh</div>
                  <div className="text-[9px] text-amber-400">Standard</div>
                </button>
                <button
                  onClick={() => handlePreset(650)}
                  className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                    units === 650
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="text-[11px]">650 kWh</div>
                  <div className="text-[9px] text-purple-400">Heavy AC</div>
                </button>
              </div>
            </div>
          </div>

          {/* Progressive Slab Visualizer */}
          <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400 font-medium">
                Progressive Slab Energy Allocation
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                breakdown.category === 'A'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {breakdown.category === 'A' ? 'Tier A (≤ 500U)' : 'Tier B (> 500U)'}
              </span>
            </div>

            {/* Dynamic Energy Bar */}
            <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
              {breakdown.activeSlabs.map((slab) => {
                const pct = Math.min(100, (slab.units / Math.max(1, units)) * 100);
                if (pct <= 0) return null;
                return (
                  <div
                    key={slab.id}
                    style={{ width: `${pct}%` }}
                    className={`${slab.color} transition-all duration-300`}
                    title={`${slab.label}: ${slab.units}U (₹${slab.cost.toFixed(2)})`}
                  />
                );
              })}
            </div>

            {/* Dynamic Legend based on Category */}
            {breakdown.category === 'A' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[10px] font-mono text-zinc-400 pt-1">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>0-100U: Free</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>101-200U: ₹2.35</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>201-400U: ₹4.70</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>401-500U: ₹6.30</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[9px] font-mono text-zinc-400 pt-1">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>0-100U: Free</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>101-400U: ₹4.70</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>401-500U: ₹6.30</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span>501-600U: ₹8.40</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>601-800U: ₹9.45</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>801-1000U: ₹10.50</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>&gt;1000U: ₹11.55</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calculation Outcome Cards */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* Total Estimated Bill */}
            <div className="bg-zinc-900/80 p-3.5 sm:p-4 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-400 font-medium block">
                Estimated TNEB Bill
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                ₹{breakdown.totalBill.toFixed(2)}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                Includes ₹50 Fixed Meter Charge
              </span>
            </div>

            {/* Blended Effective Rate */}
            <div className="bg-zinc-900/80 p-3.5 sm:p-4 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-400 font-medium block">
                Effective Tariff Rate
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums">
                ₹{breakdown.effectiveRate.toFixed(2)}
                <span className="text-xs text-zinc-400 font-normal"> / kWh</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                Blended Average Rate
              </span>
            </div>
          </div>

          {/* Slab Breakdown Card */}
          <div className="bg-gradient-to-r from-cyan-950/20 to-blue-950/20 p-3.5 sm:p-4 rounded-xl border border-cyan-800/30 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Itemized Tariff Slabs
              </span>
              <span className="text-emerald-400 font-bold">
                ₹{breakdown.subsidySavings.toFixed(2)} Govt Subsidy Saved
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-zinc-300 max-h-48 overflow-y-auto pr-1">
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Fixed Meter Charge</span>
                <span className="text-white font-bold">₹{breakdown.fixedCharge.toFixed(2)}</span>
              </div>
              {breakdown.activeSlabs.map((slab) => (
                <div key={slab.id} className="flex flex-wrap justify-between items-center py-1 border-b border-zinc-800/60 gap-1">
                  <span className={slab.id === 'free' ? 'text-emerald-400 font-medium' : 'text-zinc-300'}>
                    {slab.label}
                  </span>
                  <span className={slab.id === 'free' ? 'text-emerald-400 font-bold' : 'text-white font-bold'}>
                    {slab.units}U {slab.rate > 0 ? `@ ₹${slab.rate.toFixed(2)} = ` : '= '}₹{slab.cost.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-1 text-[11px] font-mono text-zinc-400 gap-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{breakdown.categoryLabel}</span>
              </span>
              <span className="text-white font-bold text-sm">
                Total: ₹{breakdown.totalBill.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
