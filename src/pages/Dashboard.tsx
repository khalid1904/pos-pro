import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useUIStore } from '../store/uiStore';
import { db } from '../db/db';
import {
    IndianRupee, // Note: using IndianRupee instead of generic DollarSign if INR is primary, or we can use generic
    TrendingUp,
    Package,
    ShoppingCart,
    ArrowRight,
    Plus,
    BarChart3
} from 'lucide-react';

export default function Dashboard() {
    const { currency } = useUIStore();
    const navigate = useNavigate();

    const sales = useLiveQuery(() => db.sales.toArray()) || [];
    const products = useLiveQuery(() => db.products.toArray()) || [];

    const stats = useMemo(() => {
        const now = new Date();
        const todayStr = now.toDateString();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let todayRevenue = 0;
        let monthlyRevenue = 0;
        let totalRevenue = 0;

        sales.forEach(s => {
            const d = new Date(s.timestamp);
            totalRevenue += s.total;

            if (d.toDateString() === todayStr) {
                todayRevenue += s.total;
            }

            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                monthlyRevenue += s.total;
            }
        });

        return {
            todayRevenue,
            monthlyRevenue,
            totalRevenue,
            totalSalesCount: sales.length,
            totalProducts: products.length
        };
    }, [sales, products]);

    const recentSales = useMemo(() => {
        return [...sales]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
    }, [sales]);

    return (
        <div className="p-4 sm:p-6 h-full overflow-y-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-1">Overview</h1>
                <p className="text-muted-foreground font-medium">Welcome back to your store dashboard.</p>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Today's Revenue (Primary Accent) */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                        <TrendingUp size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-green-50 font-medium mb-1">Today's Revenue</div>
                        <div className="text-4xl font-black">{currency}{stats.todayRevenue.toFixed(2)}</div>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-1">This Month</div>
                        <div className="text-2xl font-bold text-foreground">{currency}{stats.monthlyRevenue.toFixed(2)}</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <BarChart3 size={24} />
                    </div>
                </div>

                {/* Total Products */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-1">Total Products</div>
                        <div className="text-2xl font-bold text-foreground">{stats.totalProducts}</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Package size={24} />
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Sales Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
                    
                    <button 
                        onClick={() => navigate('/pos')}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-2xl shadow-sm flex items-center justify-between group transition-all hover:-translate-y-0.5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <ShoppingCart size={24} />
                            </div>
                            <span className="font-bold text-lg">Start New Sale</span>
                        </div>
                        <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                    </button>

                    <button 
                        onClick={() => navigate('/products')}
                        className="w-full bg-card hover:bg-muted border border-border text-foreground p-4 rounded-2xl shadow-sm flex items-center justify-between group transition-all hover:-translate-y-0.5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary p-2 rounded-xl">
                                <Plus size={24} />
                            </div>
                            <span className="font-bold text-lg">Add New Product</span>
                        </div>
                        <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                    </button>
                    
                    <button 
                        onClick={() => navigate('/reports')}
                        className="w-full bg-card hover:bg-muted border border-border text-foreground p-4 rounded-2xl shadow-sm flex items-center justify-between group transition-all hover:-translate-y-0.5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 text-blue-500 p-2 rounded-xl">
                                <BarChart3 size={24} />
                            </div>
                            <span className="font-bold text-lg">View Full Reports</span>
                        </div>
                        <ArrowRight size={20} className="text-muted-foreground group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1" />
                    </button>
                </div>

                {/* Recent Sales List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
                        <button onClick={() => navigate('/reports')} className="text-sm font-bold text-primary hover:underline">
                            View All
                        </button>
                    </div>

                    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                        {recentSales.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                                <ShoppingCart size={48} className="mb-4 opacity-20" />
                                <p className="font-medium text-lg">No sales yet today</p>
                                <p className="text-sm mt-1">Make your first sale to see it here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {recentSales.map(sale => (
                                    <div key={sale.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                <IndianRupee size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground">
                                                    {sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}
                                                </div>
                                                <div className="text-xs text-muted-foreground font-medium">
                                                    {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {' • '}
                                                    <span className="uppercase">{sale.paymentMethod}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-lg text-foreground">
                                                {currency}{sale.total.toFixed(2)}
                                            </div>
                                            {sale.discount > 0 && (
                                                <div className="text-xs text-green-600 font-medium">
                                                    -{currency}{sale.discount.toFixed(2)} discount
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
            </div>
        </div>
    );
}
