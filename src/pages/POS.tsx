import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Plus, Minus, Trash2 } from 'lucide-react';
import { db } from '../db/db';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import CheckoutModal from '../components/CheckoutModal';
import Receipt from '../components/Receipt';

export default function POS() {
    const { t } = useTranslation();
    const { currency } = useUIStore();
    const products = useLiveQuery(() => db.products.toArray()) || [];
    const categories = useLiveQuery(() => db.categories.toArray()) || [];

    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const {
        items, addItem, removeItem, updateQuantity, clearCart,
        getRawTotal, getFinalTotal, discount, tax
    } = useCartStore();

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search));
            const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, search, activeCategory]);

    return (
        <div className="p-4 h-full flex flex-col md:flex-row gap-4">
            {/* Left side: Products Grid */}
            <div className="flex-1 flex flex-col bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                {/* Top bar: Search & Categories */}
                <div className="p-4 border-b border-border space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                            type="text"
                            placeholder={t('pos.searchPlaceholder')}
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-input bg-background text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors ${activeCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                        >
                            All
                        </button>
                        {categories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setActiveCategory(c.id!)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors ${activeCategory === c.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addItem(product)}
                                disabled={product.stock <= 0}
                                className="flex flex-col text-left bg-background border border-border rounded-xl p-3 hover:border-primary hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative"
                            >
                                <div className="aspect-square w-full bg-muted/30 rounded-lg mb-3 flex items-center justify-center text-4xl overflow-hidden">
                                    {/* Placeholder image representation */}
                                    📦
                                </div>
                                <div className="font-bold text-lg leading-tight mb-1 truncate w-full group-hover:text-primary transition-colors">{product.name}</div>
                                <div className="text-muted-foreground text-sm font-mono mb-2">{product.barcode || '-'}</div>
                                <div className="mt-auto flex justify-between items-end w-full">
                                    <span className="font-extrabold text-lg">{currency}{product.price.toFixed(2)}</span>
                                    <span className="text-xs bg-muted px-2 py-1 rounded-md">{product.stock} in stock</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    {filteredProducts.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <Search size={48} className="opacity-20" />
                            <p className="text-lg">No products found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right side: Cart */}
            <div className="w-full md:w-96 bg-card rounded-lg shadow-sm border border-border flex flex-col flex-shrink-0 relative">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        🛒 {t('pos.cart')}
                        <span className="bg-primary text-primary-foreground text-sm py-0.5 px-2 rounded-full">{items.length}</span>
                    </h2>
                    {items.length > 0 && (
                        <button onClick={clearCart} className="text-destructive hover:bg-destructive/10 text-sm px-3 py-1 rounded-md transition-colors">
                            {t('pos.clear')}
                        </button>
                    )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <div className="text-4xl mb-4 opacity-30">🛒</div>
                            <p>{t('pos.emptyCart')}</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.productId} className="flex gap-3 bg-background border border-border p-3 rounded-lg relative">
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate" title={item.name}>{item.name}</div>
                                    <div className="text-sm font-mono text-muted-foreground">{currency}{item.price.toFixed(2)}</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-1 bg-muted rounded-md p-1 border border-border">
                                        <button
                                            onClick={() => item.quantity > 1 ? updateQuantity(item.productId, item.quantity - 1) : removeItem(item.productId)}
                                            className="w-7 h-7 flex items-center justify-center hover:bg-background rounded shadow-sm text-foreground bg-background/50"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <div className="w-8 text-center font-bold">{item.quantity}</div>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            className="w-7 h-7 flex items-center justify-center hover:bg-background rounded shadow-sm text-foreground bg-background/50"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="font-extrabold">{currency}{item.subtotal.toFixed(2)}</div>
                                </div>

                                <button
                                    onClick={() => removeItem(item.productId)}
                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity focus:opacity-100 shadow-md"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Totals & Checkout */}
                <div className="p-4 border-t border-border bg-muted/20 space-y-3">
                    <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>{t('pos.subtotal')}</span>
                            <span className="font-mono">{currency}{getRawTotal().toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                <span>{t('pos.discount')}</span>
                                <span className="font-mono">-{currency}{discount.toFixed(2)}</span>
                            </div>
                        )}
                        {tax > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span>{t('pos.tax')}</span>
                                <span className="font-mono">{currency}{(getRawTotal() * (tax / 100)).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-border pt-2 mt-2 text-xl font-black">
                            <span>{t('pos.total')}</span>
                            <span>{currency}{getFinalTotal().toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        disabled={items.length === 0}
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold text-lg uppercase tracking-wide disabled:opacity-50 transition-transform active:scale-95"
                    >
                        {t('pos.checkout')}
                    </button>
                </div>
            </div>

            <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
            <Receipt />
        </div>
    );
}
