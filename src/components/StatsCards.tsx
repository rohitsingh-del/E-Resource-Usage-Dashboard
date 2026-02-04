import type { SheetData } from '../services/googleSheets';
import { Card } from './ui/Card';
import { BookOpen, TrendingUp, Award, BarChart3 } from 'lucide-react';

interface StatsProps {
    data: SheetData;
}

export const StatsCards = ({ data }: StatsProps) => {
    // Calculate Totals
    const totalUsage = data.records.reduce((acc, record) => {
        let monthlyTotal = 0;
        Object.keys(record).forEach(key => {
            if (key !== 'Months') {
                monthlyTotal += Number(record[key]) || 0;
            }
        });
        return acc + monthlyTotal;
    }, 0);

    // Find Top Publisher
    const publisherTotals: Record<string, number> = {};
    data.publishers.forEach(pub => publisherTotals[pub] = 0);

    data.records.forEach(record => {
        data.publishers.forEach(pub => {
            publisherTotals[pub] += Number(record[pub]) || 0;
        });
    });

    const topPublisher = Object.entries(publisherTotals).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);

    // Find Peak Month
    const monthlyTotals = data.records.map(record => {
        let total = 0;
        data.publishers.forEach(pub => total += Number(record[pub]) || 0);
        return { month: record.month || record['Months'], total };
    });

    const peakMonth = monthlyTotals.reduce((a, b) => a.total > b.total ? a : b, { month: '', total: 0 });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="flex items-center space-x-4 border-l-4 border-l-accent">
                <div className="p-3 bg-accent/10 rounded-full text-accent">
                    <BookOpen size={24} />
                </div>
                <div>
                    <p className="text-slate-400 text-sm">Total Usage</p>
                    <h3 className="text-2xl font-bold">{totalUsage.toLocaleString()}</h3>
                    <p className="text-xs text-slate-500">Jan 2025 - Dec 2025</p>
                </div>
            </Card>

            <Card className="flex items-center space-x-4 border-l-4 border-l-purple-500">
                <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                    <Award size={24} />
                </div>
                <div>
                    <p className="text-slate-400 text-sm">Top Source</p>
                    <h3 className="text-xl font-bold truncate max-w-[150px]" title={topPublisher[0]}>{topPublisher[0]}</h3>
                    <p className="text-xs text-slate-500">{topPublisher[1].toLocaleString()} views</p>
                </div>
            </Card>

            <Card className="flex items-center space-x-4 border-l-4 border-l-emerald-500">
                <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-slate-400 text-sm">Peak Month</p>
                    <h3 className="text-xl font-bold">{peakMonth.month}</h3>
                    <p className="text-xs text-slate-500">{peakMonth.total.toLocaleString()} views</p>
                </div>
            </Card>

            <Card className="flex items-center space-x-4 border-l-4 border-l-amber-500">
                <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <p className="text-slate-400 text-sm">Active Publishers</p>
                    <h3 className="text-2xl font-bold">{data.publishers.length}</h3>
                    <p className="text-xs text-slate-500">Jan 2025 - Dec 2025</p>
                </div>
            </Card>
        </div>
    );
};
