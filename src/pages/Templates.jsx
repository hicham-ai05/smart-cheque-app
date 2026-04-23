import React, { useState, useEffect, useRef } from 'react';
import { Save, RefreshCw, Layers } from 'lucide-react';
import { getBankLogo, BankLogoRender } from '../utils/bankLogos.jsx';

import { getDimensions, saveDimensions, DEFAULT_DIMENSIONS } from '../utils/checkDimensions';

const BANKS = ['CIH BANK', 'Banque Populaire', 'Attijariwafa Bank', 'BMCE Bank', 'Société Générale', 'Crédit du Maroc', 'Crédit Agricole du Maroc'];
const TYPES = ['Chèque', 'LCN'];

const defaultFields = [
  { id: 'amount', label: 'Montant (Chiffres)', top: 35, left: 130, width: 40, height: 10 },
  { id: 'amountText', label: 'Montant (Lettres)', top: 45, left: 30, width: 140, height: 10 },
  { id: 'payee', label: 'Bénéficiaire', top: 58, left: 30, width: 140, height: 10 },
  { id: 'city', label: 'Lieu', top: 70, left: 80, width: 40, height: 8 },
  { id: 'date', label: 'Date', top: 70, left: 135, width: 35, height: 8 },
];

const lcnExtras = [
  { id: 'echeance', label: 'Échéance', top: 20, left: 50, width: 35, height: 8 },
  { id: 'domiciliation', label: 'Domiciliation', top: 20, left: 100, width: 60, height: 8 },
];

export default function Templates() {
  const [bank, setBank] = useState(BANKS[0]);
  const [type, setType] = useState(TYPES[0]);
  
  const [fields, setFields] = useState([]);
  const [docDimensions, setDocDimensions] = useState({ width: 175, height: 80 });
  const CHECK_WIDTH_MM = docDimensions.width;
  const CHECK_HEIGHT_MM = docDimensions.height;
  const canvasRef = useRef(null);

  useEffect(() => {
    loadTemplate();
  }, [bank, type]);

  const loadTemplate = () => {
    const savedTemplates = JSON.parse(localStorage.getItem('printTemplates') || '{}');
    const key = `${bank}_${type}`;
    const dims = getDimensions(type, bank);
    setDocDimensions(dims);
    
    if (savedTemplates[key]) {
      const data = savedTemplates[key];
      setFields(Array.isArray(data) ? data : (data.fields || []));
    } else {
      setFields(type === 'Chèque' ? [...defaultFields] : [...defaultFields, ...lcnExtras]);
    }
  };

  const saveTemplate = () => {
    const savedTemplates = JSON.parse(localStorage.getItem('printTemplates') || '{}');
    const key = `${bank}_${type}`;
    savedTemplates[key] = { fields, dimensions: docDimensions };
    localStorage.setItem('printTemplates', JSON.stringify(savedTemplates));
    alert('Modèle sauvegardé avec succès !');
  };

  const resetTemplate = () => {
    if(window.confirm('Réinitialiser ce modèle aux paramètres par défaut ?')) {
       setFields(type === 'Chèque' ? [...defaultFields] : [...defaultFields, ...lcnExtras]);
       setDocDimensions(DEFAULT_DIMENSIONS[type]);
    }
  };

  // Drag logic
  const [draggingId, setDraggingId] = useState(null);
  
  const handlePointerDown = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingId(id);
  };

  const handlePointerMove = (e) => {
    if (!draggingId || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Convert px to mm based on canvas render size vs check real size
    const mmPerPxX = CHECK_WIDTH_MM / rect.width;
    const mmPerPxY = CHECK_HEIGHT_MM / rect.height;

    let x = (e.clientX - rect.left) * mmPerPxX;
    let y = (e.clientY - rect.top) * mmPerPxY;

    // Bounds check
    const field = fields.find(f => f.id === draggingId);
    if (!field) return;

    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + field.width > CHECK_WIDTH_MM) x = CHECK_WIDTH_MM - field.width;
    if (y + field.height > CHECK_HEIGHT_MM) y = CHECK_HEIGHT_MM - field.height;

    setFields(fields.map(f => f.id === draggingId ? { ...f, left: Math.round(x), top: Math.round(y) } : f));
  };

  const handlePointerUp = () => {
    setDraggingId(null);
  };

  return (
    <div onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} style={{ minHeight: '100%' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Configuration par Banque</h1>
          <p className="page-subtitle">Ajustez les coordonnées d'impression (X, Y) pour que le texte s'imprime parfaitement sur le format papier du chèque de chaque banque.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={resetTemplate}><RefreshCw size={16} /> Réinitialiser</button>
          <button className="btn-primary" onClick={saveTemplate}><Save size={16} /> Sauvegarder Modèle</button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Éditeur de Modèle</h3>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div>
               <label style={lbl}>Banque</label>
               <select value={bank} onChange={e => setBank(e.target.value)} style={{ width: '100%' }}>
                 {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
               </select>
             </div>
             <div>
               <label style={lbl}>Type de Document</label>
               <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%' }}>
                 {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
             </div>
           </div>

           <div style={{ marginTop: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', background: 'var(--bg-main)' }}>
              <BankLogoRender bankName={bank} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Glissez-déposez les étiquettes orange ci-dessous pour régler leur position d'impression en millimètres.</p>
           </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
           <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', marginBottom: '1rem' }}>Dimensions & Coordonnées (mm)</h3>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div>
                <label style={lbl}>Largeur Support (mm)</label>
                <input type="number" value={docDimensions.width} onChange={e => setDocDimensions({...docDimensions, width: parseFloat(e.target.value)||100})} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={lbl}>Hauteur Support (mm)</label>
                <input type="number" value={docDimensions.height} onChange={e => setDocDimensions({...docDimensions, height: parseFloat(e.target.value)||50})} style={{ width: '100%' }} />
              </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
             {fields.map(f => (
               <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem' }}>
                 <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{f.label}</span>
                 <span style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>X: {f.left} | Y: {f.top}</span>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', background: 'var(--bg-element)' }}>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
           <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', gap: '8px', alignItems: 'center' }}><Layers size={18} /> Surface d'Impression Physique ({docDimensions.width}x{docDimensions.height} mm)</h3>
           <span className="badge warning">Ne pas dépasser le cadre.</span>
         </div>
         
         <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div 
              ref={canvasRef}
              style={{
                width: `${CHECK_WIDTH_MM * 5}px`, // Scaled up (5x) purely for visual UI editing
                height: `${CHECK_HEIGHT_MM * 5}px`,
                backgroundColor: '#f8fafc',
                backgroundImage: 'linear-gradient(rgba(203, 213, 225, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(203, 213, 225, 0.4) 1px, transparent 1px)', 
                backgroundSize: '25px 25px',
                border: '1px solid #94a3b8',
                borderRadius: '8px',
                position: 'relative',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                userSelect: 'none',
                touchAction: 'none' // important for pointer events
              }}
            >
               {fields.map(f => (
                 <div
                   key={f.id}
                   onPointerDown={(e) => handlePointerDown(e, f.id)}
                   style={{
                     position: 'absolute',
                     // Convert mm back to px for display (1mm = 5px in this container)
                     left: `${f.left * 5}px`,
                     top: `${f.top * 5}px`,
                     width: `${f.width * 5}px`,
                     height: `${f.height * 5}px`,
                     backgroundColor: draggingId === f.id ? 'var(--accent-primary)' : 'rgba(249, 115, 22, 0.85)',
                     color: '#fff',
                     fontSize: '0.85rem',
                     fontWeight: 600,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     borderRadius: '4px',
                     cursor: draggingId === f.id ? 'grabbing' : 'grab',
                     boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                     border: draggingId === f.id ? '2px solid #fff' : 'none',
                     zIndex: draggingId === f.id ? 10 : 1,
                     opacity: 0.9,
                     transition: draggingId === f.id ? 'none' : 'box-shadow 0.2s',
                   }}
                 >
                   {f.label}
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

const lbl = { fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' };
