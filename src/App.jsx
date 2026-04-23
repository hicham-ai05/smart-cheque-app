import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Original User Components
import Banques from './pages/Banques';
import Destinataires from './pages/Destinataires';
import Clients from './pages/Clients';
import Cheques from './pages/Cheques';
import Effets from './pages/Effets';
import Encaissement from './pages/Encaissement';
import Decaissement from './pages/Decaissement';
import Consultation from './pages/Consultation';
import Templates from './pages/Templates';
import Analytics from './pages/Analytics';

// New Premium Placeholders (Optional/additive based on your plan)
import Contacts from './pages/Contacts';
import Banks from './pages/Banks';
import Checks from './pages/Checks';
import Invoices from './pages/Invoices';
import Dashboard from './pages/Dashboard';

import AIChat from './components/AIChat';

function App() {
  return (
    <HashRouter>
      {/* Background with mesh gradient & blobs */}
      <div className="relative flex min-h-screen bg-surface-darker text-slate-300 font-sans selection:bg-brand-500/30 selection:text-white overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000 pointer-events-none"></div>
        
        {/* Main Application Layout */}
        <Sidebar />
        <main className="flex-1 relative z-10 p-6 lg:p-10 h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/consultation" replace />} />
            
            {/* Real Original User Routes */}
            <Route path="/banques" element={<Banques />} />
            <Route path="/destinataires" element={<Destinataires />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/cheques" element={<Cheques />} />
            <Route path="/effets" element={<Effets />} />
            <Route path="/encaissement" element={<Encaissement />} />
            <Route path="/decaissement" element={<Decaissement />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/analytics" element={<Analytics />} />

            <Route path="*" element={<div className="text-center p-20 animate-fade-in"><h1 className="text-3xl font-bold text-white mb-4">Erreur 404</h1><p className="text-slate-400">Cette page n'existe pas ou est en construction.</p></div>} />
          </Routes>
        </main>
        
        <AIChat />
      </div>
    </HashRouter>
  );
}

export default App;
