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
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-t border-border shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-around h-20 px-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center gap-1.5 px-2 py-2 rounded-2xl transition-all min-w-[64px]
                            ${isActive
                                ? 'text-primary scale-110'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary/10 shadow-lg shadow-primary/10' : ''}`}>
                                    <item.icon size={24} strokeWidth={isActive ? 3 : 2} />
                                </div>
                                <span className={`text-[10px] uppercase tracking-widest leading-none ${isActive ? 'font-black' : 'font-bold'}`}>
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
