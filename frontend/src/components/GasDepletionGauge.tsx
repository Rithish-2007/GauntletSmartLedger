import React from 'react';
import { Flame, Clock, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { GasForecast, GasRecordDetail } from '../types/analytics';

interface GasDepletionGaugeProps {
  active?: GasRecordDetail;
  forecast?: GasForecast;
}

export const GasDepletionGauge: React.FC<GasDepletionGaugeProps> = ({ active, forecast }) => {
  const isPresent = Boolean(active);
  const daysLeft = isPresent ? (forecast?.daysRemaining ?? 0) : 0;
  const pctRemaining = isPresent ? (forecast?.percentageRemaining ?? 0) : 0;
  const burnRate = isPresent ? (forecast?.burnRateKgPerDay ?? 0) : 0;

  // SVG Circular Gauge calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  // Arc covering 240 degrees (top open)
  const strokeDashoffset = isPresent
    ? circumference - (circumference * Math.min(100, Math.max(0, pctRemaining))) / 100
    : circumference;

  const isLow = isPresent && daysLeft <= 5;

  return (
    <div className="glass-panel rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient glow */}
      <div
        className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
          !isPresent ? 'bg-zinc-800/10' : isLow ? 'bg-rose-500/10' : 'bg-amber-500/10'
        }`}
      />

      <div>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
              <Flame
                className={`w-4 h-4 ${
                  !isPresent ? 'text-zinc-500' : isLow ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                }`}
              />
              Thermodynamic LPG Depletion Arc
            </h3>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              !isPresent
                ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60'
                : isLow
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {!isPresent ? 'NO ACTIVE CYLINDER' : isLow ? 'REFILL REQUIRED' : 'NOMINAL FLUX'}
          </span>
        </div>

        {/* Circular SVG Gauge */}
        <div className="relative flex items-center justify-center my-4">
          <svg className="w-44 h-44 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-zinc-800/80 fill-none"
            />
            {/* Progress Arc */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`fill-none transition-all duration-1000 ease-out ${
                !isPresent ? 'text-zinc-700' : isLow ? 'text-rose-500' : 'text-amber-400'
              }`}
            />
          </svg>

          {/* Centered Gauge Metrics */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              {daysLeft}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">
              {isPresent ? 'Days Remaining' : 'Days (Offline)'}
            </span>
            <span
              className={`text-[10px] font-mono mt-0.5 px-1.5 py-0.5 rounded ${
                !isPresent
                  ? 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                  : isLow
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {pctRemaining.toFixed(1)}% Capacity
            </span>
          </div>
        </div>
      </div>

      {/* Thermodynamic Parameters Grid */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-800/80 text-xs">
        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
          <div className="flex items-center space-x-1.5 text-zinc-400 mb-1">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Burn Velocity</span>
          </div>
          <div className="text-sm font-bold text-white font-mono tabular-nums">
            {burnRate > 0 ? (
              <>
                {burnRate.toFixed(3)} <span className="text-[10px] text-zinc-400 font-normal">kg/day</span>
              </>
            ) : (
              <span className="text-zinc-500 font-mono text-xs">0.000 kg/day</span>
            )}
          </div>
        </div>

        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
          <div className="flex items-center space-x-1.5 text-zinc-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Depletion Date</span>
          </div>
          <div className="text-xs font-bold text-zinc-200 font-mono">
            {isPresent ? (forecast?.predictedDepletionDate || 'Calculating...') : 'None (Offline)'}
          </div>
        </div>
      </div>

      {/* Advisory Alert Banner */}
      <div
        className={`mt-3 p-2.5 rounded-lg border flex items-center space-x-2 text-xs ${
          !isPresent
            ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
            : isLow
            ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
        }`}
      >
        {!isPresent ? (
          <>
            <Flame className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>No cylinder active. Connect a cylinder below or activate 14.2 kg fresh unit.</span>
          </>
        ) : isLow ? (
          <>
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Refill alert active. Trigger Indane/HP gas booking immediately.</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Thermodynamic reserve healthy. Connected: {active?.connectedDate}.</span>
          </>
        )}
      </div>
    </div>
  );
};
