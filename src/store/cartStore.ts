import { create } from 'zustand';
import type { SaleItem } from '../db/db';

interface CartState {
    items: SaleItem[];
    discount: number;
    tax: number;
    addItem: (product: any) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    setDiscount: (discount: number) => void;
    setTax: (tax: number) => void;
    clearCart: () => void;
    getRawTotal: () => number;
    getFinalTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    discount: 0,
    tax: 0,

    addItem: (product) => {
        set((state) => {
            const existingItem = state.items.find(item => item.productId === product.id);

            if (existingItem) {
                return {
                    items: state.items.map(item =>
                        item.productId === product.id
                            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
                            : item
                    )
                };
            }

            return {
                items: [...state.items, {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    cost: product.cost || 0,
                    quantity: 1,
                    subtotal: product.price
                }]
            };
        });
    },

    removeItem: (productId) => {
        set((state) => ({
            items: state.items.filter(item => item.productId !== productId)
        }));
    },

    updateQuantity: (productId, quantity) => {
        set((state) => ({
            items: state.items.map(item =>
                item.productId === productId
                    ? { ...item, quantity, subtotal: quantity * item.price }
                    : item
            )
        }));
    },

    setDiscount: (discount) => set({ discount }),

    setTax: (tax) => set({ tax }),

    clearCart: () => set({ items: [], discount: 0, tax: 0 }),

    getRawTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.subtotal, 0);
    },

    getFinalTotal: () => {
        const { getRawTotal, discount, tax } = get();
        const rawTotal = getRawTotal();
        const afterDiscount = rawTotal - discount;
        const taxAmount = afterDiscount * (tax / 100);
        return Math.max(0, afterDiscount + taxAmount);
    }
}));
