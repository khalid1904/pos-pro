import { db } from '../db/db';

export const exportData = async () => {
    try {
        const products = await db.products.toArray();
        const categories = await db.categories.toArray();
        const sales = await db.sales.toArray();
        const customers = await db.customers.toArray();
        const settings = await db.settings.toArray();

        const dataStr = JSON.stringify({ products, categories, sales, customers, settings }, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const exportFileDefaultName = `pos_backup_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', url);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed!');
    }
};

export const importData = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);

                await db.transaction('rw', [db.products, db.categories, db.sales, db.customers, db.settings], async () => {
                    if (data.products && Array.isArray(data.products)) {
                        await db.products.clear();
                        await db.products.bulkAdd(data.products);
                    }
                    if (data.categories && Array.isArray(data.categories)) {
                        await db.categories.clear();
                        await db.categories.bulkAdd(data.categories);
                    }
                    if (data.sales && Array.isArray(data.sales)) {
                        await db.sales.clear();
                        await db.sales.bulkAdd(data.sales);
                    }
                    if (data.customers && Array.isArray(data.customers)) {
                        await db.customers.clear();
                        await db.customers.bulkAdd(data.customers);
                    }
                    if (data.settings && Array.isArray(data.settings)) {
                        await db.settings.clear();
                        await db.settings.bulkAdd(data.settings);
                    }
                });

                resolve();
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsText(file);
    });
};
