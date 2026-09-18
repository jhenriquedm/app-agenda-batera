import { describe, it, expect } from 'vitest';
import { validateCpf, formatCpf, unmaskCpf } from '../utils/cpfValidator';
import { formatCurrencyInput, parseCurrencyInput, formatBRL } from '../utils/currencyMask';
import { showService } from '../services/showService';
import { ShowEvent, ShowFilters } from '../types';

describe('Validador e Formatador de CPF', () => {
  it('deve remover caracteres especiais', () => {
    expect(unmaskCpf('123.456.789-00')).toBe('12345678900');
  });

  it('deve formatar CPF corretamente', () => {
    expect(formatCpf('12345678900')).toBe('123.456.789-00');
  });

  it('deve validar CPF com dígitos verificadores corretos', () => {
    // CPFs válidos para teste
    expect(validateCpf('52998224725')).toBe(true);
  });

  it('deve rejeitar CPF com todos os dígitos iguais', () => {
    expect(validateCpf('11111111111')).toBe(false);
    expect(validateCpf('00000000000')).toBe(false);
  });

  it('deve rejeitar CPF com tamanho incorreto', () => {
    expect(validateCpf('123456')).toBe(false);
  });
});

describe('Máscara e Parser Monetário BRL', () => {
  it('deve formatar valores numéricos para padrão monetário', () => {
    expect(formatCurrencyInput(350)).toBe('350,00');
    expect(formatCurrencyInput('35000')).toBe('350,00');
  });

  it('deve converter string formatada de volta para número', () => {
    expect(parseCurrencyInput('350,00')).toBe(350);
    expect(parseCurrencyInput('1.250,50')).toBe(1250.5);
  });

  it('deve formatar com símbolo de Real R$', () => {
    const formatted = formatBRL(500);
    expect(formatted).toContain('500,00');
  });

  it('deve limitar a entrada em no máximo 9 dígitos numéricos', () => {
    // 12 dígitos devem ser cortados para 9 dígitos (ex: 123456789)
    const result = formatCurrencyInput('123456789999');
    expect(result).toBe('1.234.567,89');
  });
});

describe('Serviço de Gestão e Filtro de Shows', () => {
  const mockShows: ShowEvent[] = [
    {
      id: '1',
      cacheValue: 400,
      showDate: '2026-10-15T21:00',
      singerBand: 'Lucas Sertanejo',
      venue: 'Bar do Alemão',
      modality: 'Barzinho/Restaurante',
      cacheStatus: 'recebido',
      showStatus: 'finalizado',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '2',
      cacheValue: 800,
      showDate: '2026-10-20T20:00',
      singerBand: 'Marcela Rios',
      venue: 'Espaço Villa',
      modality: 'Particular',
      cacheStatus: 'pendente',
      showStatus: 'pendente',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '3',
      cacheValue: 300,
      showDate: '2026-10-22T22:00',
      singerBand: 'Banda Rock',
      venue: 'The Pub',
      modality: 'Barzinho/Restaurante',
      cacheStatus: 'pendente',
      showStatus: 'cancelado',
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('deve calcular estatísticas financeiras corretamente desconsiderando shows cancelados pendentes', () => {
    const stats = showService.calculateStats(mockShows);
    expect(stats.totalShows).toBe(3);
    expect(stats.totalCacheExpected).toBe(1200); // 400 + 800 (cancelado e pendente não conta)
    expect(stats.totalCacheReceived).toBe(400);
    expect(stats.totalCachePending).toBe(800);
    expect(stats.finishedShows).toBe(1);
    expect(stats.pendingShows).toBe(1);
    expect(stats.canceledShows).toBe(1);
  });

  it('deve somar o cachê de show cancelado caso a situação do cachê seja recebido', () => {
    const showsComCanceladoRecebido: ShowEvent[] = [
      ...mockShows,
      {
        id: '4',
        cacheValue: 250,
        showDate: '2026-10-25T20:00',
        singerBand: 'Samba Bom',
        venue: 'Boteco',
        modality: 'Barzinho/Restaurante',
        cacheStatus: 'recebido',
        showStatus: 'cancelado',
        createdAt: '',
        updatedAt: '',
      },
    ];
    const stats = showService.calculateStats(showsComCanceladoRecebido);
    expect(stats.totalShows).toBe(4);
    expect(stats.totalCacheExpected).toBe(1450); // 1200 + 250
    expect(stats.totalCacheReceived).toBe(650); // 400 + 250
    expect(stats.totalCachePending).toBe(800); // permanece 800
    expect(stats.canceledShows).toBe(2);
  });

  it('deve filtrar shows por nome do cantor', () => {
    const filters: ShowFilters = {
      singerBand: 'Lucas',
      venue: '',
      month: 0,
      year: 0,
      modality: 'todos',
      cacheStatus: 'todos',
      showStatus: 'todos',
      searchQuery: '',
    };
    const result = showService.filterShows(mockShows, filters);
    expect(result.length).toBe(1);
    expect(result[0].singerBand).toBe('Lucas Sertanejo');
  });

  it('deve filtrar shows por modalidade', () => {
    const filters: ShowFilters = {
      singerBand: '',
      venue: '',
      month: 0,
      year: 0,
      modality: 'Particular',
      cacheStatus: 'todos',
      showStatus: 'todos',
      searchQuery: '',
    };
    const result = showService.filterShows(mockShows, filters);
    expect(result.length).toBe(1);
    expect(result[0].singerBand).toBe('Marcela Rios');
  });

  it('deve filtrar shows por status de cachê pendente', () => {
    const filters: ShowFilters = {
      singerBand: '',
      venue: '',
      month: 0,
      year: 0,
      modality: 'todos',
      cacheStatus: 'pendente',
      showStatus: 'todos',
      searchQuery: '',
    };
    const result = showService.filterShows(mockShows, filters);
    expect(result.length).toBe(2);
  });
});
