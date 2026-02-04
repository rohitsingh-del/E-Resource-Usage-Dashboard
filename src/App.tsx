import { useEffect, useState } from 'react';
import { fetchSheetData, type SheetData } from './services/googleSheets';
import { DashboardCharts } from './components/DashboardCharts';
import { StatsCards } from './components/StatsCards';
import { AnalysisPanel } from './components/AnalysisPanel';
import { SchoolResourceTable } from './components/SchoolResourceTable';
import { Loader2 } from 'lucide-react';

function App() {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSheetData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
          <p className="text-sm text-slate-500">Live Data from Google Sheets</p>
          <p className="text-xs text-slate-600">Last Setup: {new Date().toLocaleDateString()}</p>
        </div>
      </header>

      <StatsCards data={data} />

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
