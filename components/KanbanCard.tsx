import React from 'react';
import { Conversation } from '../types';
import { KANBAN_COLUMNS, getStatusStyle } from '../constants';
import { getNormalizedPipeline, safeDateFormatter } from '../utils';

interface KanbanCardProps {
  conversation: Conversation;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ conversation }) => {
  // Obtém estilos baseados no status booleano
  const { Icon, color, label } = getStatusStyle(conversation.status);
  
  // Normaliza o pipeline para saber a cor da borda lateral
  const qualificationId = getNormalizedPipeline(conversation.pipeline);
  const columnDef = KANBAN_COLUMNS.find(c => c.id === qualificationId);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("conversationNumero", conversation.numero);
        e.dataTransfer.effectAllowed = "move"; 
      }}
      className={`
        bg-slate-800 
        p-4 mb-3 rounded-lg shadow-lg 
        border-l-[6px] ${columnDef?.border || 'border-slate-600'} 
        cursor-grab hover:shadow-xl hover:bg-slate-750 hover:scale-[1.02]
        transition-all active:cursor-grabbing 
        ring-1 ring-white/5
        group
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-slate-100 truncate max-w-[170px]" title={conversation.nome || 'Sem nome'}>
          {conversation.nome || 'Sem Nome'}
        </h4>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${color}`}>
          <Icon className="w-3 h-3" />
          <span>{label}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
        <span className="font-mono text-xs text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
          {conversation.numero}
        </span>
        <span className="text-[10px] text-slate-500">
          {safeDateFormatter(conversation.created_at)}
        </span>
      </div>
    </div>
  );
};

export default KanbanCard;
