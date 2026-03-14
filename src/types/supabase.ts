export interface DbProfile {
    id: string;
    full_name: string | null;
    updated_at: string;
}

export interface DbStore {
    id: string;
    owner_id: string;
    name: string;
    address: string | null;
    currency: string;
    tax_rate: number;
    created_at: string;
}

export interface DbCategory {
    id: number;
    store_id: string;
    name: string;
    created_at: string;
}

export interface DbProduct {
    id: number;
    store_id: string;
    category_id: number | null;
    name: string;
    price: number;
    cost: number;
    stock: number;
    barcode: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbSale {
    id: string;
    store_id: string;
    total: number;
    tax: number;
    discount: number;
    payment_method: 'cash' | 'upi';
    transaction_id: string | null;
    created_at: string;
}

export interface DbSaleItem {
    id: number;
    sale_id: string;
    product_id: number | null;
    name: string;
    quantity: number;
    price: number;
    cost: number;
    subtotal: number;
}
