import React, { useMemo } from 'react';
import { Users, Bot, PauseCircle, BarChart3 } from 'lucide-react';
import { Conversation, PageView } from '../types';
import { KANBAN_COLUMNS } from '../constants';
import { getNormalizedPipeline } from '../utils';

interface OverviewDashboardProps {
  conversations: Conversation[];
  setCurrentPage: (page: PageView) => void;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ conversations, setCurrentPage }) => {
  const totalConversations = conversations.length;
  
  // Cálculos de métricas gerais e dados para o gráfico
  const { active, paused, pipelineData } = useMemo(() => {
    let activeCount = 0;
    let pausedCount = 0;
    const counts: Record<string, number> = {};

    // Inicializa contagem zerada para todas as colunas do Kanban
    KANBAN_COLUMNS.forEach(col => counts[col.id] = 0);

    conversations.forEach(conv => {
      // Status IA
      if (conv.status === true) activeCount++;
      else pausedCount++;

      // Pipeline
      const qual = getNormalizedPipeline(conv.pipeline);
      if (counts[qual] !== undefined) {
        counts[qual]++;
      } else {
        counts['Novo Lead']++; // Fallback
      }
    });

    // Prepara array para o gráfico
    const data = KANBAN_COLUMNS.map(col => ({
      ...col,
      count: counts[col.id] || 0,
      // Mapeamento de cores para o background da barra de progresso
      barColor: col.border.replace('border-', 'bg-'), // Ex: border-blue-500 -> bg-blue-500
      textColor: col.color.split(' ')[0] // Pega a classe de cor do texto (ex: text-blue-400)
    }));

    return { active: activeCount, paused: pausedCount, pipelineData: data };
  }, [conversations]);

  const getPercentageValue = (count: number) => {
    if (totalConversations === 0) return 0;
    return Math.round((count / totalConversations) * 100);
  };

  const getPercentageString = (count: number) => {
    return `${getPercentageValue(count)}%`;
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-100">Visão Geral</h2>
          <div className="text-sm text-slate-500 font-mono bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Atualizado em tempo real
          </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border-l-4 border-blue-500 ring-1 ring-white/5 relative overflow-hidden group hover:bg-slate-750 transition-colors">
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Leads</p>
            <p className="text-4xl font-extrabold text-slate-100 mt-3">{totalConversations}</p>
            <div className="flex items-center text-xs mt-4 text-blue-400 font-medium">
               <Users className="w-4 h-4 mr-1" /> Base completa de contatos
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none"></div>
        </div>

        {/* Ativa */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border-l-4 border-emerald-500 ring-1 ring-white/5 relative overflow-hidden group hover:bg-slate-750 transition-colors">
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">IA Ativada</p>
            <p className="text-4xl font-extrabold text-slate-100 mt-3">{active}</p>
            <div className="flex items-center text-xs mt-4 text-emerald-400 font-medium">
               <Bot className="w-4 h-4 mr-1" /> {getPercentageString(active)} operando agora
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>
        </div>

        {/* Pausada */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border-l-4 border-red-500 ring-1 ring-white/5 relative overflow-hidden group hover:bg-slate-750 transition-colors">
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">IA Pausada</p>
            <p className="text-4xl font-extrabold text-slate-100 mt-3">{paused}</p>
            <div className="flex items-center text-xs mt-4 text-red-400 font-medium">
               <PauseCircle className="w-4 h-4 mr-1" /> {getPercentageString(paused)} necessitam atenção
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Gráfico de Pipeline Horizontal */}
      <div className="bg-slate-800 rounded-xl shadow-lg ring-1 ring-white/5 p-8">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xl font-bold text-slate-100 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-indigo-400" />
                    Distribuição do Pipeline
                </h3>
                <p className="text-slate-400 text-sm mt-1">Volume de leads por etapa do funil de vendas.</p>
            </div>
            <button 
                onClick={() => setCurrentPage('Pipeline')}
                className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors border border-slate-600 shadow-sm"
            >
                Ver Kanban
            </button>
        </div>

        <div className="space-y-6">
            {pipelineData.map((item) => {
                const percentage = getPercentageValue(item.count);
                
                return (
                    <div key={item.id} className="group">
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center">
                                <div className={`p-1.5 rounded-md mr-3 ${item.color.replace('text-', 'bg-').replace('10', '10')}`}>
                                    <item.icon className={`w-4 h-4 ${item.textColor}`} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                        {item.title}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold text-slate-100 mr-2">{item.count}</span>
                                <span className="text-xs text-slate-500 font-mono">({percentage}%)</span>
                            </div>
                        </div>
                        
                        {/* Barra de Progresso Background */}
                        <div className="w-full bg-slate-700/30 rounded-full h-3 overflow-hidden relative">
                             {/* Barra de Progresso Ativa */}
                            <div 
                                className={`h-full rounded-full ${item.barColor} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.3)] relative`}
                                style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '4px' : '0' }}
                            >
                                {/* Efeito de brilho/gradiente sutil */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
        
        {totalConversations === 0 && (
            <div className="text-center py-8 text-slate-500 italic text-sm">
                Nenhum dado disponível para o gráfico.
            </div>
        )}
      </div>
    </div>
  );
};

export default OverviewDashboard;