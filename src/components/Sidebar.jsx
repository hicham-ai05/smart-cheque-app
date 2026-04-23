import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2, Users, UserSquare2, CreditCard, FileText,
  ArrowDownToLine, ArrowUpRight, Activity, Settings2, Zap
} from 'lucide-react';

const mainNavItems = [
  { path: '/banques', label: 'BANQUES', icon: Building2 },
  { path: '/destinataires', label: 'DESTINATAIRES', icon: Users },
  { path: '/clients', label: 'CLIENTS', icon: UserSquare2 },
  { path: '/cheques', label: 'CHÈQUES', icon: CreditCard },
  { path: '/effets', label: 'EFFETS', icon: FileText },
  { path: '/encaissement', label: 'ENCAISSEMENT', icon: ArrowDownToLine },
  { path: '/decaissement', label: 'DÉCAISSEMENT', icon: ArrowUpRight },
  { path: '/consultation', label: 'CONSULTATION', icon: Activity },
  { path: '/analytics', label: 'ANALYTICS', icon: Activity },
  { path: '/templates', label: 'MODÈLES', icon: Settings2 },
];

const Sidebar = () => {
  return (
    <aside className="relative z-20 w-64 h-screen bg-surface-dark/60 backdrop-blur-2xl border-r border-surface-border flex flex-col justify-between">
      <div>
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-white/10">
              <Zap size={20} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">SMART<span className="text-brand-400"> Chèques</span></h1>
              <span className="text-[9px] text-brand-300/80 font-bold tracking-widest uppercase bg-brand-500/10 px-1.5 py-0.5 rounded-md">PRO EDITION</span>
            </div>
          </div>
        </div>

        <nav className="px-4 mt-6 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          <p className="px-2 mb-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Menu Principal</p>
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative overflow-hidden ${
                  isActive
                    ? 'text-white bg-white/5 shadow-inner ring-1 ring-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                }`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon;
                return (
                  <>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-md blur-[1px]"></div>}
                    <span className={`transition-transform duration-300 ${isActive ? 'text-brand-400' : 'group-hover:text-brand-400 group-hover:scale-110'}`}>
                      <Icon size={18} />
                    </span>
                    <span>{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 m-4 rounded-xl bg-surface-card border border-surface-border backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 ring-1 ring-white/10 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-inner relative">
            A
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface-darker rounded-full"></div>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">Administrateur</p>
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-1">
              Connecté
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
