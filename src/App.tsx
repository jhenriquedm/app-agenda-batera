import React, { useState, useEffect, useMemo } from 'react';
import { ShowEvent, ShowFilters, UserProfile } from './types';
import { showService } from './services/showService';
import { authService } from './services/authService';
import { db, initializeLocalData } from './db/localDatabase';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { ShowCard } from './components/ShowCard';
import { ShowModal } from './components/ShowModal';
import { AuthModal } from './components/AuthModal';
import { RecoveryModal } from './components/RecoveryModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ExportSyncModal } from './components/ExportSyncModal';
import {
  Drum,
  Plus,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Music,
  CheckCircle2,
  CalendarCheck2,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [shows, setShows] = useState<ShowEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isNewShowModalOpen, setIsNewShowModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<ShowEvent | null>(null);
  const [deletingShow, setDeletingShow] = useState<ShowEvent | null>(null);
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

  // Initialize DB and load shows
  useEffect(() => {
    async function load() {
      try {
        await initializeLocalData();
        const loadedShows = await showService.getAllShows();
        setShows(loadedShows);
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

  // Reload shows from Dexie
  const refreshShows = async () => {
    const list = await showService.getAllShows();
    setShows(list);
  };

  // Handlers for Add/Edit
  const handleSaveShow = async (
    data: Omit<ShowEvent, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    if (id) {
      await showService.updateShow(id, data);
    } else {
      await showService.addShow(data);
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

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Header */}
      <Header
        user={user}
        onOpenNewShowModal={() => {
          setEditingShow(null);
          setIsNewShowModalOpen(true);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={() => {
          authService.logout();
          setUser(null);
        }}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Welcome & Musician Context */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-outfit text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Painel de Shows & Cachês
            </h2>
            <p className="text-sm text-slate-400">
              Gerencie suas apresentações com múltiplos cantores, bares e eventos particulares.
            </p>
          </div>

          {/* Quick Tab Selectors */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('todos')}
              className={`rounded-xl px-3 py-1.5 transition ${
                activeTab === 'todos'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({shows.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('proximos')}
              className={`rounded-xl px-3 py-1.5 transition ${
                activeTab === 'proximos'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Próximos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pendentes_cache')}
              className={`rounded-xl px-3 py-1.5 transition ${
                activeTab === 'pendentes_cache'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              A Receber ⏳
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('concluidos')}
              className={`rounded-xl px-3 py-1.5 transition ${
                activeTab === 'concluidos'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Finalizados ✅
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
        />

        {/* 2.2 Listagem de Eventos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5 text-amber-400" />
              <h3 className="font-outfit text-lg font-bold text-white">
                Grade de Apresentações
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Exibindo {filteredShows.length} de {shows.length} eventos cadastrados
            </span>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Drum className="h-6 w-6 animate-spin text-amber-400" />
                <span>Carregando agenda do baterista...</span>
              </div>
            </div>
          ) : filteredShows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 py-16 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 text-amber-400 ring-1 ring-slate-700 mb-4">
                <Drum className="h-8 w-8" />
              </div>
              <h4 className="font-outfit text-base font-bold text-white sm:text-lg">
                Nenhum show encontrado para os filtros selecionados
              </h4>
              <p className="mt-1 max-w-md text-xs text-slate-400 sm:text-sm">
                Tente ajustar seus filtros de busca ou cadastre uma nova apresentação na sua agenda.
              </p>
              <div className="mt-5 flex gap-3">
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
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-850"
                >
                  Limpar Filtros
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingShow(null);
                    setIsNewShowModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:from-amber-400 hover:to-amber-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>Cadastrar Novo Show</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredShows.map((show) => (
                <ShowCard
                  key={show.id}
                  show={show}
                  onEdit={(s) => {
                    setEditingShow(s);
                    setIsNewShowModalOpen(true);
                  }}
                  onDelete={(s) => setDeletingShow(s)}
                  onToggleCache={handleToggleCache}
                  onCycleShowStatus={handleCycleShowStatus}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 3. Floating Action Button (+) for Mobile / Quick Access */}
      <button
        type="button"
        onClick={() => {
          setEditingShow(null);
          setIsNewShowModalOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/30 ring-4 ring-slate-950 transition-all hover:scale-105 active:scale-95"
        title="Cadastrar Novo Show (+)"
      >
        <Plus className="h-7 w-7 stroke-[2.8]" />
      </button>

      {/* Modals */}
      {/* 3. Modal de Cadastro/Edição de Show */}
      <ShowModal
        isOpen={isNewShowModalOpen}
        onClose={() => {
          setIsNewShowModalOpen(false);
          setEditingShow(null);
        }}
        onSave={handleSaveShow}
        editingShow={editingShow}
        existingSingers={availableSingers}
        existingVenues={availableVenues}
      />

      {/* 1. Modal de Login e Cadastro (Local & Firebase Nuvem) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => setUser(u)}
        onOpenRecovery={() => setIsRecoveryModalOpen(true)}
      />

      {/* 4. Modal de Recuperação de Senha (CPF ou E-mail) */}
      <RecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        onBackToLogin={() => {
          setIsRecoveryModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal
        isOpen={!!deletingShow}
        show={deletingShow}
        onClose={() => setDeletingShow(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Modal de Sincronização & Exportação */}
      <ExportSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        shows={shows}
        onImportShows={handleImportShows}
      />
    </div>
  );
}
