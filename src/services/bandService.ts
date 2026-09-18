import { db } from '../db/localDatabase';
import { BandArtist, ShowEvent } from '../types';

export const BAND_PALETTE_COLORS = [
  { name: 'Âmbar', hex: '#f59e0b', bgClass: 'bg-amber-500/15', textClass: 'text-amber-400', borderClass: 'border-amber-500/30' },
  { name: 'Esmeralda', hex: '#10b981', bgClass: 'bg-emerald-500/15', textClass: 'text-emerald-400', borderClass: 'border-emerald-500/30' },
  { name: 'Azul', hex: '#3b82f6', bgClass: 'bg-blue-500/15', textClass: 'text-blue-400', borderClass: 'border-blue-500/30' },
  { name: 'Violeta', hex: '#8b5cf6', bgClass: 'bg-purple-500/15', textClass: 'text-purple-400', borderClass: 'border-purple-500/30' },
  { name: 'Rosa', hex: '#ec4899', bgClass: 'bg-pink-500/15', textClass: 'text-pink-400', borderClass: 'border-pink-500/30' },
  { name: 'Laranja', hex: '#f97316', bgClass: 'bg-orange-500/15', textClass: 'text-orange-400', borderClass: 'border-orange-500/30' },
  { name: 'Ciano', hex: '#06b6d4', bgClass: 'bg-cyan-500/15', textClass: 'text-cyan-400', borderClass: 'border-cyan-500/30' },
  { name: 'Índigo', hex: '#6366f1', bgClass: 'bg-indigo-500/15', textClass: 'text-indigo-400', borderClass: 'border-indigo-500/30' },
  { name: 'Teal', hex: '#14b8a6', bgClass: 'bg-teal-500/15', textClass: 'text-teal-400', borderClass: 'border-teal-500/30' },
  { name: 'Vermelho', hex: '#ef4444', bgClass: 'bg-red-500/15', textClass: 'text-red-400', borderClass: 'border-red-500/30' },
];

export const SUGGESTED_GENRES = [
  'Sertanejo',
  'Rock',
  'Pop',
  'Pagode / Samba',
  'Forró / Piseiro',
  'MPB',
  'Gospel',
  'Jazz / Blues',
  'Reggae',
  'Axé',
  'Eletrônico',
  'Outro',
];

export const bandService = {
  async getAllBands(userId?: string): Promise<BandArtist[]> {
    try {
      if (!userId) return [];
      const bands = await db.bands.where('userId').equals(userId).toArray();
      return bands.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    } catch (err) {
      console.error('Erro ao buscar cantores e bandas:', err);
      try {
        if (!userId) return [];
        const all = await db.bands.toArray();
        const filtered = all.filter((b) => b.userId === userId);
        return filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      } catch {
        return [];
      }
    }
  },

  async getBandById(id: string): Promise<BandArtist | undefined> {
    try {
      return await db.bands.get(id);
    } catch (err) {
      console.error('Erro ao buscar cantor/banda por ID:', err);
      return undefined;
    }
  },

  async addBand(
    band: Omit<BandArtist, 'id' | 'createdAt' | 'updatedAt'>,
    userId?: string
  ): Promise<BandArtist> {
    const newBand: BandArtist = {
      ...band,
      userId: userId || band.userId,
      id: `band-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.bands.add(newBand);
    return newBand;
  },

  async updateBand(id: string, updates: Partial<BandArtist>): Promise<void> {
    await db.bands.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteBand(id: string): Promise<void> {
    await db.bands.delete(id);
  },

  /**
   * Calcula resumo de estatísticas de apresentações vinculadas a um cantor/banda
   */
  calculateBandMetrics(bandName: string, shows: ShowEvent[]) {
    const bandShows = shows.filter(
      (s) => s.singerBand.trim().toLowerCase() === bandName.trim().toLowerCase()
    );
    // Show cancelado só entra nas somas se o cachê estiver 'recebido'
    const payableShows = bandShows.filter(
      (s) => s.showStatus !== 'cancelado' || s.cacheStatus === 'recebido'
    );
    const totalGigs = bandShows.length;
    const totalEarnings = payableShows.reduce((acc, s) => acc + (s.cacheValue || 0), 0);
    const receivedEarnings = payableShows
      .filter((s) => s.cacheStatus === 'recebido')
      .reduce((acc, s) => acc + (s.cacheValue || 0), 0);
    const pendingEarnings = payableShows
      .filter((s) => s.cacheStatus === 'pendente')
      .reduce((acc, s) => acc + (s.cacheValue || 0), 0);

    return {
      totalGigs,
      totalEarnings,
      receivedEarnings,
      pendingEarnings,
    };
  },
};
