import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';

import Banques from './pages/Banques';
import Destinataires from './pages/Destinataires';
import Clients from './pages/Clients';
import Cheques from './pages/Cheques';
import Effets from './pages/Effets';
import Encaissement from './pages/Encaissement';
import Decaissement from './pages/Decaissement';
import Consultation from './pages/Consultation';
import Templates from './pages/Templates';

function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <main className="content-area">
        <Routes>
          <Route path="/" element={<Navigate to="/consultation" replace />} />
          <Route path="/banques" element={<Banques />} />
          <Route path="/destinataires" element={<Destinataires />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/cheques" element={<Cheques />} />
          <Route path="/effets" element={<Effets />} />
          <Route path="/encaissement" element={<Encaissement />} />
          <Route path="/decaissement" element={<Decaissement />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="*" element={<div><h1 className="page-title">Erreur 404</h1><p style={{color: 'var(--text-muted)'}}>Cette page n'existe pas ou est en construction.</p></div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
