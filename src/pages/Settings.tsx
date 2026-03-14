import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Globe, DollarSign, Store, MapPin, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function Settings() {
    useTranslation();
    const { selectedStoreId, stores, fetchStores } = useAuthStore();
    const { 
        theme, setTheme, 
        language, setLanguage,
        setCurrency,
        setMerchantUpiId
    } = useUIStore();

    const [isLoading, setIsLoading] = useState(false);
    const [storeData, setStoreData] = useState({
        name: '',
        address: '',
        currency: '₹',
        tax_rate: 0,
        merchant_upi_id: ''
    });

    const activeStore = stores.find(s => s.id === selectedStoreId);

    useEffect(() => {
        if (activeStore) {
            setStoreData({
                name: activeStore.name || '',
                address: activeStore.address || '',
                currency: activeStore.currency || '₹',
                tax_rate: activeStore.tax_rate || 0,
                merchant_upi_id: activeStore.merchant_upi_id || ''
            });
            
            // Sync UI Store with active store settings
            setCurrency(activeStore.currency || '₹');
            setMerchantUpiId(activeStore.merchant_upi_id || '');
        }
    }, [activeStore]);

    const handleSaveStore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStoreId) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('stores')
                .update({
                    name: storeData.name,
                    address: storeData.address,
                    currency: storeData.currency,
                    tax_rate: storeData.tax_rate
                })
                .eq('id', selectedStoreId);

            if (error) throw error;
            
            await fetchStores(); // Refresh local list
            setCurrency(storeData.currency);
            setMerchantUpiId(storeData.merchant_upi_id);
            
            alert('Settings saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-12 pb-24">
            <div>
                <h1 className="text-5xl font-black tracking-tighter mb-2 italic">Settings</h1>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Configure your POS & Cloud Store</p>
            </div>

            <div className="grid gap-8">
                {/* Store Profile Section */}
                <section className="bg-card rounded-[3rem] border-4 border-muted/30 shadow-2xl p-8 space-y-8 overflow-hidden relative group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-primary/10 text-primary rounded-3xl">
                            <Store size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Store Identity</h2>
                            <p className="text-sm font-bold text-muted-foreground">Your public profile & billing info</p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveStore} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2">Shop Name</label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                    <input 
                                        type="text" 
                                        value={storeData.name}
                                        onChange={e => setStoreData({...storeData, name: e.target.value})}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none font-bold transition-all" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2">Currency Symbol</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                    <select 
                                        value={storeData.currency}
                                        onChange={e => setStoreData({...storeData, currency: e.target.value})}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none font-bold transition-all appearance-none"
                                    >
                                        <option value="₹">₹ INR</option>
                                        <option value="$">$ USD</option>
                                        <option value="€">€ EUR</option>
                                        <option value="£">£ GBP</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2">Store Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 text-muted-foreground" size={20} />
                                <textarea 
                                    rows={3}
                                    value={storeData.address}
                                    onChange={e => setStoreData({...storeData, address: e.target.value})}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none font-bold transition-all resize-none" 
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2">Merchant UPI ID (For QR Payment)</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                    <input 
                                        type="text" 
                                        value={storeData.merchant_upi_id}
                                        onChange={e => setStoreData({...storeData, merchant_upi_id: e.target.value})}
                                        placeholder="yourname@upi"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none font-bold transition-all" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2">Tax Rate (%)</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                    <input 
                                        type="number" 
                                        value={storeData.tax_rate}
                                        onChange={e => setStoreData({...storeData, tax_rate: Number(e.target.value)})}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none font-bold transition-all" 
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={28} /> : <Save size={28} strokeWidth={2.5} />}
                            {isLoading ? 'Saving...' : 'Sync Settings'}
                        </button>
                    </form>
                </section>

                {/* Preferences Section */}
                <section className="bg-card rounded-[3rem] border-4 border-muted/30 p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-muted text-foreground rounded-3xl">
                            <Globe size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">App Preferences</h2>
                            <p className="text-sm font-bold text-muted-foreground">Personalize your dashboard experience</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-6 rounded-[2rem] bg-muted/30 border-2 border-transparent hover:border-border transition-all">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Color Mode</p>
                            <div className="flex gap-2">
                                <button onClick={() => setTheme('light')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>SUN</button>
                                <button onClick={() => setTheme('dark')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>MOON</button>
                            </div>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-muted/30 border-2 border-transparent hover:border-border transition-all">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Language</p>
                            <div className="flex gap-2">
                                <button onClick={() => setLanguage('en')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${language === 'en' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>ENGLISH</button>
                                <button onClick={() => setLanguage('ta')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${language === 'ta' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>TAMIL</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

