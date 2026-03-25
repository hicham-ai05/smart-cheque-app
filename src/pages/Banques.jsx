import React, { useState, useEffect } from 'react';
import { Building2, Save, Trash2, Plus, Edit2, BookOpen } from 'lucide-react';
import { BankLogoRender } from '../utils/bankLogos.jsx';

export default function Banques() {
  const [banks, setBanks] = useState([]);
  const [carnets, setCarnets] = useState([]);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showCarnetForm, setShowCarnetForm] = useState(false);
  
  const [bankForm, setBankForm] = useState({ id: null, name: 'CIH BANK', rib: '', agence: '', soldeInitial: 0 });
  const [carnetForm, setCarnetForm] = useState({ id: null, bankId: '', type: 'Chèque', numDebut: '', numFin: '', serie: '', numCours: '' });

  useEffect(() => {
    setBanks(JSON.parse(localStorage.getItem('my_banks') || '[]'));
    setCarnets(JSON.parse(localStorage.getItem('carnets') || '[]'));
  }, []);

  const saveBank = () => {
    let updated;
    if (bankForm.id) {
      updated = banks.map(b => b.id === bankForm.id ? bankForm : b);
    } else {
      updated = [...banks, { ...bankForm, id: Date.now() }];
    }
    setBanks(updated);
    localStorage.setItem('my_banks', JSON.stringify(updated));
    setShowBankForm(false);
    setBankForm({ id: null, name: 'CIH BANK', rib: '', agence: '', soldeInitial: 0 });
  };

  const deleteBank = (id) => {
    if(window.confirm('Supprimer ce compte bancaire ?')) {
      const updated = banks.filter(b => b.id !== id);
      setBanks(updated);
      localStorage.setItem('my_banks', JSON.stringify(updated));
    }
  };

  const saveCarnet = () => {
    let updated;
    const toSave = { ...carnetForm, etat: 'Ouvert', numCours: carnetForm.numCours || carnetForm.numDebut };
    if (carnetForm.id) {
      updated = carnets.map(c => c.id === carnetForm.id ? toSave : c);
    } else {
      const bank = banks.find(b => String(b.id) === String(carnetForm.bankId));
      updated = [...carnets, { ...toSave, id: Date.now(), bank: bank?.name || 'Inconnue', account: bank?.rib || '' }];
    }
    setCarnets(updated);
    localStorage.setItem('carnets', JSON.stringify(updated));
    setShowCarnetForm(false);
    setCarnetForm({ id: null, bankId: '', type: 'Chèque', numDebut: '', numFin: '', serie: '', numCours: '' });
  };

  const deleteCarnet = (id) => {
    if(window.confirm('Supprimer ce carnet ?')) {
      const updated = carnets.filter(c => c.id !== id);
      setCarnets(updated);
      localStorage.setItem('carnets', JSON.stringify(updated));
    }
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Mes Banques & Carnets</h1>
          <p className="page-subtitle">Paramétrez vos comptes bancaires et vos chéquiers / carnets d'effets.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={() => setShowCarnetForm(true)}><BookOpen size={16} /> Nouveau Carnet</button>
          <button className="btn-primary" onClick={() => setShowBankForm(true)}><Plus size={16} /> Nouveau Compte</button>
        </div>
      </header>

      {/* Forms Modal - simplified as inline forms for brevity but keeping styling premium */}
      {showBankForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--accent-primary)', background: 'var(--accent-active-bg)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff' }}>{bankForm.id ? 'Modifier le compte' : 'Ajouter un compte bancaire'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={lbl}>Nom de la Banque</label>
              <select value={bankForm.name} onChange={e => setBankForm({...bankForm, name: e.target.value})}>
                <option>CIH BANK</option><option>Banque Populaire</option><option>Attijariwafa Bank</option>
                <option>BMCE Bank</option><option>Société Générale</option><option>Crédit du Maroc</option>
                <option>Crédit Agricole du Maroc</option><option>Al Barid Bank</option>
              </select>
            </div>
            <div>
              <label style={lbl}>RIB (24 chiffres)</label>
              <input value={bankForm.rib} onChange={e => setBankForm({...bankForm, rib: e.target.value})} placeholder="Ex: 011 780 0000 0000 0000 000 00" />
            </div>
            <div>
              <label style={lbl}>Agence (Domiciliation)</label>
              <input value={bankForm.agence} onChange={e => setBankForm({...bankForm, agence: e.target.value})} placeholder="Ex: Agence Hassan II" />
            </div>
            <div>
              <label style={lbl}>Solde Initial (MAD)</label>
              <input type="number" value={bankForm.soldeInitial} onChange={e => setBankForm({...bankForm, soldeInitial: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setShowBankForm(false)}>Annuler</button>
            <button className="btn-primary" onClick={saveBank}><Save size={16} /> Enregistrer</button>
          </div>
        </div>
      )}

      {showCarnetForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--info)', background: 'var(--info-bg)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff' }}>{carnetForm.id ? 'Modifier le carnet' : 'Ajouter un nouveau carnet'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={lbl}>Rattaché au Compte</label>
              <select value={carnetForm.bankId} onChange={e => setCarnetForm({...carnetForm, bankId: e.target.value})}>
                <option value="">-- Choisir --</option>
                {banks.map(b => <option key={b.id} value={b.id}>{b.name} - {b.rib.substring(0,10)}...</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Type</label>
              <select value={carnetForm.type} onChange={e => setCarnetForm({...carnetForm, type: e.target.value})}>
                <option>Chèque</option>
                <option>LCN (Effet)</option>
              </select>
            </div>
            <div>
               <label style={lbl}>Série (Optionnel)</label>
               <input value={carnetForm.serie} onChange={e => setCarnetForm({...carnetForm, serie: e.target.value})} placeholder="Ex: A" />
            </div>
            <div>
              <label style={lbl}>N° de Début</label>
              <input value={carnetForm.numDebut} onChange={e => setCarnetForm({...carnetForm, numDebut: e.target.value, numCours: carnetForm.numCours || e.target.value})} placeholder="Ex: 000001" />
            </div>
            <div>
              <label style={lbl}>N° de Fin</label>
              <input value={carnetForm.numFin} onChange={e => setCarnetForm({...carnetForm, numFin: e.target.value})} placeholder="Ex: 000050" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setShowCarnetForm(false)}>Annuler</button>
            <button className="btn-primary" onClick={saveCarnet}><Save size={16} /> Créer Carnet</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
         <div className="card">
           <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>Comptes Bancaires</h2>
           {banks.length === 0 ? <p style={{color: 'var(--text-muted)'}}>Aucun compte.</p> : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {banks.map(b => (
                 <div key={b.id} style={{ padding: '1rem', background: 'var(--bg-element)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                       <div style={{ marginBottom: '8px' }}>
                         <BankLogoRender bankName={b.name} />
                       </div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RIB: <span style={{ fontFamily: 'monospace' }}>{b.rib}</span></div>
                       <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '4px' }}>Agence : {b.agence}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={ibtn} onClick={() => { setBankForm(b); setShowBankForm(true); }}><Edit2 size={16} color="var(--info)" /></button>
                        <button style={ibtn} onClick={() => deleteBank(b.id)}><Trash2 size={16} color="var(--danger)" /></button>
                    </div>
                 </div>
               ))}
             </div>
           )}
         </div>

         <div className="card">
           <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>Carnets Actifs</h2>
           {carnets.length === 0 ? <p style={{color: 'var(--text-muted)'}}>Aucun carnet.</p> : (
             <div className="table-container">
               <table>
                 <thead>
                   <tr>
                     <th>Type</th>
                     <th>Banque</th>
                     <th>Série</th>
                     <th>Plage N°</th>
                     <th>N° Courant</th>
                     <th>État</th>
                     <th style={{textAlign: 'right'}}>Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {carnets.map(c => (
                     <tr key={c.id}>
                       <td><span className={`badge ${c.type === 'Chèque' ? 'info' : 'warning'}`}>{c.type}</span></td>
                       <td style={{ fontWeight: 600 }}>{c.bank}</td>
                       <td>{c.serie || '-'}</td>
                       <td><span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{c.numDebut} &rarr; {c.numFin}</span></td>
                       <td style={{ fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{c.numCours}</td>
                       <td><span className={`badge ${c.etat === 'Ouvert' ? 'success' : 'danger'}`}>{c.etat}</span></td>
                       <td style={{ textAlign: 'right' }}>
                         <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                           <button style={ibtn} onClick={() => { setCarnetForm(c); setShowCarnetForm(true); }}><Edit2 size={15} color="var(--info)" /></button>
                           <button style={ibtn} onClick={() => deleteCarnet(c.id)}><Trash2 size={15} color="var(--danger)" /></button>
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
    </div>
  );
}

const lbl = { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' };
const ibtn = { background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.4rem', cursor: 'pointer', borderRadius: '6px' };
