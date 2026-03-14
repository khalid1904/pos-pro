import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Home,
    Calculator,
    Package,
    BarChart3,
    Settings,
} from 'lucide-react';

export default function BottomNav() {
    const { t } = useTranslation();

    const navItems = [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/pos', icon: Calculator, label: t('pos.title') },
        { to: '/products', icon: Package, label: t('products.title') },
        { to: '/reports', icon: BarChart3, label: t('reports.title') },
        { to: '/settings', icon: Settings, label: t('settings.title') },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[60px]
                            ${isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
            {/* Safe area spacer for iOS */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
    );
}
