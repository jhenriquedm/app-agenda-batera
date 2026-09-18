import Dexie, { type Table } from 'dexie';
import { ShowEvent, UserProfile, BandArtist } from '../types';

export class BateraAgendaDatabase extends Dexie {
  shows!: Table<ShowEvent, string>;
  userProfile!: Table<UserProfile, string>;
  bands!: Table<BandArtist, string>;

  constructor() {
    super('BateraAgendaDB');
    this.version(1).stores({
      shows: 'id, singerBand, venue, showDate, modality, cacheStatus, showStatus, createdAt',
      userProfile: 'id, email, cpf',
    });
    this.version(2).stores({
      shows: 'id, singerBand, singerBandId, venue, showDate, modality, cacheStatus, showStatus, createdAt',
      userProfile: 'id, email, cpf',
      bands: 'id, name, genre, createdAt',
    });
    this.version(3).stores({
      shows: 'id, userId, singerBand, singerBandId, venue, showDate, modality, cacheStatus, showStatus, createdAt',
      userProfile: 'id, username, email, cpf',
      bands: 'id, userId, name, genre, createdAt',
    });
  }
}

export const db = new BateraAgendaDatabase();

/**
 * Inicialização e limpeza do banco local.
 * Garante que dados mockados de testes anteriores sejam removidos para manter o app 100% zerado.
 */
export async function initializeLocalData() {
  try {
    // Se existirem shows com IDs antigos mockados ('gig-1'..'gig-5'), removemos para deixar zerado
    const mockIds = ['gig-1', 'gig-2', 'gig-3', 'gig-4', 'gig-5'];
    const existing = await db.shows.where('id').anyOf(mockIds).toArray();
    if (existing.length > 0) {
      await db.shows.bulkDelete(existing.map((s) => s.id));
    }

    // Se houver shows ou bandas antigos sem userId, associamos ao usuário padrão inicial
    const showsWithoutUser = await db.shows.filter((s) => !s.userId).toArray();
    for (const s of showsWithoutUser) {
      await db.shows.update(s.id, { userId: 'user-batera-1' });
    }

    const bandsWithoutUser = await db.bands.filter((b) => !b.userId).toArray();
    for (const b of bandsWithoutUser) {
      await db.bands.update(b.id, { userId: 'user-batera-1' });
    }
  } catch (err) {
    console.warn('Erro ao inicializar banco local Dexie:', err);
  }
}

