import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
    session: Session | null;
    user: User | null;
    selectedStoreId: string | null;
    stores: any[];
    isLoading: boolean;
    setSession: (session: Session | null) => Promise<void>;
    fetchStores: () => Promise<void>;
    setSelectedStoreId: (id: string | null) => void;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    selectedStoreId: localStorage.getItem('last_store_id'),
    stores: [],
    isLoading: true,

    setSession: async (session) => {
        set({ session, user: session?.user ?? null });
        if (session) {
            await useAuthStore.getState().fetchStores();
        } else {
            set({ isLoading: false });
        }
    },

    fetchStores: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('owner_id', user.id);

        if (!error && data) {
            set({ stores: data, isLoading: false });
            
            // Auto-select last store if it still exists
            const lastId = localStorage.getItem('last_store_id');
            if (lastId && data.find(s => s.id === lastId)) {
                set({ selectedStoreId: lastId });
            } else if (data.length === 1) {
                // Auto-select if only one store exists
                const onlyStoreId = data[0].id;
                localStorage.setItem('last_store_id', onlyStoreId);
                set({ selectedStoreId: onlyStoreId });
            }
        } else {
            set({ isLoading: false });
        }
    },

    setSelectedStoreId: (id) => {
        if (id) {
            localStorage.setItem('last_store_id', id);
        } else {
            localStorage.removeItem('last_store_id');
        }
        set({ selectedStoreId: id });
    },

    signOut: async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('last_store_id');
        set({ session: null, user: null, selectedStoreId: null });
    }
}));
