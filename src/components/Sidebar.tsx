import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Home,
    Calculator,
    Package,
    BarChart3,
    Settings,
    Store,
    ChevronLeft,
    LogOut
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
    const { t } = useTranslation();
    const { stores, selectedStoreId, setSelectedStoreId, signOut } = useAuthStore();

    const activeStore = stores.find(s => s.id === selectedStoreId);

    const navItems = [
        { to: '/', icon: Home, label: 'Dashboard' },
        { to: '/pos', icon: Calculator, label: t('pos.title') },
        { to: '/products', icon: Package, label: t('products.title') },
        { to: '/reports', icon: BarChart3, label: t('reports.title') },
        { to: '/settings', icon: Settings, label: t('settings.title') },
    ];

    return (
        <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col flex-shrink-0">
            <div className="p-6 border-b border-border">
                <h1 className="text-2xl font-black text-primary flex items-center gap-2 mb-6">
                    <img src="/pwa-192x192.png" alt="POS Pro" className="w-8 h-8 rounded-xl shadow-lg shadow-primary/20" />
                    POS Pro
                </h1>

                {activeStore && (
                    <div className="bg-muted/50 p-4 rounded-3xl border border-border">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <Store size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Active Store</p>
                                <p className="font-bold truncate text-sm">{activeStore.name}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedStoreId(null)}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-background border border-border hover:bg-muted text-xs font-black transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <ChevronLeft size={16} />
                            SWITCH STORE
                        </button>
                    </div>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all
                            ${isActive
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                        `}
                    >
                        <item.icon size={20} strokeWidth={2.5} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-black text-sm text-destructive hover:bg-destructive/10 transition-all uppercase tracking-wider"
                >
                    <LogOut size={20} strokeWidth={2.5} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
