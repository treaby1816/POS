import { useState } from 'react';
import { Search, ShoppingCart, Package, Plus, Minus, Trash2, Printer, Check, Banknote, CreditCard, Smartphone, Tag } from 'lucide-react';
import useCart from '../store/useCart';
import useInventory from '../store/useInventory';
import useSales from '../store/useSales';
import ReceiptModal from '../components/ReceiptModal';

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

export default function POS() {
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [done, setDone] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const cart = useCart();
  const inventory = useInventory();
  const sales = useSales();

  const products = inventory.products.filter(p => {
    if (!p.is_active) return false;
    const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase()) || (p.barcode && p.barcode.includes(query));
    const matchCat = catFilter === 'All' || p.category === catFilter;
    return matchQ && matchCat;
  });

  const categories = ['All', ...new Set(inventory.products.map(p => p.category))];
  const sub = cart.getSubtotal();
  const vat = cart.getVat();
  const total = cart.getTotal();

  const checkout = () => {
    if (!cart.items.length) return;
    const receiptNo = sales.generateReceiptNo();
    const now = new Date().toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const sale = {
      id: crypto.randomUUID(), receipt_no: receiptNo, store: 'Treabyn Abuja', cashier: 'Admin',
      payment_method: cart.paymentMethod, subtotal: sub, discount: cart.discount, vat_amount: vat,
      total, status: 'completed', created_at: now,
    };
    const saleItems = cart.items.map(i => ({
      product_name: i.name, qty: i.qty, unit_price: i.selling_price || i.price, total_price: (i.selling_price || i.price) * i.qty,
    }));
    sales.addSale(sale);
    inventory.deductStock(cart.items);
    setReceipt({ sale, items: saleItems });
    setDone(true);
    setTimeout(() => { setDone(false); cart.clearCart(); }, 2200);
  };

  return (
    <div className="flex gap-3.5 h-full">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Scan barcode or search…" className="input-default !pl-9" />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input-default !w-auto">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-2.5 overflow-y-auto max-h-[calc(100vh-210px)]">
          {products.map(p => (
            <button key={p.id} onClick={() => cart.addItem(p)}
              className="bg-white border border-gray-100 rounded-2xl p-3.5 text-left shadow-[0_2px_8px_rgba(44,62,107,0.06)] hover:border-amber-500 hover:shadow-[0_6px_20px_rgba(245,158,11,0.18)] transition-all">
              <div className="w-9 h-9 rounded-[10px] bg-amber-500/[0.12] flex items-center justify-center mb-2.5"><Package size={15} className="text-amber-500" /></div>
              <div className="font-bold text-gray-900 text-xs mb-1 truncate">{p.name}</div>
              <div className="text-amber-500 font-bold text-xs">{fmt(p.selling_price)}</div>
              <div className={`text-[11px] mt-0.5 ${p.stock_qty <= p.low_stock_at ? 'text-red-500' : 'text-gray-400'}`}>Stock: {p.stock_qty}</div>
            </button>
          ))}
          {!products.length && (
            <div className="col-span-full flex flex-col items-center py-12 text-gray-300">
              <Search size={28} className="mb-2 opacity-50" /><p className="text-sm">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-[272px] flex-shrink-0 bg-white border border-gray-100 rounded-card p-4 flex flex-col shadow-[0_4px_20px_rgba(44,62,107,0.10)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5"><ShoppingCart size={14} className="text-amber-500" />Cart <span className="text-gray-400 text-xs font-normal">({cart.items.length})</span></h3>
          {cart.items.length > 0 && <button onClick={cart.clearCart} className="bg-transparent border-none text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>}
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 max-h-[230px]">
          {!cart.items.length ? (
            <div className="flex flex-col items-center justify-center h-[100px] text-gray-200"><ShoppingCart size={24} className="mb-2 opacity-50" /><p className="text-xs">Cart is empty</p></div>
          ) : cart.items.map(item => (
            <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-[11px] p-2 border border-gray-100">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-gray-900 truncate">{item.name}</div>
                <div className="text-[11px] text-amber-500">{fmt(item.selling_price || item.price)}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => cart.updateQty(item.id, -1)} className="w-5 h-5 rounded-md bg-red-100 border-none text-red-500 flex items-center justify-center"><Minus size={9} /></button>
                <span className="w-4 text-center text-[11px] font-bold text-gray-900">{item.qty}</span>
                <button onClick={() => cart.updateQty(item.id, 1)} className="w-5 h-5 rounded-md bg-green-100 border-none text-green-600 flex items-center justify-center"><Plus size={9} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment + Totals */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
          <div className="flex gap-1.5">
            {[['cash', Banknote], ['card', CreditCard], ['transfer', Smartphone]].map(([method, Icon]) => (
              <button key={method} onClick={() => cart.setPaymentMethod(method)}
                className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 transition-all capitalize
                  ${cart.paymentMethod === method ? 'gradient-primary border-transparent text-white' : 'bg-white border-gray-200 text-gray-500'}`}>
                <Icon size={10} />{method}
              </button>
            ))}
          </div>
          <div className="relative">
            <Tag size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="number" value={cart.discount || ''} onChange={e => cart.setDiscount(e.target.value)} placeholder="Discount (₦)" className="input-default !text-xs !pl-7 !py-2" />
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmt(sub)}</span></div>
            <div className="flex justify-between text-gray-500"><span>VAT (7.5%)</span><span>{fmt(vat)}</span></div>
            {cart.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{fmt(cart.discount)}</span></div>}
            <div className="flex justify-between text-gray-900 font-extrabold text-sm border-t border-gray-100 pt-1.5 mt-0.5"><span>Total</span><span>{fmt(total)}</span></div>
          </div>
          <button onClick={checkout} disabled={!cart.items.length}
            className={`w-full py-3 rounded-btn border-none font-bold text-xs flex items-center justify-center gap-1.5 transition-all
              ${done ? 'bg-green-600 text-white' : cart.items.length ? 'gradient-primary text-white shadow-[0_6px_20px_rgba(245,158,11,0.35)]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            {done ? <><Check size={13} />Sale Complete!</> : <><Printer size={13} />Checkout & Print</>}
          </button>
        </div>
      </div>

      {receipt && <ReceiptModal sale={receipt.sale} items={receipt.items} onClose={() => setReceipt(null)} />}
    </div>
  );
}
