/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utilitários para gestão de contactos telefónicos em Angola (+244)
 * Números em Angola possuem 9 dígitos (geralmente móveis iniciados por 9: 91, 92, 93, 94, 95, 99 ou fixos iniciados por 2).
 */

export const ANGOLA_DIALING_CODE = '+244';
export const ANGOLA_NUMBER_LENGTH = 9;

/**
 * Limpa qualquer entrada e extrai apenas os 9 dígitos locais de Angola,
 * removendo prefixos duplicados como +244, 00244, 244, espaços ou traços.
 */
export function extractAngolaLocalDigits(rawInput: string): string {
  if (!rawInput) return '';

  let cleaned = rawInput.trim();

  // Remover prefixos comuns de Angola se colados pelo utilizador
  if (cleaned.startsWith('+244')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('00244')) {
    cleaned = cleaned.substring(5);
  } else if (cleaned.startsWith('244') && cleaned.length > 9) {
    cleaned = cleaned.substring(3);
  }

  // Filtrar apenas dígitos
  const digitsOnly = cleaned.replace(/\D/g, '');

  // Limitar ao comprimento máximo de 9 dígitos de Angola
  return digitsOnly.slice(0, ANGOLA_NUMBER_LENGTH);
}

/**
 * Formata visualmente os 9 dígitos com espaçamento natural (ex: 923 456 789)
 */
export function formatLocalDigitsDisplay(digits: string): string {
  const d = extractAngolaLocalDigits(digits);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

/**
 * Retorna o número completo no formato internacional normalizado (+244 9XXXXXXXX)
 */
export function toNormalizedAngolaPhone(digits: string): string {
  const local = extractAngolaLocalDigits(digits);
  return `${ANGOLA_DIALING_CODE} ${local}`.trim();
}

/**
 * Validação do número de telefone de Angola
 */
export function validateAngolaPhone(digitsOrFull: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  const local = extractAngolaLocalDigits(digitsOrFull);

  if (local.length === 0) {
    return { isValid: false, errorMessage: 'O número de telefone é obrigatório.' };
  }

  if (local.length < ANGOLA_NUMBER_LENGTH) {
    return {
      isValid: false,
      errorMessage: `O número em Angola deve ter 9 dígitos (introduziu ${local.length}).`,
    };
  }

  // Em Angola, telemóveis começam por 9 (91x, 92x, 93x, 94x, 95x, 99x) e redes fixas por 2
  const firstDigit = local.charAt(0);
  if (firstDigit !== '9' && firstDigit !== '2') {
    return {
      isValid: false,
      errorMessage: 'O número deve iniciar com 9 (móvel) ou 2 (fixo nacional).',
    };
  }

  return { isValid: true };
}
