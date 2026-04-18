import React from 'react';
import { Landmark } from 'lucide-react';

const Banks = () => {
  return (
    <div className="space-y-8 animate-fade-in relative z-10 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Banks & Checkbooks</h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm">
            Manage corporate bank accounts and ranges.
          </p>
        </div>
      </div>
      
      <div className="bg-surface-card border border-surface-border rounded-2xl backdrop-blur-xl shadow-2xl p-16 flex flex-col items-center justify-center text-center ring-1 ring-white/5">
        <Landmark size={48} className="text-brand-500 mb-6 opacity-80" />
        <h2 className="text-2xl font-bold text-white mb-2">Bank Configuration</h2>
        <p className="text-slate-400 max-w-sm">Bank UI coming soon with RIB verification capabilities.</p>
      </div>
    </div>
  );
};

export default Banks;
