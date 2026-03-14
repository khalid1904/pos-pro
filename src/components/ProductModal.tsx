import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { DbProduct, DbCategory } from '../types/supabase';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productToEdit?: DbProduct | null;
}

export default function ProductModal({ isOpen, onClose, productToEdit }: ProductModalProps) {
    const { t } = useTranslation();
    const { selectedStoreId } = useAuthStore();
    
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<DbProduct>>({
        name: '',
        category_id: null,
        price: 0,
        cost: 0,
        stock: 0,
        barcode: ''
    });

    useEffect(() => {
        const fetchCategories = async () => {
            if (!selectedStoreId) return;
            const { data } = await supabase
                .from('categories')
                .select('*')
                .eq('store_id', selectedStoreId)
                .order('name');
            if (data) setCategories(data);
        };

        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen, selectedStoreId]);

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                category_id: productToEdit.category_id,
                price: productToEdit.price,
                cost: productToEdit.cost,
                stock: productToEdit.stock,
                barcode: productToEdit.barcode
            });
        } else {
            setFormData({ 
                name: '', 
                category_id: categories[0]?.id || null, 
                price: 0, 
                cost: 0, 
                stock: 0, 
                barcode: '' 
            });
        }
    }, [productToEdit, isOpen, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStoreId) return;
        
        setIsLoading(true);
        try {
            if (productToEdit?.id) {
                const { error } = await supabase
                    .from('products')
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', productToEdit.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert({
                        ...formData,
                        store_id: selectedStoreId,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                if (error) throw error;
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error saving product');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] scale-in-center">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
                    <div>
                        <h2 className="text-2xl font-black">
                            {productToEdit ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p className="text-sm text-muted-foreground font-medium">Enter product details for your catalog</p>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Product Name</label>
                        <input 
                            required 
                            type="text" 
                            value={formData.name || ''} 
                            onChange={e => setFormData({ ...formData, name: e.target.value })} 
                            className="w-full p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium" 
                            placeholder="e.g. Organic Apple"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Category</label>
                        <select 
                            required 
                            value={formData.category_id || ''} 
                            onChange={e => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })} 
                            className="w-full p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium appearance-none"
                        >
                            <option value="">Select a category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Selling Price</label>
                            <input 
                                required 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                value={formData.price || 0} 
                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} 
                                className="w-full p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-primary" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Cost Price</label>
                            <input 
                                required 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                value={formData.cost || 0} 
                                onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })} 
                                className="w-full p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Initial Stock</label>
                            <input 
                                required 
                                type="number" 
                                min="0" 
                                value={formData.stock || 0} 
                                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} 
                                className="w-full p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Barcode (Optional)</label>
                            <input 
                                type="text" 
                                value={formData.barcode || ''} 
                                onChange={e => setFormData({ ...formData, barcode: e.target.value })} 
                                className="w-full p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium" 
                                placeholder="Scan or type barcode"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-3 rounded-xl border border-input hover:bg-muted font-bold transition-all"
                    >
                        {t('checkout.cancel')}
                    </button>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        form="product-form" 
                        className="px-8 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-primary/20"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {t('products.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
