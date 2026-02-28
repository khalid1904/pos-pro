import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Calculator,
    Package,
    BarChart3,
    Settings,
    Menu,
    X
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export default function Sidebar() {
    const { t } = useTranslation();
    const { isSidebarOpen, toggleSidebar } = useUIStore();

    const navItems = [
        { to: '/', icon: Calculator, label: t('pos.title') },
        { to: '/products', icon: Package, label: t('products.title') },
        { to: '/reports', icon: BarChart3, label: t('reports.title') },
        { to: '/settings', icon: Settings, label: t('settings.title') },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md shadow-md"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-6 border-b border-border">
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <Package className="text-primary" />
                        POS Pro
                    </h1>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                ${isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
              `}
                            onClick={() => isSidebarOpen && toggleSidebar()}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
}
