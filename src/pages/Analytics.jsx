import React, { useState } from 'react';
import CSVImporter from '../components/analytics/CSVImporter';
import RiskRadar from '../components/analytics/RiskRadar';
import { Activity } from 'lucide-react';

export default function Analytics() {
  const [analyzedData, setAnalyzedData] = useState(null);

  return (
    <div className="flex flex-col space-y-6">
      <header className="page-header hide-on-print flex justify-between items-start">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#0ea5e9]" />
            ANALYTICS & RISQUES
          </h1>
          <p className="page-subtitle">Importation de données et analyse des risques clients.</p>
        </div>
      </header>

      <div className="card p-6 border-slate-800">
        <CSVImporter onDataProcessed={setAnalyzedData} />
      </div>

      {analyzedData && analyzedData.clients && analyzedData.clients.length > 0 && (
        <RiskRadar clients={analyzedData.clients} />
      )}
    </div>
  );
}
