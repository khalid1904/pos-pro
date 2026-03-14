import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Loader2, ShoppingBag, CreditCard } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function Reports() {
    const { t } = useTranslation();
    const { currency } = useUIStore();
    const { selectedStoreId } = useAuthStore();
    
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('today');

    useEffect(() => {
        const fetchSalesReport = async () => {
            if (!selectedStoreId) return;
            setIsLoading(true);
            try {
                let query = supabase
                    .from('sales')
                    .select('*, sale_items(*)')
                    .eq('store_id', selectedStoreId)
                    .order('created_at', { ascending: false });

                const now = new Date();
                if (dateFilter === 'today') {
                    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
                    query = query.gte('created_at', startOfDay);
                } else if (dateFilter === 'week') {
                    const lastWeek = new Date(now.setDate(now.getDate() - 7)).toISOString();
                    query = query.gte('created_at', lastWeek);
                }

                const { data } = await query;
                setSales(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSalesReport();
    }, [selectedStoreId, dateFilter]);

    const stats = {
        totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
        totalSales: sales.length,
        avgTicket: sales.length > 0 ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length : 0,
        cashTotal: sales.filter(s => s.payment_method === 'cash').reduce((sum, s) => sum + s.total, 0),
        upiTotal: sales.filter(s => s.payment_method === 'upi').reduce((sum, s) => sum + s.total, 0),
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">{t('reports.title')}</h1>
                    <p className="text-muted-foreground font-medium mt-1">Detailed analysis of your store's performance.</p>
                </div>
                
                <div className="flex gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border">
                    {['today', 'week', 'all'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setDateFilter(filter)}
                            className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${dateFilter === filter ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-muted text-muted-foreground'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{t('reports.totalRevenue')}</p>
                    <p className="text-3xl font-black text-primary tracking-tighter">{currency}{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{t('reports.totalSales')}</p>
                    <p className="text-3xl font-black tracking-tighter">{stats.totalSales}</p>
                </div>
                <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Cash Volume</p>
                    <p className="text-3xl font-black text-green-600 tracking-tighter">{currency}{stats.cashTotal.toLocaleString()}</p>
                </div>
                <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">UPI Volume</p>
                    <p className="text-3xl font-black text-blue-600 tracking-tighter">{currency}{stats.upiTotal.toLocaleString()}</p>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-card rounded-[2.5rem] shadow-sm border border-border overflow-hidden">
                <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                        <ShoppingBag className="text-primary" size={28} />
                        Detailed Transactions
                    </h2>
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-primary" size={48} />
                            <p className="font-black text-muted-foreground uppercase tracking-widest text-sm">Loading Sales Records...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="p-8">Transaction ID</th>
                                    <th className="p-8">Date & Time</th>
                                    <th className="p-8">Method</th>
                                    <th className="p-8">Items</th>
                                    <th className="p-8 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="p-8 font-mono text-xs font-bold text-muted-foreground">#{sale.id.slice(0, 8)}</td>
                                        <td className="p-8">
                                            <div className="font-black text-sm">{new Date(sale.created_at).toLocaleDateString()}</div>
                                            <div className="text-xs text-muted-foreground font-medium">{new Date(sale.created_at).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2">
                                                {sale.payment_method === 'cash' ? <ShoppingBag size={14} className="text-green-600" /> : <CreditCard size={14} className="text-blue-600" />}
                                                <span className={`font-black uppercase text-[10px] ${sale.payment_method === 'cash' ? 'text-green-600' : 'text-blue-600'}`}>
                                                    {sale.payment_method}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className="font-bold bg-muted px-3 py-1 rounded-full text-xs">
                                                {sale.sale_items?.length || 0} Products
                                            </span>
                                        </td>
                                        <td className="p-8 text-right font-black text-xl text-primary">{currency}{sale.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {sales.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <ShoppingBag size={64} strokeWidth={1} />
                                                <p className="text-xl font-black uppercase tracking-tighter">No transactions recorded for this period.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
