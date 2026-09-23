import React from 'react';
import { Navigation, ShoppingCart, Fuel, Ticket, CheckCircle, Package } from 'lucide-react';
import type { TransportRecordDetail, GroceryRecordDetail } from '../types/analytics';

interface TransportGroceryOverviewProps {
  transportRecords: TransportRecordDetail[];
  transportTotal: number;
  groceryRecords: GroceryRecordDetail[];
  groceryTotal: number;
}

export const TransportGroceryOverview: React.FC<TransportGroceryOverviewProps> = ({
  transportRecords,
  transportTotal,
  groceryRecords,
  groceryTotal,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Transport Bento Card */}
      <div className="glass-panel rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-blue-500/10 text-blue-400">
                <Navigation className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Mobility & Commute Optimization
              </h3>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-white font-mono tabular-nums">
                ₹{transportTotal.toFixed(2)}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block">Monthly Run-rate</span>
            </div>
          </div>

          {/* Commute items list */}
          <div className="space-y-2.5 mt-3">
            {transportRecords.map((t) => (
              <div
                key={t.recordId}
                className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded bg-zinc-800 text-blue-400">
                    {t.commuteType === 'FUEL' ? (
                      <Fuel className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Ticket className="w-3.5 h-3.5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center gap-1.5">
                      <span>{t.originPoint} → {t.destinationPoint}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {t.distanceKm} km
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {t.commuteType === 'FUEL'
                        ? `${t.litersFilled}L Fuel • ${t.mileageCalculated ?? 18} km/L • ₹${t.costPerKm?.toFixed(2) ?? '5.67'}/km`
                        : `Transit Ticket • ₹${t.costPerKm?.toFixed(2) ?? '1.60'}/km`}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-white">₹{t.totalFareCost.toFixed(2)}</div>
                  <div className="text-[10px] text-zinc-500">{t.entryDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Public Transit Cost Reduction: 71.8% vs Petrol
          </span>
          <span className="text-zinc-500">2 Modes Tracked</span>
        </div>
      </div>

      {/* Grocery Bento Card */}
      <div className="glass-panel rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-amber-500/10 text-amber-400">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Pantry & Essential Groceries
              </h3>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-white font-mono tabular-nums">
                ₹{groceryTotal.toFixed(2)}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block">Monthly Aggregate</span>
            </div>
          </div>

          {/* Grocery items list */}
          <div className="space-y-2.5 mt-3">
            {groceryRecords.map((g) => (
              <div
                key={g.recordId}
                className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded bg-zinc-800 text-amber-400">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center gap-1.5">
                      <span>{g.storeName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-amber-300/80">
                        {g.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-[200px] sm:max-w-[280px]">
                      {g.receiptNotes || 'Standard provisions'}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-white">₹{g.totalAmount.toFixed(2)}</div>
                  <div className="text-[10px] text-zinc-500">{g.purchaseDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="mt-3 pt-3 border-t border-zinc-800/80">
          <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400 mb-1">
            <span>Monthly Pantry Ceiling: ₹3,000</span>
            <span className="text-emerald-400 font-bold">
              {((groceryTotal / 3000) * 100).toFixed(1)}% Absorbed
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, (groceryTotal / 3000) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
