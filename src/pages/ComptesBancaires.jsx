import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Edit } from 'lucide-react';

const emptyForm = { bank: 'CIH BANK', rib: '', titulaire: '', agence: '', type: 'Courant' };

export default function ComptesBancaires() {
  const [comptes, setComptes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('comptesBancaires') || '[]');
    setComptes(stored);
  }, []);

  const saveToStorage = (data) => {
    localStorage.setItem('comptesBancaires', JSON.stringify(data));
    setComptes(data);
  };

  const handleSubmit = () => {
    if (!form.rib) return;
    let updated;
    if (editId !== null) {
      updated = comptes.map(c => c.id === editId ? { ...form, id: editId } : c);
    } else {
      updated = [{ ...form, id: Date.now() }, ...comptes];
    }
    saveToStorage(updated);
    setShowForm(false);
    setEditId(null);
    setForm({ ...emptyForm });
  };

  const handleEdit = (c) => { setForm(c); setEditId(c.id); setShowForm(true); };
  const handleDelete = (id) => { if (!window.confirm('Supprimer ce compte ?')) return; saveToStorage(comptes.filter(c => c.id !== id)); };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Comptes Bancaires</h1>
          <p className="page-subtitle">Vos comptes RIB liés à vos chéquiers</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...emptyForm }); }}>
          <Plus size={18} /> Nouveau Compte
        </button>
      </header>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            {editId ? 'Modifier le compte' : 'Nouveau compte bancaire'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={s.label}>Banque</label>
              <select style={s.input} value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })}>
                <option>CIH BANK</option><option>Banque Populaire</option><option>Attijariwafa Bank</option><option>BMCE Bank</option><option>Société Générale</option>
              </select>
            </div>
            <div>
              <label style={s.label}>RIB (Numéro de compte)</label>
              <input style={s.input} value={form.rib} placeholder="Ex: 230 810 0011223344556 78" onChange={e => setForm({ ...form, rib: e.target.value })} />
            </div>
            <div>
              <label style={s.label}>Titulaire du compte</label>
              <input style={s.input} value={form.titulaire} placeholder="Raison sociale ou Nom" onChange={e => setForm({ ...form, titulaire: e.target.value })} />
            </div>
            <div>
              <label style={s.label}>Agence</label>
              <input style={s.input} value={form.agence} placeholder="Ex: Casablanca Centre" onChange={e => setForm({ ...form, agence: e.target.value })} />
            </div>
            <div>
              <label style={s.label}>Type de compte</label>
              <select style={s.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="Courant">Courant</option>
                <option value="Épargne">Épargne</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button className="btn-primary" onClick={handleSubmit}>{editId ? 'Mettre à jour' : 'Enregistrer'}</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div className="card">
        {comptes.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CreditCard size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Aucun compte enregistré</h2>
            <p>Ajoutez vos comptes bancaires pour les lier à vos carnets de chèques.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Banque</th>
                  <th>RIB / N° Compte</th>
                  <th>Titulaire</th>
                  <th>Agence</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comptes.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{c.bank}</td>
                    <td style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{c.rib}</td>
                    <td>{c.titulaire || '-'}</td>
                    <td>{c.agence || '-'}</td>
                    <td><span className="badge warning">{c.type}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button style={s.btn} onClick={() => handleEdit(c)}><Edit size={16} color="var(--text-muted)" /></button>
                        <button style={s.btn} onClick={() => handleDelete(c.id)}><Trash2 size={16} color="var(--danger)" /></button>
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
