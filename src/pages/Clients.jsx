import React, { useState, useEffect } from 'react';
import { UserSquare2, Plus, Save, Trash2, Edit2, Search } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  
  const [form, setForm] = useState({ id: null, name: '', ice: '', telephone: '', email: '', adresse: '' });

  useEffect(() => {
    setClients(JSON.parse(localStorage.getItem('clients') || '[]'));
  }, []);

  const save = () => {
    let updated;
    if (form.id) {
      updated = clients.map(c => c.id === form.id ? form : c);
    } else {
      updated = [{ ...form, id: Date.now() }, ...clients];
    }
    setClients(updated);
    localStorage.setItem('clients', JSON.stringify(updated));
    setShowForm(false);
    setForm({ id: null, name: '', ice: '', telephone: '', email: '', adresse: '' });
  };

  const remove = (id) => {
    if(window.confirm('Supprimer ce client ?')) {
      const updated = clients.filter(c => c.id !== id);
      setClients(updated);
      localStorage.setItem('clients', JSON.stringify(updated));
    }
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.ice && c.ice.includes(search)));

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Clients (Payeurs)</h1>
          <p className="page-subtitle">Annuaire de votre clientèle pour la réception et le rapprochement des encaissements.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Nouveau Client</button>
      </header>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--accent-primary)', background: 'var(--accent-active-bg)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff' }}>{form.id ? 'Modifier Client' : 'Ajouter Client'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div><label style={lbl}>Nom / Raison Sociale *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} autoFocus /></div>
            <div><label style={lbl}>ICE (Identifiant Commun)</label><input value={form.ice} onChange={e => setForm({...form, ice: e.target.value})} /></div>
            <div><label style={lbl}>Téléphone</label><input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} /></div>
            <div><label style={lbl}>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Adresse de Facturation</label><input value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} /></div>
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
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucun client trouvé.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{c.name}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{c.ice || '-'}</td>
                  <td>
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span>{c.telephone || '-'}</span>
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.email || ''}</span>
                     </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.adresse || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button style={ibtn} onClick={() => { setForm(c); setShowForm(true); }}><Edit2 size={16} color="var(--info)" /></button>
                      <button style={ibtn} onClick={() => remove(c.id)}><Trash2 size={16} color="var(--danger)" /></button>
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
