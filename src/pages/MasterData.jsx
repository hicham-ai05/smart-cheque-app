import React, { useState, useEffect } from 'react';
import { Users, Building, Plus, Trash2, Edit } from 'lucide-react';

export default function MasterData({ type = 'payees' }) {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState('');

  const title = type === 'payees' ? 'Gestion des Bénéficiaires' : 'Gestion des Banques';
  const icon = type === 'payees' ? <Users size={24} color="var(--accent-primary)" /> : <Building size={24} color="var(--accent-primary)" />;
  const storageKey = type === 'payees' ? 'payees' : 'banks';

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    // Seed with defaults if empty
    if (stored.length === 0) {
      const defaults = type === 'payees' 
        ? [{ id: 1, name: 'IAM' }, { id: 2, name: 'ONEE' }, { id: 3, name: 'Marjane' }]
        : [{ id: 1, name: 'CIH BANK' }, { id: 2, name: 'Banque Populaire' }, { id: 3, name: 'Attijariwafa Bank' }];
      setData(defaults);
      localStorage.setItem(storageKey, JSON.stringify(defaults));
    } else {
      setData(stored);
    }
  }, [type, storageKey]);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    const newData = [...data, { id: Date.now(), name: newItem }];
    setData(newData);
    localStorage.setItem(storageKey, JSON.stringify(newData));
    setNewItem('');
  };

  const handleDelete = (id) => {
    const newData = data.filter(item => item.id !== id);
    setData(newData);
    localStorage.setItem(storageKey, JSON.stringify(newData));
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-element)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {icon}
        </div>
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">Gérez vos données de base pour faciliter la saisie des chèques</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '2rem' }}>
        <div className="card" style={{ height: 'max-content' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff' }}>Ajouter un {type === 'payees' ? 'bénéficiaire' : 'établissement'}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Nom complet ou Raison Sociale..." 
              value={newItem} 
              onChange={(e) => setNewItem(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn-primary" onClick={handleAdd}>
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nom / Raison Sociale</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500, color: '#fff' }}>{item.name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button style={styles.actionBtn}>
                          <Edit size={16} color="var(--text-muted)" />
                        </button>
                        <button style={styles.actionBtn} onClick={() => handleDelete(item.id)}>
                          <Trash2 size={16} color="var(--danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Aucune donnée.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  actionBtn: {
    background: 'none',
    border: 'none',
    padding: '0.4rem',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
