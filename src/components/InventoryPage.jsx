import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_INVENTORY = [
  { id: '1', name: 'Scuba Diving Regulator', category: 'Scuba', stock: 12, min_stock: 15, unit: 'pcs', location: 'Dive Deck' },
  { id: '2', name: 'Premium Toiletries Kit', category: 'Housekeeping', stock: 85, min_stock: 50, unit: 'kits', location: 'HK Closet A' },
  { id: '3', name: 'Floor Disinfectant (5L)', category: 'Housekeeping', stock: 3, min_stock: 10, unit: 'cans', location: 'HK Closet B' },
  { id: '4', name: 'Premium Coffee Beans (1kg)', category: 'Restaurant', stock: 18, min_stock: 10, unit: 'bags', location: 'Kitchen Store' },
  { id: '5', name: 'Yamaha Outboard Engine Oil', category: 'Rentals', stock: 2, min_stock: 5, unit: 'liters', location: 'Boat Shed' }
];

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [activeTab, setActiveTab] = useState('All'); // All, Scuba, Housekeeping, Restaurant, Rentals
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Housekeeping');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Map DB categories back to UI categories
      const mapped = (data || []).map(item => {
        let cat = 'Housekeeping';
        if (item.category === 'Scuba Equipment') cat = 'Scuba';
        if (item.category === 'Restaurant Stock') cat = 'Restaurant';
        if (item.category === 'Rental Equipment') cat = 'Rentals';
        return {
          id: item.id,
          name: item.name,
          category: cat,
          stock: item.quantity,
          min_stock: item.min_threshold,
          unit: item.unit,
          location: 'Central Store'
        };
      });

      setItems(mapped);
      setIsDemo(false);
    } catch (err) {
      console.warn('Inventory table not ready. Using demo simulation.', err.message);
      setItems(MOCK_INVENTORY);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }

  const handleAdjustStock = async (itemId, amount) => {
    const updated = items.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.stock + amount);
        return { ...item, stock: newStock };
      }
      return item;
    });
    setItems(updated);

    if (isDemo) return;

    try {
      const targetItem = updated.find(i => i.id === itemId);
      const { error } = await supabase
        .from('inventory_items')
        .update({ quantity: targetItem.stock })
        .eq('id', itemId);
      if (error) throw error;
    } catch (err) {
      console.error('Error adjusting stock in DB:', err.message);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name || !stock) return;

    let dbCat = 'Room Amenities';
    if (category === 'Scuba') dbCat = 'Scuba Equipment';
    if (category === 'Restaurant') dbCat = 'Restaurant Stock';
    if (category === 'Rentals') dbCat = 'Rental Equipment';
    if (category === 'Housekeeping') dbCat = 'Cleaning Supplies';

    const payload = {
      name,
      category: dbCat,
      quantity: parseInt(stock, 10),
      unit,
      min_threshold: parseInt(minStock, 10) || 5
    };

    if (isDemo) {
      const newItem = {
        id: Date.now().toString(),
        name,
        category,
        stock: payload.quantity,
        min_stock: payload.min_threshold,
        unit,
        location: location || 'Central Store'
      };
      setItems([newItem, ...items]);
      setIsModalOpen(false);
      resetForm();
      return;
    }

    try {
      const { error } = await supabase.from('inventory_items').insert([payload]);
      if (error) throw error;
      setIsModalOpen(false);
      resetForm();
      fetchInventory();
    } catch (err) {
      alert('Error adding inventory item: ' + err.message);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('Housekeeping');
    setStock('');
    setMinStock('');
    setUnit('pcs');
    setLocation('');
  };

  const filteredItems = items.filter(item => activeTab === 'All' || item.category === activeTab);

  if (loading) {
    return (
      <CrmLayout title="Resort Inventory Registry" subtitle="Manage supplies, diving regulators, hospitality kits, and restaurant ingredients.">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-stone-900 border-t-transparent" />
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout title="Resort Inventory Registry" subtitle="Manage supplies, diving regulators, hospitality kits, and restaurant ingredients.">
      
      {/* Category Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['All', 'Housekeeping', 'Scuba', 'Restaurant', 'Rentals'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === cat
                  ? 'bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-900'
                  : 'bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 text-stone-600 dark:text-stone-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 font-semibold rounded-xl text-xs transition-colors shadow-sm"
        >
          Add Stock Item
        </button>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const isLow = item.stock <= item.min_stock;
          return (
            <div key={item.id} className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">{item.category}</span>
                    <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 mt-0.5">{item.name}</h3>
                  </div>
                  {isLow && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/20 border border-rose-250 text-rose-700 dark:text-rose-300">
                      Low Stock
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">{item.stock}</span>
                  <span className="text-xs text-stone-400 font-semibold uppercase">{item.unit}</span>
                </div>

                <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400 border-t border-stone-100 dark:border-stone-850 pt-3">
                  <p><span className="text-stone-400">Min Level Alert:</span> {item.min_stock} {item.unit}</p>
                  <p><span className="text-stone-400">Storage Location:</span> {item.location}</p>
                </div>
              </div>

              {/* Adjust Stock Buttons */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleAdjustStock(item.id, -1)}
                  className="flex-1 py-2 bg-stone-50 hover:bg-stone-100 dark:bg-stone-850 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition-all"
                >
                  - Deduct 1
                </button>
                <button
                  onClick={() => handleAdjustStock(item.id, 1)}
                  className="flex-1 py-2 bg-stone-950 hover:bg-stone-800 dark:bg-stone-50 dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-xl text-xs font-bold transition-all"
                >
                  + Add 1
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Stock Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800"
            >
              <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-850">
                <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50">Add Stock Item</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddItem} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-250 rounded-xl px-3 py-2.5 focus:outline-none"
                    placeholder="e.g. Toiletries Kit"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-250 rounded-xl px-3 py-2.5 focus:outline-none"
                    >
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Scuba">Scuba</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Rentals">Rentals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Unit</label>
                    <input
                      type="text"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-250 rounded-xl px-3 py-2.5 focus:outline-none"
                      placeholder="pcs, cans, kits..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Initial Stock *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-250 rounded-xl px-3 py-2.5 focus:outline-none"
                      placeholder="e.g. 50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Min Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-250 rounded-xl px-3 py-2.5 focus:outline-none"
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-250 rounded-xl px-3 py-2.5 focus:outline-none"
                    placeholder="e.g. HK Closet A"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-stone-800 transition-colors mt-4"
                >
                  Save Stock Item
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CrmLayout>
  );
}
