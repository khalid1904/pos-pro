import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { db, type Product } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productToEdit?: Product | null;
}

export default function ProductModal({ isOpen, onClose, productToEdit }: ProductModalProps) {
    const { t } = useTranslation();
    const categories = useLiveQuery(() => db.categories.toArray()) || [];

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        categoryId: 1,
        price: 0,
        cost: 0,
        stock: 0,
        barcode: ''
    });

    useEffect(() => {
        if (productToEdit) {
            setFormData(productToEdit);
        } else {
            setFormData({ name: '', categoryId: categories[0]?.id || 1, price: 0, cost: 0, stock: 0, barcode: '' });
        }
    }, [productToEdit, isOpen, categories]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (productToEdit?.id) {
                await db.products.update(productToEdit.id, {
                    ...formData,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await db.products.add({
                    ...formData as Product,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error saving product');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card w-full max-w-md rounded-lg shadow-lg flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-xl font-bold">
                        {productToEdit ? t('products.edit') : t('products.add')}
                    </h2>
                    <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X size={24} />
                    </button>
                </div>

                <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('products.name')}</label>
                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 rounded-md border border-input bg-background" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('products.category')}</label>
                        <select required value={formData.categoryId || 1} onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value) })} className="w-full p-2 rounded-md border border-input bg-background">
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('products.price')}</label>
                            <input required type="number" min="0" step="0.01" value={formData.price || 0} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full p-2 rounded-md border border-input bg-background" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('products.cost')}</label>
                            <input required type="number" min="0" step="0.01" value={formData.cost || 0} onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })} className="w-full p-2 rounded-md border border-input bg-background" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('products.stock')}</label>
                            <input required type="number" min="0" value={formData.stock || 0} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full p-2 rounded-md border border-input bg-background" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('products.barcode')}</label>
                            <input type="text" value={formData.barcode || ''} onChange={e => setFormData({ ...formData, barcode: e.target.value })} className="w-full p-2 rounded-md border border-input bg-background" />
                        </div>
                    </div>
                </form>

                <div className="p-4 border-t border-border flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-input hover:bg-muted font-medium">
                        {t('checkout.cancel')}
                    </button>
                    <button type="submit" form="product-form" className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                        {t('products.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
