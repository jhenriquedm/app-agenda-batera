import React, { useState, useEffect, useMemo } from 'react';
import { ShowEvent, ShowFilters, UserProfile, BandArtist } from './types';
import { showService } from './services/showService';
import { bandService } from './services/bandService';
import { authService } from './services/authService';
import { db, initializeLocalData } from './db/localDatabase';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { ShowCard } from './components/ShowCard';
import { ShowModal } from './components/ShowModal';
import { BandsModal } from './components/BandsModal';
import { AuthModal } from './components/AuthModal';
import { RecoveryModal } from './components/RecoveryModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ExportSyncModal } from './components/ExportSyncModal';
import { StartupSplash } from './components/StartupSplash';
import { DrumAppIcon } from './components/DrumAppIcon';
import { APP_VERSION } from './version';
import {
  Drum,
  Plus,
  CalendarCheck2,
  Mic,
  SlidersHorizontal,
} from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [shows, setShows] = useState<ShowEvent[]>([]);
  const [bands, setBands] = useState<BandArtist[]>([]);
  const [loading, setLoading] = useState(true);

  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('agenda-batera-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'dark'; // Dark por padrão para o estilo de palco
  });

  // Modals state
  const [isNewShowModalOpen, setIsNewShowModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<ShowEvent | null>(null);
  const [deletingShow, setDeletingShow] = useState<ShowEvent | null>(null);
  const [isBandsModalOpen, setIsBandsModalOpen] = useState(false);
  const [selectedBandForShow, setSelectedBandForShow] = useState<{ name: string; id?: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Quick view tab
  const [activeTab, setActiveTab] = useState<'todos' | 'proximos' | 'pendentes_cache' | 'concluidos'>('todos');

  // Filters state
  const [filters, setFilters] = useState<ShowFilters>({
    singerBand: '',
    venue: '',
    month: 0,
    year: 0,
    modality: 'todos',
    cacheStatus: 'todos',
    showStatus: 'todos',
    searchQuery: '',
  });

  // Apply dark class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('agenda-batera-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initialize DB and load data
  useEffect(() => {
    async function load() {
      try {
        await initializeLocalData();
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Falha ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Reload data when user session changes
  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        setShows([]);
        setBands([]);
        return;
      }
      setLoading(true);
      try {
        const [loadedShows, loadedBands] = await Promise.all([
          showService.getAllShows(user.id),
          bandService.getAllBands(user.id),
        ]);
        setShows(loadedShows);
        setBands(loadedBands);
      } catch (err) {
        console.error('Falha ao carregar dados do usuário:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [user]);

  // Reload shows from Dexie
  const refreshShows = async () => {
    if (!user) return;
    const list = await showService.getAllShows(user.id);
    setShows(list);
  };

  // Reload bands from Dexie
  const refreshBands = async () => {
    if (!user) return;
    const list = await bandService.getAllBands(user.id);
    setBands(list);
  };

  // Handlers for Add/Edit Show
  const handleSaveShow = async (
    data: Omit<ShowEvent, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    if (!user) return;
    if (id) {
      await showService.updateShow(id, data);
    } else {
      await showService.addShow(data, user.id);
    }
    await refreshShows();
  };

  // Handler for Delete
  const handleDeleteConfirm = async (id: string) => {
    await showService.deleteShow(id);
    await refreshShows();
  };

  // Handler for toggle cache status (Recebido <-> Pendente)
  const handleToggleCache = async (id: string, current: 'recebido' | 'pendente') => {
    await showService.toggleCacheStatus(id, current);
    await refreshShows();
  };

  // Handler for cycle show status (Pendente -> Finalizado -> Cancelado -> Pendente)
  const handleCycleShowStatus = async (
    id: string,
    current: 'pendente' | 'finalizado' | 'cancelado'
  ) => {
    await showService.setNextShowStatus(id, current);
    await refreshShows();
  };

  // Import shows from backup
  const handleImportShows = async (imported: ShowEvent[]) => {
    await db.shows.clear();
    await db.shows.bulkAdd(imported);
    await refreshShows();
  };

  // Autocomplete suggestions
  const availableSingers = useMemo(() => showService.getUniqueSingers(shows), [shows]);
  const availableVenues = useMemo(() => showService.getUniqueVenues(shows), [shows]);

  // Tab Filtering combined with user Filters
  const filteredShows = useMemo(() => {
    let list = showService.filterShows(shows, filters);

    if (activeTab === 'proximos') {
      const now = new Date();
      list = list.filter((s) => s.showStatus === 'pendente' && new Date(s.showDate) >= now);
    } else if (activeTab === 'pendentes_cache') {
      list = list.filter((s) => s.cacheStatus === 'pendente' && s.showStatus !== 'cancelado');
    } else if (activeTab === 'concluidos') {
      list = list.filter((s) => s.showStatus === 'finalizado');
    }

    return list;
  }, [shows, filters, activeTab]);

  // Overall and filtered stats
  const stats = useMemo(() => {
    return showService.calculateStats(filteredShows);
  }, [filteredShows]);

  // Inner Application Layout Content (reusable inside Simulator or Full Page)
  const renderAppContent = () => (
    <div className="flex flex-col min-h-screen bg-slate-100/80 dark:bg-slate-950 font-sans text-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Startup Presentation Splash */}
      {showSplash && <StartupSplash onFinish={() => setShowSplash(false)} />}

      {/* 1. Header */}
      <Header
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={() => {
          authService.logout();
          setUser(null);
          setIsAuthModalOpen(true);
        }}
        onOpenBandsModal={() => setIsBandsModalOpen(true)}
        bandsCount={bands.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-3.5 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
        {/* Welcome & Musician Context */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-outfit text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Painel de Shows & Cachês
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Controle rápido de apresentações, datas e recebimentos.
            </p>
          </div>

          {/* Quick Tab Selectors */}
          <div className="flex items-center justify-center gap-1 mx-auto sm:mx-0 w-full sm:w-auto rounded-2xl border border-slate-300 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-1 text-xs sm:text-sm font-bold overflow-x-auto shadow-xs scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('todos')}
              className={`rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 transition whitespace-nowrap ${
                activeTab === 'todos'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Todos ({shows.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('proximos')}
              className={`rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 transition whitespace-nowrap ${
                activeTab === 'proximos'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Próximos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pendentes_cache')}
              className={`rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 transition whitespace-nowrap ${
                activeTab === 'pendentes_cache'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              A Receber
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('concluidos')}
              className={`rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 transition whitespace-nowrap ${
                activeTab === 'concluidos'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Finalizados
            </button>
          </div>
        </div>

        {/* 2. DASHBOARD: Stats Cards */}
        <StatsCards stats={stats} />

        {/* 2.1 Filtros */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          availableSingers={availableSingers}
          availableVenues={availableVenues}
          totalResultsCount={filteredShows.length}
          bands={bands}
        />

        {/* 2.2 Listagem de Eventos - Listagem de Shows */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <h3 className="font-outfit text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Listagem de Shows
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400">
              {filteredShows.length} {filteredShows.length === 1 ? 'evento' : 'eventos'}
            </span>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <Drum className="h-5 w-5 animate-spin text-amber-500" />
                <span>Carregando agenda do baterista...</span>
              </div>
            </div>
          ) : shows.length === 0 ? (
            /* Estado Zerado Inicial */
            <div className="flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-12 px-4 text-center">
              <div className="flex items-center justify-center mb-3">
                <DrumAppIcon size="lg" rounded="rounded-2xl" className="border border-black/80 shadow-md" />
              </div>
              <h4 className="font-outfit text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Sua agenda está zerada e pronta!
              </h4>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                Cadastre seus cantores e bandas parceiros no estilo de categorias ou agende seu primeiro show diretamente.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                <button
                  type="button"
                  id="btn-zero-cadastrar-banda"
                  onClick={() => setIsBandsModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 transition hover:bg-amber-500/20 active:scale-95"
                >
                  <Mic className="h-4 w-4" />
                  <span>Cadastrar Cantor</span>
                </button>
                <button
                  type="button"
                  id="btn-zero-cadastrar-show"
                  onClick={() => {
                    setEditingShow(null);
                    setIsNewShowModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Cadastrar Primeiro Show</span>
                </button>
              </div>
            </div>
          ) : filteredShows.length === 0 ? (
            /* Nenhum show para os filtros selecionados */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-10 px-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nenhum show encontrado para os filtros selecionados.
              </p>
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    singerBand: '',
                    venue: '',
                    month: 0,
                    year: 0,
                    modality: 'todos',
                    cacheStatus: 'todos',
                    showStatus: 'todos',
                    searchQuery: '',
                  })
                }
                className="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div
              id="shows-scroll-container"
              className="max-h-[68vh] overflow-y-auto pr-1 sm:pr-1.5 rounded-2xl"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#f59e0b transparent',
              }}
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {filteredShows.map((show) => {
                  const matchedBand = bands.find(
                    (b) =>
                      (show.singerBandId && b.id === show.singerBandId) ||
                      b.name.toLowerCase().trim() === show.singerBand.toLowerCase().trim()
                  );
                  return (
                    <ShowCard
                      key={show.id}
                      show={show}
                      band={matchedBand}
                      onEdit={(s) => {
                        setEditingShow(s);
                        setIsNewShowModalOpen(true);
                      }}
                      onDelete={(s) => setDeletingShow(s)}
                      onToggleCache={handleToggleCache}
                      onCycleShowStatus={handleCycleShowStatus}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Footer com versão vX.Y.Z */}
        <footer className="pt-6 pb-12 text-center">
          <span className="font-mono text-xs text-slate-400 dark:text-slate-600">
            v{APP_VERSION}
          </span>
        </footer>
      </main>

      {/* Floating Action Button (+) for Quick Access on Mobile */}
      <button
        type="button"
        onClick={() => {
          setEditingShow(null);
          setIsNewShowModalOpen(true);
        }}
        className="fixed bottom-5 right-5 z-40 flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/30 ring-4 ring-white dark:ring-slate-950 transition-all hover:scale-105 active:scale-95"
        title="Cadastrar Novo Show (+)"
      >
        <Plus className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.8]" />
      </button>

      {/* Modals */}
      <ShowModal
        isOpen={isNewShowModalOpen}
        onClose={() => {
          setIsNewShowModalOpen(false);
          setEditingShow(null);
          setSelectedBandForShow(null);
        }}
        onSave={handleSaveShow}
        editingShow={editingShow}
        existingSingers={availableSingers}
        existingVenues={availableVenues}
        bands={bands}
        initialSinger={selectedBandForShow}
        onOpenBandsModal={() => setIsBandsModalOpen(true)}
      />

      <BandsModal
        isOpen={isBandsModalOpen}
        onClose={() => setIsBandsModalOpen(false)}
        bands={bands}
        shows={shows}
        onRefreshBands={refreshBands}
        onSelectBandForShow={(bandName, _defaultCache, bandId) => {
          setSelectedBandForShow({ name: bandName, id: bandId });
          setIsNewShowModalOpen(true);
        }}
        userId={user?.id}
      />

      <DeleteConfirmModal
        isOpen={!!deletingShow}
        show={deletingShow}
        onClose={() => setDeletingShow(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ExportSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        shows={shows}
        onImportShows={handleImportShows}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
        <div className="flex items-center gap-3 text-sm font-bold">
          <Drum className="h-6 w-6 animate-spin text-amber-500" />
          <span>Carregando Agenda do Batera...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 transition-colors duration-200 p-4">
        {isRecoveryModalOpen ? (
          <RecoveryModal
            isOpen={true}
            onClose={() => setIsRecoveryModalOpen(false)}
            onBackToLogin={() => {
              setIsRecoveryModalOpen(false);
              setIsAuthModalOpen(true);
            }}
          />
        ) : (
          <AuthModal
            isOpen={true}
            onClose={() => {}}
            onSuccess={(u) => setUser(u)}
            onOpenRecovery={() => setIsRecoveryModalOpen(true)}
            isFullScreen={true}
          />
        )}
      </div>
    );
  }

  return renderAppContent();
}
