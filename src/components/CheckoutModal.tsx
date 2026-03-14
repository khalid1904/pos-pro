import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Printer, Banknote, Smartphone, QrCode, Check, AlertCircle, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type PaymentMethod = 'cash' | 'upi';

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const { t } = useTranslation();
    const { currency, merchantUpiId } = useUIStore();
    const { selectedStoreId } = useAuthStore();
    const { items, getFinalTotal, discount, tax, clearCart } = useCartStore();
    
    const [cashReceived, setCashReceived] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [upiConfirmed, setUpiConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const total = getFinalTotal();
    const change = typeof cashReceived === 'number' ? cashReceived - total : 0;
    const isEnough = typeof cashReceived === 'number' && cashReceived >= total;
    const isINR = currency === '₹';

    const upiUri = merchantUpiId
        ? `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&am=${total.toFixed(2)}&cu=INR`
        : '';

    const canCheckout = paymentMethod === 'cash'
        ? (isEnough && typeof cashReceived === 'number')
        : upiConfirmed;

    const handleCheckout = async () => {
        if (!canCheckout || !selectedStoreId) return;
        
        setIsLoading(true);
        try {
            // 1. Create Sale
            const { data: saleData, error: saleError } = await supabase
                .from('sales')
                .insert({
                    store_id: selectedStoreId,
                    total: total,
                    tax: (items.reduce((acc, i) => acc + i.subtotal, 0) * (tax / 100)),
                    discount: discount,
                    payment_method: paymentMethod,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (saleError) throw saleError;

            // 2. Create Sale Items
            const saleItems = items.map(item => ({
                sale_id: saleData.id,
                product_id: item.productId,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                cost: item.cost,
                subtotal: item.subtotal
            }));

            const { error: itemsError } = await supabase
                .from('sale_items')
                .insert(saleItems);

            if (itemsError) throw itemsError;

            // 3. Update Inventory (Sequential for now, could be improved with RPC)
            for (const item of items) {
                // Fetch current stock first (to be safe, though RLS/Triggers could handle this better)
                const { data: pData } = await supabase
                    .from('products')
                    .select('stock')
                    .eq('id', item.productId)
                    .single();
                
                if (pData) {
                    await supabase
                        .from('products')
                        .update({ stock: Math.max(0, pData.stock - item.quantity) })
                        .eq('id', item.productId);
                }
            }

            clearCart();
            if (paymentMethod === 'cash') {
                window.print();
            }
            onClose();
            // Reset state
            setCashReceived('');
            setPaymentMethod('cash');
            setUpiConfirmed(false);
        } catch (e) {
            console.error(e);
            alert('Checkout failed! Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setCashReceived('');
        setPaymentMethod('cash');
        setUpiConfirmed(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-border scale-in-center">
                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-border bg-muted/30">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">{t('checkout.title')}</h2>
                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Finalize Transaction</p>
                    </div>
                    <button onClick={handleClose} className="p-3 bg-background border border-border rounded-2xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground">
                        <X size={28} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Total Display */}
                    <div className="bg-primary/5 p-8 rounded-[2rem] text-center border-2 border-primary/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <div className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{t('checkout.totalAmount')}</div>
                            <div className="text-6xl font-black text-primary tracking-tighter">{currency}{total.toFixed(2)}</div>
                        </div>
                    </div>

                    {/* Payment Method Toggle */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => { setPaymentMethod('cash'); setUpiConfirmed(false); }}
                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] font-black transition-all border-4 ${
                                paymentMethod === 'cash'
                                    ? 'border-primary bg-primary/10 text-primary shadow-xl shadow-primary/10 scale-105'
                                    : 'border-muted bg-muted/30 text-muted-foreground hover:border-border'
                            }`}
                        >
                            <Banknote size={32} strokeWidth={2.5} />
                            CASH
                        </button>
                        {isINR && (
                            <button
                                onClick={() => setPaymentMethod('upi')}
                                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] font-black transition-all border-4 ${
                                    paymentMethod === 'upi'
                                        ? 'border-primary bg-primary/10 text-primary shadow-xl shadow-primary/10 scale-105'
                                        : 'border-muted bg-muted/30 text-muted-foreground hover:border-border'
                                }`}
                            >
                                <Smartphone size={32} strokeWidth={2.5} />
                                UPI
                            </button>
                        )}
                    </div>

                    {/* Cash Payment Flow */}
                    {paymentMethod === 'cash' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2">{t('checkout.cashReceived')}</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground">{currency}</span>
                                    <input
                                        type="number"
                                        min={total}
                                        step="0.01"
                                        autoFocus
                                        className="w-full text-4xl p-6 pl-12 text-right rounded-3xl border-4 border-muted bg-muted/20 focus:outline-none focus:border-primary/30 focus:bg-background transition-all font-black tracking-tighter"
                                        value={cashReceived}
                                        onChange={e => setCashReceived(e.target.value ? Number(e.target.value) : '')}
                                    />
                                </div>
                            </div>

                            <div className={`p-8 rounded-[2rem] text-center transition-all ${isEnough ? 'bg-green-500/10 border-4 border-green-500/20 text-green-600' : 'bg-muted/30 border-4 border-transparent text-muted-foreground'}`}>
                                <div className="text-xs font-black uppercase tracking-widest mb-1">{t('checkout.change')}</div>
                                <div className="text-5xl font-black tracking-tighter">{currency}{Math.max(0, change).toFixed(2)}</div>
                            </div>
                        </div>
                    )}

                    {/* UPI Payment Flow */}
                    {paymentMethod === 'upi' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-300">
                            {merchantUpiId ? (
                                <div className="space-y-6">
                                    <div className="bg-white p-8 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-2xl shadow-primary/5 border border-border/50">
                                        <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Scan to Pay</div>
                                        <div className="text-4xl font-black text-gray-900 tracking-tighter">{currency}{total.toFixed(2)}</div>
                                        <div className="p-4 bg-white rounded-3xl border-4 border-muted/50">
                                            <QRCodeSVG
                                                value={upiUri}
                                                size={220}
                                                level="H"
                                                includeMargin={false}
                                            />
                                        </div>
                                        <div className="text-center font-bold">
                                            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Merchant UPI</div>
                                            <div className="text-gray-700">{merchantUpiId}</div>
                                        </div>
                                    </div>

                                    {!upiConfirmed ? (
                                        <button
                                            onClick={() => setUpiConfirmed(true)}
                                            className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-xl bg-green-500 hover:bg-green-600 text-white transition-all shadow-xl shadow-green-200"
                                        >
                                            <Check size={24} strokeWidth={3} />
                                            CONFIRM PAYMENT
                                        </button>
                                    ) : (
                                        <div className="bg-green-500 text-white p-5 rounded-[2rem] text-center font-black flex items-center justify-center gap-3 animate-bounce shadow-xl shadow-green-200">
                                            <Check size={24} strokeWidth={3} />
                                            PAID VERIFIED
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-destructive/5 border-4 border-destructive/10 p-8 rounded-[2rem] flex flex-col items-center text-center gap-4">
                                    <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
                                        <AlertCircle size={32} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="font-black text-xl text-destructive uppercase tracking-tight">UPI ID Missing</p>
                                        <p className="text-sm font-bold text-muted-foreground mt-2 leading-relaxed">
                                            Configuration required. Please visit settings to enable UPI payments for this store.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-8 border-t border-border bg-muted/30 flex gap-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 py-5 rounded-[2rem] border-4 border-muted bg-background font-black text-lg transition-all hover:bg-muted active:scale-95 disabled:opacity-50"
                    >
                        {t('checkout.cancel')}
                    </button>
                    <button
                        onClick={handleCheckout}
                        disabled={!canCheckout || isLoading}
                        className="flex-[1.5] flex justify-center items-center gap-3 py-5 rounded-[2rem] bg-primary text-primary-foreground font-black text-xl shadow-2xl shadow-primary/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            paymentMethod === 'cash' ? <Printer size={24} /> : <QrCode size={24} />
                        )}
                        {isLoading ? 'PROCESSING...' : t('checkout.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
