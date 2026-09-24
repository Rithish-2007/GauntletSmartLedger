import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { ElectricityPage } from './pages/ElectricityPage';
import { GasPage } from './pages/GasPage';
import { TelecomPage } from './pages/TelecomPage';
import { MobilityPage } from './pages/MobilityPage';
import { PantryPage } from './pages/PantryPage';
import { AuthPage } from './pages/AuthPage';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { ResetDataModal } from './components/modals/ResetDataModal';
import { fetchOverview, fetchCurrentUser, logoutUser, getStoredUser } from './services/api';
import type { OverviewData, PageId, UserSummary } from './types/analytics';
import { Shield, Cpu, ExternalLink, Zap } from 'lucide-react';

const VALID_PAGES: Record<string, PageId> = {
  '': 'dashboard',
  'dashboard': 'dashboard',
  'electricity': 'electricity',
  'gas': 'gas',
  'telecom': 'telecom',
  'mobility': 'mobility',
  'transport': 'mobility',
  'pantry': 'pantry',
  'grocery': 'pantry',
};

function getPageFromUrl(): PageId {
  if (typeof window === 'undefined') return 'dashboard';
  if (window.location.hash) {
    const hashClean = window.location.hash.replace(/^#[/]?/, '').toLowerCase();
    if (VALID_PAGES[hashClean]) return VALID_PAGES[hashClean];
  }
  const pathClean = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
  if (VALID_PAGES[pathClean]) return VALID_PAGES[pathClean];
  return 'dashboard';
}

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(() => getStoredUser());
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<PageId>(() => getPageFromUrl());
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    try {
      const targetPath = page === 'dashboard' ? '/' : `/${page}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ page }, '', targetPath);
      }
    } catch {
      // Safe fallback
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const result = await fetchOverview();
    setOverview(result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    // Initial verification of user session
    const checkAuthAndLoad = async () => {
      const user = await fetchCurrentUser();
      if (user) {
        setCurrentUser(user);
        await loadData();
      } else {
        setIsLoading(false);
      }
    };
    checkAuthAndLoad();
  }, []);

  const handleAuthSuccess = async (user: UserSummary) => {
    setCurrentUser(user);
    await loadData();
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setOverview(null);
  };

  // If user is not authenticated, display the Login / Register AuthPage
  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3 font-mono text-sm text-zinc-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Synchronizing Household Command Console...</span>
        </div>
      </div>
    );
  }

  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans relative">
      {/* Executive Persistent Header with Page Navigation */}
      <Header
        user={currentUser || overview.user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onRefresh={loadData}
        isLoading={isLoading}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Dynamic Page Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentPage === 'dashboard' && (
          <DashboardPage
            overview={overview}
            onNavigate={handleNavigate}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}
        {currentPage === 'electricity' && (
          <ElectricityPage overview={overview} onRefresh={loadData} />
        )}
        {currentPage === 'gas' && (
          <GasPage overview={overview} onRefresh={loadData} />
        )}
        {currentPage === 'telecom' && (
          <TelecomPage overview={overview} onRefresh={loadData} />
        )}
        {currentPage === 'mobility' && (
          <MobilityPage overview={overview} onRefresh={loadData} />
        )}
        {currentPage === 'pantry' && (
          <PantryPage overview={overview} onRefresh={loadData} />
        )}
      </main>

      {/* Universal Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          setIsQuickAddOpen(false);
          loadData();
        }}
      />

      {/* Universal Reset Data Modal */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSuccess={(updated) => {
          setOverview(updated);
          setIsResetModalOpen(false);
        }}
      />

      {/* Institutional Executive Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/80 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <span>GauntletSmartLedger Autonomous Architecture • Institutional Edition</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              <span>Spring Boot 3.3.4 (H2 Database)</span>
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>React 19 + Recharts + Geist</span>
            </span>
            <a
              href={isLocalHost ? 'http://localhost:8080/dashboard' : '#'}
              onClick={(e) => {
                if (!isLocalHost) {
                  e.preventDefault();
                  handleNavigate('dashboard');
                }
              }}
              target={isLocalHost ? '_blank' : undefined}
              rel="noreferrer"
              className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>{isLocalHost ? 'Thymeleaf Legacy' : 'Hub Console'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
