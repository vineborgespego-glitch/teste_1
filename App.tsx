import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchConversations, updateSupabaseQualification, getCurrentUser, signOut } from './services/supabaseService';
import { Conversation, PageView } from './types';
import { POLLING_INTERVAL_MS } from './constants';
import Sidebar from './components/Sidebar';
import OverviewDashboard from './components/OverviewDashboard';
import PipelineKanban from './components/PipelineKanban';
import LeadsTable from './components/LeadsTable';
import Login from './components/Login';

const App: React.FC = () => {
  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Estados de Dados
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentPage, setCurrentPage] = useState<PageView>('Dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controle de atualizações pendentes para evitar conflito com polling
  const pendingUpdatesRef = useRef<Set<string>>(new Set());
  
  // Controle de log de erro para não spammar o console
  const lastErrorRef = useRef<string | null>(null);

  // Verifica sessão ao iniciar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.log('Sem sessão ativa');
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkSession();
  }, []);

  // Função de busca de dados
  const loadData = useCallback(async (isPolling = false) => {
    // Segurança extra: nunca busca dados se não estiver logado
    if (!isAuthenticated) return;

    try {
      const data = await fetchConversations();
      
      // Se chegou aqui, a conexão funcionou. Limpa erros.
      if (error || lastErrorRef.current) {
          setError(null);
          lastErrorRef.current = null;
      }

      if (Array.isArray(data)) {
        setConversations(prev => {
           if (prev.length === 0) return data;
           
           const pendingIds = pendingUpdatesRef.current;
           if (pendingIds.size === 0) return data;

           // Mescla dados do servidor preservando otimizações locais pendentes
           return data.map(serverItem => {
             if (pendingIds.has(serverItem.numero)) {
               const localItem = prev.find(p => p.numero === serverItem.numero);
               return localItem || serverItem;
             }
             return serverItem;
           });
        });
      }
    } catch (e: any) {
       const errorMessage = e.message || "Erro desconhecido";
       
       // Só define o erro visível na UI se não tivermos dados nenhuns
       // Se já temos dados, o usuário pode continuar navegando (modo offline gracioso)
       if (conversations.length === 0) {
           setError("Não foi possível conectar ao banco de dados.");
       }

       // Lógica anti-spam de console: só loga se o erro mudou
       if (lastErrorRef.current !== errorMessage) {
           console.warn("Status da Conexão:", errorMessage);
           lastErrorRef.current = errorMessage;
       }
    } finally {
      if (!isPolling) {
        setIsLoading(false);
      }
    }
  }, [conversations.length, error, isAuthenticated]); 

  // Efeito de Polling Seguro (Recursivo) - Só roda se isAuthenticated for true
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    let timeoutId: number;

    const runPolling = async () => {
      if (!isMounted) return;

      // Se a aba estiver oculta, retarda o polling para economizar recursos
      if (document.hidden) {
         timeoutId = window.setTimeout(runPolling, POLLING_INTERVAL_MS * 2);
         return;
      }

      await loadData(true);

      // Agenda a próxima execução apenas APÓS o término da anterior
      if (isMounted) {
        timeoutId = window.setTimeout(runPolling, POLLING_INTERVAL_MS);
      }
    };

    // Primeira carga imediata assim que autentica
    setIsLoading(true);
    loadData(false).then(() => {
        if (isMounted) {
            timeoutId = window.setTimeout(runPolling, POLLING_INTERVAL_MS);
        }
    });

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [loadData, isAuthenticated]);

  // Função de Atualização (Drag & Drop)
  const updateConversationStatus = useCallback(async (numero: string, newQualification: string) => {
    // 1. Bloqueia updates do servidor para este item temporariamente
    pendingUpdatesRef.current.add(numero);

    // 2. Atualização Otimista (imediata na UI)
    setConversations(prev => 
        prev.map(conv => 
          conv.numero === numero ? { ...conv, pipeline: newQualification } : conv
        )
    );

    try {
        // 3. Envia para o servidor
        await updateSupabaseQualification(numero, newQualification);
    } catch (error) {
        console.error("Falha ao salvar alteração:", error);
        // Em caso de erro, a próxima rodada de polling corrigirá o estado
        // Removemos o lock para permitir que o dado real do servidor sobrescreva o otimista falho
        pendingUpdatesRef.current.delete(numero);
    } finally {
        // 4. Libera o lock após tempo suficiente para o Supabase processar a consistência
        setTimeout(() => {
          pendingUpdatesRef.current.delete(numero);
        }, 3000);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await signOut();
    setIsAuthenticated(false);
    setConversations([]);
    setError(null);
  };

  // Renderização Condicional

  // 1. Verificando estado inicial
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Não autenticado -> Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Autenticado mas carregando dados iniciais (tela de loading mais elaborada)
  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="flex flex-col items-center">
           <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <div className="text-sm font-medium text-slate-400 animate-pulse">Carregando sistema...</div>
        </div>
      </div>
    );
  }

  // 4. Autenticado e carregado -> App Principal
  return (
    <div className="min-h-screen flex bg-slate-900 antialiased font-sans text-slate-200 selection:bg-indigo-500/30">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        error={error} 
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-x-hidden overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded backdrop-blur-md shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                <span className="font-semibold mr-2">Atenção:</span>
                <span className="text-sm">{error}</span>
            </div>
            <button 
                onClick={() => {
                    setError(null);
                    loadData(false);
                }}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded transition-colors border border-red-500/30 font-medium"
            >
                Tentar Novamente
            </button>
          </div>
        )}
        
        {currentPage === 'Dashboard' && <OverviewDashboard conversations={conversations} setCurrentPage={setCurrentPage} />}
        {currentPage === 'Pipeline' && <PipelineKanban conversations={conversations} updateConversationStatus={updateConversationStatus} />}
        {currentPage === 'Table' && <LeadsTable conversations={conversations} />}
      </main>
    </div>
  );
};

export default App;