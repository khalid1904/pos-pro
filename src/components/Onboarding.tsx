import { useState } from 'react';
import { Store, Globe, Smartphone, ArrowRight, Check, X } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface OnboardingProps {
    onCancel?: () => void;
}

export default function Onboarding({ onCancel }: OnboardingProps) {
    const { setTheme, setCurrency, setMerchantUpiId } = useUIStore();
    const { user, setSelectedStoreId, fetchStores } = useAuthStore();

    const [step, setStep] = useState(1);
    
    // Step 1: Store Info
    const [storeName, setStoreName] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    
    // Step 2: Preferences
    const [currency, setLocalCurrency] = useState('₹');
    const [theme, setLocalTheme] = useState<'light'|'dark'>('light');
    
    // Step 3: Payment
    const [upiId, setUpiId] = useState('');

    const handleComplete = async () => {
        if (!user) return;
        
        try {
            // Save to Supabase
            const { data, error } = await supabase
                .from('stores')
                .insert({
                    owner_id: user.id,
                    name: storeName,
                    address: storeAddress,
                    currency: currency,
                    tax_rate: 0 // Default 
                })
                .select()
                .single();

            if (error) throw error;

            // Update Global Store Preferences (for UI theme/etc)
            setTheme(theme);
            setCurrency(currency);
            if (upiId) {
                setMerchantUpiId(upiId);
            }
            
            // Set the active store id
            setSelectedStoreId(data.id);
            await fetchStores();
        } catch (e) {
            console.error('Failed to create store:', e);
            alert('Failed to connect to the cloud. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
                
                {/* Header */}
                <div className="bg-primary p-8 text-primary-foreground text-center relative">
                    {onCancel && (
                        <button 
                            onClick={onCancel}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner overflow-hidden p-1">
                        <img src="/pwa-192x192.png" alt="POS Pro" className="w-full h-full object-contain drop-shadow-md rounded-xl" />
                    </div>
                    <h1 className="text-3xl font-black mb-2">Create New Store</h1>
                    <p className="text-primary-foreground/80 font-medium">Launch your next business location in seconds.</p>
                </div>

                {/* Progress Bar */}
                <div className="bg-muted h-1.5 w-full flex">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
                </div>

                <div className="p-8">
                    {/* Step 1: Store Identity */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-3 text-xl font-bold mb-6">
                                <Store className="text-primary" />
                                <h2>Store Information</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-foreground">What's your store's name?</label>
                                    <input 
                                        type="text" 
                                        value={storeName}
                                        onChange={e => setStoreName(e.target.value)}
                                        className="w-full p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium text-lg"
                                        placeholder="e.g. Royal Mart"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-foreground">Store Address (Optional)</label>
                                    <textarea 
                                        value={storeAddress}
                                        onChange={e => setStoreAddress(e.target.value)}
                                        className="w-full p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium resize-none"
                                        placeholder="123 Main Street..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <button 
                                disabled={!storeName.trim()}
                                onClick={() => setStep(2)}
                                className="w-full bg-primary text-primary-foreground p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 mt-8"
                            >
                                Continue <ArrowRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Localization */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-3 text-xl font-bold mb-6">
                                <Globe className="text-primary" />
                                <h2>Preferences</h2>
                            </div>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-foreground">Currency</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['₹', '$', '€', '£'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setLocalCurrency(c)}
                                                className={`p-4 rounded-xl border-2 font-bold text-lg transition-all ${
                                                    currency === c 
                                                        ? 'border-primary bg-primary/10 text-primary' 
                                                        : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                                                }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-foreground">Theme</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setLocalTheme('light')}
                                            className={`p-4 rounded-xl border-2 font-bold transition-all ${
                                                theme === 'light' 
                                                    ? 'border-primary bg-primary/10 text-primary' 
                                                    : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                                            }`}
                                        >
                                            Light Mode
                                        </button>
                                        <button
                                            onClick={() => setLocalTheme('dark')}
                                            className={`p-4 rounded-xl border-2 font-bold transition-all ${
                                                theme === 'dark' 
                                                    ? 'border-primary bg-primary/10 text-primary' 
                                                    : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                                            }`}
                                        >
                                            Dark Mode
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-muted text-foreground p-4 rounded-xl font-bold hover:bg-muted/80 transition-colors"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={() => setStep(3)}
                                    className="flex-[2] bg-primary text-primary-foreground p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                                >
                                    Continue <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payments */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-3 text-xl font-bold mb-6">
                                <Smartphone className="text-primary" />
                                <h2>Digital Payments</h2>
                            </div>
                            
                            <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl mb-6">
                                <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                                    POS Pro can automatically generate UPI QR codes for your customers to scan and pay the exact bill amount.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-foreground">Merchant UPI ID (Optional)</label>
                                <input 
                                    type="text" 
                                    value={upiId}
                                    onChange={e => setUpiId(e.target.value)}
                                    className="w-full p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium text-lg"
                                    placeholder="e.g. yourshop@upi"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    You can always add or change this later in Settings.
                                </p>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button 
                                    onClick={() => setStep(2)}
                                    className="flex-1 bg-muted text-foreground p-4 rounded-xl font-bold hover:bg-muted/80 transition-colors"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handleComplete}
                                    className="flex-[2] bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                                >
                                    Complete Setup <Check size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
