import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { useUIStore } from '../store/uiStore';
import { db } from '../db/db';
import { BarChart3, TrendingUp, DollarSign, Package, Wallet } from 'lucide-react';

export default function Reports() {
    const { t } = useTranslation();
    const { currency } = useUIStore();
    const sales = useLiveQuery(() => db.sales.toArray()) || [];

    const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    const stats = useMemo(() => {
        const now = new Date();
        const filteredSales = sales.filter(s => {
            const d = new Date(s.timestamp);
            if (timeRange === 'daily') return d.toDateString() === now.toDateString();
            if (timeRange === 'weekly') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return d >= weekAgo;
            }
            if (timeRange === 'monthly') {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            return true;
        });

        const revenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const profit = revenue * 0.3; // Simplified profit calculation (30% margin)
        const itemsSold = filteredSales.reduce((count, sale) => count + sale.items.reduce((c, i) => c + i.quantity, 0), 0);
        const avgSale = filteredSales.length > 0 ? revenue / filteredSales.length : 0;

        return { revenue, profit, count: filteredSales.length, itemsSold, avgSale };
    }, [sales, timeRange]);

    const recentSales = useMemo(() => {
        return [...sales].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
    }, [sales]);

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">{t('reports.title')}</h1>
                <select
                    className="bg-card border border-input rounded-md px-4 py-2 font-medium"
                    value={timeRange}
                    onChange={e => setTimeRange(e.target.value as any)}
                >
                    <option value="daily">{t('reports.daily')}</option>
                    <option value="weekly">Weekly Sales</option>
                    <option value="monthly">Monthly Sales</option>
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                        <DollarSign size={80} />
                    </div>
                    <div className="p-4 bg-white/20 rounded-full relative z-10"><DollarSign size={24} /></div>
                    <div className="relative z-10">
                        <div className="text-sm text-green-50 font-medium mb-1">{t('reports.revenue')}</div>
                        <div className="text-2xl font-black">{currency}{stats.revenue.toFixed(2)}</div>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 group hover:border-primary/30 transition-colors">
                    <div className="p-4 bg-blue-500/10 rounded-full text-blue-500 group-hover:scale-110 transition-transform"><TrendingUp size={24} /></div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">{t('reports.profit')}</div>
                        <div className="text-2xl font-bold">{currency}{stats.profit.toFixed(2)}</div>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 group hover:border-primary/30 transition-colors">
                    <div className="p-4 bg-amber-500/10 rounded-full text-amber-500 group-hover:scale-110 transition-transform"><Wallet size={24} /></div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Avg Sale Value</div>
                        <div className="text-2xl font-bold">{currency}{stats.avgSale.toFixed(2)}</div>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 group hover:border-primary/30 transition-colors">
                    <div className="p-4 bg-purple-500/10 rounded-full text-purple-500 group-hover:scale-110 transition-transform"><BarChart3 size={24} /></div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">{t('reports.salesCount')}</div>
                        <div className="text-2xl font-bold">{stats.count}</div>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 group hover:border-primary/30 transition-colors">
                    <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-500 group-hover:scale-110 transition-transform"><Package size={24} /></div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Items Sold</div>
                        <div className="text-2xl font-bold">{stats.itemsSold}</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-card rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col">
                <h2 className="text-xl font-bold m-4 sm:m-0 sm:mb-4">Recent Sales History</h2>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-y border-border">
                                <th className="p-4 font-medium">Date & Time</th>
                                <th className="p-4 font-medium">Items</th>
                                <th className="p-4 font-medium">Discount</th>
                                <th className="p-4 font-medium">Tax</th>
                                <th className="p-4 font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSales.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">No sales recorded yet.</td>
                                </tr>
                            ) : (
                                recentSales.map(s => (
                                    <tr key={s.id} className="border-b border-border/50 hover:bg-muted/20">
                                        <td className="p-4">{new Date(s.timestamp).toLocaleString()}</td>
                                        <td className="p-4">{s.items.length} items</td>
                                        <td className="p-4 text-green-600 dark:text-green-400">-{currency}{s.discount.toFixed(2)}</td>
                                        <td className="p-4">{currency}{s.tax.toFixed(2)}</td>
                                        <td className="p-4 font-bold text-lg">{currency}{s.total.toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
