import Dexie, { type EntityTable } from 'dexie';

// 1. Define Interfaces for Database Models

export interface Product {
    id?: number;
    name: string;
    categoryId: number;
    price: number;
    cost: number;
    stock: number;
    barcode: string;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id?: number;
    name: string;
}

export interface SaleItem {
    productId: number;
    name: string;
    price: number;
    cost: number;
    quantity: number;
    subtotal: number;
}

export interface Sale {
    id?: number;
    items: SaleItem[];
    total: number;
    discount: number;
    tax: number;
    paymentMethod: 'cash' | 'upi';
    timestamp: string;
}

export interface Customer {
    id?: number;
    name: string;
    phone: string;
}

export interface AppSettings {
    id?: number; // usually just 1 row
    theme: 'light' | 'dark';
    taxRate: number;
    currency: string;
    language: string; // 'en' | 'ta'
    storeName: string;
    storeAddress: string;
    merchantUpiId: string;
}

// 2. Define the Database Class extending Dexie

class POSDatabase extends Dexie {
    // Declare implicit table properties
    products!: EntityTable<Product, 'id'>;
    categories!: EntityTable<Category, 'id'>;
    sales!: EntityTable<Sale, 'id'>;
    customers!: EntityTable<Customer, 'id'>;
    settings!: EntityTable<AppSettings, 'id'>;

    constructor() {
        super('pos_database');

        // Define tables and indexes
        this.version(1).stores({
            products: '++id, name, categoryId, barcode',
            categories: '++id, name',
            sales: '++id, timestamp',
            customers: '++id, name, phone',
            settings: '++id'
        });
    }
}

export const db = new POSDatabase();

// 3. Optional: Initial data population on first load
db.on('populate', async () => {
    await db.settings.add({
        theme: 'light',
        taxRate: 0,
        currency: '₹',
        language: 'en',
        storeName: 'My Local Shop',
        storeAddress: '123 Main St',
        merchantUpiId: ''
    });

    await db.categories.bulkAdd([
        { name: 'General' },
        { name: 'Groceries' },
        { name: 'Electronics' }
    ]);
});
