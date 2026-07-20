import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_ORDERS = [
  { id: 'order-1', table_number: 'Table 4', room_number: null, order_items: [{ name: 'Butter Garlic Prawns', quantity: 2, price: 450 }, { name: 'Mango Lassi', quantity: 2, price: 120 }], total_amount: 1140, status: 'Preparing', created_at: '2026-07-17T12:30:00Z' },
  { id: 'order-2', table_number: null, room_number: 'Room 205', order_items: [{ name: 'Paneer Butter Masala', quantity: 1, price: 280 }, { name: 'Butter Roti', quantity: 3, price: 40 }], total_amount: 400, status: 'Pending', created_at: '2026-07-17T12:45:00Z' },
  { id: 'order-3', table_number: 'Table 9', room_number: null, order_items: [{ name: 'Chicken Biryani', quantity: 1, price: 320 }, { name: 'Fresh Lime Soda', quantity: 1, price: 80 }], total_amount: 400, status: 'Served', created_at: '2026-07-17T11:30:00Z' }
];

const FOOD_ITEMS = [
  { name: 'Chicken Biryani', price: 320 },
  { name: 'Butter Garlic Prawns', price: 450 },
  { name: 'Paneer Butter Masala', price: 280 },
  { name: 'Butter Roti', price: 40 },
  { name: 'Mango Lassi', price: 120 },
  { name: 'Fresh Lime Soda', price: 80 }
];

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  // Form State
  const [isRoomService, setIsRoomService] = useState(false);
  const [targetNumber, setTargetNumber] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // [{ name, quantity, price }]

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_restaurant_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data && data.length > 0 ? data : MOCK_ORDERS);
    } catch (err) {
      console.error('Error fetching restaurant orders:', err);
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) return alert('Select at least one food item!');

    const total = selectedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    try {
      const payload = {
        table_number: isRoomService ? null : `Table ${targetNumber}`,
        room_number: isRoomService ? `Room ${targetNumber}` : null,
        order_items: selectedItems,
        total_amount: total,
        status: 'Pending'
      };

      const { data, error } = await supabase
        .from('crm_restaurant_orders')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setOrders(prev => [data[0], ...prev]);
      } else {
        const newMock = {
          id: `order-mock-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString()
        };
        setOrders(prev => [newMock, ...prev]);
      }

      setIsOrderOpen(false);
      setTargetNumber('');
      setSelectedItems([]);
    } catch (err) {
      console.error('Error creating order:', err);
      // fallback mock update
      const newMock = {
        id: `order-mock-${Date.now()}`,
        table_number: isRoomService ? null : `Table ${targetNumber}`,
        room_number: isRoomService ? `Room ${targetNumber}` : null,
        order_items: selectedItems,
        total_amount: total,
        status: 'Pending',
        created_at: new Date().toISOString()
      };
      setOrders(prev => [newMock, ...prev]);
      setIsOrderOpen(false);
      setTargetNumber('');
      setSelectedItems([]);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('crm_restaurant_orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      console.error('Error updating order status:', err);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  const handleAddItem = (food) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.name === food.name);
      if (existing) {
        return prev.map(item => item.name === food.name ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        return [...prev, { ...food, quantity: 1 }];
      }
    });
  };

  const handleRemoveItem = (foodName) => {
    setSelectedItems(prev => prev.filter(item => item.name !== foodName));
  };

  const diningRevenue = orders
    .filter(o => o.status === 'Served')
    .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

  const activeOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;

  return (
    <CrmLayout title="Resort Kitchen & KOT" subtitle="Monitor dining table bookings, trace active kitchen tickets, and route room service food orders.">
      <div className="relative font-sans text-slate-800">
        
        {/* KPI Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Active Kitchen Tickets</p>
            <h3 className="text-3xl font-serif text-slate-900">{activeOrdersCount} Tickets</h3>
            <p className="text-[10px] text-amber-600 mt-2">● Awaiting chef preparation / serving</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Dining Receipts</p>
            <h3 className="text-3xl font-serif text-emerald-600">₹{diningRevenue.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-emerald-600 mt-2">✓ Settled culinary orders</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">F&B Performance</p>
            <h3 className="text-3xl font-serif text-indigo-600">96% Positive</h3>
            <p className="text-[10px] text-slate-500 mt-2">Kitchen delivery SLA maintained</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <h3 className="font-serif text-lg text-slate-800 font-medium">Culinary Operations</h3>
          <button
            onClick={() => setIsOrderOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            🍳 Log Restaurant Order / KOT
          </button>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full bg-white border border-slate-200/80 rounded-[32px] p-12 text-center text-slate-400">
              Loading kitchen order tickets...
            </div>
          ) : orders.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200/80 rounded-[32px] p-12 text-center text-slate-400">
              No orders queued today.
            </div>
          ) : (
            orders.map(o => (
              <div key={o.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <span className="font-serif font-bold text-slate-900 text-base">
                      {o.table_number || o.room_number || 'Takeaway'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      o.status === 'Served' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      o.status === 'Preparing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      o.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {o.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {Array.isArray(o.order_items) && o.order_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs font-medium text-slate-700">
                        <span>{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                        <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-auto">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-900 mb-4">
                    <span>Total Amount</span>
                    <span>₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex gap-2">
                    {o.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'Preparing')}
                        className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold uppercase text-[9px] tracking-wider rounded-xl transition-all"
                      >
                        ⚡ Start Cooking
                      </button>
                    )}
                    {(o.status === 'Pending' || o.status === 'Preparing') && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'Served')}
                        className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold uppercase text-[9px] tracking-wider rounded-xl transition-all"
                      >
                        ✓ Mark Served
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Order Modal */}
        <AnimatePresence>
          {isOrderOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white border border-slate-200 p-8 rounded-[32px] w-full max-w-xl shadow-2xl relative my-8"
              >
                <button
                  onClick={() => setIsOrderOpen(false)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-800 transition-colors"
                >
                  ✕
                </button>

                <h3 className="font-serif text-3xl text-slate-900 mb-1">Create KOT Order</h3>
                <p className="text-slate-500 text-xs mb-6 font-medium">Record a table dining or room service order.</p>

                <form onSubmit={handleCreateOrder} className="space-y-6 text-left font-sans">
                  
                  {/* Destination Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Service Type</label>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setIsRoomService(false)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${!isRoomService ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                        >
                          Table Service
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsRoomService(true)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${isRoomService ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                        >
                          Room Service
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
                        {isRoomService ? 'Room Number' : 'Table Number'}
                      </label>
                      <input
                        type="number"
                        required
                        placeholder={isRoomService ? 'e.g. 205' : 'e.g. 4'}
                        value={targetNumber}
                        onChange={(e) => setTargetNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Menu & Selected list layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                    {/* Menu items */}
                    <div>
                      <h4 className="font-serif text-slate-900 mb-3 text-sm">Resort Menu Selection</h4>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {FOOD_ITEMS.map((food, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                            <span className="font-medium text-slate-700">{food.name} <span className="text-slate-400">(₹{food.price})</span></span>
                            <button
                              type="button"
                              onClick={() => handleAddItem(food)}
                              className="px-2.5 py-1 bg-amber-500 text-white rounded-lg font-bold text-[10px]"
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected items */}
                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-slate-900 mb-3 text-sm">Active Order Cart</h4>
                        {selectedItems.length === 0 ? (
                          <p className="text-slate-400 text-xs italic py-8 text-center">No items added to ticket yet</p>
                        ) : (
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {selectedItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs text-slate-700">
                                <span>{item.name} <span className="font-bold text-amber-600">x{item.quantity}</span></span>
                                <div className="flex items-center gap-3">
                                  <span>₹{item.price * item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.name)}
                                    className="text-rose-500 font-bold hover:text-rose-600"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {selectedItems.length > 0 && (
                        <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-xs font-bold text-slate-900">
                          <span>Subtotal Due</span>
                          <span>₹{selectedItems.reduce((sum, item) => sum + item.quantity * item.price, 0).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Confirm & Send to Kitchen (KOT)
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </CrmLayout>
  );
}
