import React, { useState, useEffect } from 'react';
import { ArrowUpRight, CheckCircle, Clock } from 'lucide-react';

export default function Decaissement() {
  const [emittedDocs, setEmittedDocs] = useState([]);

  useEffect(() => {
    setEmittedDocs(JSON.parse(localStorage.getItem('emittedDocs') || '[]'));
  }, []);

  const totalSorti = emittedDocs.filter(d => d.status === 'Payé' || d.status === 'Débité').reduce((sum, d) => sum + Number(d.amount), 0);
  const totalEncours = emittedDocs.filter(d => d.status === 'Émis' || d.status === 'En circulation').reduce((sum, d) => sum + Number(d.amount), 0);

  const updateStatus = (id, newStatus) => {
    const updated = emittedDocs.map(d => d.id === id ? { ...d, status: newStatus } : d);
    setEmittedDocs(updated);
    localStorage.setItem('emittedDocs', JSON.stringify(updated));
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Décaissement (Sorties)</h1>
          <p className="page-subtitle">Suivi global des décaissements (Chèques et Effets remis à vos fournisseurs).</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
         <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)', background: 'var(--warning-bg)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--warning)', textTransform: 'uppercase', fontWeight: 600 }}>Total en Circulation (À Débiter)</p>
            <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '0.5rem 0' }}>{totalEncours.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</h3>
         </div>
         <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)', background: 'var(--success-bg)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--success)', textTransform: 'uppercase', fontWeight: 600 }}>Total Sorti (Débité / Payé)</p>
            <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '0.5rem 0' }}>{totalSorti.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</h3>
         </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>Documents émis (Fournisseurs)</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Bénéficiaire (Fournisseur)</th>
                <th>N°</th>
                <th>Banque Active</th>
                <th style={{textAlign: 'right'}}>Montant</th>
                <th style={{textAlign: 'center'}}>Statut / Pointage</th>
              </tr>
            </thead>
            <tbody>
              {emittedDocs.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucun document émis.</td></tr>
              ) : emittedDocs.map(d => (
                <tr key={d.id}>
                  <td><span className={`badge ${d.type === 'LCN' ? 'warning' : 'info'}`}>{d.type}</span></td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{d.payee}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{d.checkNum || d.id}</td>
                  <td>{d.bank}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-primary)' }}>{Number(d.amount).toLocaleString('fr-MA', { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'center' }}>
                     <select 
                       value={d.status} 
                       onChange={(e) => updateStatus(d.id, e.target.value)}
                       style={{ padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: ['Payé', 'Débité'].includes(d.status) ? 'var(--success)' : d.status === 'Rejeté' ? 'var(--danger)' : '#fff' }}
                     >
                       <option>Brouillon</option>
                       <option>Émis</option>
                       <option>En circulation</option>
                       <option>Payé</option>
                       <option>Débité</option>
                       <option>Rejeté</option>
                       <option>Annulé</option>
                     </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
