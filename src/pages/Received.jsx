import React, { useState, useEffect } from 'react';
import { Inbox, FilePlus, CheckSquare, Printer, Plus } from 'lucide-react';

export default function Received() {
  const [receivedChecks, setReceivedChecks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newCheck, setNewCheck] = useState({ client: '', amount: '', bank: '', date: '', number: '' });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('receivedChecks') || '[]');
    setReceivedChecks(stored);
  }, []);

  const handleAdd = () => {
    if (!newCheck.client || !newCheck.amount) return;
    const checkRecord = {
      id: `REC-${Date.now()}`,
      ...newCheck,
      status: 'À déposer',
      timestamp: new Date().toISOString()
    };
    const updated = [checkRecord, ...receivedChecks];
    setReceivedChecks(updated);
    localStorage.setItem('receivedChecks', JSON.stringify(updated));
    setNewCheck({ client: '', amount: '', bank: '', date: '', number: '' });
    setShowForm(false);
  };

  const handleGenerateSlip = () => {
    const toDeposit = receivedChecks.filter(c => c.status === 'À déposer');
    if (toDeposit.length === 0) {
      alert("Aucun chèque à déposer sélectionné.");
      return;
    }
    alert(`Génération du bordereau de remise pour ${toDeposit.length} chèque(s). Total: ${toDeposit.reduce((sum, c) => sum + Number(c.amount), 0)} DH. Cette action lancera l'impression.`);
    
    // Marquer comme déposé
    const updated = receivedChecks.map(c => c.status === 'À déposer' ? { ...c, status: 'Déposé' } : c);
    setReceivedChecks(updated);
    localStorage.setItem('receivedChecks', JSON.stringify(updated));
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Remise de Chèques Reçus</h1>
          <p className="page-subtitle">Enregistrez les chèques de vos clients et générez vos bordereaux de dépôt</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> Saisir un chèque reçu
          </button>
          <button className="btn-primary" onClick={handleGenerateSlip}>
            <Printer size={18} /> Imprimer Bordereau
          </button>
        </div>
      </header>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Nouveau chèque reçu</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
             <div>
                <label style={styles.label}>N° Chèque</label>
                <input style={styles.input} type="text" value={newCheck.number} onChange={e => setNewCheck({...newCheck, number: e.target.value})} placeholder="Ex: 1234567" />
             </div>
             <div>
                <label style={styles.label}>Banque (Tiré)</label>
                <input style={styles.input} type="text" value={newCheck.bank} onChange={e => setNewCheck({...newCheck, bank: e.target.value})} placeholder="Banque Populaire..." />
             </div>
             <div>
                <label style={styles.label}>Nom du Client (Tireur)</label>
                <input style={styles.input} type="text" value={newCheck.client} onChange={e => setNewCheck({...newCheck, client: e.target.value})} placeholder="Société ou Particulier" />
             </div>
             <div>
                <label style={styles.label}>Montant (DH)</label>
                <input style={styles.input} type="number" value={newCheck.amount} onChange={e => setNewCheck({...newCheck, amount: e.target.value})} placeholder="0.00" />
             </div>
             <div>
                <button className="btn-primary" style={{ width: '100%' }} onClick={handleAdd}>Ajouter</button>
             </div>
          </div>
        </div>
      )}

      <div className="card">
        {receivedChecks.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Inbox size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Aucun chèque enregistré</h2>
            <p>Saisissez les chèques payés par vos clients pour préparer la remise bancaire.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>N° Chèque</th>
                  <th>Client Tireur</th>
                  <th>Banque</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {receivedChecks.map((check) => (
                  <tr key={check.id}>
                    <td style={{ fontWeight: 500, color: '#fff' }}>{check.number || '-'}</td>
                    <td>{check.client}</td>
                    <td>{check.bank || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{Number(check.amount).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH</td>
                    <td>
                      <span className={`badge ${check.status === 'À déposer' ? 'warning' : 'success'}`}>
                        {check.status === 'À déposer' && <CheckSquare size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }}/>}
                        {check.status}
                      </span>
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

const styles = {
  label: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' },
  input: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: '#fff' }
};
