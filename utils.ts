import { KANBAN_COLUMNS } from './constants';

// Mapeamento de termos antigos/variados para o padrão do Kanban
const LEGACY_MAPPING: Record<string, string> = {
  'pendente': 'Novo Lead',
  'novo': 'Novo Lead',
  'qualificado': 'Fechado',
  'ganho': 'Fechado',
  'não qualificado': 'Perdidos',
  'perdido': 'Perdidos',
  'em análise': 'Em Atendimento',
  'atendimento': 'Em Atendimento',
  'proposta': 'Proposta Enviada'
};

/**
 * Normaliza o pipeline. Se vier null, undefined ou desconhecido, retorna 'Novo Lead'.
 */
export const getNormalizedPipeline = (pipeline: string | null | undefined): string => {
  if (!pipeline || typeof pipeline !== 'string') {
    return 'Novo Lead';
  }

  const trimmed = pipeline.trim();
  const lowerTrimmed = trimmed.toLowerCase();

  // 1. Busca Exata
  const exactMatch = KANBAN_COLUMNS.find(col => col.id.toLowerCase() === lowerTrimmed);
  if (exactMatch) return exactMatch.id;

  // 2. Busca por Mapeamento (Legado)
  if (LEGACY_MAPPING[lowerTrimmed]) {
    return LEGACY_MAPPING[lowerTrimmed];
  }
  
  // 3. Fallback
  return 'Novo Lead';
};

/**
 * Formata data de forma segura.
 */
export const safeDateFormatter = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit' 
    });
  } catch (e) {
    return '-';
  }
};
