import React, { useState, useEffect } from 'react';
import { Users, Plus, Save, Trash2, Edit2, Search } from 'lucide-react';

export default function Destinataires() {
  const [payees, setPayees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  
  const [form, setForm] = useState({ id: null, name: '', ice: '', telephone: '', email: '', adresse: '' });

  useEffect(() => {
    setPayees(JSON.parse(localStorage.getItem('payees') || '[]'));
  }, []);

  const save = () => {
    let updated;
    if (form.id) {
      updated = payees.map(p => p.id === form.id ? form : p);
    } else {
      updated = [{ ...form, id: Date.now() }, ...payees];
    }
    setPayees(updated);
    localStorage.setItem('payees', JSON.stringify(updated));
    setShowForm(false);
    setForm({ id: null, name: '', ice: '', telephone: '', email: '', adresse: '' });
  };

  const remove = (id) => {
    if(window.confirm('Supprimer ce fournisseur ?')) {
      const updated = payees.filter(p => p.id !== id);
      setPayees(updated);
      localStorage.setItem('payees', JSON.stringify(updated));
    }
  };

  const filtered = payees.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.ice && p.ice.includes(search)));

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Destinataires (Fournisseurs)</h1>
          <p className="page-subtitle">Annuaire des bénéficiaires pour l'émission de chèques ou LCN.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Nouveau Destinataire</button>
      </header>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--info)', background: 'var(--info-bg)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff' }}>{form.id ? 'Modifier Destinataire' : 'Ajouter Destinataire'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div><label style={lbl}>Nom / Raison Sociale *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} autoFocus /></div>
            <div><label style={lbl}>ICE (Identifiant Commun)</label><input value={form.ice} onChange={e => setForm({...form, ice: e.target.value})} /></div>
            <div><label style={lbl}>Téléphone</label><input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} /></div>
            <div><label style={lbl}>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Adresse</label><input value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} /></div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
            <button className="btn-primary" onClick={save} disabled={!form.name}><Save size={16} /> Enregistrer</button>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ position: 'relative', width: '300px', marginBottom: '1.5rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Rechercher Raison sociale, ICE..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', paddingLeft: '2.5rem' }} />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Raison Sociale</th>
                <th>ICE</th>
                <th>Contact</th>
                <th>Adresse</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucun destinataire trouvé.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{p.name}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.ice || '-'}</td>
                  <td>
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span>{p.telephone || '-'}</span>
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.email || ''}</span>
                     </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.adresse || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button style={ibtn} onClick={() => { setForm(p); setShowForm(true); }}><Edit2 size={16} color="var(--info)" /></button>
                      <button style={ibtn} onClick={() => remove(p.id)}><Trash2 size={16} color="var(--danger)" /></button>
                    </div>
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
