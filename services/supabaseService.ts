import { createClient, User } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, TABLE_NAME } from '../constants';
import { Conversation } from '../types';

// Inicializa o cliente oficial do Supabase
// Configuração 'persistSession: false' é crítica para rodar em iframes/containers sem erros de Storage
// 'autoRefreshToken: false' economiza requisições desnecessárias para este caso de uso
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // Mantém false para estabilidade no preview, mas em prod poderia ser true
    autoRefreshToken: false,
    detectSessionInUrl: false,
  }
});

// --- AUTH SERVICES ---

export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Erro inesperado no login' };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Erro ao sair:', error.message);
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

// --- DATA SERVICES ---

/**
 * Busca todos os dados da tabela usando o SDK.
 */
export const fetchConversations = async (): Promise<Conversation[]> => {
  // Verifica conectividade básica antes de tentar o fetch
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error("Sem conexão com a internet");
  }

  // O SDK usa .from() e .select() de forma segura
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false }); // Ordenação padrão no banco

  if (error) {
    // Lançamos o erro para ser tratado pelo App.tsx
    // NÃO logamos no console aqui para evitar spam
    throw new Error(`[Supabase Error ${error.code}]: ${error.message}`);
  }

  return (data as Conversation[]) || [];
};

/**
 * Atualiza a coluna 'pipeline' (qualificação) no Supabase usando o SDK.
 */
export const updateSupabaseQualification = async (numero: string, newQualification: string): Promise<Conversation[] | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ pipeline: newQualification })
    .eq('numero', numero)
    .select(); // .select() retorna o registro atualizado

  if (error) {
    console.warn(`Falha ao atualizar lead ${numero}:`, error.message);
    throw new Error(error.message);
  }

  return data as Conversation[];
};