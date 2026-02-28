import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Printer } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { db } from '../db/db';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const { t } = useTranslation();
    const { currency } = useUIStore();
    const { items, getFinalTotal, discount, tax, clearCart } = useCartStore();
    const [cashReceived, setCashReceived] = useState<number | ''>('');

    if (!isOpen) return null;

    const total = getFinalTotal();
    const change = typeof cashReceived === 'number' ? cashReceived - total : 0;
    const isEnough = typeof cashReceived === 'number' && cashReceived >= total;

    const handleCheckout = async () => {
        if (!isEnough) return;
        try {
            // Save sale to DB
            await db.sales.add({
                items,
                total,
                discount,
                tax,
                paymentMethod: 'cash',
                timestamp: new Date().toISOString()
            });

            // Update inventory
            await db.transaction('rw', db.products, async () => {
                for (const item of items) {
                    const p = await db.products.get(item.productId);
                    if (p) {
                        await db.products.update(p.id!, { stock: Math.max(0, p.stock - item.quantity) });
                    }
                }
            });

            clearCart();
            window.print(); // Simple browser print triggered
            onClose();
        } catch (e) {
            console.error(e);
            alert('Checkout failed!');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card w-full max-w-md rounded-lg shadow-lg flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-xl font-bold">{t('checkout.title')}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground mb-1">{t('checkout.totalAmount')}</div>
                        <div className="text-4xl font-bold text-primary">{currency}{total.toFixed(2)}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">{t('checkout.cashReceived')}</label>
                        <input
                            type="number"
                            min={total}
                            step="0.01"
                            autoFocus
                            className="w-full text-2xl p-3 text-center rounded-md border border-input bg-background"
                            value={cashReceived}
                            onChange={e => setCashReceived(e.target.value ? Number(e.target.value) : '')}
                        />
                    </div>

                    <div className={`p-4 rounded-lg text-center ${isEnough ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-muted/30'}`}>
                        <div className="text-sm mb-1">{t('checkout.change')}</div>
                        <div className="text-3xl font-bold">{currency}{Math.max(0, change).toFixed(2)}</div>
                    </div>
                </div>

                <div className="p-4 border-t border-border flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-lg border border-input font-bold"
                    >
                        {t('checkout.cancel')}
                    </button>
                    <button
                        onClick={handleCheckout}
                        disabled={!isEnough || typeof cashReceived !== 'number'}
                        className="flex-1 flex justify-center items-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50"
                    >
                        <Printer size={20} />
                        {t('checkout.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
