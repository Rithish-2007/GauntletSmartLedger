import React, { useEffect, useState } from 'react';
import {
  Zap,
  RefreshCw,
  Download,
  ShieldCheck,
  LayoutDashboard,
  Flame,
  Smartphone,
  Navigation,
  ShoppingBag,
} from 'lucide-react';
import type { UserSummary, PageId } from '../types/analytics';

interface HeaderProps {
  user?: UserSummary;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenQuickAdd: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentPage,
  onNavigate,
  onRefresh,
  isLoading,
  onOpenQuickAdd,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'electricity', label: 'Electricity', icon: <Zap className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'gas', label: 'LPG Gas', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'telecom', label: 'Telecom', icon: <Smartphone className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'mobility', label: 'Mobility', icon: <Navigation className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'pantry', label: 'Pantry', icon: <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> },
  ];

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base tracking-tight text-white font-sans">
                  SmartLedger<span className="text-emerald-400">™</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                  EXECUTIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block tracking-tight">
                Household Utility Intelligence Matrix
              </p>
            </div>
          </div>

          {/* Controls: Quick Add, Refresh, Clock, User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Add Expense Button */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <span className="text-sm leading-none">+</span>
              <span>Add Expense</span>
            </button>

            {/* Live system clock */}
            <div className="hidden md:flex items-center space-x-2 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-zinc-500">UTC:</span>
              <span className="text-zinc-200 font-semibold tabular-nums">{time || '12:00:00'}</span>
            </div>

            {/* Database status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-zinc-900/80 border-zinc-800 text-emerald-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px]">ACTIVE LEDGER</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* PDF Audit Download */}
            <button
              onClick={() => window.print()}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Audit PDF</span>
            </button>

            {/* User profile avatar */}
            <div className="flex items-center space-x-2 pl-2 border-l border-zinc-800">
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200 font-mono">
                {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'RK'}
              </div>
              <div className="hidden xl:block text-left text-xs">
                <div className="font-medium text-zinc-200 leading-tight">{user?.fullName || 'Rithish Kumar'}</div>
                <div className="text-[10px] text-zinc-500 font-mono">Primary Household Lead</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Navigation Bar Row */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none text-xs font-medium border-t border-zinc-800/40 pt-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-800/90 text-white shadow-sm border border-zinc-700/80 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
