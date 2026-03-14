import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Printer, Banknote, Smartphone, QrCode, Check, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { db } from '../db/db';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type PaymentMethod = 'cash' | 'upi';

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const { t } = useTranslation();
    const { currency, merchantUpiId } = useUIStore();
    const { items, getFinalTotal, discount, tax, clearCart } = useCartStore();
    const [cashReceived, setCashReceived] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [upiConfirmed, setUpiConfirmed] = useState(false);

    if (!isOpen) return null;

    const total = getFinalTotal();
    const change = typeof cashReceived === 'number' ? cashReceived - total : 0;
    const isEnough = typeof cashReceived === 'number' && cashReceived >= total;
    const isINR = currency === '₹';

    // Build UPI deep link URI
    const upiUri = merchantUpiId
        ? `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&am=${total.toFixed(2)}&cu=INR`
        : '';

    const canCheckout = paymentMethod === 'cash'
        ? (isEnough && typeof cashReceived === 'number')
        : upiConfirmed;

    const handleCheckout = async () => {
        if (!canCheckout) return;
        try {
            // Save sale to DB
            await db.sales.add({
                items,
                total,
                discount,
                tax,
                paymentMethod,
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
            alert('Checkout failed!');
        }
    };

    const handleClose = () => {
        setCashReceived('');
        setPaymentMethod('cash');
        setUpiConfirmed(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card w-full max-w-md rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-xl font-bold">{t('checkout.title')}</h2>
                    <button onClick={handleClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Total Display */}
                    <div className="bg-primary/10 p-4 rounded-xl text-center">
                        <div className="text-sm text-muted-foreground mb-1">{t('checkout.totalAmount')}</div>
                        <div className="text-4xl font-black text-primary">{currency}{total.toFixed(2)}</div>
                    </div>

                    {/* Payment Method Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setPaymentMethod('cash'); setUpiConfirmed(false); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-base transition-all border-2 ${
                                paymentMethod === 'cash'
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-background text-muted-foreground hover:border-muted-foreground'
                            }`}
                        >
                            <Banknote size={20} />
                            Cash
                        </button>
                        {isINR && (
                            <button
                                onClick={() => setPaymentMethod('upi')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-base transition-all border-2 ${
                                    paymentMethod === 'upi'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border bg-background text-muted-foreground hover:border-muted-foreground'
                                }`}
                            >
                                <Smartphone size={20} />
                                UPI
                            </button>
                        )}
                    </div>

                    {/* Cash Payment Flow */}
                    {paymentMethod === 'cash' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-2">{t('checkout.cashReceived')}</label>
                                <input
                                    type="number"
                                    min={total}
                                    step="0.01"
                                    autoFocus
                                    className="w-full text-2xl p-3 text-center rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={cashReceived}
                                    onChange={e => setCashReceived(e.target.value ? Number(e.target.value) : '')}
                                />
                            </div>

                            <div className={`p-4 rounded-xl text-center transition-colors ${isEnough ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-muted/30'}`}>
                                <div className="text-sm mb-1">{t('checkout.change')}</div>
                                <div className="text-3xl font-bold">{currency}{Math.max(0, change).toFixed(2)}</div>
                            </div>
                        </>
                    )}

                    {/* UPI Payment Flow */}
                    {paymentMethod === 'upi' && (
                        <>
                            {merchantUpiId ? (
                                <div className="space-y-4">
                                    {/* QR Code */}
                                    <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-4 shadow-inner">
                                        <div className="text-sm text-gray-500 font-medium">Scan to Pay</div>
                                        <div className="text-3xl font-black text-gray-900">{currency}{total.toFixed(2)}</div>
                                        <div className="p-3 bg-white rounded-xl border border-gray-200">
                                            <QRCodeSVG
                                                value={upiUri}
                                                size={200}
                                                level="H"
                                                includeMargin={false}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-400">Merchant UPI</div>
                                            <div className="font-semibold text-gray-700">{merchantUpiId}</div>
                                        </div>
                                    </div>

                                    {/* Mark as Paid Toggle */}
                                    {!upiConfirmed ? (
                                        <button
                                            onClick={() => setUpiConfirmed(true)}
                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white transition-colors"
                                        >
                                            <Check size={20} />
                                            Mark as Paid
                                        </button>
                                    ) : (
                                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                                            <Check size={20} />
                                            Payment Confirmed
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* No UPI ID configured */
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4 rounded-xl flex items-start gap-3">
                                    <AlertCircle size={24} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-amber-800 dark:text-amber-300">UPI ID Not Set</p>
                                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                            Please go to <strong>Settings</strong> and enter your Merchant UPI ID to enable UPI payments.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-border flex gap-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 py-3 rounded-xl border border-input font-bold hover:bg-muted transition-colors"
                    >
                        {t('checkout.cancel')}
                    </button>
                    <button
                        onClick={handleCheckout}
                        disabled={!canCheckout}
                        className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50 transition-all hover:bg-primary/90 active:scale-95"
                    >
                        {paymentMethod === 'cash' ? <Printer size={20} /> : <QrCode size={20} />}
                        {t('checkout.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
