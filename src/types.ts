export type ModalityType = 'Particular' | 'Barzinho/Restaurante';

export type CacheStatusType = 'recebido' | 'pendente';

export type ShowStatusType = 'pendente' | 'finalizado' | 'cancelado';

export interface ShowEvent {
  id: string;
  cacheValue: number; // Em reais (ex: 350.00)
  showDate: string; // Formato ISO YYYY-MM-DDTHH:mm
  singerBand: string; // Nome do cantor / Banda
  venue: string; // Nome do estabelecimento / Local
  modality: ModalityType;
  cacheStatus: CacheStatusType;
  showStatus: ShowStatusType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  instrument: string; // ex: Baterista
  avatar?: string;
  isGuest?: boolean;
}

export interface ShowFilters {
  singerBand: string;
  venue: string;
  month: number; // 0 para todos, 1-12 para Janeiro-Dezembro
  year: number; // 0 para todos, ex: 2026
  modality: 'todos' | ModalityType;
  cacheStatus: 'todos' | CacheStatusType;
  showStatus: 'todos' | ShowStatusType;
  searchQuery: string;
}

export interface ShowStats {
  totalShows: number;
  totalCacheExpected: number;
  totalCacheReceived: number;
  totalCachePending: number;
  finishedShows: number;
  pendingShows: number;
  canceledShows: number;
}
