import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const LAUNDRY_ITEMS = [
  { id: '1', item: 'Bedsheets', dirty: 45, washing: 20, drying: 15, ready: 120 },
  { id: '2', item: 'Towels', dirty: 60, washing: 30, drying: 25, ready: 200 },
  { id: '3', item: 'Curtains', dirty: 5, washing: 0, drying: 2, ready: 40 },
  { id: '4', item: 'Blankets', dirty: 12, washing: 8, drying: 4, ready: 80 },
  { id: '5', item: 'Pillow Covers', dirty: 90, washing: 40, drying: 30, ready: 300 },
];

const MOCK_TASKS = [
  { id: '1', room: { room_number: '101', id: 'r1' }, status: 'Pending', priority: 'Medium', assigned_staff: null, notes: 'Guests checkout at 11 AM' },
  { id: '2', room: { room_number: '102', id: 'r2' }, status: 'In Progress', priority: 'High', assigned_staff: { id: 's1', full_name: 'Ramesh Kumar' }, notes: 'Vip room checkin today' },
  { id: '3', room: { room_number: '201', id: 'r3' }, status: 'Completed', priority: 'Low', assigned_staff: { id: 's2', full_name: 'Anita Devi' }, notes: '' },
];

const MOCK_LOST_FOUND = [
  { id: '1', item_name: 'Gold Ring', found_location: 'Room 201', found_by: 'Anita Devi', claimed_status: 'Found', created_at: '2026-07-16T10:00:00Z' },
  { id: '2', item_name: 'iPhone Charger', found_location: 'Reception Lobby', found_by: 'Ramesh Kumar', claimed_status: 'Claimed', created_at: '2026-07-15T15:30:00Z' },
];

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [lostFound, setLostFound] = useState([]);
  const [laundry, setLaundry] = useState(LAUNDRY_ITEMS);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // tasks, laundry, lostfound

  // Form states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLfModalOpen, setIsLfModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskNotes, setTaskNotes] = useState('');

  // Lost & found form states
  const [itemName, setItemName] = useState('');
  const [foundLocation, setFoundLocation] = useState('');
  const [foundBy, setFoundBy] = useState('');
  const [claimedStatus, setClaimedStatus] = useState('Found');

  const [roomsList, setRoomsList] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Try to fetch rooms, staff, and housekeeping
      const roomsRes = await supabase.from('rooms').select('id, room_number');
      const staffRes = await supabase.from('staff').select('id, full_name');
      const housekeepingRes = await supabase.from('housekeeping_tasks').select('*, room:rooms(room_number), assigned_staff:staff(full_name)');
      const lfRes = await supabase.from('lost_found_items').select('*').order('created_at', { ascending: false });

      if (roomsRes.error || staffRes.error || housekeepingRes.error) {
        throw new Error('Supabase tables not configured.');
      }

      setRoomsList(roomsRes.data || []);
      setStaff(staffRes.data || []);
      setTasks(housekeepingRes.data || []);
      setLostFound(lfRes.data || []);
      setIsDemo(false);
    } catch (err) {
      console.warn('Housekeeping schemas not fully ready. Using demo simulation.', err.message);
      setTasks(MOCK_TASKS);
      setStaff([
        { id: 's1', full_name: 'Ramesh Kumar' },
        { id: 's2', full_name: 'Anita Devi' },
        { id: 's3', full_name: 'Sunita Gowda' },
      ]);
      setRoomsList([
        { id: 'r1', room_number: '101' },
        { id: 'r2', room_number: '102' },
        { id: 'r3', room_number: '201' },
        { id: 'r4', room_number: '202' },
        { id: 'r5', room_number: '301' },
      ]);
      setLostFound(MOCK_LOST_FOUND);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }

  const createCleaningTask = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) return;

    const payload = {
      room_id: selectedRoomId,
      assigned_staff_id: assignedStaffId || null,
      priority: taskPriority,
      notes: taskNotes,
      status: assignedStaffId ? 'Assigned' : 'Pending',
    };

    if (isDemo) {
      const roomObj = roomsList.find(r => r.id === selectedRoomId);
      const staffObj = staff.find(s => s.id === assignedStaffId);
      const newTask = {
        id: Date.now().toString(),
        room: roomObj,
        status: payload.status,
        priority: payload.priority,
        assigned_staff: staffObj || null,
        notes: payload.notes,
      };
      setTasks([newTask, ...tasks]);
      setIsTaskModalOpen(false);
      return;
    }

    try {
      const { error } = await supabase.from('housekeeping_tasks').insert([payload]);
      if (error) throw error;
      setIsTaskModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error creating housekeeping task: ' + err.message);
    }
  };

  const autoAssignTasks = () => {
    if (staff.length === 0) {
      alert('No housekeepers registered to auto-assign tasks.');
      return;
    }

    // Calculate current task load for each staff member
    const staffLoads = staff.map(s => {
      const activeCount = tasks.filter(t => t.assigned_staff?.id === s.id && t.status !== 'Completed').length;
      return { ...s, count: activeCount };
    });

    const updatedTasks = tasks.map(t => {
      if (!t.assigned_staff || t.status === 'Pending') {
        // Sort housekeepers by load ascending
        staffLoads.sort((a, b) => a.count - b.count);
        const leastBusy = staffLoads[0];
        leastBusy.count += 1;
        return {
          ...t,
          status: 'Assigned',
          assigned_staff: { id: leastBusy.id, full_name: leastBusy.full_name }
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    alert('Auto-assigned unassigned cleaning tasks to least busy housekeepers!');
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    if (isDemo) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      return;
    }

    try {
      const payload = { status: newStatus };
      if (newStatus === 'In Progress') payload.start_time = new Date().toISOString();
      if (newStatus === 'Completed') payload.completion_time = new Date().toISOString();

      const { error } = await supabase
        .from('housekeeping_tasks')
        .update(payload)
        .eq('id', taskId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  const logLostFoundItem = async (e) => {
    e.preventDefault();
    const payload = {
      item_name: itemName,
      found_location: foundLocation,
      found_by: foundBy,
      claimed_status: claimedStatus,
    };

    if (isDemo) {
      const newItem = {
        id: Date.now().toString(),
        ...payload,
        created_at: new Date().toISOString(),
      };
      setLostFound([newItem, ...lostFound]);
      setIsLfModalOpen(false);
      return;
    }

    try {
      const { error } = await supabase.from('lost_found_items').insert([payload]);
      if (error) throw error;
      setIsLfModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error saving lost and found item: ' + err.message);
    }
  };

  const updateLaundryCount = (itemId, field, amount) => {
    setLaundry(laundry.map(item => {
      if (item.id === itemId) {
        const val = Math.max(0, item[field] + amount);
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Emergency': return 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'High': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default: return 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700';
    }
  };

  return (
    <CrmLayout title="Housekeeping Ops" subtitle="Manage room cleaning queues, laundry operations, and lost & found logs.">
      {isDemo && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="font-semibold text-sm">Demo Simulation Active</p>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Running in simulated mode. Execute `scripts/supabase_phase1_setup.sql` in your Supabase SQL editor to connect dynamic live operations.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-medium transition-colors shrink-0"
          >
            Retry Database
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-850 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 text-sm font-semibold transition-all ${
            activeTab === 'tasks' ? 'border-b-2 border-stone-900 dark:border-stone-50 text-stone-900 dark:text-stone-50' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          Cleaning Queue ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('laundry')}
          className={`pb-3 text-sm font-semibold transition-all ${
            activeTab === 'laundry' ? 'border-b-2 border-stone-900 dark:border-stone-50 text-stone-900 dark:text-stone-50' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          Laundry Inventory
        </button>
        <button
          onClick={() => setActiveTab('lostfound')}
          className={`pb-3 text-sm font-semibold transition-all ${
            activeTab === 'lostfound' ? 'border-b-2 border-stone-900 dark:border-stone-50 text-stone-900 dark:text-stone-50' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          Lost & Found ({lostFound.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-stone-900/10 border-t-stone-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div>
          {/* 1. Cleaning Queue */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
                <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">Assigned Room Cleaning Requests</h3>
                <div className="flex gap-2">
                  <button
                    onClick={autoAssignTasks}
                    className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Auto-Assign Queue
                  </button>
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 font-semibold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Create Task
                  </button>
                </div>
              </div>

              {tasks.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 text-center py-16 px-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
                  <p className="text-stone-400 text-sm">All rooms are currently serviced and clean.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map(task => (
                    <div key={task.id} className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-serif text-lg text-stone-900 dark:text-stone-100">Room {task.room?.room_number}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <p className="text-xs text-stone-500">
                            Status: <span className="font-semibold text-stone-800 dark:text-stone-200">{task.status}</span>
                          </p>
                          <p className="text-xs text-stone-500">
                            Assigned To: <span className="font-semibold text-stone-800 dark:text-stone-200">{task.assigned_staff?.full_name || 'Unassigned'}</span>
                          </p>
                          {task.notes && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-850 p-2 rounded-lg border border-stone-100 dark:border-stone-800">
                              Note: {task.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-stone-150 dark:border-stone-850 pt-4 mt-2">
                        {task.status === 'Pending' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'In Progress')}
                            className="flex-1 py-2 bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 rounded-xl text-xs font-semibold"
                          >
                            Start Cleaning
                          </button>
                        )}
                        {task.status === 'Assigned' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'In Progress')}
                            className="flex-1 py-2 bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 rounded-xl text-xs font-semibold"
                          >
                            Start
                          </button>
                        )}
                        {task.status === 'In Progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'Inspection')}
                            className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold"
                          >
                            Request Inspection
                          </button>
                        )}
                        {task.status === 'Inspection' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'Completed')}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                          >
                            Approve & Complete
                          </button>
                        )}
                        {task.status === 'Completed' && (
                          <div className="w-full text-center text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                            Service Completed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Laundry Inventory */}
          {activeTab === 'laundry' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-500 uppercase tracking-widest">
                    <th className="p-4 sm:p-5">Linen / Item</th>
                    <th className="p-4 sm:p-5">Dirty</th>
                    <th className="p-4 sm:p-5">Washing</th>
                    <th className="p-4 sm:p-5">Drying</th>
                    <th className="p-4 sm:p-5 text-emerald-600">Clean / Ready</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
                  {laundry.map(item => (
                    <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20">
                      <td className="p-4 sm:p-5 font-semibold text-stone-800 dark:text-stone-200">{item.item}</td>
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateLaundryCount(item.id, 'dirty', -1)} className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs hover:bg-stone-200 dark:hover:bg-stone-700 dark:text-white">-</button>
                          <span className="w-8 text-center font-mono dark:text-stone-100">{item.dirty}</span>
                          <button onClick={() => updateLaundryCount(item.id, 'dirty', 1)} className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs hover:bg-stone-200 dark:hover:bg-stone-700 dark:text-white">+</button>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateLaundryCount(item.id, 'washing', -1)} className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs hover:bg-stone-200 dark:hover:bg-stone-700 dark:text-white">-</button>
                          <span className="w-8 text-center font-mono dark:text-stone-100">{item.washing}</span>
                          <button onClick={() => updateLaundryCount(item.id, 'washing', 1)} className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs hover:bg-stone-200 dark:hover:bg-stone-700 dark:text-white">+</button>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateLaundryCount(item.id, 'drying', -1)} className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs hover:bg-stone-200 dark:hover:bg-stone-700 dark:text-white">-</button>
                          <span className="w-8 text-center font-mono dark:text-stone-100">{item.drying}</span>
                          <button onClick={() => updateLaundryCount(item.id, 'drying', 1)} className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs hover:bg-stone-200 dark:hover:bg-stone-700 dark:text-white">+</button>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 text-emerald-700 dark:text-emerald-400 font-semibold">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateLaundryCount(item.id, 'ready', -1)} className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs hover:bg-stone-200 dark:hover:bg-stone-700 dark:text-white">-</button>
                          <span className="w-8 text-center font-mono">{item.ready}</span>
                          <button onClick={() => updateLaundryCount(item.id, 'ready', 1)} className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs hover:bg-stone-200 dark:hover:bg-stone-700 dark:text-white">+</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Lost & Found */}
          {activeTab === 'lostfound' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
                <h3 className="text-sm font-bold text-stone-800 dark:text-stone-250">Lost & Found Log</h3>
                <button
                  onClick={() => setIsLfModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 font-semibold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Log Found Item
                </button>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-500 uppercase tracking-widest">
                      <th className="p-4 sm:p-5">Found Date</th>
                      <th className="p-4 sm:p-5">Item Details</th>
                      <th className="p-4 sm:p-5">Location</th>
                      <th className="p-4 sm:p-5">Found By</th>
                      <th className="p-4 sm:p-5">Claim Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
                    {lostFound.map(item => (
                      <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/10">
                        <td className="p-4 sm:p-5 text-stone-500 font-mono text-xs">{new Date(item.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="p-4 sm:p-5 font-semibold text-stone-800 dark:text-stone-250">{item.item_name}</td>
                        <td className="p-4 sm:p-5 text-stone-600 dark:text-stone-400">{item.found_location}</td>
                        <td className="p-4 sm:p-5 text-stone-600 dark:text-stone-400">{item.found_by}</td>
                        <td className="p-4 sm:p-5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            item.claimed_status === 'Claimed'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {item.claimed_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800"
            >
              <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-850">
                <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50">Create Cleaning Task</h2>
                <button onClick={() => setIsTaskModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={createCleaningTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Select Room *</label>
                  <select
                    required
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="">-- Choose Room --</option>
                    {roomsList.map(room => (
                      <option key={room.id} value={room.id}>Room {room.room_number}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Assign Housekeeper</label>
                  <select
                    value={assignedStaffId}
                    onChange={(e) => setAssignedStaffId(e.target.value)}
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="">-- Unassigned --</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Notes / Instructions</label>
                  <textarea
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    rows="2"
                    placeholder="e.g. Needs extra towels, vacuum floor"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTaskModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lost & Found Modal */}
      <AnimatePresence>
        {isLfModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800"
            >
              <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-850">
                <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50">Log Found Item</h2>
                <button onClick={() => setIsLfModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={logLostFoundItem} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Item Details *</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Leather Wallet"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Found Location *</label>
                  <input
                    type="text"
                    required
                    value={foundLocation}
                    onChange={(e) => setFoundLocation(e.target.value)}
                    placeholder="e.g. Room 102 under bed"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Found By *</label>
                  <input
                    type="text"
                    required
                    value={foundBy}
                    onChange={(e) => setFoundBy(e.target.value)}
                    placeholder="e.g. Sunita"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Status</label>
                  <select
                    value={claimedStatus}
                    onChange={(e) => setClaimedStatus(e.target.value)}
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="Found">Found (In Safe)</option>
                    <option value="Claimed">Claimed (Returned to Guest)</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLfModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800"
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
