import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Printer, Save, CheckCircle, FileText, Trash2, Settings, X, Move } from 'lucide-react';
import { numberToFrench } from '../utils/numberToFrench';
import { BankLogoRender } from '../utils/bankLogos.jsx';

const CHECK_WIDTH_MM = 175;
const CHECK_HEIGHT_MM = 80;

// Default positions for a standard Moroccan YELLOWISH LCN
const defaultFields = [
  { id: 'echeance',     label: 'Échéance',        left: 135, top: 10 },
  { id: 'amount',       label: 'Montant',         left: 135, top: 18 },
  { id: 'payee',        label: 'Bénéficiaire',    left: 45,  top: 35 },
  { id: 'city',         label: 'À (Lieu)',        left: 50,  top: 48 },
  { id: 'date',         label: 'Le (Date)',       left: 75,  top: 48 },
  { id: 'amountText',   label: 'Montant lettres', left: 120, top: 40 }, // LCN often has text on right box area
  { id: 'tire',         label: 'Tiré (Débiteur)', left: 45,  top: 65 },
  { id: 'domiciliation',label: 'Domiciliation',   left: 45,  top: 75 },
];

const mmToPercent = (mm, axis) => {
  const total = axis === 'x' ? CHECK_WIDTH_MM : CHECK_HEIGHT_MM;
  return `${(mm / total) * 100}%`;
};

export default function Effets() {
  const [carnets, setCarnets] = useState([]);
  const [selectedCarnet, setSelectedCarnet] = useState(null);
  const [payees, setPayees] = useState([]);
  const [saved, setSaved] = useState(false);
  const [emitted, setEmitted] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [template, setTemplate] = useState(defaultFields);
  const [calibrating, setCalibrating] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [globalOffsets, setGlobalOffsets] = useState({ left: 0, top: 0 });
  const previewRef = useRef(null);

  const [formData, setFormData] = useState({
    type: 'LCN',
    checkNum: '',
    amount: '',
    amountText: '',
    payee: '', // Bénéficiaire
    tire: '',  // Débiteur
    echeance: '',
    domiciliation: '',
    date: new Date().toISOString().split('T')[0],
    city: 'Casablanca',
    observation: '',
    bank: 'CIH BANK',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    const c = JSON.parse(localStorage.getItem('carnets') || '[]').filter(c => c.etat === 'Ouvert' && c.type === 'LCN');
    const p = JSON.parse(localStorage.getItem('payees') || '[]');
    const e = JSON.parse(localStorage.getItem('emittedDocs') || '[]').filter(d => d.type === 'LCN');
    const offsets = JSON.parse(localStorage.getItem('globalPrintOffsets') || '{"left": 0, "top": 0}');
    
    setCarnets(c);
    setPayees(p);
    setEmitted(e);
    setGlobalOffsets(offsets);

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
    const savedTemplates = JSON.parse(localStorage.getItem('printTemplates') || '{}');
    if (savedTemplates[`${bankName}_LCN`]) {
      const saved = savedTemplates[`${bankName}_LCN`];
      const merged = defaultFields.map(df => saved.find(sf => sf.id === df.id) || df);
      setTemplate(merged);
    } else {
      setTemplate(defaultFields.map(f => ({ ...f })));
    }
  };

  const saveTemplate = () => {
    const all = JSON.parse(localStorage.getItem('printTemplates') || '{}');
    all[`${formData.bank}_LCN`] = template;
    localStorage.setItem('printTemplates', JSON.stringify(all));
    localStorage.setItem('globalPrintOffsets', JSON.stringify(globalOffsets));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const update = { [name]: value };
    if (name === 'amount') update.amountText = value ? numberToFrench(value) : '';
    if (name === 'bank') loadTemplate(value);
    setFormData(f => ({ ...f, ...update }));
    setSaved(false);
  };

  const handlePrint = () => { saveCheck('Émis'); window.print(); };

  const saveCheck = (status = 'Brouillon') => {
    const newCheck = {
      ...formData,
      id: formData.id || `LCN-${formData.checkNum || Date.now()}`,
      status,
      timestamp: formData.timestamp || new Date().toISOString()
    };
    const allDocs = JSON.parse(localStorage.getItem('emittedDocs') || '[]');
    localStorage.setItem('emittedDocs', JSON.stringify([newCheck, ...allDocs.filter(d => d.id !== newCheck.id)]));
    loadData();
    if (status === 'Émis') setShowForm(false);
  };

  const handleEdit = (doc) => {
    setFormData(doc);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet effet ?')) {
      const allDocs = JSON.parse(localStorage.getItem('emittedDocs') || '[]');
      const updatedDocs = allDocs.filter(d => d.id !== id);
      localStorage.setItem('emittedDocs', JSON.stringify(updatedDocs));
      loadData();
    }
  };

  const onMouseDown = useCallback((e, id) => {
    if (!calibrating) return;
    e.preventDefault();
    const field = template.find(f => f.id === id);
    setDragging({ id, startX: e.clientX, startY: e.clientY, startLeft: field.left, startTop: field.top });
  }, [calibrating, template]);

  const onMouseMove = useCallback((e) => {
    if (!dragging || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const scaleX = CHECK_WIDTH_MM / rect.width;
    const scaleY = CHECK_HEIGHT_MM / rect.height;
    const dx = (e.clientX - dragging.startX) * scaleX;
    const dy = (e.clientY - dragging.startY) * scaleY;
    setTemplate(prev => prev.map(f =>
      f.id === dragging.id
        ? { ...f, left: Math.max(0, Math.min(CHECK_WIDTH_MM - 10, dragging.startLeft + dx)), top: Math.max(0, Math.min(CHECK_HEIGHT_MM - 5, dragging.startTop + dy)) }
        : f
    ));
  }, [dragging]);

  useEffect(() => {
    const handleMouseUp = () => setDragging(null);
    if (calibrating) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [calibrating, onMouseMove]);

  const getFieldValue = (id) => {
    if (id === 'echeance') return formData.echeance ? formData.echeance.split('-').reverse().join('/') : '';
    if (id === 'amount') {
      const formattedNumber = Number(formData.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }).replace(/,/g, ' ');
      return formData.amount ? `# ${formattedNumber} #` : '';
    }
    if (id === 'payee') return formData.payee ? formData.payee.toUpperCase() : '';
    if (id === 'amountText') return formData.amountText ? `${formData.amountText.toUpperCase()} * * * * *` : '';
    if (id === 'tire') return formData.tire ? formData.tire.toUpperCase() : '';
    if (id === 'domiciliation') return formData.domiciliation ? formData.domiciliation.toUpperCase() : '';
    if (id === 'city') return formData.city ? formData.city.toUpperCase() : '';
    if (id === 'date') return formData.date ? formData.date.split('-').reverse().join('/') : '';
    return '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <header className="page-header hide-on-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">EFFETS (LCN)</h1>
          <p className="page-subtitle">Émission de Lettres de Change Normalisées.</p>
        </div>
        {!showForm ? <button className="btn-primary" onClick={() => {
            setFormData({
              type: 'LCN',
              checkNum: '',
              amount: '',
              amountText: '',
              payee: '',
              tire: '',
              echeance: '',
              domiciliation: '',
              date: new Date().toISOString().split('T')[0],
              city: 'Casablanca',
              observation: '',
              bank: 'CIH BANK',
            });
            setShowForm(true);
        }}>Émettre un Effet</button> : <button className="btn-secondary" onClick={() => setShowForm(false)}>Fermer</button>}
      </header>

      {showForm && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.2fr', gap: '2rem', alignItems: 'start', marginBottom: '2rem' }} className="hide-on-print">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Détails LCN</h2>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <button className="btn-secondary" onClick={() => saveCheck('Brouillon')}><Save size={14} /> Brouillon</button>
                 <button className="btn-primary" onClick={handlePrint}><Printer size={14} /> Imprimer</button>
               </div>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <div><label style={lbl}>Banque</label><select name="bank" value={formData.bank} onChange={handleChange} style={{ width: '100%' }}>
                  <option>Attijariwafa Bank</option><option>CIH BANK</option><option>Banque Populaire</option><option>BMCE Bank</option><option>Société Générale</option>
               </select></div>
               <div><label style={lbl}>Date d'échéance</label><input name="echeance" type="date" value={formData.echeance} onChange={handleChange} style={{ width: '100%', border: '1px solid orange' }} /></div>
             </div>

             <div><label style={lbl}>Montant (MAD)</label><input name="amount" type="number" value={formData.amount} onChange={handleChange} style={{ width: '100%', fontSize: '1.4rem' }} /></div>
             <div><label style={lbl}>Bénéficiaire (À l'ordre de)</label><input name="payee" value={formData.payee} onChange={handleChange} style={{ width: '100%', fontWeight: 700 }} /></div>
             
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '4px' }}>
               <label style={lbl}>Montant en lettres</label>
               <textarea name="amountText" value={formData.amountText} onChange={handleChange} rows={2} style={{ width: '100%', resize: 'none' }} />
             </div>

             <div><label style={lbl}>Tiré (Personne qui paie)</label><input name="tire" value={formData.tire} onChange={handleChange} style={{ width: '100%' }} placeholder="Nom du débiteur" /></div>
             <div><label style={lbl}>Domiciliation (Banque du tiré)</label><input name="domiciliation" value={formData.domiciliation} onChange={handleChange} style={{ width: '100%' }} /></div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <div><label style={lbl}>Lieu creation</label><input name="city" value={formData.city} onChange={handleChange} style={{ width: '100%' }} /></div>
               <div><label style={lbl}>Date creation</label><input name="date" type="date" value={formData.date} onChange={handleChange} style={{ width: '100%' }} /></div>
             </div>
          </div>

          <div style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Aperçu : LCN Jaune</h2>
              <button className={calibrating ? 'btn-primary' : 'btn-secondary'} onClick={() => setCalibrating(!calibrating)}>
                {calibrating ? <Save size={14} onClick={saveTemplate}/> : <Settings size={14}/>} {calibrating ? 'Sauvegarder' : 'Calibrer'}
              </button>
            </div>
            
            <div ref={previewRef} style={lcnContainer} className="printable-check">
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                 <div style={{ position: 'absolute', top: 5, left: 5 }}><BankLogoRender bankName={formData.bank} /></div>
                 <div style={{ position: 'absolute', top: 5, right: 10, fontSize: '0.65rem', color: '#854d0e', fontWeight: 700 }}>LETTRE DE CHANGE</div>

                 {/* Labels Statiques LCN */}
                 <div style={{ position: 'absolute', top: '12%', left: '45%', fontSize: '0.5rem', color: '#854d0e' }}>Date d'échéance</div>
                 <div style={{ position: 'absolute', top: '28%', left: '4%', fontSize: '0.5rem', color: '#854d0e' }}>Bénéficiaire :</div>
                 <div style={{ position: 'absolute', top: '48%', left: '4%', fontSize: '0.5rem', color: '#854d0e' }}>Lieu et date de création :</div>
                 <div style={{ position: 'absolute', top: '65%', left: '4%', fontSize: '0.5rem', color: '#854d0e' }}>Tiré :</div>
                 <div style={{ position: 'absolute', top: '75%', left: '4%', fontSize: '0.5rem', color: '#854d0e' }}>Domiciliation :</div>

                 {/* Champs dynamiques LCN */}
                 {template.map(field => (
                   <div key={field.id} onMouseDown={(e) => onMouseDown(e, field.id)} style={{
                     position: 'absolute', left: mmToPercent(field.left, 'x'), top: mmToPercent(field.top, 'y'),
                     fontFamily: 'Arial, Helvetica, sans-serif',
                     fontSize: (field.id === 'amount' || field.id === 'echeance') ? '0.9rem' : '0.75rem',
                     fontWeight: 600, color: '#3f2b1d', cursor: calibrating ? 'grab' : 'default',
                     border: calibrating ? '1px dashed brown' : 'none', padding: calibrating ? '2px' : 0
                   }}>{getFieldValue(field.id)}</div>
                 ))}
                 
                 <div style={{ position: 'absolute', bottom: '10%', right: '10%', fontSize: '0.5rem', color: '#854d0e', textAlign: 'center' }}>
                   Acceptation ou Aval<br/>Tireur (Signature)
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real Print Only */}
      <div className="real-print-only" style={{
        marginLeft: `${globalOffsets.left}mm`,
        marginTop: `${globalOffsets.top}mm`
      }}>
        {template.map(f => (
          <div key={f.id} style={{
            position: 'absolute', left: `${f.left}mm`, top: `${f.top}mm`,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '11pt', fontWeight: 600, color: '#000', whiteSpace: 'nowrap'
          }}>{getFieldValue(f.id)}</div>
        ))}
      </div>

      {/* Historique des LCNs */}
      {!showForm && (
        <div className="card hide-on-print" style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>Historique des Effets (LCN)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Échéance</th>
                  <th style={{ padding: '0.75rem' }}>Tiré</th>
                  <th style={{ padding: '0.75rem' }}>Bénéficiaire</th>
                  <th style={{ padding: '0.75rem' }}>Montant</th>
                  <th style={{ padding: '0.75rem' }}>Statut</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emitted.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem' }}>{doc.echeance.split('-').reverse().join('/')}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#fff' }}>{doc.tire}</td>
                    <td style={{ padding: '0.75rem' }}>{doc.payee}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{Number(doc.amount).toLocaleString('fr-MA')} MAD</td>
                    <td style={{ padding: '0.75rem' }}>
                       <span style={{ padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', background: doc.status === 'Émis' ? '#10b98120' : '#f59e0b20', color: doc.status === 'Émis' ? '#10b981' : '#f59e0b' }}>
                          {doc.status}
                       </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                       <button style={{ ...ibtn, color: 'var(--text-muted)' }} onClick={() => handleEdit(doc)} title="Modifier"><Settings size={16} /></button>
                       <button style={{ ...ibtn, color: 'var(--danger)' }} onClick={() => handleDelete(doc.id)} title="Supprimer"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {emitted.length === 0 && <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun effet enregistré.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .real-print-only, .real-print-only * { visibility: visible; }
          .real-print-only { position: absolute; left: 0; top: 0; width: ${CHECK_WIDTH_MM}mm; height: ${CHECK_HEIGHT_MM}mm; margin: 0; padding: 0; }
          @page { size: auto; margin: 0; }
        }
        @media screen { .real-print-only { display: none; } }
      `}</style>
    </div>
  );
}

const ibtn = { padding: '0.4rem', cursor: 'pointer', background: 'none', border: 'none' };

const lbl = { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' };
const lcnContainer = {
  backgroundColor: '#fefce8', // Yellowish for LCN
  borderRadius: '4px', border: '1px solid #eab308', aspectRatio: '175/80', position: 'relative', overflow: 'hidden',
  backgroundImage: 'linear-gradient(rgba(234,179,8,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.1) 1px, transparent 1px)',
  backgroundSize: '20px 20px'
};
