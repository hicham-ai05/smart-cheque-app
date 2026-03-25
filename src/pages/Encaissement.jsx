import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, Plus, Save, Trash2, Edit2, CheckCircle } from 'lucide-react';

export default function Encaissement() {
  const [receivedDocs, setReceivedDocs] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({
    id: null,
    client: '',
    type: 'Chèque',
    numPiece: '',
    banqueTireur: '',
    montant: '',
    dateReception: new Date().toISOString().split('T')[0],
    dateEcheance: '',
    status: 'Reçu' // Reçu, Remis en banque, Encaissé, Impayé
  });

  useEffect(() => {
    setReceivedDocs(JSON.parse(localStorage.getItem('receivedDocs') || '[]'));
    setClients(JSON.parse(localStorage.getItem('clients') || '[]'));
  }, []);

  const save = () => {
    let updated;
    const toSave = { ...form, id: form.id || `REC-${Date.now()}` };
    if (form.id) {
      updated = receivedDocs.map(d => d.id === form.id ? toSave : d);
    } else {
      updated = [toSave, ...receivedDocs];
    }
    setReceivedDocs(updated);
    localStorage.setItem('receivedDocs', JSON.stringify(updated));
    setShowForm(false);
    setForm({ id: null, client: '', type: 'Chèque', numPiece: '', banqueTireur: '', montant: '', dateReception: new Date().toISOString().split('T')[0], dateEcheance: '', status: 'Reçu' });
  };

  const remove = (id) => {
    if(window.confirm('Supprimer cet encaissement ?')) {
      const updated = receivedDocs.filter(d => d.id !== id);
      setReceivedDocs(updated);
      localStorage.setItem('receivedDocs', JSON.stringify(updated));
    }
  };

  const updateStatus = (id, newStatus) => {
    const updated = receivedDocs.map(d => d.id === id ? { ...d, status: newStatus } : d);
    setReceivedDocs(updated);
    localStorage.setItem('receivedDocs', JSON.stringify(updated));
  };

  const totalReceived = receivedDocs.filter(d => d.status === 'Reçu').reduce((sum, d) => sum + Number(d.montant), 0);
  const totalEnCaisse = receivedDocs.filter(d => d.status === 'Encaissé').reduce((sum, d) => sum + Number(d.montant), 0);

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Encaissement</h1>
          <p className="page-subtitle">Saisie des chèques et effets reçus des clients (Entrées d'argent).</p>
        </div>
        {!showForm ? (
          <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Nouvelle Réception</button>
        ) : (
          <button className="btn-secondary" onClick={() => setShowForm(false)}>Fermer</button>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
         <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--info)', background: 'var(--info-bg)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--info)', textTransform: 'uppercase', fontWeight: 600 }}>Total à remettre en banque</p>
            <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '0.5rem 0' }}>{totalReceived.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</h3>
         </div>
         <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)', background: 'var(--success-bg)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--success)', textTransform: 'uppercase', fontWeight: 600 }}>Total Encaissé</p>
            <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '0.5rem 0' }}>{totalEnCaisse.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</h3>
         </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--accent-primary)', background: 'var(--accent-active-bg)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Détails de la pièce reçue</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={lbl}>Client (Tireur)</label>
              <select value={form.client} onChange={e => setForm({...form, client: e.target.value})} style={{ width: '100%' }}>
                <option value="">Sélectionnez un client...</option>
                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Type de Pièce</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%' }}>
                <option>Chèque</option><option>LCN</option><option>Virement</option><option>Espèces</option>
              </select>
            </div>
            {['Chèque', 'LCN'].includes(form.type) && (
              <>
                <div><label style={lbl}>N° de la pièce</label><input value={form.numPiece} onChange={e => setForm({...form, numPiece: e.target.value})} /></div>
                <div><label style={lbl}>Banque du Client</label><input value={form.banqueTireur} onChange={e => setForm({...form, banqueTireur: e.target.value})} /></div>
              </>
            )}
            <div><label style={lbl}>Montant (MAD)</label><input type="number" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} /></div>
            <div><label style={lbl}>Date Réception</label><input type="date" value={form.dateReception} onChange={e => setForm({...form, dateReception: e.target.value})} /></div>
            {form.type === 'LCN' && (
              <div><label style={lbl}>Date d'échéance</label><input type="date" value={form.dateEcheance} onChange={e => setForm({...form, dateEcheance: e.target.value})} /></div>
            )}
            <div>
              <label style={lbl}>Statut initial</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: '100%' }}>
                <option>Reçu</option><option>Remis en banque</option><option>Encaissé</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
            <button className="btn-primary" onClick={save} disabled={!form.client || !form.montant}><Save size={16} /> Enregistrer l'encaissement</button>
          </div>
        </div>
      )}

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>Historique des Encaissements</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Client</th>
                <th>N° Pièce</th>
                <th>Banque</th>
                <th style={{textAlign: 'right'}}>Montant</th>
                <th style={{textAlign: 'center'}}>Statut / Cycle</th>
                <th style={{textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {receivedDocs.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucun encaissement saisi.</td></tr>
              ) : receivedDocs.map(d => (
                <tr key={d.id}>
                  <td><span className={`badge ${d.type === 'LCN' ? 'warning' : 'info'}`}>{d.type}</span></td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{d.client}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{d.numPiece || '-'}</td>
                  <td>{d.banqueTireur}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-primary)' }}>{Number(d.montant).toLocaleString('fr-MA', { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'center' }}>
                     <select 
                       value={d.status} 
                       onChange={(e) => updateStatus(d.id, e.target.value)}
                       style={{ padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: d.status === 'Encaissé' ? 'var(--success)' : d.status === 'Impayé' ? 'var(--danger)' : '#fff' }}
                     >
                       <option>Reçu</option>
                       <option>Remis en banque</option>
                       <option>Encaissé</option>
                       <option>Impayé</option>
                     </select>
                  </td>
                  <td style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                    <button style={ibtn} onClick={() => { setForm(d); setShowForm(true); }}><Edit2 size={15} color="var(--info)" /></button>
                    <button style={ibtn} onClick={() => remove(d.id)}><Trash2 size={15} color="var(--danger)" /></button>
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

const lbl = { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' };
const ibtn = { background: 'var(--bg-element)', border: '1px solid var(--border-color)', padding: '0.4rem', cursor: 'pointer', borderRadius: '6px' };
