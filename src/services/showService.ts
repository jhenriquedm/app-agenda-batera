import { db } from '../db/localDatabase';
import { ShowEvent, ShowFilters, ShowStats } from '../types';

export const showService = {
  async getAllShows(): Promise<ShowEvent[]> {
    try {
      const list = await db.shows.toArray();
      // Ordenar por data mais recente / próximos shows primeiro
      return list.sort((a, b) => new Date(a.showDate).getTime() - new Date(b.showDate).getTime());
    } catch (err) {
      console.error('Erro ao obter shows do banco local:', err);
      return [];
    }
  },

  async addShow(show: Omit<ShowEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShowEvent> {
    const newShow: ShowEvent = {
      ...show,
      id: `show-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.shows.add(newShow);
    return newShow;
  },

  async updateShow(id: string, updates: Partial<ShowEvent>): Promise<void> {
    await db.shows.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteShow(id: string): Promise<void> {
    await db.shows.delete(id);
  },

  async toggleCacheStatus(id: string, currentStatus: 'recebido' | 'pendente'): Promise<'recebido' | 'pendente'> {
    const nextStatus = currentStatus === 'recebido' ? 'pendente' : 'recebido';
    await this.updateShow(id, { cacheStatus: nextStatus });
    return nextStatus;
  },

  async setNextShowStatus(id: string, currentStatus: 'pendente' | 'finalizado' | 'cancelado'): Promise<void> {
    let next: 'pendente' | 'finalizado' | 'cancelado' = 'finalizado';
    if (currentStatus === 'pendente') next = 'finalizado';
    else if (currentStatus === 'finalizado') next = 'cancelado';
    else next = 'pendente';

    await this.updateShow(id, { showStatus: next });
  },

  calculateStats(shows: ShowEvent[]): ShowStats {
    let totalCacheExpected = 0;
    let totalCacheReceived = 0;
    let totalCachePending = 0;
    let finishedShows = 0;
    let pendingShows = 0;
    let canceledShows = 0;

    for (const s of shows) {
      // Shows cancelados não somam no cachê previsto/recebido
      if (s.showStatus === 'cancelado') {
        canceledShows++;
        continue;
      }

      totalCacheExpected += s.cacheValue || 0;

      if (s.cacheStatus === 'recebido') {
        totalCacheReceived += s.cacheValue || 0;
      } else {
        totalCachePending += s.cacheValue || 0;
      }

      if (s.showStatus === 'finalizado') {
        finishedShows++;
      } else {
        pendingShows++;
      }
    }

    return {
      totalShows: shows.length,
      totalCacheExpected,
      totalCacheReceived,
      totalCachePending,
      finishedShows,
      pendingShows,
      canceledShows,
    };
  },

  filterShows(shows: ShowEvent[], filters: ShowFilters): ShowEvent[] {
    return shows.filter((item) => {
      // Filtro por Nome do Cantor
      if (filters.singerBand.trim()) {
        const query = filters.singerBand.toLowerCase().trim();
        if (!item.singerBand.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Filtro por Nome do Estabelecimento
      if (filters.venue.trim()) {
        const query = filters.venue.toLowerCase().trim();
        if (!item.venue.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Filtro por Mês/Ano
      if (filters.month > 0 || filters.year > 0) {
        const d = new Date(item.showDate);
        if (filters.month > 0 && d.getMonth() + 1 !== filters.month) {
          return false;
        }
        if (filters.year > 0 && d.getFullYear() !== filters.year) {
          return false;
        }
      }

      // Filtro por Modalidade (Particular ou Barzinho/Restaurante)
      if (filters.modality !== 'todos') {
        if (item.modality !== filters.modality) {
          return false;
        }
      }

      // Filtro por Status de Cachê (Recebido ou Pendente)
      if (filters.cacheStatus !== 'todos') {
        if (item.cacheStatus !== filters.cacheStatus) {
          return false;
        }
      }

      // Filtro por Status do Show (Pendente, Finalizado, Cancelado)
      if (filters.showStatus !== 'todos') {
        if (item.showStatus !== filters.showStatus) {
          return false;
        }
      }

      // Busca geral
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matches =
          item.singerBand.toLowerCase().includes(q) ||
          item.venue.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  },

  getUniqueSingers(shows: ShowEvent[]): string[] {
    const set = new Set<string>();
    shows.forEach((s) => {
      if (s.singerBand?.trim()) set.add(s.singerBand.trim());
    });
    return Array.from(set).sort();
  },

  getUniqueVenues(shows: ShowEvent[]): string[] {
    const set = new Set<string>();
    shows.forEach((s) => {
      if (s.venue?.trim()) set.add(s.venue.trim());
    });
    return Array.from(set).sort();
  },
};
