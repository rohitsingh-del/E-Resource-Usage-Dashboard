import { useEffect, useState } from 'react';
import { fetchSheetData, type SheetData, DATASETS } from './services/googleSheets';
import { DashboardCharts } from './components/DashboardCharts';
import { StatsCards } from './components/StatsCards';
import { AnalysisPanel } from './components/AnalysisPanel';
import { SchoolResourceTable } from './components/SchoolResourceTable';
import { NewspaperView } from './components/NewspaperView';
import { Loader2, Calendar, Sun, Moon } from 'lucide-react';

function App() {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<keyof typeof DATASETS>('2025 Data');
  const [darkMode, setDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'newspaper'>('dashboard');

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    setLoading(true);
    fetchSheetData(DATASETS[selectedDataset])
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedDataset]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background p-4 md:p-8 space-y-8 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            E-Resources Usage Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Galgotias University Knowledge Center</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">

            {/* View Toggle */}
            <div className="bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 flex mr-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${currentView === 'dashboard'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('newspaper')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${currentView === 'newspaper'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                Newspaper Data
              </button>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <div className="hidden md:block">
            {currentView === 'dashboard' && (
              <div className="flex items-center gap-2 mb-1 justify-end">
                <Calendar size={14} className="text-slate-500" />
                <select
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value as keyof typeof DATASETS)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded focus:ring-accent focus:border-accent p-1 outline-none"
                >
                  {Object.keys(DATASETS).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
            )}
            <p className="text-xs text-slate-600">Last Setup: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="space-y-8">
        {currentView === 'newspaper' ? (
          <NewspaperView />
        ) : (
          <>
            {loading ? (
              <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
              </div>
            ) : error ? (
              <div className="min-h-[50vh] flex items-center justify-center text-red-500">
                Error loading data: {error}
              </div>
            ) : data ? (
              <div className="animate-in fade-in duration-500 space-y-8">
                <StatsCards data={data} datasetName={selectedDataset} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <DashboardCharts data={data} darkMode={darkMode} />
                  </div>
                  <div className="lg:col-span-1">
                    <AnalysisPanel data={data} />
                  </div>
                </div>
                <SchoolResourceTable />
              </div>
            ) : null}
          </>
        )}
      </main>

      <footer className="text-center text-slate-600 text-sm py-8 space-y-2">
        <p>© {new Date().getFullYear()} Galgotias University. All Rights Reserved.</p>
        <p className="text-base font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 inline-block px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-700/50">
          Created and designed by <span className="text-accent font-bold">Rohit Singh</span>, Assistant Librarian, Galgotias University
        </p>
      </footer>
    </div>
  );
}

export default App;
