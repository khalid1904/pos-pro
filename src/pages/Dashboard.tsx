import { useTranslation } from 'react-i18next';
import { TrendingUp, ShoppingBag, DollarSign, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
    const { t } = useTranslation();
    const { currency } = useUIStore();
    const { selectedStoreId } = useAuthStore();
    
    const [stats, setStats] = useState({
        revenue: 0,
        salesCount: 0,
        productCount: 0,
        lowStock: 0,
        recentSales: [] as any[]
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!selectedStoreId) return;
            setIsLoading(true);
            try {
                // Fetch stats from Supabase
                const [salesRes, productsRes] = await Promise.all([
                    supabase.from('sales').select('total').eq('store_id', selectedStoreId),
                    supabase.from('products').select('stock').eq('store_id', selectedStoreId),
                ]);

                const recentSalesRes = await supabase
                    .from('sales')
                    .select('*')
                    .eq('store_id', selectedStoreId)
                    .order('created_at', { ascending: false })
                    .limit(5);

                const revenue = salesRes.data?.reduce((sum, s) => sum + s.total, 0) || 0;
                const salesCount = salesRes.data?.length || 0;
                const productCount = productsRes.data?.length || 0;
                const lowStock = productsRes.data?.filter(p => p.stock < 10).length || 0;

                setStats({
                    revenue,
                    salesCount,
                    productCount,
                    lowStock,
                    recentSales: recentSalesRes.data || []
                });
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedStoreId]);

    const statCards = [
        { title: t('dashboard.stats.revenue'), value: `${currency}${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
        { title: t('dashboard.stats.sales'), value: stats.salesCount.toString(), icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-100' },
        { title: t('dashboard.stats.products'), value: stats.productCount.toString(), icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: t('dashboard.stats.lowStock'), value: stats.lowStock.toString(), icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">{t('dashboard.title')}</h1>
                    <p className="text-muted-foreground font-medium mt-1">Here's what's happening in your shop today.</p>
                </div>
                <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 text-primary font-black uppercase tracking-widest text-xs">
                    Cloud Live Sync
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-card p-6 rounded-[2rem] shadow-sm border border-border flex items-center gap-4 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                            <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Sales */}
                <div className="lg:col-span-2 bg-card rounded-[2.5rem] shadow-sm border border-border flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <TrendingUp className="text-primary" size={24} />
                            Recent Sales
                        </h2>
                        <button className="text-primary font-black text-sm hover:underline">View All</button>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 text-xs font-black text-muted-foreground uppercase tracking-widest">
                                <tr>
                                    <th className="p-6">Time</th>
                                    <th className="p-6">Method</th>
                                    <th className="p-6 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {stats.recentSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-6">
                                            <div className="font-bold">{new Date(sale.created_at).toLocaleTimeString()}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(sale.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${sale.payment_method === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {sale.payment_method}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right font-black text-lg text-primary">{currency}{sale.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {stats.recentSales.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-12 text-center text-muted-foreground font-bold italic">
                                            No sales recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Performance Goal (Static/Placeholder) */}
                <div className="bg-primary text-primary-foreground rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-primary/30">
                    <div className="relative z-10 flex-1">
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">Growth Target</h2>
                        <div className="text-6xl font-black mb-2">82%</div>
                        <p className="font-bold text-primary-foreground/70 uppercase tracking-widest text-xs mb-8">Of monthly goal reached</p>
                        
                        <div className="space-y-4">
                            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[82%] rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                            </div>
                            <p className="text-sm font-medium leading-relaxed">
                                You're doing great! Your sales are up 12% compared to last week. Keep pushing those categories.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
