import { X, Printer } from 'lucide-react';

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

export default function ReceiptModal({ sale, items, onClose }) {
  if (!sale) return null;
  const handlePrint = () => { window.print(); };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[360px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Receipt Preview</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 border-none transition-colors"><X size={14} /></button>
        </div>

        {/* Receipt */}
        <div className="px-6 py-5 font-mono text-xs" id="receipt-content">
          <div className="text-center mb-4">
            <div className="text-lg font-extrabold text-gray-900 font-sans">Treabyn Store</div>
            <div className="text-gray-400 text-[10px]">Wuse 2, Abuja · 08012345678</div>
            <div className="text-gray-400 text-[10px]">www.treabyn.com</div>
          </div>
          <div className="border-t border-dashed border-gray-300 my-3" />
          <div className="flex justify-between text-gray-500 mb-1"><span>Receipt:</span><span className="text-amber-600 font-bold">{sale.receipt_no}</span></div>
          <div className="flex justify-between text-gray-500 mb-1"><span>Date:</span><span>{sale.created_at}</span></div>
          <div className="flex justify-between text-gray-500 mb-1"><span>Cashier:</span><span>{sale.cashier}</span></div>
          <div className="flex justify-between text-gray-500 mb-1"><span>Payment:</span><span className="capitalize">{sale.payment_method}</span></div>
          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Items */}
          <div className="mb-2">
            <div className="flex justify-between font-bold text-gray-700 mb-1"><span>Item</span><span>Total</span></div>
            {(items || []).map((item, i) => (
              <div key={i} className="flex justify-between text-gray-600 py-0.5">
                <span className="flex-1 truncate">{item.product_name || item.name} x{item.qty}</span>
                <span className="ml-2">{fmt(item.total_price || item.unit_price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-gray-300 my-3" />

          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmt(sale.subtotal)}</span></div>
          <div className="flex justify-between text-gray-500"><span>VAT (7.5%)</span><span>{fmt(sale.vat_amount)}</span></div>
          {sale.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{fmt(sale.discount)}</span></div>}
          <div className="border-t border-dashed border-gray-300 my-2" />
          <div className="flex justify-between font-extrabold text-gray-900 text-sm"><span>TOTAL</span><span>{fmt(sale.total)}</span></div>

          <div className="text-center mt-5 text-gray-400 text-[10px]">
            <p>Thank you for shopping with us!</p>
            <p className="mt-1">Powered by Treabyn POS</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-4 flex gap-2">
          <button onClick={handlePrint} className="btn-primary flex-1 flex items-center justify-center gap-2 !text-xs"><Printer size={13} />Print Receipt</button>
          <button onClick={onClose} className="btn-secondary flex-1 !text-xs">Close</button>
        </div>
      </div>
    </div>
  );
}
