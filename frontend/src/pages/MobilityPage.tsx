import React, { useState } from 'react';
import type { OverviewData } from '../types/analytics';
import { Navigation, Fuel, Ticket, Plus, Trash2, Calendar } from 'lucide-react';
import { TravelSplitChart } from '../components/charts/TravelSplitChart';
import { AddTravelModal } from '../components/modals/AddTravelModal';
import { deleteTransportRecord } from '../services/api';

interface MobilityPageProps {
  overview: OverviewData;
  onRefresh?: () => void;
}

export const MobilityPage: React.FC<MobilityPageProps> = ({ overview, onRefresh }) => {
  const { transport } = overview;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const fuelSpend = transport.records
    .filter((r) => r.commuteType === 'FUEL')
    .reduce((sum, r) => sum + (r.totalFareCost || 0), 0);

  const ticketSpend = transport.records
    .filter((r) => r.commuteType === 'TICKET')
    .reduce((sum, r) => sum + (r.totalFareCost || 0), 0);

  const handleDelete = async (recordId: number) => {
    if (!confirm('Are you sure you want to remove this travel/fuel record?')) return;
    try {
      setIsDeleting(recordId);
      await deleteTransportRecord(recordId);
      onRefresh?.();
    } catch (err) {
      console.error('Failed to delete travel record', err);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-zinc-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Navigation className="w-3 h-3" />
              <span>TRAVEL & FUEL EXPENSES</span>
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Everyday Fuel Fill-ups & Ticket Bookings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 font-sans">
            Travel & Mobility Ledger
          </h1>
        </div>

        {/* Action Button & Quick KPI stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-xs hover:from-blue-600 hover:to-indigo-700 transition shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Travel / Fuel</span>
          </button>
          <div className="bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">TOTAL SPENT</span>
            <span className="text-base font-bold text-white font-mono tabular-nums">
              ₹{transport.totalMonthlySpend.toFixed(2)}
            </span>
          </div>
          <div className="bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">FUEL FILL-UPS</span>
            <span className="text-base font-bold text-amber-400 font-mono tabular-nums">
              ₹{fuelSpend.toFixed(2)}
            </span>
          </div>
          <div className="bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">TICKETS & TRANSIT</span>
            <span className="text-base font-bold text-cyan-400 font-mono tabular-nums">
              ₹{ticketSpend.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Travel Split Chart */}
      <TravelSplitChart records={transport.records} />

      {/* Full Travel & Fuel Ledger */}
      <div className="glass-panel p-5 rounded-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Itemized Commute & Fuel Logs
            </h3>
            <p className="text-xs text-zinc-500">
              Direct entries of petrol, diesel, and tickets booked for family members
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {transport.records.length} Recorded Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[11px]">
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Type</th>
                <th className="pb-2.5">Details</th>
                <th className="pb-2.5">Transit / Fuel Type</th>
                <th className="pb-2.5 text-right">Amount Paid</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {transport.records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono text-xs">
                    No travel or fuel expenses recorded yet. Click "Log Travel / Fuel" to record your first entry.
                  </td>
                </tr>
              ) : (
                transport.records.map((t) => {
                  const isFuel = t.commuteType === 'FUEL';
                  return (
                    <tr key={t.recordId} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{t.entryDate}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold ${
                            isFuel
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {isFuel ? <Fuel className="w-3 h-3" /> : <Ticket className="w-3 h-3" />}
                          {isFuel ? 'FUEL FILL' : 'TICKET'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-white">
                        {isFuel ? (
                          <span>{t.vehicleName || t.originPoint || 'Vehicle'}</span>
                        ) : (
                          <div>
                            <span className="text-white font-semibold">
                              {t.passengerName || t.originPoint || 'Passenger'}
                            </span>
                            {(t.routeDestination || t.destinationPoint) && (
                              <span className="text-zinc-400 text-[11px] block">
                                → {t.routeDestination || t.destinationPoint}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-zinc-400">
                        {isFuel ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]">
                            {t.fuelType || t.destinationPoint || 'Petrol'}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]">
                            {t.transitMode || 'Transit'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-bold text-white tabular-nums text-sm">
                        ₹{t.totalFareCost.toFixed(2)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDelete(t.recordId)}
                          disabled={isDeleting === t.recordId}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                          title="Delete travel record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddTravelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          onRefresh?.();
        }}
      />
    </div>
  );
};
