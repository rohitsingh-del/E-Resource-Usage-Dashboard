import { useState, useEffect } from 'react';
import { fetchNewspaperData, NEWSPAPER_DATASETS, type NewspaperRecord } from '../services/googleSheets';
import { Loader2, Calendar, Newspaper, IndianRupee } from 'lucide-react';
import { Card } from './ui/Card';

export function NewspaperView() {
    const [selectedMonth, setSelectedMonth] = useState<keyof typeof NEWSPAPER_DATASETS>('March 2025');
    const [data, setData] = useState<NewspaperRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const records = await fetchNewspaperData(NEWSPAPER_DATASETS[selectedMonth]);
                setData(records);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Failed to load newspaper data.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [selectedMonth]);

    const totalCost = data.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalCopies = data.reduce((sum, item) => sum + item.totalCopies, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Newspaper className="text-accent h-6 w-6" />
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Newspaper Records</h2>
                </div>

                <div className="flex items-center gap-2">
                    <Calendar className="text-slate-500 h-4 w-4" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value as keyof typeof NEWSPAPER_DATASETS)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md p-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                    >
                        {Object.keys(NEWSPAPER_DATASETS).map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
            ) : error ? (
                <div className="text-red-500 text-center py-12">{error}</div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-indigo-100 text-sm font-medium">Total Monthly Bill</p>
                                    <h3 className="text-3xl font-bold mt-1">₹{totalCost.toLocaleString()}</h3>
                                </div>
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <IndianRupee className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Total Copies Received</p>
                                    <h3 className="text-3xl font-bold mt-1">{totalCopies.toLocaleString()}</h3>
                                </div>
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Newspaper className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Newspapers Subscribed</p>
                                    <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{data.length}</h3>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Simple Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Newspaper Name</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Total Copies</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Total Price (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {data.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-right">{item.totalCopies}</td>
                                            <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-semibold text-right">
                                                ₹{item.totalPrice.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 font-semibold">
                                    <tr>
                                        <td className="px-6 py-4 text-slate-800 dark:text-slate-200">Total</td>
                                        <td className="px-6 py-4 text-slate-800 dark:text-slate-200 text-right">{totalCopies}</td>
                                        <td className="px-6 py-4 text-accent text-right">₹{totalCost.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
