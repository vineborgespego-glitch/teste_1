import { LucideIcon } from 'lucide-react';

export interface Conversation {
  numero: string; // Identificador único (PK)
  nome: string | null;
  pipeline: string | null; // Pode vir nulo do banco
  status: boolean | null; // true = ativada, false = pausada
  created_at: string;
  comercial?: boolean | null;
  // Index signature permitida apenas para ordenação dinâmica segura
  [key: string]: string | boolean | number | null | undefined; 
}

export interface KanbanColumnDef {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  border: string;
}

export interface StatusStyleDef {
  label: string;
  color: string;
  Icon: LucideIcon;
}

export type PageView = 'Dashboard' | 'Pipeline' | 'Table';
