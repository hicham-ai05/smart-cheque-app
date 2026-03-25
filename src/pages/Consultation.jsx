import React, { useEffect, useState } from 'react';
import { Activity, CheckSquare, Clock, ArrowDownToLine, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function Consultation() {
  const [emitted, setEmitted] = useState([]);
  const [received, setReceived] = useState([]);

  useEffect(() => {
    setEmitted(JSON.parse(localStorage.getItem('emittedDocs') || '[]'));
    setReceived(JSON.parse(localStorage.getItem('receivedDocs') || '[]'));
  }, []);

  const pointEmitted = (id) => {
    const updated = emitted.map(d => d.id === id ? { ...d, status: 'Débité' } : d);
    setEmitted(updated);
    localStorage.setItem('emittedDocs', JSON.stringify(updated));
  };

  const pointReceived = (id) => {
    const updated = received.map(d => d.id === id ? { ...d, status: 'Encaissé' } : d);
    setReceived(updated);
    localStorage.setItem('receivedDocs', JSON.stringify(updated));
  };

  // Stats
  const totalSorties = emitted.filter(d => ['Débité', 'Payé'].includes(d.status)).reduce((s, d) => s + Number(d.amount), 0);
  const totalEntrees = received.filter(d => d.status === 'Encaissé').reduce((s, d) => s + Number(d.montant), 0);
  const soldeTheorique = totalEntrees - totalSorties;

  // Circulation
  const decaissementEnCours = emitted.filter(d => ['Émis', 'En circulation'].includes(d.status));
  const encaissementEnCours = received.filter(d => ['Reçu', 'Remis en banque'].includes(d.status));

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Consultation & Rapprochement</h1>
        <p className="page-subtitle">Vision globale de la trésorerie et pointage bancaire.</p>
      </header>

      {/* TDB Stats */}
      <h2 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 600, marginBottom: '1.5rem' }}>Tableau de Bord Trésorerie</h2>
      <div style={styles.statsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={{...styles.statIconWrapper, borderColor: 'rgba(59, 130, 246, 0.3)', background: 'var(--info-bg)'}}>
            <TrendingUp size={24} color="var(--info)" />
          </div>
          <div>
            <p style={styles.statLabel}>Solde Bancaire (Delta)</p>
            <h3 style={{...styles.statValue, color: soldeTheorique >= 0 ? 'var(--info)' : 'var(--danger)'}}>{soldeTheorique.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</h3>
          </div>
        </div>
        
        <div className="card" style={styles.statCard}>
          <div style={{...styles.statIconWrapper, borderColor: 'rgba(16, 185, 129, 0.3)', background: 'var(--success-bg)'}}>
            <ArrowDownToLine size={24} color="var(--success)" />
          </div>
          <div>
            <p style={styles.statLabel}>Total Encaissé (Entrées)</p>
            <h3 style={{...styles.statValue, color: 'var(--success)'}}>{totalEntrees.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</h3>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{...styles.statIconWrapper, borderColor: 'rgba(239, 68, 68, 0.3)', background: 'var(--danger-bg)'}}>
            <ArrowUpRight size={24} color="var(--danger)" />
          </div>
          <div>
            <p style={styles.statLabel}>Total Débité (Sorties)</p>
            <h3 style={{...styles.statValue, color: 'var(--danger)'}}>{totalSorties.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
         {/* Pointage Sorties */}
         <div className="card">
            <h2 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--warning)" /> Décaissements en Circulation
            </h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>N°</th>
                    <th>Fournisseur</th>
                    <th style={{textAlign: 'right'}}>Montant</th>
                    <th style={{textAlign: 'center'}}>Pointer</th>
                  </tr>
                </thead>
                <tbody>
                  {decaissementEnCours.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Aucun document en circulation.</td></tr>
                  ) : decaissementEnCours.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontSize: '0.8rem' }}>{d.type}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{d.checkNum}</td>
                      <td style={{ fontWeight: 500 }}>{d.payee}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--accent-primary)' }}>{Number(d.amount).toLocaleString('fr-MA', { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: 'center' }}>
                         <button style={btnPoint} onClick={() => pointEmitted(d.id)} title="Marquer comme Débité sur le relevé">
                           <CheckSquare size={16} /> Pointer
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </div>

         {/* Pointage Entrées */}
         <div className="card">
            <h2 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--warning)" /> Encaissements en Attente
            </h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Client</th>
                    <th>N° Pièce</th>
                    <th style={{textAlign: 'right'}}>Montant</th>
                    <th style={{textAlign: 'center'}}>Pointer</th>
                  </tr>
                </thead>
                <tbody>
                  {encaissementEnCours.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Aucun encaissement en attente.</td></tr>
                  ) : encaissementEnCours.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontSize: '0.8rem' }}>{d.type}</td>
                      <td style={{ fontWeight: 500 }}>{d.client}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{d.numPiece}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--accent-primary)' }}>{Number(d.montant).toLocaleString('fr-MA', { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: 'center' }}>
                         <button style={btnPoint} onClick={() => pointReceived(d.id)} title="Marquer comme Encaissé sur le relevé">
                           <CheckSquare size={16} /> Pointer
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </div>
      </div>
    </div>
  );
}

const btnPoint = { background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 };

const styles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  statIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-element)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  statValue: {
    fontSize: '1.6rem',
    color: '#fff',
    fontWeight: 700,
  }
};
