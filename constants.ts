import { CheckCircle, XCircle, Star, MessageCircle, FileText, Bot } from 'lucide-react';
import { KanbanColumnDef, StatusStyleDef, Conversation } from './types';

// Função auxiliar para obter variáveis de ambiente de forma segura (suporta Vite e CRA)
const getEnv = (key: string, fallback: string): string => {
  try {
    // @ts-ignore - Suporte a Vite
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // @ts-ignore - Suporte a CRA/Node
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
  } catch (e) {
    // Ignora erros de acesso a env
  }
  return fallback;
};

// --- SUPABASE CONFIGURATION ---
// Tenta pegar das variáveis de ambiente primeiro. Se não achar, usa o valor hardcoded (fallback).
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', getEnv('REACT_APP_SUPABASE_URL', 'https://ttuasjspbpifxvstabts.supabase.co'));
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY', getEnv('REACT_APP_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dWFzanNwYnBpZnh2c3RhYnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjM4MDIsImV4cCI6MjA3OTI5OTgwMn0.yzHY9BBn77clIjeCz14Y7cJZ5a0CAOV4Ge0CFfK5ma4'));

export const TABLE_NAME = 'testeAI';
export const POLLING_INTERVAL_MS = 5000;

// --- UI CONFIGURATION (DARK THEME) ---

export const KANBAN_COLUMNS: KanbanColumnDef[] = [
  { id: 'Novo Lead', title: 'Novo Lead', icon: Star, color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500' },
  { id: 'Em Atendimento', title: 'Em Atendimento', icon: MessageCircle, color: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500' },
  { id: 'Proposta Enviada', title: 'Proposta Enviada', icon: FileText, color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500' },
  { id: 'Fechado', title: 'Fechado', icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500' },
  { id: 'Perdidos', title: 'Perdidos', icon: XCircle, color: 'bg-red-500/10 text-red-400', border: 'border-red-500' },
];

// Lógica centralizada de status visual
export const getStatusStyle = (status: boolean | null | undefined): StatusStyleDef => {
  // Se for TRUE: Verde, Robô, Ativada
  if (status === true) {
    return { label: 'Ativada', color: 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30', Icon: Bot };
  }
  // Se for FALSE ou NULL: Vermelho, Robô, Pausada
  return { label: 'Pausada', color: 'text-red-400 bg-red-500/20 border border-red-500/30', Icon: Bot };
};