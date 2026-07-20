import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_VISITORS = [
  { id: 'vis-1', name: 'Rohan Sharma', vehicle_number: 'KA-30-M-4819', purpose: 'Vendor Delivery', entry_time: '2026-07-17T09:30:00Z', exit_time: null, parking_slot: 'Slot A1' },
  { id: 'vis-2', name: 'Sanjay Kamath', vehicle_number: 'KA-02-H-7722', purpose: 'Day Visit Guest', entry_time: '2026-07-17T11:15:00Z', exit_time: '2026-07-17T13:00:00Z', parking_slot: 'Slot B3' },
  { id: 'vis-3', name: 'Anil Desai', vehicle_number: 'KA-31-P-9005', purpose: 'Resort Maintenance Crew', entry_time: '2026-07-17T12:00:00Z', exit_time: null, parking_slot: 'Slot A2' }
];

export default function VisitorManagementPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    vehicle_number: '',
    purpose: '',
    parking_slot: 'Slot A1'
  });

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_visitors')
        .select('*')
        .order('entry_time', { ascending: false });

      if (error) throw error;
      setVisitors(data && data.length > 0 ? data : MOCK_VISITORS);
    } catch (err) {
      console.error('Error fetching visitors:', err);
      setVisitors(MOCK_VISITORS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleRegisterVisitor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        vehicle_number: form.vehicle_number,
        purpose: form.purpose,
        parking_slot: form.parking_slot,
        entry_time: new Date().toISOString(),
        exit_time: null
      };

      const { data, error } = await supabase
        .from('crm_visitors')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setVisitors(prev => [data[0], ...prev]);
      } else {
        const newMock = {
          id: `vis-mock-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString()
        };
        setVisitors(prev => [newMock, ...prev]);
      }

      setIsRegisterOpen(false);
      setForm({
        name: '',
        vehicle_number: '',
        purpose: '',
        parking_slot: 'Slot A1'
      });
    } catch (err) {
      console.error('Error registering visitor:', err);
      // fallback mock update
      const newMock = {
        id: `vis-mock-${Date.now()}`,
        ...form,
        entry_time: new Date().toISOString(),
        exit_time: null,
        created_at: new Date().toISOString()
      };
      setVisitors(prev => [newMock, ...prev]);
      setIsRegisterOpen(false);
    }
  };

  const handleRegisterExit = async (id) => {
    const exitTime = new Date().toISOString();
    try {
      const { error } = await supabase
        .from('crm_visitors')
        .update({ exit_time: exitTime })
        .eq('id', id);

      if (error) throw error;

      setVisitors(prev => prev.map(v => v.id === id ? { ...v, exit_time: exitTime } : v));
    } catch (err) {
      console.error('Error registering exit:', err);
      setVisitors(prev => prev.map(v => v.id === id ? { ...v, exit_time: exitTime } : v));
    }
  };

  const activeVisitors = visitors.filter(v => !v.exit_time);
  const occupiedSlots = activeVisitors.map(v => v.parking_slot).filter(Boolean);

  return (
    <CrmLayout title="Visitor Log & Parking" subtitle="Trace entry/exit logs of day visitors, vendors, and manage resort parking allocations.">
      <div className="relative font-sans text-slate-800">
        
        {/* KPI Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Active Visitors</p>
            <h3 className="text-3xl font-serif text-slate-900">{activeVisitors.length} Registered</h3>
            <p className="text-[10px] text-amber-600 mt-2">● Currently inside resort perimeter</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Occupied Parking Slots</p>
            <h3 className="text-3xl font-serif text-indigo-600">{occupiedSlots.length} Slots</h3>
            <p className="text-[10px] text-indigo-600 mt-2">● Assigned to visitor vehicles</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Logs Today</p>
            <h3 className="text-3xl font-serif text-slate-900">{visitors.length} Logs</h3>
            <p className="text-[10px] text-slate-500 mt-2">Overall visitors roster</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
          <h3 className="font-serif text-lg text-slate-800">Logs Ledger</h3>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="w-full lg:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            🚗 Register Visitor Entry
          </button>
        </div>

        {/* Visitors Table */}
        <div className="bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-serif text-xl text-slate-900">Entry Logs</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  <th className="py-4 px-8">Visitor Name</th>
                  <th className="py-4 px-6">Vehicle Number</th>
                  <th className="py-4 px-6">Purpose of Visit</th>
                  <th className="py-4 px-6">Entry Time</th>
                  <th className="py-4 px-6">Parking Slot</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">Loading visitor logs...</td>
                  </tr>
                ) : visitors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">No visitors logged today.</td>
                  </tr>
                ) : (
                  visitors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-8 font-semibold text-slate-900">{v.name}</td>
                      <td className="py-4 px-6 font-mono text-slate-800">{v.vehicle_number || 'N/A'}</td>
                      <td className="py-4 px-6 text-slate-500 font-medium">{v.purpose}</td>
                      <td className="py-4 px-6 text-slate-400">{new Date(v.entry_time).toLocaleTimeString('en-IN')}</td>
                      <td className="py-4 px-6 font-semibold text-amber-700">{v.parking_slot || 'None'}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          v.exit_time ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {v.exit_time ? `Exited ${new Date(v.exit_time).toLocaleTimeString('en-IN')}` : 'Inside Resort'}
                        </span>
                      </td>
                      <td className="py-4 px-8 text-right">
                        {!v.exit_time && (
                          <button
                            onClick={() => handleRegisterExit(v.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold uppercase text-[9px] tracking-wider px-3 py-1.5 rounded-xl transition-all"
                          >
                            ✓ Checkout Exit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Register Visitor Modal */}
        <AnimatePresence>
          {isRegisterOpen && (
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
                className="bg-white border border-slate-200 p-8 rounded-[32px] w-full max-w-md shadow-2xl relative my-8"
              >
                <button
                  onClick={() => setIsRegisterOpen(false)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-800 transition-colors"
                >
                  ✕
                </button>

                <h3 className="font-serif text-3xl text-slate-900 mb-1">Register Visitor</h3>
                <p className="text-slate-500 text-xs mb-6 font-medium">Record a new vehicle entry at the gate.</p>

                <form onSubmit={handleRegisterVisitor} className="space-y-4 text-left font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Visitor Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohan Sharma"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Vehicle Number</label>
                      <input
                        type="text"
                        placeholder="e.g. KA-30-M-4819"
                        value={form.vehicle_number}
                        onChange={(e) => setForm(prev => ({ ...prev, vehicle_number: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Parking Slot</label>
                      <select
                        value={form.parking_slot}
                        onChange={(e) => setForm(prev => ({ ...prev, parking_slot: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                      >
                        <option value="Slot A1">Slot A1 (Near Lobby)</option>
                        <option value="Slot A2">Slot A2 (Near Lobby)</option>
                        <option value="Slot B1">Slot B1 (Poolside)</option>
                        <option value="Slot B2">Slot B2 (Poolside)</option>
                        <option value="Slot B3">Slot B3 (Beach side)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Purpose of Visit</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vendor Delivery, Maintenance, etc."
                      value={form.purpose}
                      onChange={(e) => setForm(prev => ({ ...prev, purpose: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Confirm & Register Visitor
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
