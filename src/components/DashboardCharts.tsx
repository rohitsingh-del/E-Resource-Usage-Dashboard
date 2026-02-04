
import { useState, useMemo } from 'react';
import type { SheetData } from '../services/googleSheets';
import { Card } from './ui/Card';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { ArrowUpRight } from 'lucide-react';

interface ChartsProps {
    data: SheetData;
    darkMode: boolean;
}

const COLORS = ['#38bdf8', '#818cf8', '#22d3ee', '#4ade80', '#fbbf24', '#f87171', '#c084fc'];

export const DashboardCharts = ({ data, darkMode }: ChartsProps) => {
    const [selectedPublisher, setSelectedPublisher] = useState<string>('All');

    // Theme constants
    const gridColor = darkMode ? '#1e293b' : '#e2e8f0'; // slate-800 vs slate-200
    const axisColor = darkMode ? '#64748b' : '#94a3b8'; // slate-500 vs slate-400
    const tooltipBg = darkMode ? '#1e293b' : '#ffffff';
    const tooltipBorder = darkMode ? '#334155' : '#e2e8f0';
    const tooltipText = darkMode ? '#f1f5f9' : '#0f172a';

    // Prepare data for the monthly trend chart
    const trendData = useMemo(() => {
        return data.records.map(record => {
            let value = 0;
            if (selectedPublisher === 'All') {
                data.publishers.forEach(pub => {
                    value += Number(record[pub]) || 0;
                });
            } else {
                value = Number(record[selectedPublisher]) || 0;
            }
            return {
                month: record.month || record['Months'],
                value: value
            };
        });
    }, [data, selectedPublisher]);

    // Prepare data for the Top Publishers Bar Chart
    const rankingData = useMemo(() => {
        const totals = data.publishers.map(pub => {
            const total = data.records.reduce((sum, record) => sum + (Number(record[pub]) || 0), 0);
            return { name: pub, total };
        });
        return totals.sort((a, b) => b.total - a.total).slice(0, 10); // Top 10
    }, [data]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-lg text-xs">
                    <p className="font-semibold text-slate-900 dark:text-slate-200 mb-1">{label}</p>
                    <p className="text-accent font-bold">
                        {payload[0].value.toLocaleString()} views
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Trend Chart */}
            <Card>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                            <ArrowUpRight className="text-accent" size={20} />
                            Monthly Usage Trend
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Visualizing usage over time for {selectedPublisher}</p>
                    </div>

                    <select
                        value={selectedPublisher}
                        onChange={(e) => setSelectedPublisher(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-lg focus:ring-accent focus:border-accent block p-2.5 outline-none"
                    >
                        <option value="All">All Publishers</option>
                        {data.publishers.map(pub => (
                            <option key={pub} value={pub}>{pub}</option>
                        ))}
                    </select>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis
                                dataKey="month"
                                stroke={axisColor}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke={axisColor}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)} k` : value}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor, strokeWidth: 1 }} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#38bdf8"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Ranking Chart */}
            <Card>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Top 10 Publishers</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Publishers with the highest total usage this year</p>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rankingData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                            <XAxis type="number" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke={axisColor}
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                width={100}
                            />
                            <Tooltip
                                cursor={{ fill: darkMode ? '#1e293b' : '#f1f5f9' }}
                                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }}
                            />
                            <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={20}>
                                {rankingData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};
