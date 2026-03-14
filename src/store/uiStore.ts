import { create } from 'zustand';

interface UIState {
    isSidebarOpen: boolean;
    theme: 'light' | 'dark';
    currency: string;
    merchantUpiId: string;
    isOnboarded: boolean;
    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
    setCurrency: (currency: string) => void;
    setMerchantUpiId: (id: string) => void;
    setIsOnboarded: (status: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarOpen: false,
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    currency: localStorage.getItem('currency') || '₹',
    merchantUpiId: localStorage.getItem('merchantUpiId') || '',
    isOnboarded: localStorage.getItem('isOnboarded') === 'true',

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    setTheme: (theme) => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        set({ theme });
    },

    setCurrency: (currency) => {
        localStorage.setItem('currency', currency);
        set({ currency });
    },

    setMerchantUpiId: (id) => {
        localStorage.setItem('merchantUpiId', id);
        set({ merchantUpiId: id });
    },

    setIsOnboarded: (status) => {
        localStorage.setItem('isOnboarded', status ? 'true' : 'false');
        set({ isOnboarded: status });
    }
}));
