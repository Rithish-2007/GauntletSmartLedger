import React, { useState } from 'react';
import { X, Navigation, Fuel, Ticket, CheckCircle2 } from 'lucide-react';
import { addTransportRecord } from '../../services/api';
import type { OverviewData } from '../../types/analytics';

interface AddTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: OverviewData) => void;
}

const VEHICLE_PRESETS = ['Car', 'Bike', 'Scooter'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG'];
const TRANSIT_MODES = ['Bus', 'Train', 'Metro', 'Cab / Auto', 'Flight'];

export const AddTravelModal: React.FC<AddTravelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [activeTab, setActiveTab] = useState<'FUEL' | 'PUBLIC_TICKET'>('FUEL');

  // Fuel Form State
  const [vehicle, setVehicle] = useState('Car');
  const [fuelType, setFuelType] = useState('Petrol');
  const [fuelAmount, setFuelAmount] = useState('300');
  const [fuelDate, setFuelDate] = useState(today);

  // Ticket Form State
  const [passenger, setPassenger] = useState('Self');
  const [route, setRoute] = useState('');
  const [transitMode, setTransitMode] = useState('Train');
  const [ticketFare, setTicketFare] = useState('80');
  const [ticketDate, setTicketDate] = useState(today);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (activeTab === 'FUEL') {
        const amount = parseFloat(fuelAmount) || 0;
        if (amount <= 0) {
          setError('Please enter a valid fuel expense amount.');
          setIsLoading(false);
          return;
        }

        const personLabel = `${vehicle} (${fuelType})`;
        const updated = await addTransportRecord({
          type: 'FUEL',
          personName: personLabel,
          origin: fuelType,
          destination: vehicle,
          totalFare: amount,
          date: fuelDate,
        });
        onSuccess(updated);
        onClose();
      } else {
        const fare = parseFloat(ticketFare) || 0;
        if (fare <= 0) {
          setError('Please enter a valid ticket fare.');
          setIsLoading(false);
          return;
        }
        if (!route.trim()) {
          setError('Please enter the journey or route details (e.g. Metro to Office).');
          setIsLoading(false);
          return;
        }

        const updated = await addTransportRecord({
          type: 'PUBLIC_TICKET',
          personName: passenger.trim(),
          origin: transitMode,
          destination: route.trim(),
          totalFare: fare,
          date: ticketDate,
        });
        onSuccess(updated);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record travel expense.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans tracking-tight">
                Log Travel & Fuel Expense
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Record ticket bookings or everyday fuel fill-ups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Fuel Refill vs Ticket Booking */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('FUEL')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'FUEL'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Fuel className="w-4 h-4 text-amber-400" />
            <span>Fuel Refill</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PUBLIC_TICKET')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'PUBLIC_TICKET'
                ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Ticket className="w-4 h-4 text-blue-400" />
            <span>Ticket Booking</span>
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs font-mono rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'FUEL' ? (
            /* Fuel Mode Inputs */
            <>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Vehicle
                </label>
                <div className="flex gap-2">
                  {VEHICLE_PRESETS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVehicle(v)}
                      className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                        vehicle === v
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder="Other vehicle"
                    className="flex-1 px-3 py-1.5 text-xs font-mono bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Fuel Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FUEL_TYPES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFuelType(f)}
                      className={`py-1.5 text-xs font-mono rounded-lg text-center transition-all ${
                        fuelType === f
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Amount Spent (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    value={fuelAmount}
                    onChange={(e) => setFuelAmount(e.target.value)}
                    placeholder="e.g. 200 or 400"
                    required
                    className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={fuelDate}
                    onChange={(e) => setFuelDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Ticket Mode Inputs */
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    To Whom / Passenger
                  </label>
                  <input
                    type="text"
                    value={passenger}
                    onChange={(e) => setPassenger(e.target.value)}
                    placeholder="e.g. Self, Dad, Mom"
                    required
                    className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Transit Mode
                  </label>
                  <select
                    value={transitMode}
                    onChange={(e) => setTransitMode(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {TRANSIT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Destination / Route / Description
                </label>
                <input
                  type="text"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="e.g. Chennai to Bangalore or Metro to Office"
                  required
                  className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Ticket Fare (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    value={ticketFare}
                    onChange={(e) => setTicketFare(e.target.value)}
                    placeholder="e.g. 80"
                    required
                    className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={ticketDate}
                    onChange={(e) => setTicketDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2 text-xs font-mono font-medium rounded-lg font-bold transition-all disabled:opacity-50 flex items-center space-x-1.5 ${
                activeTab === 'FUEL'
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                  : 'bg-blue-500 hover:bg-blue-400 text-white'
              }`}
            >
              {isLoading ? (
                <span>Recording...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{activeTab === 'FUEL' ? 'Log Fuel Fill-up' : 'Save Ticket Booking'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
