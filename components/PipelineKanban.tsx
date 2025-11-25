import React, { useCallback, useMemo } from 'react';
import { Conversation } from '../types';
import { KANBAN_COLUMNS } from '../constants';
import { getNormalizedPipeline } from '../utils';
import KanbanCard from './KanbanCard';

interface PipelineKanbanProps {
  conversations: Conversation[];
  updateConversationStatus: (numero: string, newQualification: string) => void;
}

const PipelineKanban: React.FC<PipelineKanbanProps> = ({ conversations, updateConversationStatus }) => {
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, newQualification: string) => {
    e.preventDefault();
    const conversationNumero = e.dataTransfer.getData("conversationNumero");
    if (conversationNumero) {
      updateConversationStatus(conversationNumero, newQualification);
    }
  }, [updateConversationStatus]); 

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const groupedConversations = useMemo(() => {
    const groups: Record<string, Conversation[]> = {};
    
    // Inicializa todos os grupos para garantir que colunas vazias renderizem corretamente
    KANBAN_COLUMNS.forEach(col => {
        groups[col.id] = [];
    });

    conversations.forEach(conv => {
      const qualification = getNormalizedPipeline(conv.pipeline);
      if (groups[qualification]) {
          groups[qualification].push(conv);
      } else {
          // Fallback seguro caso o getNormalizedPipeline falhe (improvável)
          groups['Novo Lead'].push(conv);
      }
    });
    
    return groups;
  }, [conversations]);

  return (
    <div className="p-6 bg-slate-900 min-h-screen overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-100">Pipeline de Vendas</h2>
          <div className="text-sm text-slate-400">
             Arraste os cards para mudar a fase
          </div>
      </div>

      <div className="flex gap-4 min-w-[1200px] xl:min-w-0 xl:grid xl:grid-cols-5 pb-4">
        {KANBAN_COLUMNS.map(column => (
          <div
            key={column.id}
            onDrop={(e) => handleDrop(e, column.id)}
            onDragOver={handleDragOver}
            className={`
                flex flex-col 
                rounded-xl 
                bg-slate-800/50 
                border border-white/5 
                h-[calc(100vh-12rem)] 
                min-w-[280px]
                transition-colors hover:bg-slate-800/80
            `}
          >
            {/* Header da Coluna */}
            <div className={`p-3 border-b border-white/5 flex items-center justify-between rounded-t-xl ${column.color.replace('text-', 'bg-').replace('10', '5')}`}>
                <div className="flex items-center font-semibold text-slate-200">
                    <column.icon className={`w-4 h-4 mr-2 ${column.color.split(' ')[1]}`} />
                    {column.title}
                </div>
                <span className="bg-slate-900 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-700">
                    {groupedConversations[column.id]?.length || 0}
                </span>
            </div>

            {/* Área de Drop / Lista */}
            <div className="flex-1 p-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent space-y-2">
              {groupedConversations[column.id]?.map(conv => (
                <KanbanCard key={conv.numero} conversation={conv} />
              ))}
              {groupedConversations[column.id]?.length === 0 && (
                  <div className="h-20 border-2 border-dashed border-slate-700/50 rounded-lg flex items-center justify-center text-slate-600 text-xs italic m-2">
                      Vazio
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineKanban;
