import type { SheetData } from '../services/googleSheets';
import { Card } from './ui/Card';
import { Lightbulb, Info, AlertCircle } from 'lucide-react';

interface AnalysisProps {
    data: SheetData;
}

export const AnalysisPanel = ({ data }: AnalysisProps) => {
    // --- Automated Insights Logic ---

    // 1. Consistency: Calc coefficient of variation for monthly totals
    const monthlyTotals = data.records.map(r => {
        let t = 0;
        data.publishers.forEach(p => t += Number(r[p]) || 0);
        return t;
    });
    const mean = monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length;
    const variance = monthlyTotals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / monthlyTotals.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean; // Coefficient of Variation

    let consistencyMsg = "Usage is relatively stable throughout the year.";
    if (cv > 0.5) consistencyMsg = "Usage shows significant fluctuations month-to-month.";

    // 2. High Impact Publisher
    const publisherTotals = data.publishers.map(pub => {
        return {
            name: pub,
            total: data.records.reduce((sum, r) => sum + (Number(r[pub]) || 0), 0)
        };
    }).sort((a, b) => b.total - a.total);

    const topPub = publisherTotals[0];
    const share = (topPub.total / monthlyTotals.reduce((a, b) => a + b, 0)) * 100;

    // 3. Growth (First vs Last Month with data)
    // Assuming chronological order and full year or YTD
    const firstMonth = monthlyTotals[0];
    const lastMonth = monthlyTotals[monthlyTotals.length - 1]; // This might be Total row? No, filtered out.
    // Wait, if last month is partial it might dip.
    const growth = ((lastMonth - firstMonth) / firstMonth) * 100;

    return (
        <div className="space-y-6">
            <Card className="border-l-4 border-l-yellow-500 bg-yellow-500/5">
                <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-500 flex items-center gap-2 mb-2">
                    <Lightbulb size={20} />
                    Key Insight
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    <strong>{topPub.name}</strong> dominates the platform usage, accounting for
                    <strong className="text-slate-900 dark:text-white"> {share.toFixed(1)}%</strong> of all traffic.
                    Focusing on maintaining this subscription is critical.
                </p>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Automated Analysis</h3>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-3">
                        <Info className="text-blue-500 dark:text-blue-400 mt-1 flex-shrink-0" size={16} />
                        <div>
                            <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">Usage Pattern</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {consistencyMsg} The data shows a standard deviation of {stdDev.toFixed(0)} views.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle className={growth > 0 ? "text-green-500 dark:text-green-400 mt-1 flex-shrink-0" : "text-red-500 dark:text-red-400 mt-1 flex-shrink-0"} size={16} />
                        <div>
                            <h4 className={growth > 0 ? "text-sm font-medium text-green-600 dark:text-green-400" : "text-sm font-medium text-red-600 dark:text-red-400"}>
                                {growth > 0 ? "Positive Growth" : "Usage Decline"}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Comparing Jan to the latest month, overall usage has {growth > 0 ? "increased" : "decreased"} by {Math.abs(growth).toFixed(1)}%.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Card>
                <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Publisher Breakdown</h3>
                <div className="space-y-3">
                    {publisherTotals.slice(0, 5).map((pub, i) => (
                        <div key={pub.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 font-mono">
                                    {i + 1}
                                </span>
                                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={pub.name}>{pub.name}</span>
                            </div>
                            <span className="font-medium text-slate-900 dark:text-slate-200">{pub.total.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
