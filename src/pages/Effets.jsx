import React, { useState, useEffect } from 'react';
import { Printer, Save, CheckCircle, FileText, Edit2, Trash2 } from 'lucide-react';
import { numberToFrench } from '../utils/numberToFrench';
import { BankLogoRender } from '../utils/bankLogos.jsx';

const CHECK_WIDTH_MM = 175;
const CHECK_HEIGHT_MM = 80;

const defaultFields = [
  { id: 'amount', left: 130, top: 35 },
  { id: 'amountText', left: 30, top: 45 },
  { id: 'payee', left: 30, top: 58 },
  { id: 'city', left: 80, top: 70 },
  { id: 'date', left: 135, top: 70 },
  { id: 'echeance', left: 50, top: 20 },
  { id: 'domiciliation', left: 100, top: 20 },
];

export default function Effets() {
  const [carnets, setCarnets] = useState([]);
  const [selectedCarnet, setSelectedCarnet] = useState(null);
  const [payees, setPayees] = useState([]);
  const [logoError, setLogoError] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [emitted, setEmitted] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [template, setTemplate] = useState(defaultFields);

  const [formData, setFormData] = useState({
    type: 'LCN',
    checkNum: '',
    amount: '',
    amountText: '',
    payee: '',
    date: new Date().toISOString().split('T')[0],
    city: 'Casablanca',
    bank: 'CIH BANK',
    echeance: '',
    domiciliation: '',
    observation: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const c = JSON.parse(localStorage.getItem('carnets') || '[]').filter(c => c.etat === 'Ouvert' && c.type === 'LCN');
    const p = JSON.parse(localStorage.getItem('payees') || '[]');
    const e = JSON.parse(localStorage.getItem('emittedDocs') || '[]').filter(d => d.type === 'LCN');
    
    setCarnets(c);
    setPayees(p);
    setEmitted(e);

    if (c.length > 0 && !formData.checkNum) {
      const carnet = c[0];
      setSelectedCarnet(carnet);
      setFormData(f => ({ ...f, bank: carnet.bank, checkNum: carnet.numCours }));
      loadTemplate(carnet.bank);
    } else {
      loadTemplate(formData.bank);
    }
  };

  const loadTemplate = (bankName) => {
    const saved = JSON.parse(localStorage.getItem('printTemplates') || '{}');
    if (saved[`${bankName}_LCN`]) {
      setTemplate(saved[`${bankName}_LCN`]);
    } else {
      setTemplate(defaultFields);
    }
  };

  const getBankDomain = (bankName) => {
    const map = { 'CIH BANK': 'cihbank.ma', 'Banque Populaire': 'groupebanquepopulaire.ma', 'Attijariwafa Bank': 'attijariwafabank.com', 'BMCE Bank': 'bankofafrica.ma', 'Société Générale': 'sgmaroc.com' };
    return map[bankName] || null;
  };

  const handleCarnetChange = (e) => {
    const carnet = carnets.find(c => String(c.id) === e.target.value);
    if (carnet) {
      setSelectedCarnet(carnet);
      setFormData(f => ({ ...f, bank: carnet.bank, checkNum: carnet.numCours }));
      setLogoError(false);
      loadTemplate(carnet.bank);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const update = { [name]: value };
    if (name === 'amount') update.amountText = value ? numberToFrench(value) : '';
    if (name === 'bank') {
       setLogoError(false);
       loadTemplate(value);
    }
    setFormData(f => ({ ...f, ...update }));
    setSaved(false);
  };

  const saveCheck = (status = 'Brouillon') => {
    const newCheck = {
      id: `LCN-${formData.checkNum || Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      ...formData,
      status,
      timestamp: new Date().toISOString()
    };
    
    const allDocs = JSON.parse(localStorage.getItem('emittedDocs') || '[]');
    const updatedDocs = [newCheck, ...allDocs.filter(d => d.id !== newCheck.id)];
    localStorage.setItem('emittedDocs', JSON.stringify(updatedDocs));

    if (selectedCarnet && status !== 'Brouillon') {
      const allCarnets = JSON.parse(localStorage.getItem('carnets') || '[]');
      const nextNum = String(parseInt(selectedCarnet.numCours) + 1).padStart(selectedCarnet.numCours.length, '0');
      const updated = allCarnets.map(c => c.id === selectedCarnet.id ? { ...c, numCours: nextNum, etat: parseInt(nextNum) > parseInt(c.numFin) ? 'Fermé' : 'Ouvert' } : c);
      localStorage.setItem('carnets', JSON.stringify(updated));
      setFormData(f => ({ ...f, checkNum: nextNum }));
    }

    if (formData.payee) {
      const p = JSON.parse(localStorage.getItem('payees') || '[]');
      if (!p.find(x => x.name.toLowerCase() === formData.payee.toLowerCase())) { 
        p.push({ id: Date.now(), name: formData.payee }); 
        localStorage.setItem('payees', JSON.stringify(p)); 
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    loadData();
    if(status === 'Émis') setShowForm(false);
  };

  const handlePrint = () => { saveCheck('Émis'); window.print(); };

  const deleteCheck = (id) => {
    if(window.confirm('Supprimer cet effet de l\'historique ?')) {
      const allDocs = JSON.parse(localStorage.getItem('emittedDocs') || '[]');
      localStorage.setItem('emittedDocs', JSON.stringify(allDocs.filter(d => d.id !== id)));
      loadData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <header className="page-header hide-on-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">EFFETS (LCN)</h1>
          <p className="page-subtitle">Émission et historique des Lettres de Change Normalisées (Billet à ordre).</p>
        </div>
        {!showForm ? (
          <button className="btn-primary" onClick={() => setShowForm(true)}><FileText size={18} /> Émettre un Effet</button>
        ) : (
          <button className="btn-secondary" onClick={() => setShowForm(false)}>Fermer le formulaire</button>
        )}
      </header>

      {showForm && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.2fr', gap: '2rem', alignItems: 'start', marginBottom: '2rem' }} className="hide-on-print">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--warning)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
               <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', margin: 0 }}>Détails de l'Effet (LCN)</h2>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <button className="btn-secondary" onClick={() => saveCheck('Brouillon')}><Save size={14} /> Brouillon</button>
                 <button className="btn-primary" onClick={handlePrint}><Printer size={14} /> Imprimer</button>
               </div>
            </div>

            {carnets.length > 0 ? (
              <div>
                <label style={lbl}>Carnet d'Effets actif</label>
                <select style={{ width: '100%' }} onChange={handleCarnetChange} value={selectedCarnet?.id || ''}>
                  {carnets.map(c => <option key={c.id} value={c.id}>{c.bank} – N° {c.numCours} ({c.serie || 'Sans série'})</option>)}
                </select>
              </div>
            ) : (
              <div style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>⚠️ Aucun carnet d'effets ouvert trouvé. Allez dans "Banques".</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>N° LCN</label><input name="checkNum" value={formData.checkNum} onChange={handleChange} style={{ width: '100%', fontWeight: 700 }} /></div>
              <div>
                <label style={lbl}>Banque Tirée</label>
                <select name="bank" value={formData.bank} onChange={handleChange} style={{ width: '100%' }}>
                  <option>CIH BANK</option><option>Banque Populaire</option><option>Attijariwafa Bank</option><option>BMCE Bank</option><option>Société Générale</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(249, 115, 22, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
              <div><label style={lbl}>Date d'échéance *</label><input name="echeance" type="date" value={formData.echeance} onChange={handleChange} style={{ width: '100%' }} /></div>
              <div><label style={lbl}>Domiciliation (Agence)</label><input name="domiciliation" value={formData.domiciliation} onChange={handleChange} style={{ width: '100%' }} /></div>
            </div>

            <div><label style={lbl}>Montant (MAD)</label><input name="amount" type="number" value={formData.amount} onChange={handleChange} style={{ width: '100%', fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-primary)', textAlign: 'right' }} placeholder="0.00" /></div>
            <div><label style={lbl}>Montant en lettres</label><textarea name="amountText" value={formData.amountText} onChange={handleChange} rows={2} style={{ width: '100%', resize: 'none' }} /></div>
            
            <div>
              <label style={lbl}>Bénéficiaire / À l'ordre de (Le Tiré)</label>
              <input name="payee" list="payees-list" value={formData.payee} onChange={handleChange} style={{ width: '100%' }} />
              <datalist id="payees-list">{payees.map(p => <option key={p.id} value={p.name} />)}</datalist>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>Lieu de création</label><input name="city" value={formData.city} onChange={handleChange} style={{ width: '100%' }} /></div>
              <div><label style={lbl}>Date de création</label><input name="date" type="date" value={formData.date} onChange={handleChange} style={{ width: '100%' }} /></div>
            </div>
          </div>

          {/* Aperçu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>Aperçu Avant Impression</h2>
            
            <div style={checkBox} className="printable-check">
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div style={{ position: 'absolute', top: 0, left: 0 }}>
                   <BankLogoRender bankName={formData.bank} />
                </div>
                <div style={{ position: 'absolute', top: 0, right: 0, fontSize: '0.8rem', color: '#475569', fontWeight: 600, letterSpacing: '0.05em' }}>
                  N° LCN {String(formData.checkNum).padEnd(6, ' ')}
                </div>
                <div style={{ position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', fontWeight: 800, letterSpacing: '0.35em', color: 'rgba(203, 213, 225, 0.5)', fontSize: '1.25rem' }}>
                  LETTRE DE CHANGE
                </div>
                <div style={{ position: 'absolute', top: '35px', right: 0, display: 'flex', alignItems: 'stretch', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ background: '#f1f5f9', border: '1.5px solid #64748b', borderRight: 'none', padding: '6px 8px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', color: '#334155' }}>MAD</div>
                  <div style={{ border: '1.5px solid #64748b', background: '#fff', padding: '6px 15px', fontWeight: 'bold', minWidth: '170px', textAlign: 'center', fontSize: '1.2rem', color: '#0f172a' }}>
                    # {formData.amount ? Number(formData.amount).toLocaleString('fr-MA', { minimumFractionDigits: 2 }) : ''} #
                  </div>
                </div>
                <div style={{ position: 'absolute', top: '100px', left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={previewLabel}>Contre cette lettre de change stipulée sans frais payez la somme de :</span>
                    <span style={{ ...handw, flex: 1, borderBottom: '1.5px dotted #94a3b8' }}>{formData.amountText}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={previewLabel}>À l'ordre de :</span>
                    <span style={{ ...handw, flex: 1, borderBottom: '1.5px dotted #94a3b8' }}>{formData.payee}</span>
                  </div>
                </div>

                <div style={{ position: 'absolute', top: '165px', right: '10px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <span style={previewLabel}>A</span><span style={{ ...handw, borderBottom: '1.5px dotted #94a3b8', minWidth: '110px', textAlign: 'center' }}>{formData.city}</span>
                  <span style={previewLabel}>le</span><span style={{ ...handw, borderBottom: '1.5px dotted #94a3b8', minWidth: '100px', textAlign: 'center' }}>{formData.date ? formData.date.split('-').reverse().join('/') : ''}</span>
                </div>

                <div style={{ position: 'absolute', top: '200px', left: 0, display: 'flex', gap: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={previewLabel}>Échéance :</span>
                    <span style={{ ...handw, borderBottom: '1.5px dotted #94a3b8', minWidth: '100px', textAlign: 'center' }}>
                      {formData.echeance ? formData.echeance.split('-').reverse().join('/') : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={previewLabel}>Domiciliation :</span>
                    <span style={{ ...handw, borderBottom: '1.5px dotted #94a3b8', minWidth: '180px' }}>{formData.bank} {formData.domiciliation}</span>
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: '25px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Signature</span>
                  <div style={{ border: '1.5px dashed #cbd5e1', width: '160px', height: '60px', background: 'rgba(255,255,255,0.5)' }}></div>
                </div>
                
                <div style={{ position: 'absolute', bottom: '26px', left: 0, right: 0, borderTop: '1px solid #fca5a5', borderBottom: '1px solid #fca5a5', padding: '2px 0', textAlign: 'center', fontSize: '0.5rem', fontWeight: 700, color: '#ef4444', letterSpacing: '0.1em' }}>
                  NE RIEN ÉCRIRE NI SIGNER EN DESSOUS DE CETTE LIGNE
                </div>
                <div style={{ position: 'absolute', bottom: '4px', left: '10px', fontFamily: '"Courier New", Courier, monospace', fontSize: '0.8rem', letterSpacing: '0.15em', fontWeight: 700, color: '#1e293b' }}>
                  ⑆ {String(formData.checkNum).padEnd(7, ' ')} ⑈ {selectedCarnet?.account || '01234 567890 12'} ⑉ 88
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impression Invisible Container */}
      <div className="real-print-only">
        {template.map(f => {
           let val = '';
           if (f.id === 'amount') val = formData.amount ? `# ${Number(formData.amount).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} #` : '';
           if (f.id === 'amountText') val = formData.amountText;
           if (f.id === 'payee') val = formData.payee;
           if (f.id === 'city') val = formData.city;
           if (f.id === 'date') val = formData.date ? formData.date.split('-').reverse().join('/') : '';
           if (f.id === 'echeance') val = formData.echeance ? formData.echeance.split('-').reverse().join('/') : '';
           if (f.id === 'domiciliation') val = formData.domiciliation;
           
           return (
             <div key={f.id} style={{
               position: 'absolute',
               left: `${f.left}mm`,
               top: `${f.top}mm`,
               fontFamily: f.id === 'amountText' || f.id === 'payee' || f.id.includes('city') ? '"Caveat", "Satisfy", "Comic Sans MS", cursive' : 'monospace',
               fontSize: f.id.includes('amountText') || f.id === 'payee' ? '14pt' : '11pt',
               fontWeight: 600,
               color: '#000',
               whiteSpace: 'nowrap'
             }}>
               {val}
             </div>
           );
        })}
      </div>

      {/* Historique des Effets */}
      <div className="card hide-on-print">
         <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>Historique des Effets (LCN)</h2>
         <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>N° LCN</th>
                <th>Création</th>
                <th>Échéance</th>
                <th>Le Tiré</th>
                <th style={{ textAlign: 'right' }}>Montant</th>
                <th style={{ textAlign: 'center' }}>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {emitted.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Aucun LCN émis.</td></tr>
              ) : emitted.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>{c.checkNum}</td>
                  <td>{c.date}</td>
                  <td style={{ fontWeight: 600, color: 'var(--warning)' }}>{c.echeance || '-'}</td>
                  <td style={{ fontWeight: 500 }}>{c.payee}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-primary)' }}>{Number(c.amount).toLocaleString('fr-MA', { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'center' }}>
                     <span className={`badge ${c.status === 'Payé' ? 'success' : c.status === 'Émis' || c.status === 'En circulation' ? 'info' : 'warning'}`}>{c.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                     <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                       <button style={ibtn} onClick={() => deleteCheck(c.id)}><Trash2 size={15} color="var(--danger)" /></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         </div>
      </div>

      <style>{`
        @media print { 
          body * { visibility: hidden; } 
          .real-print-only, .real-print-only * { visibility: visible; } 
          .real-print-only { 
            position: absolute; left: 0; top: 0; 
            width: ${CHECK_WIDTH_MM}mm; height: ${CHECK_HEIGHT_MM}mm; 
            margin: 0; padding: 0; 
            background: white !important;
          } 
          .hide-on-print { display:none!important; } 
          @page { size: auto; margin: 0; }
        }
        @media screen {
          .real-print-only { display: none; }
        }
      `}</style>
    </div>
  );
}

const lbl = { fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' };
const previewLabel = { fontSize: '0.7rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', fontStyle: 'italic', whiteSpace: 'nowrap' };
const handw = { fontFamily: '"Caveat", "Satisfy", "Comic Sans MS", cursive', fontSize: '1.4rem', color: '#0f172a', fontWeight: 600, paddingLeft: '8px', paddingBottom: '0px' };
const checkBox = {
  backgroundColor: '#f8fafc', borderRadius: '8px', padding: '30px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', aspectRatio: '175/80', position: 'relative', border: '1px solid #cbd5e1', overflow: 'hidden',
  backgroundImage: 'linear-gradient(rgba(203, 213, 225, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(203, 213, 225, 0.4) 1px, transparent 1px)', backgroundSize: '25px 25px'
};
const ibtn = { background: 'var(--bg-element)', border: '1px solid var(--border-color)', padding: '0.4rem', cursor: 'pointer', borderRadius: '6px' };
