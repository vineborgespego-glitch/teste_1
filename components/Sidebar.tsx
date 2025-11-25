import React from 'react';
import { LayoutDashboard, Users, ClipboardList, LogOut } from 'lucide-react';
import { PageView } from '../types';

interface SidebarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  error: string | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, error, onLogout }) => {
  return (
    <nav className="w-64 bg-slate-800 shadow-xl flex flex-col p-4 h-screen sticky top-0 border-r border-slate-700">
      <div className="text-2xl font-extrabold text-indigo-400 mb-8 p-2 flex items-center gap-2">
        <span>AI Dashboard</span>
      </div>
      
      <div className="space-y-2 flex-1">
        <button
          onClick={() => setCurrentPage('Dashboard')}
          className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            currentPage === 'Dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Visão Geral
        </button>
        <button
          onClick={() => setCurrentPage('Pipeline')}
          className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            currentPage === 'Pipeline' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
          }`}
        >
          <Users className="w-5 h-5 mr-3" />
          Pipeline (Kanban)
        </button>
        <button
          onClick={() => setCurrentPage('Table')}
          className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            currentPage === 'Table' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
          }`}
        >
          <ClipboardList className="w-5 h-5 mr-3" />
          Leads (Tabela)
        </button>
      </div>

      <div className="mt-auto space-y-4 pt-4 border-t border-slate-700">
        <button 
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors border border-transparent hover:border-red-900/30"
        >
            <LogOut className="w-4 h-4 mr-3" />
            Sair da Conta
        </button>

        <div>
          <div className="text-xs text-slate-500 mb-1">Status da Conexão:</div>
          <div className={`text-xs font-semibold p-2 rounded-lg ${error ? 'bg-red-900/30 text-red-400 border border-red-900' : 'bg-emerald-900/30 text-emerald-400 border border-emerald-900'}`}>
              {error ? 'Erro Supabase' : 'Conectado (Polling)'}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;