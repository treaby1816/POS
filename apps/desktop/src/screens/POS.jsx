import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Check, Banknote, CreditCard, Smartphone, Grid, List, Plus, Minus, UserCheck, Users } from 'lucide-react';
import useCart from '../store/useCart';
import useInventory from '../store/useInventory';
import useSales from '../store/useSales';
import useCustomers from '../store/useCustomers';
import ReceiptModal from '../components/ReceiptModal';
import { getSmartIcon } from '../utils/icons';

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

export default function POS() {
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [done, setDone] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [custQuery, setCustQuery] = useState('');

  const cart = useCart();
  const inventory = useInventory();
  const sales = useSales();
  const customers = useCustomers();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleGlobalFocus = (e) => {
      // Auto-focus search if typing letters/numbers and not already in an input
      if (document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'SELECT' && 
          e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalFocus);
    return () => window.removeEventListener('keydown', handleGlobalFocus);
  }, []);

  const products = inventory.products.filter(p => {
    if (!p.is_active) return false;
    const q = query.toLowerCase().trim();
    const matchQ = !q || p.name.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q));
    const matchCat = catFilter === 'All' || p.category === catFilter;
    return matchQ && matchCat;
  });

  const categories = ['All', ...new Set(inventory.products.map(p => p.category))];
  const sub = cart.getSubtotal();
  const vat = cart.getVat();
  const total = cart.getTotal();

  const isCredit = cart.paymentMethod === 'credit';

  const checkout = () => {
    if (!cart.items.length) return;
    if (isCredit && !selectedCustomer) {
      setShowCustomerPicker(true);
      return;
    }
    const receiptNo = sales.generateReceiptNo();
    const now = new Date().toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const sale = {
      id: crypto.randomUUID(), receipt_no: receiptNo, store: 'Treabyn Abuja', cashier: 'Admin',
      payment_method: cart.paymentMethod, subtotal: sub, discount: cart.discount, vat_amount: vat,
      total, status: isCredit ? 'credit' : 'completed', created_at: now,
      customer_id: selectedCustomer?.id || null,
      customer_name: selectedCustomer?.name || null,
    };
    const saleItems = cart.items.map(i => ({
      product_name: i.name, qty: i.qty, unit_price: i.selling_price || i.price, total_price: (i.selling_price || i.price) * i.qty,
    }));
    sales.addSale(sale);
    inventory.deductStock(cart.items);

    // If credit sale, add debt to customer
    if (isCredit && selectedCustomer) {
      customers.addDebt(selectedCustomer.id, total, receiptNo);
    }

    setReceipt({ sale, items: saleItems });
    setDone(true);
    setTimeout(() => { setDone(false); cart.clearCart(); setSelectedCustomer(null); }, 2200);
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      const q = query.trim().toLowerCase();
      const exactMatch = inventory.products.find(p => p.is_active && (p.barcode === query.trim() || p.name.toLowerCase() === q));
      const toAdd = exactMatch || (products.length === 1 ? products[0] : null);
      if (toAdd) {
        cart.addItem(toAdd);
        setQuery('');
      }
    }
  };

  const filteredCustomers = customers.customers.filter(c => {
    const q = custQuery.toLowerCase().trim();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div className="flex gap-3.5 h-full">
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input 
              ref={searchRef}
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              onKeyDown={handleSearchKey}
              placeholder="Scan barcode or type to search…" 
              className="input-default !pl-9 !pr-8" 
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 border-none bg-transparent">✕</button>
            )}
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input-default !w-auto">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-amber-500' : 'text-gray-400 hover:text-gray-600'}`}><Grid size={15}/></button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-amber-500' : 'text-gray-400 hover:text-gray-600'}`}><List size={15}/></button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-2.5 overflow-y-auto max-h-[calc(100vh-210px)]">
            {products.map(p => {
              const Icon = getSmartIcon(p);
              return (
                <button key={p.id} onClick={() => cart.addItem(p)}
                  className="bg-white border border-gray-100 rounded-2xl p-3.5 text-left shadow-[0_2px_8px_rgba(44,62,107,0.06)] hover:border-amber-500 hover:shadow-[0_6px_20px_rgba(245,158,11,0.18)] transition-all">
                  <div className="w-9 h-9 rounded-[10px] bg-amber-500/[0.12] flex items-center justify-center mb-2.5">
                    <Icon size={15} className="text-amber-500" />
                  </div>
                  <div className="font-bold text-gray-900 text-xs mb-1 truncate">{p.name}</div>
                  <div className="text-amber-500 font-bold text-xs">{fmt(p.selling_price)}</div>
                  <div className={`text-[11px] mt-0.5 ${p.stock_qty <= p.low_stock_at ? 'text-red-500' : 'text-gray-400'}`}>Stock: {p.stock_qty}</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[calc(100vh-210px)] bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(44,62,107,0.06)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2.5 text-[11px] text-gray-500 uppercase tracking-wide font-bold">Barcode</th>
                  <th className="px-4 py-2.5 text-[11px] text-gray-500 uppercase tracking-wide font-bold">Product</th>
                  <th className="px-4 py-2.5 text-[11px] text-gray-500 uppercase tracking-wide font-bold">Price</th>
                  <th className="px-4 py-2.5 text-[11px] text-gray-500 uppercase tracking-wide font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-gray-400 text-[10px]">{p.barcode || p.id.slice(0, 8)}</td>
                    <td className="px-4 py-2.5 font-bold text-gray-900 text-xs">{p.name}</td>
                    <td className="px-4 py-2.5 text-xs text-amber-500 font-bold">{fmt(p.selling_price)}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => cart.addItem(p)} className="bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-md text-[11px] font-extrabold hover:bg-amber-500 hover:text-white transition-colors">Add</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cart Panel — elastic: grows with items, scrolls only when overflowing viewport */}
      <div className="w-[272px] flex-shrink-0 bg-white border border-gray-100 rounded-card p-4 flex flex-col shadow-[0_4px_20px_rgba(44,62,107,0.10)] max-h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5"><ShoppingCart size={14} className="text-amber-500" />Cart <span className="text-gray-400 text-xs font-normal">({cart.items.length})</span></h3>
          {cart.items.length > 0 && <button onClick={() => cart.clearCart()} className="bg-transparent border-none text-gray-300 hover:text-red-500"><Trash2 size={12} /></button>}
        </div>

        {cart.items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-300 text-xs text-center">Scan or add products<br/>to start a sale</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 min-h-0">
            {cart.items.map(item => (
              <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-[11px] p-2 border border-gray-100 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-gray-900 truncate">{item.name}</div>
                  <div className="text-[11px] text-amber-500">{fmt(item.selling_price)}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => cart.updateQty(item.id, -1)} className="w-5 h-5 rounded-md bg-red-100 border-none text-red-500 flex items-center justify-center"><Minus size={9} /></button>
                  <span className="w-4 text-center text-[11px] font-bold text-gray-900">{item.qty}</span>
                  <button onClick={() => cart.updateQty(item.id, 1)} className="w-5 h-5 rounded-md bg-green-100 border-none text-green-600 flex items-center justify-center"><Plus size={9} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2 flex-shrink-0">
          {/* Payment methods — now with Credit */}
          <div className="flex gap-1">
            {[['cash', Banknote], ['card', CreditCard], ['transfer', Smartphone], ['credit', UserCheck]].map(([method, Icon]) => (
              <button key={method} onClick={() => { cart.setPaymentMethod(method); if (method !== 'credit') setSelectedCustomer(null); }}
                className={`flex-1 py-1.5 rounded-lg border text-[9px] font-bold flex items-center justify-center gap-0.5 transition-all capitalize
                  ${cart.paymentMethod === method
                    ? method === 'credit' ? 'bg-red-500 border-red-500 text-white' : 'gradient-primary border-transparent text-white'
                    : 'bg-white border-gray-200 text-gray-500'}`}>
                <Icon size={9} />{method}
              </button>
            ))}
          </div>

          {/* Customer selector for credit */}
          {isCredit && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {selectedCustomer ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[9px] font-bold">{selectedCustomer.name.charAt(0)}</div>
                    <div>
                      <div className="text-[11px] font-bold text-red-700">{selectedCustomer.name}</div>
                      <div className="text-[9px] text-red-400">Owes {fmt(selectedCustomer.balance)}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="text-red-400 hover:text-red-600 bg-transparent border-none text-[10px] font-bold">Change</button>
                </div>
              ) : (
                <button onClick={() => setShowCustomerPicker(true)} className="w-full text-center text-red-500 text-[11px] font-bold bg-transparent border-none py-1 hover:text-red-700">
                  <Users size={12} className="inline mr-1" />Select Customer for Credit
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1 text-xs pt-1">
            <div className="flex justify-between text-gray-900 font-bold"><span>Total</span><span>{fmt(total)}</span></div>
          </div>
          <button onClick={checkout} disabled={!cart.items.length}
            className={`w-full py-3 rounded-btn border-none font-bold text-xs flex items-center justify-center gap-1.5 transition-all mt-1
              ${done ? 'bg-green-600 text-white' : isCredit ? 'bg-red-500 text-white shadow-[0_6px_20px_rgba(239,68,68,0.35)]' : 'gradient-primary text-white shadow-[0_6px_20px_rgba(245,158,11,0.35)]'}`}>
            {done ? 'Sale Complete!' : isCredit ? 'Sell on Credit' : 'Checkout'}
          </button>
        </div>
      </div>

      {receipt && <ReceiptModal sale={receipt.sale} items={receipt.items} onClose={() => setReceipt(null)} />}

      {/* Customer Picker Modal */}
      {showCustomerPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowCustomerPicker(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[400px] max-h-[60vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-2">Select Customer</h3>
              <input value={custQuery} onChange={(e) => setCustQuery(e.target.value)} placeholder="Search by name or phone…" className="input-default !text-xs" autoFocus />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredCustomers.map((c) => (
                <button key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustomerPicker(false); setCustQuery(''); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 transition-colors text-left border-none bg-transparent">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-[11px] font-bold">{c.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-900">{c.name}</div>
                    <div className="text-[10px] text-gray-400">{c.phone || 'No phone'}</div>
                  </div>
                  {c.balance > 0 && <span className="text-[10px] font-bold text-red-500">Owes {fmt(c.balance)}</span>}
                </button>
              ))}
              {filteredCustomers.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No customers found. Add one in the Customers screen.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
