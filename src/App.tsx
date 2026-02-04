import { useEffect, useState } from 'react';
import { fetchSheetData, type SheetData, DATASETS } from './services/googleSheets';
import { DashboardCharts } from './components/DashboardCharts';
import { StatsCards } from './components/StatsCards';
import { AnalysisPanel } from './components/AnalysisPanel';
import { SchoolResourceTable } from './components/SchoolResourceTable';
import { Loader2, Calendar } from 'lucide-react';

function App() {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<keyof typeof DATASETS>('2025 Data');

  useEffect(() => {
    setLoading(true);
    fetchSheetData(DATASETS[selectedDataset])
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedDataset]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-red-500">
        Error loading data: {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            E-Resources Usage Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Galgotias University Knowledge Center</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="flex items-center gap-2 mb-1 justify-end">
            <Calendar size={14} className="text-slate-500" />
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value as keyof typeof DATASETS)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded focus:ring-accent focus:border-accent p-1 outline-none"
            >
              {Object.keys(DATASETS).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-600">Last Setup: {new Date().toLocaleDateString()}</p>
        </div>
      </header>

      <StatsCards data={data} datasetName={selectedDataset} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <DashboardCharts data={data} />
        </div>
        <div className="lg:col-span-1">
          <AnalysisPanel data={data} />
        </div>
      </div>

      <SchoolResourceTable />

      <footer className="text-center text-slate-600 text-sm py-8 space-y-2">
        <p>© {new Date().getFullYear()} Galgotias University. All Rights Reserved.</p>
        <p className="text-base font-semibold text-slate-400 bg-slate-800/50 inline-block px-4 py-2 rounded-full border border-slate-700/50">
          Created and designed by <span className="text-accent font-bold">Rohit Singh</span>, Assistant Librarian, Galgotias University
        </p>
      </footer>
    </div>
  );
}

export default App;
