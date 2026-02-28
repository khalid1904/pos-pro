import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { db, type Product } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import ProductModal from '../components/ProductModal';
import { exportData, importData } from '../utils/dataHelper';

export default function Products() {
    const { t } = useTranslation();
    const { currency } = useUIStore();
    const products = useLiveQuery(() => db.products.toArray()) || [];
    const categories = useLiveQuery(() => db.categories.toArray()) || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleEdit = (product: Product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setProductToEdit(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id?: number) => {
        if (id && confirm('Are you sure you want to delete this product?')) {
            await db.products.delete(id);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                await importData(e.target.files[0]);
                alert(t('common.success'));
            } catch (err) {
                alert(t('common.error'));
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">{t('products.title')}</h1>
                <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md font-medium border border-border">
                        <Upload size={18} />
                        <span className="hidden sm:inline">{t('products.import')}</span>
                    </button>
                    <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleImport} />

                    <button onClick={exportData} className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md font-medium border border-border">
                        <Download size={18} />
                        <span className="hidden sm:inline">{t('products.export')}</span>
                    </button>

                    <button onClick={handleAdd} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium">
                        <Plus size={18} />
                        {t('products.add')}
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-card rounded-lg shadow-sm border border-border p-0 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-4 font-medium">{t('products.name')}</th>
                                <th className="p-4 font-medium">{t('products.category')}</th>
                                <th className="p-4 font-medium">{t('products.price')}</th>
                                <th className="p-4 font-medium">{t('products.stock')}</th>
                                <th className="p-4 font-medium">{t('products.barcode')}</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        {t('common.noData')}
                                    </td>
                                </tr>
                            ) : (
                                products.map((p) => {
                                    const cat = categories.find(c => c.id === p.categoryId);
                                    return (
                                        <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20">
                                            <td className="p-4 font-semibold">{p.name}</td>
                                            <td className="p-4">{cat?.name || '-'}</td>
                                            <td className="p-4 font-mono font-bold">{currency}{p.price.toFixed(2)}</td>
                                            <td className="p-4">{p.stock}</td>
                                            <td className="p-4 text-sm text-muted-foreground">{p.barcode || '-'}</td>
                                            <td className="p-4 flex justify-end gap-2">
                                                <button onClick={() => handleEdit(p)} className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
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

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                productToEdit={productToEdit}
            />
        </div>
    );
}
