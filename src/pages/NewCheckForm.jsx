import React, { useState, useEffect } from 'react';
import { Printer, Save, CheckCircle, FileText, CreditCard } from 'lucide-react';
import { numberToFrench } from '../utils/numberToFrench';

export default function NewCheckForm() {
  const [carnets, setCarnets] = useState([]);
  const [selectedCarnet, setSelectedCarnet] = useState(null);
  const [payees, setPayees] = useState([]);
  const [logoError, setLogoError] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    type: 'Chèque', // 'Chèque' or 'LCN'
    checkNum: '',
    amount: '',
    amountText: '',
    payee: '',
    date: new Date().toISOString().split('T')[0],
    city: 'Casablanca',
    bank: 'CIH BANK',
    observation: '',
    reference: '',
    echeance: '',
    domiciliation: ''
  });

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem('carnets') || '[]').filter(c => c.etat === 'Ouvert');
    const p = JSON.parse(localStorage.getItem('payees') || '[]');
    setCarnets(c);
    setPayees(p);
    if (c.length > 0) {
      const carnet = c[0];
      setSelectedCarnet(carnet);
      setFormData(f => ({ ...f, bank: carnet.bank, checkNum: carnet.numCours }));
    }
  }, []);

  const getBankDomain = (bankName) => {
    const map = { 'CIH BANK': 'cihbank.ma', 'Banque Populaire': 'groupebanquepopulaire.ma', 'Attijariwafa Bank': 'attijariwafabank.com', 'BMCE Bank': 'bankofafrica.ma', 'Société Générale': 'sgmaroc.com' };
    return map[bankName] || null;
  };

  const handleCarnetChange = (e) => {
    const carnet = carnets.find(c => c.id === Number(e.target.value));
    if (carnet) {
      setSelectedCarnet(carnet);
      setFormData(f => ({ ...f, bank: carnet.bank, checkNum: carnet.numCours }));
      setLogoError(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Toggle handling
    if (type === 'checkbox' && name === 'typeToggle') {
      const isLcn = checked;
      setFormData(f => ({ ...f, type: isLcn ? 'LCN' : 'Chèque' }));
      return;
    }

    const update = { [name]: value };
    if (name === 'amount') {
      update.amountText = value ? numberToFrench(value) : '';
    }
    if (name === 'bank') setLogoError(false);
    
    setFormData(f => ({ ...f, ...update }));
    setSaved(false);
  };

  const saveCheck = (status = 'Brouillon') => {
    const prefix = formData.type === 'LCN' ? 'LCN' : 'CHQ';
    const newCheck = {
      id: `${prefix}-${formData.checkNum || Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      ...formData,
      status,
      timestamp: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem('emittedChecks') || '[]');
    localStorage.setItem('emittedChecks', JSON.stringify([newCheck, ...existing]));

    // Increment carnet si sélectionné
    if (selectedCarnet && status !== 'Brouillon') {
      const allCarnets = JSON.parse(localStorage.getItem('carnets') || '[]');
      const nextNum = String(parseInt(selectedCarnet.numCours) + 1);
      const updated = allCarnets.map(c => c.id === selectedCarnet.id ? { ...c, numCours: nextNum, etat: nextNum > c.numFin ? 'Fermé' : 'Ouvert' } : c);
      localStorage.setItem('carnets', JSON.stringify(updated));
      setFormData(f => ({ ...f, checkNum: nextNum }));
    }
    if (formData.payee) {
      const p = JSON.parse(localStorage.getItem('payees') || '[]');
      if (!p.find(x => x.name === formData.payee)) { p.push({ id: Date.now(), name: formData.payee }); localStorage.setItem('payees', JSON.stringify(p)); }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePrint = () => { saveCheck('Émis'); window.print(); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Émettre un Nouveau Titre</h1>
          <p className="page-subtitle">Chèque ou Effet strictement conforme aux normes Bank Al-Maghrib</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {saved && <span className="badge success" style={{ padding: '0.5rem 1rem' }}><CheckCircle size={16} /> Enregistré</span>}
          <button className="btn-secondary" style={{ color: 'var(--text-main)' }} onClick={() => saveCheck('Brouillon')}>
            <Save size={18} /> Brouillon
          </button>
          <button onClick={handlePrint} className="btn-primary hide-on-print">
            <Printer size={18} /> Imprimer {formData.type}
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.2fr', gap: '2.5rem', alignItems: 'start' }} className="hide-on-print">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
             <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', margin: 0 }}>Saisie des informations</h2>
             
             {/* LCN Toggle */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: formData.type === 'Chèque' ? 'var(--accent-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: formData.type === 'Chèque' ? 600 : 400 }}>
                   <CreditCard size={16} /> Chèque
                </span>
                <label className="switch">
                  <input type="checkbox" name="typeToggle" checked={formData.type === 'LCN'} onChange={handleChange} />
                  <span className="slider"></span>
                </label>
                <span style={{ fontSize: '0.85rem', color: formData.type === 'LCN' ? 'var(--accent-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: formData.type === 'LCN' ? 600 : 400 }}>
                   <FileText size={16} /> Effet (LCN)
                </span>
             </div>
          </div>

          {/* Carnet Selector */}
          {carnets.length > 0 && (
            <div>
              <label style={lbl}>Carnet de {formData.type}s en cours</label>
              <select style={{ width: '100%', padding: '0.85rem' }} onChange={handleCarnetChange} value={selectedCarnet?.id || ''}>
                <option value="">-- Sélectionnez un carnet --</option>
                {carnets.map(c => (
                  <option key={c.id} value={c.id}>{c.bank} – N° {c.numCours} ({c.serie || 'Sans série'})</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={lbl}>N° {formData.type}</label>
              <input name="checkNum" value={formData.checkNum} onChange={handleChange} style={{ width: '100%', fontWeight: 700 }} placeholder="Ex: 004512" />
            </div>
            <div>
              <label style={lbl}>Banque / Domiciliation principale</label>
              <select name="bank" value={formData.bank} onChange={handleChange} style={{ width: '100%' }}>
                <option>CIH BANK</option><option>Banque Populaire</option><option>Attijariwafa Bank</option><option>BMCE Bank</option><option>Société Générale</option>
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>Montant en chiffres (MAD)</label>
            <input name="amount" type="number" value={formData.amount} onChange={handleChange} style={{ width: '100%', fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-primary)', textAlign: 'right' }} placeholder="0.00" />
          </div>

          <div>
            <label style={lbl}>Montant en toutes lettres</label>
            <textarea name="amountText" value={formData.amountText} onChange={handleChange} rows={2} style={{ width: '100%', fontSize: '0.95rem', resize: 'none' }} placeholder="Généré automatiquement..." />
          </div>

          <div>
            <label style={lbl}>Bénéficiaire (À l'ordre de)</label>
            <input name="payee" list="payees-list" value={formData.payee} onChange={handleChange} style={{ width: '100%' }} placeholder="Nom ou Raison Sociale" />
            <datalist id="payees-list">{payees.map(p => <option key={p.id} value={p.name} />)}</datalist>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={lbl}>Lieu de création</label>
              <input name="city" value={formData.city} onChange={handleChange} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={lbl}>Date de création</label>
              <input name="date" type="date" value={formData.date} onChange={handleChange} style={{ width: '100%' }} />
            </div>
          </div>
          
          {formData.type === 'LCN' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', background: 'rgba(249, 115, 22, 0.05)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
              <div>
                <label style={lbl}>Date d'échéance</label>
                <input name="echeance" type="date" value={formData.echeance} onChange={handleChange} style={{ width: '100%', borderColor: 'rgba(249, 115, 22, 0.3)' }} />
              </div>
              <div>
                <label style={lbl}>Domiciliation (Agence)</label>
                <input name="domiciliation" value={formData.domiciliation} onChange={handleChange} style={{ width: '100%', borderColor: 'rgba(249, 115, 22, 0.3)' }} placeholder="Ex: Agence Hassan II" />
              </div>
            </div>
          )}

          <div>
            <label style={lbl}>Observation / Motif (Interne)</label>
            <input name="observation" value={formData.observation} onChange={handleChange} style={{ width: '100%' }} placeholder="Facture N°, Loyer Janvier..." />
          </div>
        </div>

        {/* Document Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>Aperçu : {formData.type}</h2>
            <span className="badge info" style={{ letterSpacing: '0.05em' }}>Rendu d'impression BAM</span>
          </div>
          
          <div style={checkBox} className="printable-check">
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>

              {/* Logo / Bank Name */}
              <div style={{ position: 'absolute', top: 0, left: 0 }}>
                {!logoError && getBankDomain(formData.bank) ? (
                  <img src={`https://logo.clearbit.com/${getBankDomain(formData.bank)}`} alt={formData.bank} style={{ maxHeight: '35px', maxWidth: '140px', objectFit: 'contain', filter: 'grayscale(100%) brightness(0.9)' }} onError={() => setLogoError(true)} />
                ) : (
                  <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#1e293b' }}>{formData.bank}</span>
                )}
              </div>

              {/* N° top right */}
              <div style={{ position: 'absolute', top: 0, right: 0, fontSize: '0.8rem', color: '#475569', fontWeight: 600, letterSpacing: '0.05em' }}>
                N° {formData.checkNum?.padEnd(6, ' ')}
              </div>

              {/* Watermark Title */}
              <div style={{ position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', fontWeight: 800, letterSpacing: '0.35em', color: 'rgba(203, 213, 225, 0.5)', fontSize: '1.25rem' }}>
                {formData.type === 'Chèque' ? 'CHÈQUE' : 'LETTRE DE CHANGE'}
              </div>

              {/* Amount block */}
              <div style={{ position: 'absolute', top: '35px', right: 0, display: 'flex', alignItems: 'stretch', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ background: '#f1f5f9', border: '1.5px solid #64748b', borderRight: 'none', padding: '6px 8px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', color: '#334155' }}>MAD</div>
                <div style={{ border: '1.5px solid #64748b', background: '#fff', padding: '6px 15px', fontWeight: 'bold', minWidth: '170px', textAlign: 'center', fontSize: '1.2rem', color: '#0f172a' }}>
                  # {formData.amount ? Number(formData.amount).toLocaleString('fr-MA', { minimumFractionDigits: 2 }) : ''} #
                </div>
              </div>

              {/* Legal Formulation (Moroccan specific) */}
              <div style={{ position: 'absolute', top: '100px', left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Ligne 1: Montant en lettres */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={previewLabel}>
                    {formData.type === 'Chèque' 
                      ? 'Payez contre ce chèque la somme de :' 
                      : 'Contre cette lettre de change stipulée sans frais payez la somme de :'}
                  </span>
                  <span style={{ ...handw, flex: 1, borderBottom: '1.5px dotted #94a3b8', lineHeight: '1.2' }}>{formData.amountText}</span>
                </div>

                {/* Ligne 2: Bénéficiaire */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={previewLabel}>À l'ordre de :</span>
                  <span style={{ ...handw, flex: 1, borderBottom: '1.5px dotted #94a3b8' }}>{formData.payee}</span>
                </div>
              </div>

              {/* Lieu et Date (Creation) */}
              <div style={{ position: 'absolute', top: '175px', right: '10px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <span style={previewLabel}>A</span>
                <span style={{ ...handw, borderBottom: '1.5px dotted #94a3b8', minWidth: '110px', textAlign: 'center' }}>{formData.city}</span>
                <span style={previewLabel}>le</span>
                <span style={{ ...handw, borderBottom: '1.5px dotted #94a3b8', minWidth: '100px', textAlign: 'center' }}>{formData.date ? formData.date.split('-').reverse().join('/') : ''}</span>
              </div>

              {/* Effet specific lines (Echeance & Domiciliation) */}
              {formData.type === 'LCN' && (
                <div style={{ position: 'absolute', top: '210px', left: 0, display: 'flex', gap: '25px' }}>
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
              )}

              {/* Signature zone */}
              <div style={{ position: 'absolute', bottom: formData.type === 'LCN' ? '25px' : '40px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Signature de l'émetteur</span>
                <div style={{ border: '1.5px dashed #cbd5e1', width: '160px', height: '60px', background: 'rgba(255,255,255,0.5)' }}></div>
              </div>

              {/* No signature warning */}
              <div style={{ position: 'absolute', bottom: '26px', left: 0, right: 0, borderTop: '1px solid #fca5a5', borderBottom: '1px solid #fca5a5', padding: '2px 0', textAlign: 'center', fontSize: '0.5rem', fontWeight: 700, color: '#ef4444', letterSpacing: '0.1em' }}>
                NE RIEN ÉCRIRE NI SIGNER EN DESSOUS DE CETTE LIGNE
              </div>

              {/* MICR (Magnetic Ink Character Recognition snippet) */}
              <div style={{ position: 'absolute', bottom: '4px', left: '10px', fontFamily: '"Courier New", Courier, monospace', fontSize: '0.8rem', letterSpacing: '0.15em', fontWeight: 700, color: '#1e293b' }}>
                ⑆ {formData.checkNum?.padEnd(7, ' ')} ⑈ {selectedCarnet?.account || '01234 567890 12'} ⑉ {formData.type === 'LCN' ? '88' : '11'}
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-element)', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '10px', alignItems: 'flex-start', lineHeight: '1.5' }}>
              <span style={{ color: 'var(--info)' }}>💡</span>
              En cliquant sur "Imprimer", le document sera sauvegardé avec le statut "Émis" et l'imprimante système sera appelée. Veillez à utiliser le format papier exact de votre banque.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print { 
          body * { visibility: hidden; } 
          .printable-check, .printable-check * { visibility: visible; } 
          .printable-check { 
            position: absolute; 
            left:0; top:0; 
            width:175mm; height:80mm; 
            background:none!important; 
            box-shadow:none!important; 
            border:none!important; 
          } 
          .hide-on-print { display:none!important; } 
        }
      `}</style>
    </div>
  );
}

const lbl = { fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block', letterSpacing: '0.01em' };
const previewLabel = { fontSize: '0.7rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', fontStyle: 'italic', whiteSpace: 'nowrap', textShadow: '0px 1px 0px rgba(255,255,255,0.8)' };
const handw = { fontFamily: '"Caveat", "Satisfy", "Comic Sans MS", cursive', fontSize: '1.4rem', color: '#0f172a', fontWeight: 600, paddingLeft: '8px', paddingBottom: '0px' };
const checkBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '30px',
  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
  aspectRatio: '175/80',
  position: 'relative',
  backgroundImage: 
    'linear-gradient(rgba(203, 213, 225, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(203, 213, 225, 0.4) 1px, transparent 1px)',
  backgroundSize: '25px 25px',
  border: '1px solid #cbd5e1',
  overflow: 'hidden'
};
