import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Minus, Trash2, Loader2, Package } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import CheckoutModal from '../components/CheckoutModal';
import Receipt from '../components/Receipt';
import type { DbProduct, DbCategory } from '../types/supabase';

export default function POS() {
    const { t } = useTranslation();
    const { currency } = useUIStore();
    const { selectedStoreId } = useAuthStore();
    
    const [products, setProducts] = useState<DbProduct[]>([]);
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const {
        items, addItem, removeItem, updateQuantity, clearCart,
        getRawTotal, getFinalTotal, discount, tax
    } = useCartStore();

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedStoreId) return;
            setIsLoading(true);
            try {
                const [pRes, cRes] = await Promise.all([
                    supabase.from('products').select('*').eq('store_id', selectedStoreId).order('name'),
                    supabase.from('categories').select('*').eq('store_id', selectedStoreId).order('name')
                ]);
                if (pRes.data) setProducts(pRes.data);
                if (cRes.data) setCategories(cRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedStoreId]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search));
            const matchesCategory = activeCategory === 'all' || p.category_id === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, search, activeCategory]);

    return (
        <div className="p-4 h-full flex flex-col lg:flex-row gap-6 bg-muted/20">
            {/* Left side: Products Grid */}
            <div className="flex-1 flex flex-col bg-card rounded-[2rem] shadow-xl shadow-primary/5 border border-border overflow-hidden">
                {/* Top bar: Search & Categories */}
                <div className="p-6 border-b border-border space-y-6 bg-card/50 backdrop-blur-md">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder={t('pos.searchPlaceholder')}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-transparent bg-muted/50 text-xl focus:outline-none focus:border-primary/20 focus:bg-background focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all ${activeCategory === 'all' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                        >
                            All Products
                        </button>
                        {categories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setActiveCategory(c.id)}
                                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all ${activeCategory === c.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <Loader2 size={48} className="animate-spin text-primary" />
                            <p className="text-xl font-bold animate-pulse">Syncing catalog...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-50">
                            <Package size={80} strokeWidth={1} />
                            <div className="text-center">
                                <p className="text-2xl font-black">No Items Found</p>
                                <p className="font-medium">Try adjusting your search or category</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addItem(product as any)}
                                    disabled={product.stock <= 0}
                                    className="flex flex-col text-left bg-background border-2 border-transparent rounded-[2rem] p-4 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden bg-gradient-to-br from-background to-muted/20"
                                >
                                    <div className="aspect-square w-full bg-primary/5 rounded-3xl mb-4 flex items-center justify-center text-5xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                        📦
                                    </div>
                                    <h3 className="font-black text-lg leading-tight mb-1 truncate w-full group-hover:text-primary transition-colors">{product.name}</h3>
                                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-3">{product.barcode || 'NO BARCODE'}</p>
                                    <div className="mt-auto flex justify-between items-center w-full">
                                        <span className="font-black text-2xl text-primary">{currency}{product.price.toFixed(2)}</span>
                                        <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${product.stock < 10 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                            {product.stock} left
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right side: Cart */}
            <div className="w-full lg:w-[26rem] bg-card rounded-[2rem] shadow-xl shadow-primary/5 border border-border flex flex-col flex-shrink-0 relative overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/10">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                        <span className="text-3xl">🛒</span>
                        {t('pos.cart')}
                        <span className="bg-primary text-primary-foreground text-sm font-black py-1 px-3 rounded-xl shadow-lg shadow-primary/20">{items.length}</span>
                    </h2>
                    {items.length > 0 && (
                        <button onClick={clearCart} className="text-destructive hover:bg-destructive/10 font-bold text-sm px-4 py-2 rounded-xl transition-all">
                            {t('pos.clear')}
                        </button>
                    )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30">
                            <div className="text-8xl mb-6">🛒</div>
                            <p className="text-xl font-black">{t('pos.emptyCart')}</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.productId} className="flex gap-4 bg-muted/30 border border-border/50 p-4 rounded-3xl relative group">
                                <div className="flex-1 min-w-0">
                                    <div className="font-black text-lg truncate pr-6" title={item.name}>{item.name}</div>
                                    <div className="text-primary font-black">{currency}{item.price.toFixed(2)}</div>
                                </div>

                                <div className="flex flex-col items-end justify-between gap-3">
                                    <div className="flex items-center gap-2 bg-background rounded-2xl p-1.5 shadow-inner border border-border/50">
                                        <button
                                            onClick={() => item.quantity > 1 ? updateQuantity(item.productId, item.quantity - 1) : removeItem(item.productId)}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-primary hover:text-white rounded-xl transition-all text-primary font-bold"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <div className="w-8 text-center font-black text-lg">{item.quantity}</div>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-primary hover:text-white rounded-xl transition-all text-primary font-bold"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <div className="font-black text-xl">{currency}{item.subtotal.toFixed(2)}</div>
                                </div>

                                <button
                                    onClick={() => removeItem(item.productId)}
                                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={20} strokeWidth={3} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Totals & Checkout */}
                <div className="p-8 border-t border-border bg-muted/30 space-y-6">
                    <div className="space-y-3 font-bold">
                        <div className="flex justify-between text-muted-foreground">
                            <span className="uppercase tracking-widest text-xs">{t('pos.subtotal')}</span>
                            <span className="font-black">{currency}{getRawTotal().toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-destructive">
                                <span className="uppercase tracking-widest text-xs">{t('pos.discount')}</span>
                                <span className="font-black">-{currency}{discount.toFixed(2)}</span>
                            </div>
                        )}
                        {tax > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span className="uppercase tracking-widest text-xs">{t('pos.tax')} ({tax}%)</span>
                                <span className="font-black">{currency}{(getRawTotal() * (tax / 100)).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-border pt-6 mt-4 align-baseline">
                            <span className="text-2xl font-black uppercase tracking-tight">{t('pos.total')}</span>
                            <span className="text-4xl font-black text-primary">{currency}{getFinalTotal().toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        disabled={items.length === 0}
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-2xl shadow-primary/30 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                    >
                        ⚡ {t('pos.checkout')}
                    </button>
                </div>
            </div>

            <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
            <Receipt />
        </div>
    );
}
