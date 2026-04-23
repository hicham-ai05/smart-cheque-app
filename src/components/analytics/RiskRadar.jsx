import React, { useState, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

export default function RiskRadar({ clients = [] }) {
  const [selectedClientName, setSelectedClientName] = useState('');

  // Auto-compute scores
  const processedClients = useMemo(() => {
    if (!clients || clients.length === 0) return [];

    const now = new Date();

    // 1st pass: calculate raw metrics
    const rawData = clients.map(client => {
      const txs = [...client.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
      const nbTransactions = txs.length;
      
      let paidCount = 0;
      let sumMontant = 0;
      let firstDate = new Date();
      let lastDate = new Date(0);

      if (txs.length > 0) {
        firstDate = new Date(txs[0].date);
        lastDate = new Date(txs[txs.length - 1].date);
      }

      const gaps = [];
      for (let i = 1; i < txs.length; i++) {
        const prev = new Date(txs[i-1].date);
        const curr = new Date(txs[i].date);
        const diffTime = Math.abs(curr - prev);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        gaps.push(diffDays);
      }

      let stdDevGaps = 0;
      if (gaps.length > 0) {
        const meanGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        const variance = gaps.reduce((a, b) => a + Math.pow(b - meanGap, 2), 0) / gaps.length;
        stdDevGaps = Math.sqrt(variance);
      }

      txs.forEach(tx => {
        if (tx.statut === 'paye') paidCount++;
        sumMontant += tx.montant;
      });

      const avgMontant = nbTransactions > 0 ? sumMontant / nbTransactions : 0;
      const daysSinceFirst = Math.max(0, Math.ceil((now - firstDate) / (1000 * 60 * 60 * 24)));
      const ancienneteJours = Math.max(0, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

      return {
        ...client,
        raw: {
          paidCount,
          nbTransactions,
          avgMontant,
          daysSinceFirst,
          ancienneteJours,
          stdDevGaps
        }
      };
    });

    // Calculate maxes across dataset for normalization
    const maxInDataset = Math.max(...rawData.map(c => c.raw.nbTransactions), 1);
    const maxAvgInDataset = Math.max(...rawData.map(c => c.raw.avgMontant), 1);
    const maxStdDev = Math.max(...rawData.map(c => c.raw.stdDevGaps), 1);

    // 2nd pass: calculate final scores [0, 100]
    return rawData.map(client => {
      const { paidCount, nbTransactions, avgMontant, daysSinceFirst, ancienneteJours, stdDevGaps } = client.raw;

      const solvabilite = nbTransactions > 0 ? (paidCount / nbTransactions) * 100 : 0;
      const historique = Math.min((ancienneteJours / 365) * 100, 100);
      const frequence = Math.min((nbTransactions / maxInDataset) * 100, 100);
      const montantMoyen = Math.min((avgMontant / maxAvgInDataset) * 100, 100);
      const anciennete = Math.min((daysSinceFirst / 730) * 100, 100);
      const regularite = 100 - Math.min((stdDevGaps / maxStdDev) * 100, 100);

      const scoresObj = {
        Solvabilité: Math.round(solvabilite),
        Historique: Math.round(historique),
        Fréquence: Math.round(frequence),
        'Montant moyen': Math.round(montantMoyen),
        Ancienneté: Math.round(anciennete),
        Régularité: Math.round(regularite)
      };

      const avgScore = Math.round(
        (scoresObj.Solvabilité + 
         scoresObj.Historique + 
         scoresObj.Fréquence + 
         scoresObj['Montant moyen'] + 
         scoresObj.Ancienneté + 
         scoresObj.Régularité) / 6
      );

      return {
        ...client,
        scoresObj,
        avgScore
      };
    });
  }, [clients]);

  if (!clients || clients.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 bg-[#0B0C10] rounded-xl border border-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>
        <AlertCircle className="w-12 h-12 text-slate-500 mb-4" />
        <p className="text-slate-400">Importez un fichier CSV pour générer les scores</p>
      </div>
    );
  }

  // Set default selected client if none selected
  if (!selectedClientName && processedClients.length > 0) {
    setSelectedClientName(processedClients[0].nom);
  }

  const selectedClient = processedClients.find(c => c.nom === selectedClientName) || processedClients[0];
  
  const radarData = selectedClient ? [
    { subject: 'Solvabilité', A: selectedClient.scoresObj.Solvabilité, fullMark: 100 },
    { subject: 'Historique', A: selectedClient.scoresObj.Historique, fullMark: 100 },
    { subject: 'Fréquence', A: selectedClient.scoresObj.Fréquence, fullMark: 100 },
    { subject: 'Montant moyen', A: selectedClient.scoresObj['Montant moyen'], fullMark: 100 },
    { subject: 'Ancienneté', A: selectedClient.scoresObj.Ancienneté, fullMark: 100 },
    { subject: 'Régularité', A: selectedClient.scoresObj.Régularité, fullMark: 100 },
  ] : [];

  const riskiestClients = [...processedClients].sort((a, b) => a.avgScore - b.avgScore).slice(0, 5);

  const getRiskBadge = (score) => {
    if (score >= 70) return { label: 'Faible', color: 'text-green-400', bg: 'bg-green-400/10', icon: <ShieldCheck className="w-4 h-4 mr-1" /> };
    if (score >= 40) return { label: 'Modéré', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: <Shield className="w-4 h-4 mr-1" /> };
    return { label: 'Élevé', color: 'text-red-400', bg: 'bg-red-400/10', icon: <ShieldAlert className="w-4 h-4 mr-1" /> };
  };

  const currentBadge = selectedClient ? getRiskBadge(selectedClient.avgScore) : null;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Radar Chart Section */}
      <div className="bg-[#0B0C10] rounded-xl p-6 border border-slate-800 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-semibold text-white">Analyse de Risque</h3>
          
          <select 
            value={selectedClientName}
            onChange={(e) => setSelectedClientName(e.target.value)}
            className="bg-[#060709] border border-slate-700 text-white text-sm rounded-lg focus:ring-[#0ea5e9] focus:border-[#0ea5e9] block p-2.5 max-w-[200px]"
          >
            {processedClients.map(c => (
              <option key={c.nom} value={c.nom}>{c.nom}</option>
            ))}
          </select>
        </div>

        {selectedClient && (
          <>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Score Moyen</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-white">{selectedClient.avgScore}</span>
                  <span className="text-sm text-slate-500">/ 100</span>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full flex items-center ${currentBadge.bg} ${currentBadge.color} border border-current/20`}>
                {currentBadge.icon}
                <span className="font-medium text-sm">Risque {currentBadge.label}</span>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#060709', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#0ea5e9' }}
                  />
                  <Radar name={selectedClient.nom} dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* Top Riskiest Table Section */}
      <div className="bg-[#0B0C10] rounded-xl p-6 border border-slate-800 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6">Top 5 Clients à Risque</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs uppercase bg-[#060709] text-slate-400">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg rounded-bl-lg">Nom</th>
                <th className="px-4 py-3 text-center">Score moyen</th>
                <th className="px-4 py-3 rounded-tr-lg rounded-br-lg text-right">Badge</th>
              </tr>
            </thead>
            <tbody>
              {riskiestClients.map((client, idx) => {
                const badge = getRiskBadge(client.avgScore);
                return (
                  <tr key={client.nom} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white flex items-center space-x-2">
                      <span className="text-slate-500 text-xs">#{idx + 1}</span>
                      <span className="truncate max-w-[150px]">{client.nom}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold">
                      {client.avgScore}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-auto pt-6 text-xs text-slate-500 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Les scores sont calculés à partir de la solvabilité, la fréquence, le montant moyen et l'historique des transactions. Un score plus bas indique un risque plus élevé.</p>
        </div>
      </div>

    </div>
  );
}
