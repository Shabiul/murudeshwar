import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_SHIFTS = [
  { id: 'shift-1', name: 'Naveen Kumar', shift_date: '2026-07-17', shift_type: 'Morning', notes: 'First floor reception duty' },
  { id: 'shift-2', name: 'Sandesh Hegde', shift_date: '2026-07-17', shift_type: 'Evening', notes: 'Beach activities supervision' },
  { id: 'shift-3', name: 'Divya Gowda', shift_date: '2026-07-17', shift_type: 'Night', notes: 'Resort main gate security' },
  { id: 'shift-4', name: 'Ravi Bhat', shift_date: '2026-07-18', shift_type: 'Morning', notes: 'Kitchen logistics handover' }
];

const MOCK_STAFF = ['Naveen Kumar', 'Sandesh Hegde', 'Divya Gowda', 'Ravi Bhat', 'Sunita Rao', 'Kishore Nayak'];

export default function ShiftManagementPage() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: MOCK_STAFF[0],
    shift_date: new Date().toISOString().split('T')[0],
    shift_type: 'Morning',
    notes: ''
  });

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_shifts')
        .select('*')
        .order('shift_date', { ascending: true });

      if (error) throw error;
      setShifts(data && data.length > 0 ? data : MOCK_SHIFTS);
    } catch (err) {
      console.error('Error fetching shifts:', err);
      setShifts(MOCK_SHIFTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleAssignShift = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        name: form.name,
        shift_date: form.shift_date,
        shift_type: form.shift_type,
        notes: form.notes
      };

      const { data, error } = await supabase
        .from('crm_shifts')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setShifts(prev => [...prev, data[0]]);
      } else {
        const newMock = {
          id: `shift-mock-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString()
        };
        setShifts(prev => [...prev, newMock]);
      }

      setIsAssignOpen(false);
      setForm({
        name: MOCK_STAFF[0],
        shift_date: new Date().toISOString().split('T')[0],
        shift_type: 'Morning',
        notes: ''
      });
    } catch (err) {
      console.error('Error assigning shift:', err);
      // fallback mock update
      const newMock = {
        id: `shift-mock-${Date.now()}`,
        ...form,
        created_at: new Date().toISOString()
      };
      setShifts(prev => [...prev, newMock]);
      setIsAssignOpen(false);
    }
  };

  // Roster Auto-Allocator Algorithm
  const handleAutoAllocate = () => {
    const today = new Date();
    const nextThreeDays = Array.from({ length: 3 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const shiftTypes = ['Morning', 'Evening', 'Night'];
    const generated = [];

    nextThreeDays.forEach(date => {
      // Allocate 3 random staff members for the 3 shift types
      const shuffledStaff = [...MOCK_STAFF].sort(() => 0.5 - Math.random());
      shiftTypes.forEach((type, idx) => {
        generated.push({
          id: `shift-auto-${date}-${type}`,
          name: shuffledStaff[idx],
          shift_date: date,
          shift_type: type,
          notes: `Auto-allocated shift for ${type} slot`
        });
      });
    });

    setShifts(prev => [...prev.filter(s => !s.id.includes('auto')), ...generated]);
  };

  // Group shifts by date for cleaner timeline dashboard
  const groupedShifts = shifts.reduce((groups, shift) => {
    const date = shift.shift_date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(shift);
    return groups;
  }, {});

  return (
    <CrmLayout title="Shift Roster Control" subtitle="Maintain daily duty schedules, assign shift slots, and run auto-allocation algorithms.">
      <div className="relative font-sans text-slate-800">
        
        {/* KPI Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Morning Crew</p>
            <h3 className="text-3xl font-serif text-slate-900">
              {shifts.filter(s => s.shift_type === 'Morning').length} Staff
            </h3>
            <p className="text-[10px] text-amber-600 mt-2">● Active breakfast / checkouts</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Evening Crew</p>
            <h3 className="text-3xl font-serif text-indigo-600">
              {shifts.filter(s => s.shift_type === 'Evening').length} Staff
            </h3>
            <p className="text-[10px] text-indigo-600 mt-2">● Beach activities & kitchen</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Night Watch</p>
            <h3 className="text-3xl font-serif text-rose-600">
              {shifts.filter(s => s.shift_type === 'Night').length} Staff
            </h3>
            <p className="text-[10px] text-rose-600 mt-2">● Security & check-ins</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Staff Pool</p>
            <h3 className="text-3xl font-serif text-slate-900">{MOCK_STAFF.length} Available</h3>
            <p className="text-[10px] text-slate-500 mt-2">Ready to dispatch</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <button
            onClick={handleAutoAllocate}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            🤖 Run Shift Auto-Allocator
          </button>
          <button
            onClick={() => setIsAssignOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            👤 Assign Duty Shift
          </button>
        </div>

        {/* Calendar Timeline Lists */}
        <div className="space-y-8">
          {loading ? (
            <div className="bg-white border border-slate-200/80 rounded-[32px] p-12 text-center text-slate-400">
              Loading current duty rosters...
            </div>
          ) : Object.keys(groupedShifts).length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-[32px] p-12 text-center text-slate-400">
              No shifts assigned yet. Click "Run Shift Auto-Allocator" or manually assign.
            </div>
          ) : (
            Object.keys(groupedShifts).sort().map(date => (
              <div key={date} className="bg-white border border-slate-200/80 rounded-[32px] p-8 shadow-sm">
                <h3 className="font-serif text-xl text-slate-950 mb-6 flex items-center gap-2">
                  📅 {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Morning', 'Evening', 'Night'].map(type => {
                    const matchedShifts = groupedShifts[date].filter(s => s.shift_type === type);
                    return (
                      <div key={type} className="bg-slate-50/60 border border-slate-100 rounded-2xl p-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            type === 'Morning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            type === 'Evening' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {type} Shift
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {type === 'Morning' ? '06:00 - 14:00' : type === 'Evening' ? '14:00 - 22:00' : '22:00 - 06:00'}
                          </span>
                        </div>

                        {matchedShifts.length === 0 ? (
                          <p className="text-slate-400 text-xs italic py-4">No staff assigned</p>
                        ) : (
                          <div className="space-y-3">
                            {matchedShifts.map(s => (
                              <div key={s.id} className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-xs">
                                <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                                <p className="text-[10px] text-slate-500 mt-1">{s.notes || 'General resort duties'}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Assign Shift Modal */}
        <AnimatePresence>
          {isAssignOpen && (
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
                  onClick={() => setIsAssignOpen(false)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-800 transition-colors"
                >
                  ✕
                </button>

                <h3 className="font-serif text-3xl text-slate-900 mb-1">Assign Shift</h3>
                <p className="text-slate-500 text-xs mb-6 font-medium">Create a duty entry for the resort roster.</p>

                <form onSubmit={handleAssignShift} className="space-y-4 text-left font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Staff Member</label>
                    <select
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400 font-medium"
                    >
                      {MOCK_STAFF.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Duty Date</label>
                      <input
                        type="date"
                        required
                        value={form.shift_date}
                        onChange={(e) => setForm(prev => ({ ...prev, shift_date: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Shift Type</label>
                      <select
                        value={form.shift_type}
                        onChange={(e) => setForm(prev => ({ ...prev, shift_type: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                      >
                        <option value="Morning">Morning (06:00 - 14:00)</option>
                        <option value="Evening">Evening (14:00 - 22:00)</option>
                        <option value="Night">Night (22:00 - 06:00)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Duty Notes / Area</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Front desk reception duty..."
                      value={form.notes}
                      onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Confirm Assignment
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
