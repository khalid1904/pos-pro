import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
    session: Session | null;
    user: User | null;
    selectedStoreId: string | null;
    isLoading: boolean;
    setSession: (session: Session | null) => void;
    setSelectedStoreId: (id: string | null) => void;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    selectedStoreId: localStorage.getItem('last_store_id'),
    isLoading: true,

    setSession: (session) => {
        set({ 
            session, 
            user: session?.user ?? null, 
            isLoading: false 
        });
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
