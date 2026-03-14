import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Home,
    Calculator,
    Package,
    BarChart3,
    Settings,
} from 'lucide-react';

export default function Sidebar() {
    const { t } = useTranslation();

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
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <img src="/pwa-192x192.png" alt="POS Pro" className="w-8 h-8 rounded-lg shadow-sm" />
                    POS Pro
                </h1>
            </div>

            <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                            ${isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                        `}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
