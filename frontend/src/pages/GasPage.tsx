import React, { useState } from 'react';
import { GasDepletionGauge } from '../components/GasDepletionGauge';
import { ConnectGasModal } from '../components/modals/ConnectGasModal';
import { GasLifespanChart } from '../components/charts/GasLifespanChart';
import { finishLpgCylinder, deleteGasRecord, resetLpgData } from '../services/api';
import type { OverviewData } from '../types/analytics';
import {
  Flame,
  Calendar,
  ShieldCheck,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
  Trash2,
  CheckCheck,
} from 'lucide-react';

interface GasPageProps {
  overview: OverviewData;
  onRefresh?: () => void;
}

export const GasPage: React.FC<GasPageProps> = ({ overview, onRefresh }) => {
  const { gas } = overview;
  const active = gas.active;
  const forecast = gas.forecast;

  const [isLoading, setIsLoading] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleMarkEmpty = async () => {
    if (!window.confirm('Mark currently active cylinder as empty today? This will calculate its final lifespan and burn rate.')) return;
    setIsLoading(true);
    setStatusMsg(null);
    try {
      await finishLpgCylinder();
      setStatusMsg('Cylinder marked as empty. Burn rate calculated.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (recordId: number) => {
    if (!window.confirm('Are you sure you want to delete this cylinder record?')) return;
    setDeletingId(recordId);
    try {
      await deleteGasRecord(recordId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetGas = async () => {
    if (!window.confirm('Wipe all LPG cylinder data to fresh ₹0 baseline?')) return;
    setIsLoading(true);
    setStatusMsg(null);
    try {
      await resetLpgData();
      setStatusMsg('LPG data wiped clean to 0.0 fresh baseline.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-zinc-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-3 h-3" />
              <span>THERMODYNAMIC TELEMETRY</span>
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Domestic LPG 14.2 kg Sub-system
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 font-sans">
            LPG Gas Reserve & Depletion Forecast
          </h1>
        </div>

        {/* Quick KPI stats */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono w-full sm:w-auto">
          <div className="flex-1 min-w-[130px] bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">BURN VELOCITY</span>
            <span className="text-base font-bold text-amber-400 font-mono tabular-nums">
              {forecast?.burnRateKgPerDay && forecast.burnRateKgPerDay > 0
                ? `${forecast.burnRateKgPerDay.toFixed(3)} kg/d`
                : active
                ? 'Tracking Cycle'
                : '0.000 kg/d'}
            </span>
          </div>
          <div className="flex-1 min-w-[130px] bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">{forecast?.burnRateKgPerDay && forecast.burnRateKgPerDay > 0 ? 'EST. DEPLETION' : 'STATUS'}</span>
            <span className="text-base font-bold text-white font-mono">
              {forecast?.burnRateKgPerDay && forecast.burnRateKgPerDay > 0
                ? (forecast.predictedDepletionDate || 'Calculating...')
                : active
                ? `Active (Conn: ${active.connectedDate})`
                : 'Offline'}
            </span>
          </div>
          <button
            onClick={() => setShowConnectModal(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Connect Cylinder</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Lifespan Comparison Interactive Chart */}
      <GasLifespanChart history={gas.history} />

      {/* Main Grid: Gauge on Left + History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Depletion Arc Gauge & Cylinder Operations */}
        <div className="lg:col-span-5 space-y-4">
          <GasDepletionGauge active={active} forecast={forecast} />

          {/* Cylinder Management Panel */}
          <div className="glass-panel p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <span className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5 font-sans">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Cylinder Operations
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {active ? 'Status: Active In-Use' : 'Status: Empty / None'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowConnectModal(true)}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold font-mono transition-all cursor-pointer disabled:opacity-50"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{active ? 'Connect Next Cylinder' : 'Connect Cylinder'}</span>
              </button>

              {active && (
                <button
                  onClick={handleMarkEmpty}
                  disabled={isLoading}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-medium transition-all cursor-pointer disabled:opacity-50"
                  title="Mark cylinder as empty today"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark Empty Today</span>
                </button>
              )}

              <button
                onClick={handleResetGas}
                disabled={isLoading}
                className="flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-mono transition-all cursor-pointer disabled:opacity-50"
                title="Wipe LPG data and return to fresh zero"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset 0</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Specs & History Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cylinder Specifications Card */}
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800/80 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Cylinder Hardware & Calibration Standards
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">NET LPG WEIGHT</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {active?.cylinderWeightKg ? `${active.cylinderWeightKg.toFixed(1)} kg` : '14.2 kg'}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Domestic Spec</span>
              </div>
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">
                  {forecast?.burnRateKgPerDay && forecast.burnRateKgPerDay > 0 ? 'DAYS REMAINING' : 'LIFECYCLE STATUS'}
                </span>
                <span className={`text-lg font-bold tabular-nums ${(forecast?.daysRemaining ?? 0) <= 5 && (forecast?.burnRateKgPerDay ?? 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {forecast?.burnRateKgPerDay && forecast.burnRateKgPerDay > 0
                    ? `${forecast.daysRemaining} Days`
                    : active
                    ? 'Active In-Use'
                    : 'Offline'}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  {forecast?.burnRateKgPerDay && forecast.burnRateKgPerDay > 0
                    ? (forecast.daysRemaining <= 5 ? 'Refill Recommended' : 'Optimal Reserve')
                    : active
                    ? `Connected ${active.connectedDate}`
                    : 'No Active Cylinder'}
                </span>
              </div>
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">CYLINDER COST</span>
                <span className="text-lg font-bold text-amber-400 tabular-nums">
                  ₹{active?.bookingCost ? active.bookingCost.toFixed(2) : '0.00'}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Current Rate</span>
              </div>
            </div>
          </div>

          {/* Lifecycle & Consumption History Table */}
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Cylinder Historical Lifespan Log
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {gas.history.length} Cylinder(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[11px]">
                    <th className="pb-2">Connected</th>
                    <th className="pb-2">Finished</th>
                    <th className="pb-2">Cost</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {gas.history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-zinc-500 font-mono text-xs">
                        No cylinder history logged. Click "Connect Cylinder" above.
                      </td>
                    </tr>
                  ) : (
                    gas.history.map((rec) => (
                      <tr key={rec.recordId} className="hover:bg-zinc-900/40">
                        <td className="py-2.5 font-semibold text-white">{rec.connectedDate}</td>
                        <td className="py-2.5 text-zinc-400">{rec.finishedDate || 'In-Use'}</td>
                        <td className="py-2.5 font-bold text-white">₹{rec.bookingCost.toFixed(2)}</td>
                        <td className="py-2.5">
                          {rec.isActive ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                              EXHAUSTED
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleDelete(rec.recordId)}
                            disabled={deletingId === rec.recordId}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete cylinder record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      <ConnectGasModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};
