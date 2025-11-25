import React, { useState, useMemo, useCallback } from 'react';
import { Conversation } from '../types';
import { KANBAN_COLUMNS, getStatusStyle } from '../constants';
import { getNormalizedPipeline, safeDateFormatter } from '../utils';

interface LeadsTableProps {
  conversations: Conversation[];
}

type SortDirection = 'ascending' | 'descending';
interface SortConfig {
  key: string;
  direction: SortDirection;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ conversations }) => {
    // ALTERAÇÃO: Ordenação padrão agora é pelo Pipeline (ascending = ordem do funil)
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'pipeline', direction: 'ascending' });
  
    const columns = [
      { key: 'nome', label: 'Nome' },
      { key: 'numero', label: 'Número' },
      { key: 'pipeline', label: 'Fase do Pipeline' },
      { key: 'status', label: 'Status IA' },
      { key: 'comercial', label: 'Comercial' }, 
      { key: 'created_at', label: 'Criado em' },
    ];
  
    const sortedConversations = useMemo(() => {
      let sortableItems = [...conversations];
      if (sortConfig.key) {
        sortableItems.sort((a, b) => {
          // Extração segura de valores
          const aRaw = a[sortConfig.key];
          const bRaw = b[sortConfig.key];

          // Tratamento para nulos na ordenação
          const aValue = aRaw ?? '';
          const bValue = bRaw ?? '';
  
          // Lógica de ordenação específica para Pipeline (baseada na ordem das colunas do Kanban)
          if (sortConfig.key === 'pipeline') {
            const pipeA = getNormalizedPipeline(aValue as string);
            const pipeB = getNormalizedPipeline(bValue as string);
            
            // Encontra o índice (peso) de cada status na lista oficial de colunas
            const indexA = KANBAN_COLUMNS.findIndex(col => col.id === pipeA);
            const indexB = KANBAN_COLUMNS.findIndex(col => col.id === pipeB);

            // Se não encontrar (index -1), joga para o final
            const weightA = indexA === -1 ? 999 : indexA;
            const weightB = indexB === -1 ? 999 : indexB;

            return sortConfig.direction === 'ascending' 
                ? weightA - weightB 
                : weightB - weightA;
          }

          if (sortConfig.key === 'created_at') {
            const dateA = new Date(aValue as string).getTime() || 0;
            const dateB = new Date(bValue as string).getTime() || 0;
            return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
          }
  
          // Ordenação padrão (alfabética/numérica) para outras colunas
          if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        });
      }
      return sortableItems;
    }, [conversations, sortConfig]);
  
    const requestSort = useCallback((key: string) => {
      let direction: SortDirection = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setSortConfig({ key, direction });
    }, [sortConfig.key, sortConfig.direction]); 
  
    const getSortIcon = (key: string) => {
      if (sortConfig.key !== key) return <span className="text-slate-600 ml-1">↕</span>;
      return sortConfig.direction === 'ascending' ? <span className="text-indigo-400 ml-1">▲</span> : <span className="text-indigo-400 ml-1">▼</span>;
    };
  
    return (
      <div className="p-6 bg-slate-900 min-h-screen">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Relatório de Leads</h2>
        <p className="text-slate-400 mb-6 text-sm">Visualize e filtre todos os leads da base.</p>
        
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden ring-1 ring-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900">
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.key}
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800 transition-colors select-none group"
                      onClick={() => requestSort(col.key)}
                    >
                      <div className="flex items-center">
                        {col.label}
                        {getSortIcon(col.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {sortedConversations.map(conv => {
                    // Prepara os dados de renderização aqui para manter o JSX limpo
                    const statusStyle = getStatusStyle(conv.status);
                    const { Icon } = statusStyle;
                    const qualId = getNormalizedPipeline(conv.pipeline);
                    const qualDef = KANBAN_COLUMNS.find(c => c.id === qualId);

                    return (
                        <tr key={conv.numero} className="hover:bg-slate-700/40 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                            {conv.nome || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                            {conv.numero}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${qualDef?.color || 'bg-slate-700 text-slate-300'}`}>
                                {qualDef?.title || conv.pipeline || 'Desconhecido'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${statusStyle.color}`}>
                                <Icon className="w-3 h-3 mr-1.5" />
                                {statusStyle.label}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                             {conv.comercial ? (
                                 <span className="text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded text-xs border border-indigo-500/30">Sim</span>
                             ) : (
                                 <span className="text-slate-500">Não</span>
                             )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {safeDateFormatter(conv.created_at)}
                        </td>
                        </tr>
                    );
                })}
                
                {sortedConversations.length === 0 && (
                    <tr>
                        <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center">
                                <span className="text-lg">Nenhum registro encontrado</span>
                                <span className="text-sm mt-1">Aguardando dados da tabela...</span>
                            </div>
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
};

export default LeadsTable;