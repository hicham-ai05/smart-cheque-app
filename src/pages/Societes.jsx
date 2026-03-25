import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Edit, CheckCircle } from 'lucide-react';

const emptyForm = { name: '', if_num: '', rc: '', tp: '', ice: '', cnss: '', adresse: '', ville: 'Casablanca', tel: '', email: '' };

export default function Societes() {
  const [societes, setSocietes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('societes') || '[]');
    const act = localStorage.getItem('activeSociete');
    setSocietes(stored);
    setActive(act ? Number(act) : (stored[0]?.id || null));
  }, []);

  const save = (data) => {
    localStorage.setItem('societes', JSON.stringify(data));
    setSocietes(data);
  };

  const handleSubmit = () => {
    if (!form.name) return;
    let updated;
    if (editId !== null) {
      updated = societes.map(s => s.id === editId ? { ...form, id: editId } : s);
    } else {
      const newItem = { ...form, id: Date.now() };
      updated = [newItem, ...societes];
      if (updated.length === 1) {
        setActive(newItem.id);
        localStorage.setItem('activeSociete', newItem.id);
      }
    }
    save(updated);
    setShowForm(false);
    setEditId(null);
    setForm({ ...emptyForm });
  };

  const handleEdit = (s) => { setForm(s); setEditId(s.id); setShowForm(true); };
  const handleDelete = (id) => { if (!window.confirm('Supprimer cette société ?')) return; save(societes.filter(s => s.id !== id)); };
  const handleSetActive = (id) => { setActive(id); localStorage.setItem('activeSociete', id); };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Gestion des Sociétés</h1>
          <p className="page-subtitle">Gérez vos entités légales pour l'impression des documents officiels</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...emptyForm }); }}>
          <Plus size={18} /> Nouvelle Société
        </button>
      </header>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            {editId ? 'Modifier la société' : 'Nouvelle société'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { key: 'name', label: 'Raison Sociale *', ph: 'Nom officiel...' },
              { key: 'ice', label: 'ICE', ph: '15 chiffres' },
              { key: 'if_num', label: 'Identifiant Fiscal (IF)', ph: '' },
              { key: 'rc', label: 'Registre de Commerce (RC)', ph: '' },
              { key: 'tp', label: 'Taxe Professionelle (TP)', ph: '' },
              { key: 'cnss', label: 'CNSS', ph: '' },
              { key: 'tel', label: 'Téléphone', ph: '+212...' },
              { key: 'email', label: 'Email', ph: 'contact@...' },
              { key: 'ville', label: 'Ville', ph: 'Casablanca' },
            ].map(f => (
              <div key={f.key} style={f.key === 'name' ? { gridColumn: '1/-1' } : {}}>
                <label style={s.label}>{f.label}</label>
                <input style={s.input} value={form[f.key] || ''} placeholder={f.ph} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={s.label}>Adresse Complète</label>
              <input style={s.input} value={form.adresse} placeholder="N° rue, quartier..." onChange={e => setForm({ ...form, adresse: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button className="btn-primary" onClick={handleSubmit}>{editId ? 'Mettre à jour' : 'Enregistrer'}</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div className="card">
        {societes.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Building2 size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Aucune société enregistrée</h2>
            <p>Ajoutez votre entreprise pour l'afficher sur les bordereaux et documents d'impression.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Raison Sociale</th>
                  <th>ICE</th>
                  <th>RC</th>
                  <th>Ville</th>
                  <th>Tel / Email</th>
                  <th>Active</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {societes.map(soc => (
                  <tr key={soc.id}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{soc.name}</td>
                    <td>{soc.ice || '-'}</td>
                    <td>{soc.rc || '-'}</td>
                    <td>{soc.ville || '-'}</td>
                    <td>{soc.tel || soc.email || '-'}</td>
                    <td>
                      {active === soc.id
                        ? <span className="badge success"><CheckCircle size={12} style={{ marginRight: 4 }} />Active</span>
                        : <button className="btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem' }} onClick={() => handleSetActive(soc.id)}>Activer</button>
                      }
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button style={s.btn} onClick={() => handleEdit(soc)}><Edit size={16} color="var(--text-muted)" /></button>
                        <button style={s.btn} onClick={() => handleDelete(soc.id)}><Trash2 size={16} color="var(--danger)" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  label: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' },
  input: { width: '100%' },
  btn: { background: 'none', border: 'none', padding: '0.4rem', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }
};
