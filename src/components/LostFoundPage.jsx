import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_ITEMS = [
  { id: '1', item_name: 'Gold Wedding Ring', description: 'Found inside the pool side shower room, inscription reads "A&R 2020"', found_location: 'Pool Shower Room', found_date: '2026-07-16', found_by: 'Anita Devi (Housekeeper)', claimed_status: 'Unclaimed', claimant_name: '', claimant_phone: '', notes: 'Safe locker #4' },
  { id: '2', item_name: 'iPhone 15 Pro Max', description: 'Titanium grey, no phone cover. Left on table 12 of restaurant', found_location: 'Beachside Restaurant', found_date: '2026-07-15', found_by: 'Subhash (Waiter)', claimed_status: 'Claimed', claimant_name: 'John Doe', claimant_phone: '+91 98765 43210', notes: 'Verified via photo verification and passcode unlock' },
  { id: '3', item_name: 'Scuba Diving Fins', description: 'Mares Avanti Quattro, yellow colour, size L', found_location: 'Scuba Diving Deck', found_date: '2026-07-10', found_by: 'Manjunath (Instructor)', claimed_status: 'Unclaimed', claimant_name: '', claimant_phone: '', notes: 'Storage rack #2' }
];

export default function LostFoundPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [filter, setFilter] = useState('All'); // All, Unclaimed, Claimed

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // for claiming
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [foundLocation, setFoundLocation] = useState('');
  const [foundDate, setFoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [foundBy, setFoundBy] = useState('');
  const [notes, setNotes] = useState('');

  // Claim form states
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimantName, setClaimantName] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lost_found_items')
        .select('*')
        .order('found_date', { ascending: false });

      if (error) throw error;
      setItems(data || []);
      setIsDemo(false);
    } catch (err) {
      console.warn('Lost and found tables not configured. Using fallback simulation.', err.message);
      setItems(MOCK_ITEMS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault();
    const payload = {
      item_name: itemName,
      description,
      found_location: foundLocation,
      found_date: foundDate,
      found_by: foundBy,
      claimed_status: 'Unclaimed',
      claimant_name: '',
      claimant_phone: '',
      notes
    };

    if (isDemo) {
      setItems([{ id: Date.now().toString(), ...payload }, ...items]);
      setIsModalOpen(false);
      resetForm();
      return;
    }

    try {
      const { error } = await supabase.from('lost_found_items').insert([payload]);
      if (error) throw error;
      setIsModalOpen(false);
      resetForm();
      fetchItems();
    } catch (err) {
      alert('Error creating item entry: ' + err.message);
    }
  };

  const handleClaimItem = async (e) => {
    e.preventDefault();
    const payload = {
      claimed_status: 'Claimed',
      claimant_name: claimantName,
      claimant_phone: claimantPhone,
      claimed_date: new Date().toISOString().split('T')[0]
    };

    if (isDemo) {
      setItems(items.map(item => item.id === selectedItem.id ? { ...item, ...payload } : item));
      setIsClaimModalOpen(false);
      setSelectedItem(null);
      setClaimantName('');
      setClaimantPhone('');
      return;
    }

    try {
      const { error } = await supabase
        .from('lost_found_items')
        .update(payload)
        .eq('id', selectedItem.id);

      if (error) throw error;
      setIsClaimModalOpen(false);
      setSelectedItem(null);
      setClaimantName('');
      setClaimantPhone('');
      fetchItems();
    } catch (err) {
      alert('Error claiming item: ' + err.message);
    }
  };

  const resetForm = () => {
    setItemName('');
    setDescription('');
    setFoundLocation('');
    setFoundDate(new Date().toISOString().split('T')[0]);
    setFoundBy('');
    setNotes('');
  };

  const filteredItems = items.filter(item => {
    if (filter === 'All') return true;
    return item.claimed_status === filter;
  });

  return (
    <CrmLayout title="Lost & Found Registry" subtitle="Manage lost guest belongings and custody returns.">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
        <div className="flex gap-2">
          {['All', 'Unclaimed', 'Claimed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === f
                  ? 'bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-900'
                  : 'bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 text-stone-600 dark:text-stone-300'
              }`}
            >
              {f} ({items.filter(item => f === 'All' || item.claimed_status === f).length})
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 font-semibold rounded-xl text-xs transition-colors shadow-sm"
        >
          Add Found Item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-stone-900/10 border-t-stone-900 rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 text-center py-16 px-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
          <p className="text-stone-400 text-sm">No logged items match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-serif text-lg text-stone-900 dark:text-stone-50">{item.item_name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    item.claimed_status === 'Claimed'
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                      : 'bg-amber-50 border-amber-250 text-amber-700'
                  }`}>
                    {item.claimed_status}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">{item.description}</p>
                <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 border-t border-stone-100 dark:border-stone-850 pt-3">
                  <p><span className="text-stone-400">Found Loc:</span> {item.found_location}</p>
                  <p><span className="text-stone-400">Found Date:</span> {item.found_date}</p>
                  <p><span className="text-stone-400">Found By:</span> {item.found_by}</p>
                  {item.notes && <p><span className="text-stone-400">Custody Notes:</span> {item.notes}</p>}
                  {item.claimed_status === 'Claimed' && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/40 mt-3 text-[11px] text-emerald-800 dark:text-emerald-300">
                      <p className="font-bold uppercase tracking-wider text-[9px] mb-1">Claimant Info</p>
                      <p>Name: {item.claimant_name}</p>
                      <p>Phone: {item.claimant_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {item.claimed_status === 'Unclaimed' && (
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setIsClaimModalOpen(true);
                  }}
                  className="w-full mt-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 text-xs font-semibold rounded-xl"
                >
                  Mark as Claimed
                </button>
              )}
            </div>
          ))}
        </div>
      )}

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
                <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50">Log Found Guest Item</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddItem} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Item Title *</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Rayban Sunglasses"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="2"
                    placeholder="e.g. Left at Table 4. Scratched left lens."
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Location Found *</label>
                    <input
                      type="text"
                      required
                      value={foundLocation}
                      onChange={(e) => setFoundLocation(e.target.value)}
                      placeholder="e.g. Poolside"
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={foundDate}
                      onChange={(e) => setFoundDate(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Discovered By *</label>
                  <input
                    type="text"
                    required
                    value={foundBy}
                    onChange={(e) => setFoundBy(e.target.value)}
                    placeholder="e.g. Anita Gowda (HK)"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Storage / Custody Location</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Front desk safe locker #2"
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

      {/* Claim Item Modal */}
      <AnimatePresence>
        {isClaimModalOpen && (
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl">
              <h3 className="font-serif text-lg text-stone-900 dark:text-stone-50 mb-2">Claim Belonging</h3>
              <p className="text-xs text-stone-400 mb-4">Provide guest name and verification details to close return custody.</p>
              
              <form onSubmit={handleClaimItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Claimant Name *</label>
                  <input
                    type="text"
                    required
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Claimant Contact *</label>
                  <input
                    type="text"
                    required
                    value={claimantPhone}
                    onChange={(e) => setClaimantPhone(e.target.value)}
                    placeholder="e.g. +91 99999 88888"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsClaimModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-stone-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-brand-gold text-stone-900 hover:bg-brand-gold/90 text-xs font-bold rounded-lg"
                  >
                    Complete Return
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </CrmLayout>
  );
}
