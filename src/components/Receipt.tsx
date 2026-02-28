import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';

export default function Receipt() {
    const { items, getRawTotal, getFinalTotal, discount, tax } = useCartStore();
    const { currency } = useUIStore();
    const dateStr = new Date().toLocaleString();

    return (
        <div id="print-receipt" className="hidden print:block font-mono text-xs">
            <div className="text-center mb-4">
                {/* You can load store name from settings here */}
                <h2 className="text-xl font-bold font-sans">POS Pro Store</h2>
                <p>123 Main St, Local Market</p>
                <p>{dateStr}</p>
                <p>--------------------------------</p>
            </div>

            <table className="w-full text-left mb-4">
                <thead>
                    <tr className="border-b border-black">
                        <th className="py-1">Item</th>
                        <th className="py-1 text-center">Qty</th>
                        <th className="py-1 text-right">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.productId}>
                            <td className="py-1 pr-2 truncate max-w-[150px]">{item.name}</td>
                            <td className="py-1 text-center">{item.quantity}</td>
                            <td className="py-1 text-right">{currency}{item.subtotal.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-t border-black pt-2 space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{currency}{getRawTotal().toFixed(2)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{currency}{discount.toFixed(2)}</span>
                    </div>
                )}
                {tax > 0 && (
                    <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{currency}{(getRawTotal() * (tax / 100)).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-black">
                    <span>TOTAL:</span>
                    <span>{currency}{getFinalTotal().toFixed(2)}</span>
                </div>
            </div>

            <div className="text-center mt-6 pt-4 border-t border-black border-dashed">
                <p className="font-bold">Thank you for your visit!</p>
                <p>Please come again.</p>
            </div>
        </div>
    );
}
