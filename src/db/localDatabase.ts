import Dexie, { type Table } from 'dexie';
import { ShowEvent, UserProfile } from '../types';
import { INITIAL_SHOWS } from '../data/initialData';

export class BateraAgendaDatabase extends Dexie {
  shows!: Table<ShowEvent, string>;
  userProfile!: Table<UserProfile, string>;

  constructor() {
    super('BateraAgendaDB');
    this.version(1).stores({
      shows: 'id, singerBand, venue, showDate, modality, cacheStatus, showStatus, createdAt',
      userProfile: 'id, email, cpf',
    });
  }
}

export const db = new BateraAgendaDatabase();

/**
 * Inicializa dados se o banco estiver vazio
 */
export async function initializeLocalData() {
  try {
    const count = await db.shows.count();
    if (count === 0) {
      await db.shows.bulkAdd(INITIAL_SHOWS);
    }
  } catch (err) {
    console.warn('Erro ao inicializar banco local Dexie:', err);
  }
}
