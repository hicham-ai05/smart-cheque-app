import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit } from 'lucide-react';

export default function Carnets() {
  const [carnets, setCarnets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ bank: 'CIH BANK', account: '', serie: '', numDebut: '', numFin: '', numCours: '', etat: 'Ouvert' });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('carnets') || '[]');
    setCarnets(stored);
  }, []);

  const save = (data) => {
    localStorage.setItem('carnets', JSON.stringify(data));
    setCarnets(data);
  };

  const handleSubmit = () => {
    if (!form.numDebut || !form.numFin) return;
    let updated;
    if (editId !== null) {
      updated = carnets.map(c => c.id === editId ? { ...form, id: editId } : c);
    } else {
      updated = [{ ...form, id: Date.now(), numCours: form.numDebut }, ...carnets];
    }
    save(updated);
    setShowForm(false);
    setEditId(null);
    setForm({ bank: 'CIH BANK', account: '', serie: '', numDebut: '', numFin: '', numCours: '', etat: 'Ouvert' });
  };

  const handleEdit = (c) => {
    setForm(c);
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer ce carnet ?')) return;
    save(carnets.filter(c => c.id !== id));
  };

  const remaining = (c) => Math.max(0, parseInt(c.numFin) - parseInt(c.numCours) + 1);

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Carnets de Chèques</h1>
          <p className="page-subtitle">Gérez vos chéquiers physiques et suivez le numéro en cours</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ bank: 'CIH BANK', account: '', serie: '', numDebut: '', numFin: '', numCours: '', etat: 'Ouvert' }); }}>
          <Plus size={18} /> Nouveau Carnet
        </button>
      </header>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            {editId ? 'Modifier le carnet' : 'Nouveau carnet de chèques'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={s.label}>Banque</label>
              <select style={s.input} value={form.bank} onChange={e => setForm({...form, bank: e.target.value})}>
                <option>CIH BANK</option>
                <option>Banque Populaire</option>
                <option>Attijariwafa Bank</option>
                <option>BMCE Bank</option>
                <option>Société Générale</option>
              </select>
            </div>
            <div>
              <label style={s.label}>N° Compte (RIB)</label>
              <input style={s.input} value={form.account} onChange={e => setForm({...form, account: e.target.value})} placeholder="Ex: 011 22334455 66" />
            </div>
            <div>
              <label style={s.label}>Série</label>
              <input style={s.input} value={form.serie} onChange={e => setForm({...form, serie: e.target.value})} placeholder="Ex: A, B, 01..." />
            </div>
            <div>
              <label style={s.label}>N° Début</label>
              <input style={s.input} type="number" value={form.numDebut} onChange={e => setForm({...form, numDebut: e.target.value, numCours: e.target.value})} placeholder="Ex: 1000001" />
            </div>
            <div>
              <label style={s.label}>N° Fin</label>
              <input style={s.input} type="number" value={form.numFin} onChange={e => setForm({...form, numFin: e.target.value})} placeholder="Ex: 1000025" />
            </div>
            <div>
              <label style={s.label}>État</label>
              <select style={s.input} value={form.etat} onChange={e => setForm({...form, etat: e.target.value})}>
                <option value="Ouvert">Ouvert</option>
                <option value="Fermé">Fermé</option>
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
        {carnets.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Aucun carnet enregistré</h2>
            <p>Ajoutez un carnet de chèques pour activer la numérotation automatique.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Banque</th>
                  <th>Série</th>
                  <th>N° Début</th>
                  <th>N° Fin</th>
                  <th>N° En Cours</th>
                  <th>Restants</th>
                  <th>État</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {carnets.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500, color: '#fff' }}>{c.bank}</td>
                    <td>{c.serie || '-'}</td>
                    <td>{c.numDebut}</td>
                    <td>{c.numFin}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{c.numCours}</td>
                    <td>
                      <span className={`badge ${remaining(c) > 5 ? 'success' : remaining(c) > 0 ? 'warning' : 'danger'}`}>
                        {remaining(c)} chèque{remaining(c) !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td><span className={`badge ${c.etat === 'Ouvert' ? 'success' : 'danger'}`}>{c.etat}</span></td>
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
