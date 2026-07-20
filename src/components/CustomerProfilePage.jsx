import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_CUSTOMERS = [
  {
    id: 'c1',
    full_name: 'Akash Hegde',
    email: 'akash@example.com',
    phone: '+91 98765 43210',
    vip_tag: true,
    blacklist_tag: false,
    preferred_room: 'Suite',
    preferred_activities: ['Scuba Diving', 'Sunset Cruise'],
    preferred_food: 'Vegetarian Indian',
    preferred_payment_method: 'UPI',
    emergency_contact_name: 'Vidya Hegde',
    emergency_contact_phone: '+91 98765 43211',
    tags: ['Frequent Guest', 'Early Bird'],
    family_members: [
      { name: 'Vidya Hegde', relationship: 'Spouse' },
      { name: 'Karan Hegde', relationship: 'Son' }
    ],
    notes: 'Likes high floor rooms, quiet environments, and extra pillows.',
    bookings: [
      { id: 'b1', service_type: 'Stay', created_at: '2026-06-10T12:00:00Z', details: { room_type: 'Suite', nights: 3, total_paid: 22500 } },
      { id: 'b2', service_type: 'Scuba', created_at: '2026-06-11T09:00:00Z', details: { dive_type: 'Deep Sea', participants: 2, total_paid: 7000 } },
    ]
  },
  {
    id: 'c2',
    full_name: 'Sarah Mitchell',
    email: 'sarah@example.com',
    phone: '+1 415 555 2671',
    vip_tag: false,
    blacklist_tag: false,
    preferred_room: 'Beachfront Villa',
    preferred_activities: ['Scuba Diving'],
    preferred_food: 'Continental seafood',
    preferred_payment_method: 'Credit Card',
    emergency_contact_name: 'David Mitchell',
    emergency_contact_phone: '+1 415 555 2672',
    tags: ['International'],
    family_members: [],
    notes: 'Prefers early morning scuba sessions.',
    bookings: [
      { id: 'b3', service_type: 'Stay', created_at: '2026-05-15T12:00:00Z', details: { room_type: 'Beachfront Villa', nights: 5, total_paid: 60000 } },
    ]
  }
];

export default function CustomerProfilePage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);

  // Modal forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vipTag, setVipTag] = useState(false);
  const [blacklistTag, setBlacklistTag] = useState(false);
  const [preferredRoom, setPreferredRoom] = useState('Standard Room');
  const [prefActivityInput, setPrefActivityInput] = useState('');
  const [preferredActivities, setPreferredActivities] = useState([]);
  const [preferredFood, setPreferredFood] = useState('');
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState('UPI');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState([]);
  
  // Family members list in form
  const [familyMembers, setFamilyMembers] = useState([]);
  const [famName, setFamName] = useState('');
  const [famRelation, setFamRelation] = useState('Spouse');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;

      const customersWithBookings = await Promise.all((data || []).map(async (cust) => {
        const { data: bookings } = await supabase
          .from('leads')
          .select('id, service_type, created_at, details')
          .eq('customer_id', cust.id);
        return {
          ...cust,
          bookings: bookings || [],
          tags: cust.tags || [],
          family_members: cust.family_members || []
        };
      }));

      setCustomers(customersWithBookings);
      setIsDemo(false);
    } catch (err) {
      console.warn('Customers schema not ready yet. Using mock demo.', err.message);
      setCustomers(MOCK_CUSTOMERS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setVipTag(false);
    setBlacklistTag(false);
    setPreferredRoom('Standard Room');
    setPreferredActivities([]);
    setPreferredFood('');
    setPreferredPaymentMethod('UPI');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setNotes('');
    setTags([]);
    setFamilyMembers([]);
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();

    const payload = {
      full_name: fullName,
      email,
      phone,
      vip_tag: vipTag,
      blacklist_tag: blacklistTag,
      preferred_room: preferredRoom,
      preferred_activities: preferredActivities,
      preferred_food: preferredFood,
      preferred_payment_method: preferredPaymentMethod,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
      notes,
      tags,
      family_members: familyMembers
    };

    if (isDemo) {
      const newCust = {
        id: Date.now().toString(),
        ...payload,
        bookings: [],
      };
      setCustomers([...customers, newCust]);
      setIsAddModalOpen(false);
      return;
    }

    try {
      const { error } = await supabase.from('customers').insert([payload]);
      if (error) throw error;
      setIsAddModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert('Error creating customer: ' + err.message);
    }
  };

  const addActivity = () => {
    if (prefActivityInput.trim() && !preferredActivities.includes(prefActivityInput.trim())) {
      setPreferredActivities([...preferredActivities, prefActivityInput.trim()]);
      setPrefActivityInput('');
    }
  };

  const addTag = () => {
    if (tagsInput.trim() && !tags.includes(tagsInput.trim())) {
      setTags([...tags, tagsInput.trim()]);
      setTagsInput('');
    }
  };

  const addFamilyMember = () => {
    if (famName.trim()) {
      setFamilyMembers([...familyMembers, { name: famName.trim(), relationship: famRelation }]);
      setFamName('');
    }
  };

  const calculateLifetimeSpend = (cust) => {
    if (!cust.bookings) return 0;
    return cust.bookings.reduce((sum, b) => {
      const amt = Number(b.details?.total_paid) || 0;
      return sum + amt;
    }, 0);
  };

  return (
    <CrmLayout title="Customer 360° Profiles" subtitle="Permanent guest dossiers. Track lifetime visits, total spend, and room/food preferences.">
      {isDemo && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="font-semibold text-sm">Demo Simulation Active</p>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Showing simulation mode. Please run `scripts/supabase_phase1_setup.sql` in your Supabase SQL editor to link customers live.
            </p>
          </div>
          <button
            onClick={fetchCustomers}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-medium transition-colors shrink-0"
          >
            Retry Database
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer Directory List */}
        <div className="lg:col-span-1 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-850 p-6 shadow-sm flex flex-col h-[700px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg text-stone-900 dark:text-stone-50 font-bold">Directory</h3>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-850 font-semibold rounded-xl text-xs transition-colors shadow-sm"
            >
              + Add Profile
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-stone-900/10 border-t-stone-900 rounded-full animate-spin"></div>
              </div>
            ) : customers.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8">No customer profiles added yet.</p>
            ) : (
              customers.map(cust => (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCust(cust)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedCust?.id === cust.id
                      ? 'bg-stone-50 dark:bg-stone-850 border-stone-950 dark:border-stone-100 shadow-sm'
                      : 'border-stone-150 dark:border-stone-800 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">{cust.full_name}</span>
                    <div className="flex gap-1">
                      {cust.vip_tag && <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded">VIP</span>}
                      {cust.blacklist_tag && <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-[8px] font-bold px-1.5 py-0.5 rounded">BLACKLIST</span>}
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{cust.phone}</p>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400">
                    <span>{cust.bookings?.length || 0} Bookings</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">₹{calculateLifetimeSpend(cust).toLocaleString('en-IN')} spend</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Customer Details Block (Customer 360) */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-850 p-8 shadow-sm h-[700px] overflow-y-auto">
          {selectedCust ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-800 pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-50">{selectedCust.full_name}</h2>
                    <div className="flex gap-1">
                      {selectedCust.vip_tag && <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">VIP</span>}
                      {selectedCust.blacklist_tag && <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded">Blacklisted</span>}
                    </div>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">{selectedCust.email} | {selectedCust.phone}</p>
                  
                  {/* Guest Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {selectedCust.tags?.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-[10px] rounded-full text-stone-600 dark:text-stone-300 border border-stone-200/50 dark:border-stone-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest block">Lifetime Spend</span>
                  <span className="text-2xl font-serif text-stone-900 dark:text-stone-50 mt-0.5">₹{calculateLifetimeSpend(selectedCust).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Guest Preferences */}
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Guest Preferences</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-stone-50 dark:bg-stone-850 p-5 rounded-2xl border border-stone-100 dark:border-stone-800">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Preferred Room</span>
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">{selectedCust.preferred_room || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Dining Choice</span>
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">{selectedCust.preferred_food || 'No preference'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Payment Mode</span>
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">{selectedCust.preferred_payment_method || 'UPI'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Favored Activities</span>
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">
                      {selectedCust.preferred_activities?.join(', ') || 'None log'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Family Members */}
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Family Members ({selectedCust.family_members?.length || 0})</h4>
                {selectedCust.family_members && selectedCust.family_members.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedCust.family_members.map((member, idx) => (
                      <div key={idx} className="p-3 border border-stone-100 dark:border-stone-850 rounded-xl bg-stone-50/50 dark:bg-stone-850/40 text-xs">
                        <p className="font-semibold text-stone-800 dark:text-stone-200">{member.name}</p>
                        <p className="text-stone-400 mt-0.5">{member.relationship}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No family members registered.</p>
                )}
              </div>

              {/* Contact Notes */}
              {selectedCust.notes && (
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Internal Service Notes</h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 bg-amber-50/60 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900 p-4 rounded-2xl italic leading-relaxed">
                    "{selectedCust.notes}"
                  </p>
                </div>
              )}

              {/* Emergency Contacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-stone-200/60 dark:border-stone-800 p-4 rounded-2xl">
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Emergency Contact</h4>
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">{selectedCust.emergency_contact_name || 'No contact configured'}</p>
                  {selectedCust.emergency_contact_phone && <p className="text-xs text-stone-500 mt-0.5">{selectedCust.emergency_contact_phone}</p>}
                </div>
              </div>

              {/* Customer Timeline */}
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Customer Timeline</h4>
                <div className="relative border-l border-stone-200 dark:border-stone-800 ml-3 space-y-4">
                  <div className="relative pl-6">
                    <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-stone-900 dark:bg-stone-50 rounded-full" />
                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">Check-In Completed</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">July 16, 2026 | Frontdesk Staff</p>
                  </div>
                  <div className="relative pl-6">
                    <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-stone-400 dark:bg-stone-700 rounded-full" />
                    <p className="text-xs font-semibold text-stone-700 dark:text-stone-400">Scuba Diving Booking Verified</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">July 15, 2026 | Dive Instructor</p>
                  </div>
                </div>
              </div>

              {/* Booking History */}
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Historical Visits ({selectedCust.bookings?.length || 0})</h4>
                {selectedCust.bookings && selectedCust.bookings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCust.bookings.map(book => (
                      <div key={book.id} className="flex justify-between items-center p-4 border border-stone-150 dark:border-stone-800 rounded-2xl hover:bg-stone-50/40">
                        <div>
                          <span className="text-xs font-bold text-stone-500 block uppercase tracking-wider">{book.service_type}</span>
                          <span className="text-xs text-stone-400 mt-1 block">
                            Logged: {new Date(book.created_at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-stone-900 dark:text-stone-50">
                            ₹{(book.details?.total_paid || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No bookings recorded for this guest profile yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <svg className="w-12 h-12 text-stone-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <h3 className="font-serif text-lg text-stone-900 dark:text-stone-50">Select Customer Profile</h3>
              <p className="text-xs text-stone-400 mt-1">Choose a customer directory record to view booking history, lifetime spends and VIP status.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800"
            >
              <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-850 flex justify-between items-center bg-stone-50 dark:bg-stone-850">
                <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50">Add Customer Profile</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveCustomer} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Anand Gowda"
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 99999 88888"
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Add Tags</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="e.g. Vegetarian"
                        className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-2 py-1 focus:outline-none"
                      />
                      <button type="button" onClick={addTag} className="px-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs">Add</button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 items-center py-2 bg-stone-50 dark:bg-stone-850 px-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="vip"
                      checked={vipTag}
                      onChange={(e) => setVipTag(e.target.checked)}
                      className="rounded text-brand-gold focus:ring-brand-gold"
                    />
                    <label htmlFor="vip" className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase cursor-pointer">VIP Guest</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="blacklist"
                      checked={blacklistTag}
                      onChange={(e) => setBlacklistTag(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <label htmlFor="blacklist" className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase cursor-pointer">Blacklist Guest</label>
                  </div>
                </div>

                {/* Add Family Members in Form */}
                <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Add Family Members</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={famName}
                      onChange={(e) => setFamName(e.target.value)}
                      placeholder="Family Member Name"
                      className="flex-1 text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-1.5 focus:outline-none"
                    />
                    <select
                      value={famRelation}
                      onChange={(e) => setFamRelation(e.target.value)}
                      className="text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-1.5"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Friend">Friend</option>
                    </select>
                    <button type="button" onClick={addFamilyMember} className="px-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs">Add</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Preferred Room Type</label>
                    <select
                      value={preferredRoom}
                      onChange={(e) => setPreferredRoom(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                    >
                      <option value="Standard Room">Standard Room</option>
                      <option value="Deluxe Room">Deluxe Room</option>
                      <option value="Suite">Suite</option>
                      <option value="Family Room">Family Room</option>
                      <option value="Beachfront Villa">Beachfront Villa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Preferred Food Choice</label>
                    <input
                      type="text"
                      value={preferredFood}
                      onChange={(e) => setPreferredFood(e.target.value)}
                      placeholder="e.g. Vegetarian, Gluten Free"
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Favored Activities</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={prefActivityInput}
                      onChange={(e) => setPrefActivityInput(e.target.value)}
                      placeholder="e.g. Deep Sea Diving"
                      className="flex-1 text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addActivity}
                      className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="e.g. Spouse, Friend"
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="+91 98888 77777"
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Internal Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2.5"
                    placeholder="Guest details, service expectations..."
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold rounded-xl hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl"
                  >
                    Create Profile
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
