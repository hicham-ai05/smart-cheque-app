import React, { useEffect, useState } from 'react';
import { Activity, Clock, TrendingUp, FileText, CreditCard, CheckSquare } from 'lucide-react';

export default function Dashboard() {
  const [recentDocs, setRecentDocs] = useState([]);
  const [stats, setStats] = useState({ 
    totalEmitted: 0, 
    pendingAmount: 0, 
    totalDocuments: 0,
    totalChequesCirculation: 0,
    totalLcnCirculation: 0,
    totalPaye: 0
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('emittedChecks') || '[]');
    setRecentDocs(stored.slice(0, 6)); // Last 6 docs

    let totalE = 0, pendingE = 0, chqCirculation = 0, lcnCirculation = 0, paye = 0;

    stored.forEach(c => {
      const amount = Number(c.amount) || 0;
      const type = c.type || (c.id.startsWith('LCN') ? 'LCN' : 'Chèque');
      
      totalE += amount;
      
      if (c.status === 'Brouillon' || c.status === 'En attente') {
        pendingE += amount;
      }
      
      if (c.status === 'Émis' || c.status === 'En circulation') {
        if (type === 'Chèque') chqCirculation += amount;
        else if (type === 'LCN') lcnCirculation += amount;
      }

      if (c.status === 'Payé') {
        paye += amount;
      }
    });
    
    setStats({
      totalEmitted: totalE,
      pendingAmount: pendingE,
      totalDocuments: stored.length,
      totalChequesCirculation: chqCirculation,
      totalLcnCirculation: lcnCirculation,
      totalPaye: paye
    });
  }, []);

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-subtitle">Aperçu général de vos flux de trésorerie (Chèques et Effets)</p>
      </header>

      {/* Primary Stats */}
      <div style={styles.statsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIconWrapper}>
            <TrendingUp size={24} color="var(--accent-primary)" />
          </div>
          <div>
            <p style={styles.statLabel}>Montant Total Enregistré</p>
            <h3 style={styles.statValue}>{stats.totalEmitted.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</h3>
          </div>
        </div>
        
        <div className="card" style={styles.statCard}>
          <div style={{...styles.statIconWrapper, borderColor: 'rgba(16, 185, 129, 0.3)', background: 'var(--success-bg)'}}>
            <CheckSquare size={24} color="var(--success)" />
          </div>
          <div>
            <p style={styles.statLabel}>Montant Total Encaissé / Payé</p>
            <h3 style={{...styles.statValue, color: 'var(--success)'}}>{stats.totalPaye.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</h3>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{...styles.statIconWrapper, borderColor: 'rgba(59, 130, 246, 0.3)', background: 'var(--info-bg)'}}>
            <Clock size={24} color="var(--info)" />
          </div>
          <div>
            <p style={styles.statLabel}>Brouillons / En Attente</p>
            <h3 style={styles.statValue}>{stats.pendingAmount.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</h3>
          </div>
        </div>
      </div>

      {/* Secondary Stats (Circulation Breakdown) */}
      <h2 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 600, marginBottom: '1.5rem' }}>Encours en Circulation</h2>
      <div style={{...styles.statsGrid, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
        
        <div className="card" style={{...styles.statCard, padding: '1.5rem'}}>
          <div style={{...styles.statIconWrapper, width: '40px', height: '40px'}}>
            <CreditCard size={20} color="var(--warning)" />
          </div>
          <div>
            <p style={styles.statLabel}>Chèques en circulation</p>
            <h3 style={{...styles.statValue, fontSize: '1.25rem', color: 'var(--warning)'}}>{stats.totalChequesCirculation.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</h3>
          </div>
        </div>

        <div className="card" style={{...styles.statCard, padding: '1.5rem'}}>
          <div style={{...styles.statIconWrapper, width: '40px', height: '40px'}}>
            <FileText size={20} color="var(--warning)" />
          </div>
          <div>
            <p style={styles.statLabel}>Effets (LCN) en circulation</p>
            <h3 style={{...styles.statValue, fontSize: '1.25rem', color: 'var(--warning)'}}>{stats.totalLcnCirculation.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</h3>
          </div>
        </div>

        <div className="card" style={{...styles.statCard, padding: '1.5rem'}}>
          <div style={{...styles.statIconWrapper, width: '40px', height: '40px'}}>
            <Activity size={20} color="var(--text-main)" />
          </div>
          <div>
            <p style={styles.statLabel}>Documents Traités</p>
            <h3 style={{...styles.statValue, fontSize: '1.25rem'}}>{stats.totalDocuments} Docs</h3>
          </div>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div style={styles.tableHeader}>
          <h2 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 600 }}>Derniers Documents Enregistrés</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>N°</th>
                <th>Création</th>
                <th>Bénéficiaire</th>
                <th style={{ textAlign: 'right' }}>Montant</th>
                <th style={{ textAlign: 'center' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentDocs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                    <Activity size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                    Aucun document récent. Mettez-vous à jour !
                  </td>
                </tr>
              ) : recentDocs.map((doc) => {
                const docType = doc.type || (doc.id.startsWith('LCN') ? 'LCN' : 'Chèque');
                return (
                  <tr key={doc.id}>
                    <td>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: docType === 'LCN' ? 'var(--warning)' : 'var(--info)', fontWeight: 600, fontSize: '0.85rem' }}>
                          {docType === 'LCN' ? <FileText size={14} /> : <CreditCard size={14} />}
                          {docType}
                       </span>
                    </td>
                    <td style={{ fontWeight: 500, color: '#fff' }}>{doc.checkNum || doc.id.split('-')[1]}</td>
                    <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{doc.date}</td>
                    <td style={{ fontWeight: 500 }}>{doc.payee || '-'}</td>
                    <td style={{ fontWeight: 700, textAlign: 'right', color: 'var(--accent-primary)' }}>{doc.amount ? Number(doc.amount).toLocaleString('fr-MA', { minimumFractionDigits: 2 }) : '0.00'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${
                         doc.status === 'Payé' ? 'success' : 
                         ['Rejeté', 'Annulé'].includes(doc.status) ? 'danger' : 
                         ['Émis', 'En circulation'].includes(doc.status) ? 'info' : 
                         'warning'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  }
};
