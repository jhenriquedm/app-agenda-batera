/**
 * Utilitários para sanitização e validação de campos de texto sem caracteres especiais
 */

/**
 * Sanitiza o nome de usuário:
 * - Não permite caracteres especiais nem espaços
 * - Apenas letras (sem acento), números e sublinhado (_)
 * - Limita estritamente em 20 caracteres
 */
export function sanitizeUsername(value: string): string {
  if (!value) return '';
  return value
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 20);
}

/**
 * Sanitiza o nome completo:
 * - Não permite caracteres especiais numéricos ou símbolos
 * - Permite letras com acentos da língua portuguesa e espaços
 * - Limita estritamente em 50 caracteres
 */
export function sanitizeName(value: string): string {
  if (!value) return '';
  return value
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
    .slice(0, 50);
}

/**
 * Sanitiza campos de texto gerais (ex: local, cantor, observações):
 * - Remove caracteres especiais como < > { } [ ] $ % & * # @ \ ^ ~ + = | ; : " '
 * - Mantém texto limpo legível
 */
export function sanitizeCleanText(value: string, maxLength?: number): string {
  if (!value) return '';
  const sanitized = value.replace(/[<>{}%$&@\\^~+=|;"'`]/g, '');
  return maxLength ? sanitized.slice(0, maxLength) : sanitized;
}
