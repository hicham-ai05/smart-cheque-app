import React, { useEffect, useState } from 'react';
import { FileText, Search, Trash2, Printer, CheckSquare, XCircle, CreditCard, RotateCcw } from 'lucide-react';

const STATUS_FLOW = { 'Brouillon': 'Émis', 'Émis': 'En circulation', 'En circulation': 'Payé', 'Payé': null, 'Rejeté': null, 'Annulé': null };
const STATUS_COLOR = { 
  'Brouillon': 'warning', 
  'Émis': 'info', 
  'En circulation': 'warning', 
  'Payé': 'success', 
  'Rejeté': 'danger', 
  'Annulé': 'danger' 
};

export default function EmittedChecks() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [filterType, setFilterType] = useState('Tous'); // 'Tous', 'Chèque', 'LCN'

  const load = () => {
    const stored = JSON.parse(localStorage.getItem('emittedChecks') || '[]');
    setDocuments(stored);
  };

  useEffect(() => { load(); }, []);

  const updateDoc = (id, patch) => {
    const updated = documents.map(c => c.id === id ? { ...c, ...patch } : c);
    setDocuments(updated);
    localStorage.setItem('emittedChecks', JSON.stringify(updated));
  };

  const deleteDoc = (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce document ?')) return;
    const updated = documents.filter(c => c.id !== id);
    setDocuments(updated);
    localStorage.setItem('emittedChecks', JSON.stringify(updated));
  };

  const advance = (doc) => {
    const next = STATUS_FLOW[doc.status];
    if (next) updateDoc(doc.id, { status: next });
  };

  const reject = (doc) => {
    if (window.confirm('Marquer comme rejeté (Impayé) ?')) updateDoc(doc.id, { status: 'Rejeté' });
  };

  const cancel = (doc) => {
    if (window.confirm('Annuler ce document ?')) updateDoc(doc.id, { status: 'Annulé' });
  };

  const filtered = documents.filter(c => {
    const docType = c.type || (c.id.startsWith('LCN') ? 'LCN' : 'Chèque');
    
    const matchSearch = (c.payee || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (c.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Tous' || c.status === filterStatus;
    const matchType = filterType === 'Tous' || docType === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const totalAll = filtered.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const totalEnCirculation = filtered.filter(c => ['Émis', 'En circulation'].includes(c.status)).reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const totalPaye = filtered.filter(c => c.status === 'Payé').reduce((s, c) => s + (Number(c.amount) || 0), 0);

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Mes Émissions</h1>
          <p className="page-subtitle">Journal des paiements (Chèques & Effets) — Gérez le cycle de vie selon la norme BAM</p>
        </div>
      </header>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Rechercher par bénéficiaire ou Numéro..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', paddingLeft: '2.5rem' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-element)', padding: '0.25rem', borderRadius: '8px' }}>
            {['Tous', 'Chèque', 'LCN'].map(t => (
               <button key={t} onClick={() => setFilterType(t)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: filterType === t ? 'var(--bg-card)' : 'transparent', color: filterType === t ? 'var(--accent-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: filterType === t ? 600 : 500 }}>
                  {t}
               </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['Tous', 'Brouillon', 'Émis', 'En circulation', 'Payé', 'Rejeté'].map(st => (
              <button key={st} onClick={() => setFilterStatus(st)}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: filterStatus === st ? 'var(--accent-primary)' : 'var(--bg-element)', color: filterStatus === st ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontWeight: filterStatus === st ? 600 : 400, fontSize: '0.85rem' }}>
                {st}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-element)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem' }}>Aucun document trouvé.</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Essayez de modifier vos filtres.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>N° Document</th>
                  <th>Date Création</th>
                  <th>Bénéficiaire</th>
                  <th>Banque</th>
                  <th style={{ textAlign: 'right' }}>Montant (MAD)</th>
                  <th style={{ textAlign: 'center' }}>Statut</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => {
                  const docType = doc.type || (doc.id.startsWith('LCN') ? 'LCN' : 'Chèque');
                  return (
                    <tr key={doc.id}>
                      <td>
                         <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: docType === 'LCN' ? 'var(--warning)' : 'var(--info)', fontWeight: 600, fontSize: '0.85rem' }}>
                            {docType === 'LCN' ? <FileText size={14} /> : <CreditCard size={14} />}
                            {docType}
                         </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>{doc.checkNum || doc.id.split('-')[1]}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{doc.date}</td>
                      <td style={{ fontWeight: 500, color: '#fff' }}>{doc.payee || '-'}</td>
                      <td>
                         <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{doc.bank || '-'}</span>
                            {doc.echeance && <span style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>Échéance: {doc.echeance}</span>}
                         </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-primary)', textAlign: 'right' }}>
                        {doc.amount ? Number(doc.amount).toLocaleString('fr-MA', { minimumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                         <span className={`badge ${STATUS_COLOR[doc.status] || 'info'}`}>{doc.status}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                          
                          {/* Next step button */}
                          {STATUS_FLOW[doc.status] && (
                            <button style={ab} title={`Passer à: ${STATUS_FLOW[doc.status]}`} onClick={() => advance(doc)}>
                              <CheckSquare size={16} color="var(--success)" />
                            </button>
                          )}
                          
                          {/* Reject button (only if emitted/circulation) */}
                          {['Émis', 'En circulation'].includes(doc.status) && (
                            <button style={ab} title="Marquer comme Rejeté" onClick={() => reject(doc)}>
                              <RotateCcw size={16} color="var(--danger)" />
                            </button>
                          )}

                          {/* Cancel button */}
                          {!['Annulé', 'Payé', 'Rejeté'].includes(doc.status) && (
                            <button style={ab} title="Annuler le document" onClick={() => cancel(doc)}>
                              <XCircle size={16} color="var(--warning)" />
                            </button>
                          )}

                          <button style={ab} title="Imprimer visuel" onClick={() => window.print()}>
                            <Printer size={16} color="var(--info)" />
                          </button>
                          
                          <button style={ab} title="Supprimer définitivement" onClick={() => deleteDoc(doc.id)}>
                            <Trash2 size={16} color="var(--danger)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats Footer Bar */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-card)', borderRadius: '12px', display: 'flex', gap: '1.5rem', justifyContent: 'space-between', flexWrap: 'wrap', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'var(--bg-element)', borderRadius: '8px' }}>
              <FileText size={20} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents filtrés</span>
               <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>{filtered.length}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'var(--warning-bg)', borderRadius: '8px' }}>
              <CreditCard size={20} color="var(--warning)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>En circulation</span>
               <span style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '1.2rem' }}>{totalEnCirculation.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'var(--success-bg)', borderRadius: '8px' }}>
              <CheckSquare size={20} color="var(--success)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total encaissé / payé</span>
               <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.2rem' }}>{totalPaye.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
               <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Valeur AfficHÉE</span>
               <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>{totalAll.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ab = { 
  background: 'var(--bg-element)', 
  border: '1px solid var(--border-color)', 
  padding: '0.4rem', 
  cursor: 'pointer', 
  borderRadius: '6px', 
  display: 'flex', 
  alignItems: 'center',
  transition: 'all 0.2s ease'
};
