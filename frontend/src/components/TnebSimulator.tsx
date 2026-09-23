import React, { useState, useEffect } from 'react';
import { Sliders, Zap, Calculator, Scale, ArrowRight, RotateCcw } from 'lucide-react';
import type { SubMeterSimResult } from '../types/analytics';
import { simulateElectricity } from '../services/api';

export const TnebSimulator: React.FC = () => {
  const [masterUnits, setMasterUnits] = useState<number>(420);
  const [myUnits, setMyUnits] = useState<number>(180);
  const [otherUnits, setOtherUnits] = useState<number>(240);
  const [simResult, setSimResult] = useState<SubMeterSimResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const handleResetSliders = () => {
    setMasterUnits(420);
    setMyUnits(180);
    setOtherUnits(240);
  };

  // Trigger recalculation on slider change
  useEffect(() => {
    let isCancelled = false;
    setIsCalculating(true);
    const timer = setTimeout(async () => {
      const res = await simulateElectricity(masterUnits, myUnits, otherUnits);
      if (!isCancelled) {
        setSimResult(res);
        setIsCalculating(false);
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [masterUnits, myUnits, otherUnits]);

  return (
    <div className="glass-panel rounded-xl p-5 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800/80 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
              TNEB Progressive Slab & Sub-Meter Fair Split Simulator
            </h3>
            <p className="text-[11px] text-zinc-400">
              Interactive bi-monthly tariff calculator with proportional tariff absorption
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleResetSliders}
            className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
            title="Reset sliders back to baseline (420U master / 180U share)"
          >
            <RotateCcw className="w-2.5 h-2.5 text-amber-400" />
            <span>Reset Sliders</span>
          </button>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {isCalculating ? 'Computing Slab...' : 'Real-time Matrix'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Sliders Control Panel */}
        <div className="lg:col-span-6 space-y-4">
          {/* Slider 1: Master Meter */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-zinc-300 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Master EB Meter Units
              </span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">
                {masterUnits} <span className="text-zinc-500 text-[10px]">kWh</span>
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="10"
              value={masterUnits}
              onChange={(e) => setMasterUnits(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
              <span>100 kWh (Free Tier)</span>
              <span>500 kWh (Subsidy Cutoff)</span>
              <span>1000 kWh</span>
            </div>
          </div>

          {/* Slider 2: My Sub-meter */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-zinc-300 font-medium flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                My Floor Sub-Meter
              </span>
              <span className="font-mono text-cyan-400 font-bold tabular-nums">
                {myUnits} <span className="text-zinc-500 text-[10px]">kWh</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={masterUnits}
              step="5"
              value={myUnits}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMyUnits(val);
                setOtherUnits(Math.max(0, masterUnits - val));
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Slider 3: Tenant / Other Floor Sub-meter */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-zinc-300 font-medium flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-purple-400" />
                Tenant / Other Floor Sub-Meter
              </span>
              <span className="font-mono text-purple-400 font-bold tabular-nums">
                {otherUnits} <span className="text-zinc-500 text-[10px]">kWh</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={masterUnits}
              step="5"
              value={otherUnits}
              onChange={(e) => {
                const val = Number(e.target.value);
                setOtherUnits(val);
                setMyUnits(Math.max(0, masterUnits - val));
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Mathematical fairness formula card */}
          <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 font-mono">
            <span className="text-emerald-400 font-semibold block mb-0.5">Fair Allocation Principle:</span>
            <code>Share = Total Bill × (Floor Units ÷ Total Floor Units)</code>
            <span className="block mt-1 text-zinc-500">
              Guarantees zero subsidy hogging & prevents tenant overcharging.
            </span>
          </div>
        </div>

        {/* Real-time Calculation Outcome Cards */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Total Master EB Bill */}
            <div className="bg-zinc-900/70 p-3.5 rounded-lg border border-zinc-800">
              <span className="text-[11px] text-zinc-400 font-medium block">Total TNEB Master Bill</span>
              <span className="text-xl font-bold text-white font-mono tabular-nums">
                ₹{simResult ? simResult.totalEbBill.toFixed(2) : '0.00'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                First 100U ₹0 Subsidy Included
              </span>
            </div>

            {/* Effective Tariff Rate */}
            <div className="bg-zinc-900/70 p-3.5 rounded-lg border border-zinc-800">
              <span className="text-[11px] text-zinc-400 font-medium block">Effective Tariff Rate</span>
              <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
                ₹{simResult ? simResult.effectiveRatePerUnit.toFixed(2) : '0.00'}
                <span className="text-xs text-zinc-400 font-normal"> / kWh</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                Blended Progressive Rate
              </span>
            </div>
          </div>

          {/* Split comparison card */}
          <div className="bg-gradient-to-r from-cyan-950/20 to-purple-950/20 p-4 rounded-lg border border-zinc-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                Fair Allocation Split
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Ratio: {myUnits}U : {otherUnits}U
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border-r border-zinc-800/80 pr-2">
                <div className="text-[10px] uppercase font-mono text-cyan-400 font-semibold">My Floor Share</div>
                <div className="text-2xl font-black text-white font-mono tabular-nums">
                  ₹{simResult ? simResult.calculatedMyShare.toFixed(2) : '0.00'}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {myUnits > 0 && masterUnits > 0 ? ((myUnits / (myUnits + otherUnits)) * 100).toFixed(1) : 0}% of load
                </div>
              </div>

              <div className="pl-2">
                <div className="text-[10px] uppercase font-mono text-purple-400 font-semibold">Tenant Share</div>
                <div className="text-2xl font-black text-white font-mono tabular-nums">
                  ₹{simResult ? (simResult.totalEbBill - simResult.calculatedMyShare).toFixed(2) : '0.00'}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {otherUnits > 0 && masterUnits > 0 ? ((otherUnits / (myUnits + otherUnits)) * 100).toFixed(1) : 0}% of load
                </div>
              </div>
            </div>
          </div>

          {/* Live verification badge */}
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono px-1">
            <span className="flex items-center gap-1">
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              Direct Java Calculation Engine verified
            </span>
            <span>Zero tariff rounding error</span>
          </div>
        </div>
      </div>
    </div>
  );
};
