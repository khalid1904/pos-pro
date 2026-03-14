import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import ProductModal from '../components/ProductModal';
import type { DbProduct } from '../types/supabase';

export default function Products() {
    const { t } = useTranslation();
    const { currency } = useUIStore();
    const { selectedStoreId } = useAuthStore();
    
    const [products, setProducts] = useState<DbProduct[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<DbProduct | null>(null);

    const fetchProductsData = async () => {
        if (!selectedStoreId) return;
        setIsLoading(true);
        try {
            const [pRes, cRes] = await Promise.all([
                supabase.from('products').select('*').eq('store_id', selectedStoreId).order('name'),
                supabase.from('categories').select('*').eq('store_id', selectedStoreId)
            ]);
            
            if (pRes.data) setProducts(pRes.data);
            if (cRes.data) setCategories(cRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProductsData();
    }, [selectedStoreId]);

    const handleEdit = (product: DbProduct) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setProductToEdit(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (!error) {
                fetchProductsData();
            } else {
                alert('Error deleting product');
            }
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">{t('products.title')}</h1>
                <div className="flex gap-2">
                    <button onClick={handleAdd} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                        <Plus size={20} />
                        {t('products.add')}
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-card rounded-3xl shadow-sm border border-border p-0 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-4 font-bold uppercase text-xs text-muted-foreground tracking-wider">{t('products.name')}</th>
                                <th className="p-4 font-bold uppercase text-xs text-muted-foreground tracking-wider">{t('products.category')}</th>
                                <th className="p-4 font-bold uppercase text-xs text-muted-foreground tracking-wider">{t('products.price')}</th>
                                <th className="p-4 font-bold uppercase text-xs text-muted-foreground tracking-wider">{t('products.stock')}</th>
                                <th className="p-4 font-bold uppercase text-xs text-muted-foreground tracking-wider">{t('products.barcode')}</th>
                                <th className="p-4 font-bold uppercase text-xs text-muted-foreground tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 size={32} className="animate-spin text-primary" />
                                            <span className="font-medium">{t('common.loading')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                                            <Plus size={48} className="mb-2" />
                                            <p className="text-lg font-bold">{t('common.noData')}</p>
                                            <p className="text-sm">Start by adding your first product.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((p) => {
                                    const cat = categories.find(c => c.id === p.category_id);
                                    return (
                                        <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="p-4 font-bold text-foreground">{p.name}</td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-bold">
                                                    {cat?.name || 'General'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono font-black text-primary">{currency}{p.price.toFixed(2)}</td>
                                            <td className="p-4">
                                                <span className={`font-bold ${p.stock < 10 ? 'text-destructive' : 'text-foreground'}`}>
                                                    {p.stock}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-muted-foreground">{p.barcode || '-'}</td>
                                            <td className="p-4 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(p)} className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors" title="Edit">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <ProductModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        fetchProductsData();
                    }}
                    productToEdit={productToEdit}
                />
            )}
        </div>
    );
}
