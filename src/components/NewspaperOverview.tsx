
import { useState, useEffect } from 'react';
import {
    ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { fetchAllNewspaperMonths, getNewspaperLanguage, type MonthlyAggregation } from '../services/googleSheets';
import { Loader2, TrendingUp, Languages, IndianRupee } from 'lucide-react';
import { Card } from './ui/Card';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const LanguagePieChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0 || data.every(d => d.value === 0)) {
        return (
            <div className="flex h-[300px] items-center justify-center text-slate-400">
                No data available for language distribution
            </div>
        );
    }
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

const TrendChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="name" scale="point" padding={{ left: 30, right: 30 }} />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="cost" name="Monthly Cost (₹)" fill="#8884d8" barSize={40} />
            <Line yAxisId="right" type="monotone" dataKey="copies" name="Total Copies" stroke="#82ca9d" strokeWidth={3} />
        </ComposedChart>
    </ResponsiveContainer>
);

export function NewspaperOverview() {
    const [data, setData] = useState<MonthlyAggregation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllNewspaperMonths().then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

    // --- Prepare Chart Data ---

    // 1. Monthly Trend Data
    // We need to sort by month. The fetchAll returns in Object.keys order.
    // 'March 2025', 'April 2025'... simplistic sort might work if we just map
    const monthOrder = [
        'March 2025', 'April 2025', 'May 2025', 'July 2025', 'August 2025',
        'September 2025', 'October 2025', 'November 2025', 'December 2025'
    ];

    // Sort data based on defined order
    const sortedData = [...data].sort((a, b) => {
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

    const trendData = sortedData.map(item => ({
        name: item.month.split(' ')[0], // 'March', 'April'
        cost: item.totalPrice,
        copies: item.totalIsr
    }));

    // 2. Language Distribution (Aggregate across all months or take latest? Aggregate makes sense for overall volume)
    // Let's count TOTAL copies by language across all months
    let hindiCount = 0;
    let englishCount = 0;
    let otherCount = 0;

    data.forEach(month => {
        month.records.forEach(rec => {
            const lang = getNewspaperLanguage(rec.name);
            if (lang === 'Hindi') hindiCount += rec.totalCopies;
            else if (lang === 'English') englishCount += rec.totalCopies;
            else otherCount += rec.totalCopies;
        });
    });

    const languageData = [
        { name: 'Hindi', value: hindiCount },
        { name: 'English', value: englishCount },
        ...(otherCount > 0 ? [{ name: 'Other', value: otherCount }] : [])
    ];

    // Stats
    const totalYearCost = data.reduce((sum, m) => sum + m.totalPrice, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white dark:bg-slate-800 border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Year-to-Date Cost</p>
                            <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">₹{totalYearCost.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <IndianRupee className="w-6 h-6 text-indigo-500" />
                        </div>
                    </div>
                </Card>
                <Card className="bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Copies Received</p>
                            <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">
                                {(hindiCount + englishCount + otherCount).toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                </Card>
                <Card className="bg-white dark:bg-slate-800 border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Dominant Language</p>
                            <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">
                                {hindiCount > englishCount ? 'Hindi' : 'English'}
                            </h3>
                        </div>
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <Languages className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trend Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-slate-200">Monthly Usage Trends</h3>
                    <TrendChart data={trendData} />
                </div>

                {/* Language Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-slate-200">Language Distribution (Copies)</h3>
                    <LanguagePieChart data={languageData} />
                </div>
            </div>
        </div>
    );
}
