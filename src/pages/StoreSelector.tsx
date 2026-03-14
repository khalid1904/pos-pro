import { useAuthStore } from '../store/authStore';
import { Store, Plus, ArrowRight, LogOut } from 'lucide-react';
import { useState } from 'react';
import Onboarding from '../components/Onboarding';

export default function StoreSelector() {
    const { stores, setSelectedStoreId, signOut, user } = useAuthStore();
    const [showCreate, setShowCreate] = useState(false);

    if (showCreate) {
        return <Onboarding onCancel={() => setShowCreate(false)} />;
    }

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-foreground">Select Store</h1>
                        <p className="text-muted-foreground font-medium">Welcome back, {user?.email}</p>
                    </div>
                    <button 
                        onClick={() => signOut()}
                        className="p-3 bg-card border border-border rounded-2xl hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all text-muted-foreground"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    {stores.map((store) => (
                        <button
                            key={store.id}
                            onClick={() => setSelectedStoreId(store.id)}
                            className="bg-card p-6 rounded-3xl border-2 border-transparent hover:border-primary/50 shadow-sm hover:shadow-md transition-all text-left flex flex-col group"
                        >
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Store size={24} />
                            </div>
                            <h2 className="text-xl font-bold mb-1">{store.name}</h2>
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-4">{store.address || 'No address set'}</p>
                            
                            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-primary font-bold text-sm">
                                Enter Store
                                <ArrowRight size={16} className="-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                            </div>
                        </button>
                    ))}

                    <button
                        onClick={() => setShowCreate(true)}
                        className="bg-muted/50 p-6 rounded-3xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-card transition-all text-left flex flex-col items-center justify-center min-h-[180px] group"
                    >
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Plus size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-muted-foreground group-hover:text-foreground">Add New Store</h2>
                    </button>
                </div>
            </div>
        </div>
    );
}
