import { Smartphone, Signal, AlertCircle, CheckCircle2, Wifi, ExternalLink, Trash2 } from 'lucide-react';
import type { TelecomRecordDetail } from '../types/analytics';

interface TelecomMatrixProps {
  records: TelecomRecordDetail[];
  onDelete?: (recordId: number) => void;
}

export const TelecomMatrix: React.FC<TelecomMatrixProps> = ({ records, onDelete }) => {
  const today = new Date();

  const getDaysLeft = (expiryDateStr: string) => {
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getOperatorBadge = (operator: string) => {
    switch (operator.toUpperCase()) {
      case 'JIO':
        return {
          bg: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-500',
        };
      case 'AIRTEL':
        return {
          bg: 'bg-rose-600/20 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-500',
        };
      case 'BSNL':
        return {
          bg: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
        };
      default:
        return {
          bg: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
          dot: 'bg-purple-500',
        };
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 relative flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Family Telecom Validity Matrix
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            {records.length} SIM Cards
          </span>
        </div>

        {/* Matrix list */}
        <div className="space-y-3 mt-4">
          {records.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 font-mono text-xs">
              No family SIM records registered. All connectivity lines clear.
            </div>
          ) : (
            records.map((sim) => {
            const daysLeft = getDaysLeft(sim.expiryDate);
            const isExpired = daysLeft <= 0;
            const isCritical = daysLeft > 0 && daysLeft <= 5;
            const badge = getOperatorBadge(sim.serviceProvider);

            const progressPct = Math.max(
              0,
              Math.min(100, (daysLeft / Math.max(sim.validityDays, 1)) * 100)
            );

            return (
              <div
                key={sim.recordId}
                className="bg-zinc-900/50 hover:bg-zinc-900/80 p-3.5 rounded-lg border border-zinc-800/80 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-xs tracking-tight">
                      {sim.familyMemberName}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.bg}`}
                    >
                      {sim.serviceProvider}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {isExpired ? (
                    <span className="flex items-center space-x-1 text-[10px] font-mono font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      <AlertCircle className="w-3 h-3" />
                      <span>EXPIRED</span>
                    </span>
                  ) : isCritical ? (
                    <span className="flex items-center space-x-1 text-[10px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      <span>EXPIRING SOON</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ACTIVE</span>
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExpired ? 'bg-rose-500' : isCritical ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Details Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-400 font-mono gap-1.5">
                  <span className="flex items-center space-x-1">
                    <Wifi className="w-3 h-3 text-zinc-500" />
                    <span>Plan: ₹{sim.planAmount} ({sim.validityDays}d)</span>
                  </span>
                  <div className="flex items-center justify-between sm:justify-end space-x-3">
                    <span>
                      {isExpired ? (
                        <span className="text-rose-400">Recharge Due</span>
                      ) : (
                        <span>
                          <strong className="text-white font-bold">{daysLeft}</strong> days left ({sim.expiryDate})
                        </span>
                      )}
                    </span>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(sim.recordId)}
                        className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                        title="Delete recharge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 gap-1.5">
        <span className="flex items-center space-x-1 text-[11px] font-mono text-zinc-500">
          <Signal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Automated Validity Watchdog Active</span>
        </span>
        <a
          href="https://www.jio.com"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
        >
          <span>Quick Gateway</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
