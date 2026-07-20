import React, { useState } from 'react';
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
  const [items, setItems] = useState(MOCK_INVENTORY);
  const [activeTab, setActiveTab] = useState('All'); // All, Scuba, Housekeeping, Restaurant, Rentals
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Housekeeping');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [location, setLocation] = useState('');

  const handleAdjustStock = (itemId, amount) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.stock + amount);
        return { ...item, stock: newStock };
      }
      return item;
    }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!name || !stock) return;

    const newItem = {
      id: Date.now().toString(),
      name,
      category,
      stock: parseInt(stock, 10),
      min_stock: parseInt(minStock, 10) || 0,
      unit,
      location: location || 'Central Store'
    };

    setItems([newItem, ...items]);
    setIsModalOpen(false);
    resetForm();
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

      {/* Add Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800"
            >
              <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-850 flex justify-between items-center bg-stone-50 dark:bg-stone-850">
                <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50">Register Supply Stock</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  &times;
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
                    placeholder="e.g. Toiletries Kit"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                    >
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Scuba">Scuba</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Rentals">Rentals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Measurement Unit</label>
                    <input
                      type="text"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. pcs, kits, liters"
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Starting Stock *</label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Min Level Alert</label>
                    <input
                      type="number"
                      required
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Main HK closet"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl"
                  >
                    Log Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CrmLayout>
  );
}
