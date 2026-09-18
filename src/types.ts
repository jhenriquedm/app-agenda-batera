export type ModalityType = 'Particular' | 'Barzinho/Restaurante';

export type CacheStatusType = 'recebido' | 'pendente';

export type ShowStatusType = 'pendente' | 'finalizado' | 'cancelado';

export interface BandArtist {
  id: string;
  userId?: string; // Isolamento por usuário
  name: string; // Nome do cantor / banda
  genre?: string; // Gênero musical (ex: Sertanejo, Rock, Pop, Pagode, etc.)
  color: string; // Cor hex ou identificador para tag (ex: #f59e0b)
  contactPerson?: string; // Nome do produtor / contato
  phone?: string; // Telefone / WhatsApp do contato
  pixKey?: string; // Chave Pix para cobrança / recebimento
  defaultCache?: number; // Cachê padrão acordado (em R$)
  notes?: string; // Observações gerais
  createdAt: string;
  updatedAt: string;
}

export interface ShowEvent {
  id: string;
  cacheValue: number; // Em reais (ex: 350.00)
  showDate: string; // Formato ISO YYYY-MM-DDTHH:mm
  singerBand: string; // Nome do cantor / Banda
  singerBandId?: string; // ID opcional do cantor/banda cadastrado
  venue: string; // Nome do estabelecimento / Local
  modality: ModalityType;
  cacheStatus: CacheStatusType;
  showStatus: ShowStatusType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string; // Isolamento por usuário
}

export interface UserProfile {
  id: string;
  name: string;
  username: string; // Nome de usuário único para login (máx 20 caracteres sem caracteres especiais)
  email?: string;
  cpf?: string;
  instrument?: string; // ex: Baterista
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
