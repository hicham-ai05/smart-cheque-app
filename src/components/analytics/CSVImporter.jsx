import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function CSVImporter({ onDataProcessed }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState(null);
  const [rowCount, setRowCount] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setProcessStatus(null);
    setIsProcessing(true);

    const ext = file.name.split('.').pop().toLowerCase();
    
    try {
      if (ext === 'csv') {
        parseCSV(file);
      } else if (ext === 'xlsx' || ext === 'xls') {
        parseExcel(file);
      } else {
        throw new Error("Format de fichier non supporté. Veuillez utiliser .csv ou .xlsx");
      }
    } catch (err) {
      setProcessStatus(err.message);
      setIsProcessing(false);
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        analyzeData(results.data);
      },
      error: (error) => {
        setProcessStatus(`Erreur CSV: ${error.message}`);
        setIsProcessing(false);
      }
    });
  };

  const parseExcel = async (file) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      analyzeData(jsonData);
    } catch (error) {
      setProcessStatus(`Erreur Excel: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const cleanKey = (k) => String(k).toLowerCase().trim();

  const getVal = (row, possibleKeys) => {
    const keys = Object.keys(row);
    for (const key of keys) {
      if (possibleKeys.includes(cleanKey(key))) {
        return row[key];
      }
    }
    return '';
  };

  const analyzeData = (data) => {
    setRowCount(data.length);
    
    // Simulating processing delay to show indicator
    setTimeout(() => {
      try {
        let totalCheques = 0;
        let totalMontant = 0;
        let impayesCount = 0;
        const byBanque = {};
        const byMonth = {};
        const byRange = { '<1k': 0, '1-5k': 0, '5-10k': 0, '10-50k': 0, '>50k': 0 };
        const byStatut = { paye: 0, attente: 0, impaye: 0, annule: 0 };
        const clientsMap = {};

        let minDate = new Date('2100-01-01');
        let maxDate = new Date('1970-01-01');

        data.forEach(row => {
          const id = getVal(row, ['id', 'reference', 'ref']);
          const rawDate = getVal(row, ['date', 'date creation', 'date emission']);
          const montantRaw = getVal(row, ['montant', 'valeur', 'amount']);
          const banque = getVal(row, ['banque', 'bank']) || 'Inconnue';
          const statutRaw = getVal(row, ['statut', 'status', 'état', 'etat']);
          const client_nom = getVal(row, ['client_nom', 'client', 'nom client', 'payee', 'beneficiaire', 'tire']);
          const client_ice = getVal(row, ['client_ice', 'ice']);
          const type = getVal(row, ['type', 'doc type']) || 'Chèque';

          const montant = parseFloat(String(montantRaw).replace(/,/g, '').replace(/\s/g, '')) || 0;
          
          if (montant === 0 && !client_nom) return;

          totalCheques++;
          totalMontant += montant;

          const s = cleanKey(String(statutRaw));
          let statut = 'attente';
          if (s.includes('pay') && !s.includes('impay')) statut = 'paye';
          else if (s.includes('impay') || s.includes('rejet')) statut = 'impaye';
          else if (s.includes('annul')) statut = 'annule';

          if (statut === 'impaye') impayesCount++;
          byStatut[statut] = (byStatut[statut] || 0) + 1;

          byBanque[banque] = (byBanque[banque] || 0) + 1;

          if (montant < 1000) byRange['<1k']++;
          else if (montant <= 5000) byRange['1-5k']++;
          else if (montant <= 10000) byRange['5-10k']++;
          else if (montant <= 50000) byRange['10-50k']++;
          else byRange['>50k']++;

          let dateObj = new Date(rawDate);
          if (isNaN(dateObj.getTime())) {
            const parts = String(rawDate).split('/');
            if (parts.length === 3) {
              dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            } else {
              dateObj = new Date();
            }
          }
          
          if (dateObj < minDate) minDate = dateObj;
          if (dateObj > maxDate) maxDate = dateObj;

          const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
          if (!byMonth[monthKey]) byMonth[monthKey] = { emis: 0, encaisses: 0, impayes: 0 };
          
          byMonth[monthKey].emis++;
          if (statut === 'paye') byMonth[monthKey].encaisses++;
          if (statut === 'impaye') byMonth[monthKey].impayes++;

          if (client_nom) {
            if (!clientsMap[client_nom]) {
              clientsMap[client_nom] = { nom: client_nom, ice: client_ice, transactions: [], scores: {} };
            }
            clientsMap[client_nom].transactions.push({ id, date: dateObj.toISOString(), montant, banque, statut, type });
          }
        });

        const tauxImpayes = totalCheques > 0 ? (impayesCount / totalCheques) * 100 : 0;
        const clients = Object.values(clientsMap);

        const formatDate = (d) => {
          if (d.getFullYear() > 2050 || d.getFullYear() < 2000) return 'N/A';
          return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        };

        const resultObj = {
          totalCheques,
          totalMontant,
          tauxImpayes,
          byBanque,
          byMonth,
          byRange,
          byStatut,
          clients
        };

        setProcessStatus({
          total: totalCheques,
          banks: Object.keys(byBanque).length,
          startDate: formatDate(minDate),
          endDate: formatDate(maxDate)
        });

        if (onDataProcessed) {
          onDataProcessed(resultObj);
        }

      } catch (err) {
        setProcessStatus(`Erreur lors de l'analyse: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    }, 800);
  };

  return (
    <div className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          backgroundColor: '#0B0C10',
          borderColor: isDragging ? '#0ea5e9' : '#1e293b',
        }}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${isDragging ? 'opacity-80 scale-[1.02]' : ''}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
          className="hidden" 
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#0ea5e9] animate-spin" />
            <p className="text-white font-medium">
              Traitement de {rowCount || '...'} lignes...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full" style={{ backgroundColor: '#060709' }}>
              <UploadCloud className="w-10 h-10 text-[#0ea5e9]" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Importez vos données
            </h3>
            <p className="text-sm text-center max-w-md text-slate-400">
              Glissez-déposez votre fichier .CSV ou .XLSX ici, ou cliquez pour parcourir.
              <br /><br />
              <span className="text-xs text-slate-500">Colonnes attendues : id, date, montant, banque, statut, client_nom, client_ice, type</span>
            </p>
          </div>
        )}
      </div>

      {/* Success Banner */}
      {processStatus && typeof processStatus === 'object' && !isProcessing && (
        <div className="mt-4 p-4 rounded-lg flex items-center space-x-3 border" style={{ backgroundColor: '#060709', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm text-white">
              ✅ <strong className="text-green-400">{processStatus.total} chèques importés</strong> — {processStatus.banks} banques — du {processStatus.startDate} au {processStatus.endDate}
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {typeof processStatus === 'string' && !isProcessing && (
        <div className="mt-4 p-4 rounded-lg flex items-center space-x-3 border" style={{ backgroundColor: 'rgba(127, 29, 29, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-400">
            {processStatus}
          </p>
        </div>
      )}
    </div>
  );
}
