import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Electrical', 'Plumbing', 'Furniture', 'AC', 'Television', 'WiFi', 'Water Leakage', 'Painting', 'Civil Repairs'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Emergency'];
const STATUSES = ['Reported', 'Assigned', 'Working', 'Completed', 'Verified'];

const MOCK_REQS = [
  { id: '1', room: { room_number: '102' }, category: 'AC', priority: 'High', status: 'Reported', description: 'AC unit making loud noise and not cooling.', assigned_staff: null, created_at: '2026-07-17T09:00:00Z' },
  { id: '2', room: { room_number: '201' }, category: 'Plumbing', priority: 'Emergency', status: 'Working', description: 'Water leak in the bathroom faucet.', assigned_staff: { full_name: 'Anita Devi' }, created_at: '2026-07-16T14:30:00Z' },
  { id: '3', room: { room_number: '101' }, category: 'Electrical', priority: 'Low', status: 'Completed', description: 'Bedside lamp bulb replacement.', assigned_staff: { full_name: 'Ramesh Kumar' }, created_at: '2026-07-15T11:00:00Z' },
];

const MOCK_ASSETS = [
  { id: 'a1', name: 'O-General 1.5 Ton AC', serial_number: 'OG-847291-AC', room_number: '101', category: 'AC', status: 'Operational', install_date: '2024-05-12' },
  { id: 'a2', name: 'Samsung 43" Smart TV', serial_number: 'SS-904128-TV', room_number: '102', category: 'Television', status: 'Operational', install_date: '2025-01-20' },
  { id: 'a3', name: 'Hindware Geyser 15L', serial_number: 'HW-012847-GY', room_number: '201', category: 'Plumbing', status: 'Requires Maintenance', install_date: '2023-11-05' },
  { id: 'a4', name: 'Netgear WiFi Access Point', serial_number: 'NG-482012-AP', room_number: '301', category: 'WiFi', status: 'Operational', install_date: '2025-06-18' },
];

export default function MaintenancePage() {
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [assets, setAssets] = useState(MOCK_ASSETS);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets'); // tickets, assets

  // Filters
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Electrical');
  const [selectedPriority, setSelectedPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Asset Form States
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetSerial, setAssetSerial] = useState('');
  const [assetRoom, setAssetRoom] = useState('101');
  const [assetCat, setAssetCat] = useState('AC');
  const [assetStatus, setAssetStatus] = useState('Operational');

  // Selected request for editing/updates
  const [selectedReq, setSelectedReq] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const roomRes = await supabase.from('rooms').select('id, room_number');
      const staffRes = await supabase.from('staff').select('id, full_name');
      const maintRes = await supabase.from('maintenance_requests').select('*, room:rooms(room_number), assigned_staff:staff(full_name)').order('created_at', { ascending: false });

      if (roomRes.error || staffRes.error || maintRes.error) {
        throw new Error('Maintenance table not ready');
      }

      setRooms(roomRes.data || []);
      setStaff(staffRes.data || []);
      setRequests(maintRes.data || []);
      setIsDemo(false);
    } catch (err) {
      console.warn('Maintenance database schemas not configured. Loading demo simulator.', err.message);
      setRequests(MOCK_REQS);
      setStaff([
        { id: 's1', full_name: 'Ramesh Kumar' },
        { id: 's2', full_name: 'Anita Devi' },
      ]);
      setRooms([
        { id: 'r1', room_number: '101' },
        { id: 'r2', room_number: '102' },
        { id: 'r3', room_number: '201' },
      ]);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }

  const openReportModal = () => {
    setSelectedReq(null);
    setSelectedRoomId('');
    setSelectedCategory('Electrical');
    setSelectedPriority('Medium');
    setDescription('');
    setAssignedStaffId('');
    setResolutionNotes('');
    setIsModalOpen(true);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    const payload = {
      room_id: selectedRoomId || null,
      category: selectedCategory,
      priority: selectedPriority,
      description,
      assigned_staff_id: assignedStaffId || null,
      status: selectedReq ? selectedReq.status : 'Reported',
      resolution_notes: resolutionNotes || null,
    };

    if (isDemo) {
      const roomObj = rooms.find(r => r.id === selectedRoomId);
      const staffObj = staff.find(s => s.id === assignedStaffId);

      if (selectedReq) {
        setRequests(requests.map(r => r.id === selectedReq.id ? { ...r, ...payload, room: roomObj, assigned_staff: staffObj } : r));
      } else {
        setRequests([{
          id: Date.now().toString(),
          ...payload,
          room: roomObj || null,
          assigned_staff: staffObj || null,
          created_at: new Date().toISOString(),
        }, ...requests]);
      }
      setIsModalOpen(false);
      return;
    }

    try {
      if (selectedReq) {
        const { error } = await supabase.from('maintenance_requests').update(payload).eq('id', selectedReq.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('maintenance_requests').insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error saving request: ' + err.message);
    }
  };

  const handleQuickStatusChange = async (reqId, newStatus) => {
    if (isDemo) {
      setRequests(requests.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
      return;
    }

    try {
      const { error } = await supabase.from('maintenance_requests').update({ status: newStatus }).eq('id', reqId);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleAddAsset = (e) => {
    e.preventDefault();
    const newAsset = {
      id: Date.now().toString(),
      name: assetName,
      serial_number: assetSerial || 'N/A',
      room_number: assetRoom,
      category: assetCat,
      status: assetStatus,
      install_date: new Date().toISOString().split('T')[0]
    };
    setAssets([newAsset, ...assets]);
    setIsAssetModalOpen(false);
    setAssetName('');
    setAssetSerial('');
  };

  const filteredRequests = requests.filter(req => {
    const matchesCat = filterCategory === 'All' || req.category === filterCategory;
    const matchesPri = filterPriority === 'All' || req.priority === filterPriority;
    const matchesStat = filterStatus === 'All' || req.status === filterStatus;
    return matchesCat && matchesPri && matchesStat;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Emergency': return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold';
      case 'High': return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 font-bold';
      case 'Medium': return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300';
      default: return 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Reported': return 'bg-stone-100 dark:bg-stone-800 text-stone-850 dark:text-stone-200';
      case 'Assigned': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300';
      case 'Working': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300';
      case 'Completed': return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300';
      case 'Verified': return 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <CrmLayout title="Maintenance & Assets" subtitle="Track facilities repairs, AC servicing, electrical faults, and room assets.">
      {isDemo && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="font-semibold text-sm">Demo Simulation Active</p>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Showing simulation mode. Please run `scripts/supabase_phase1_setup.sql` inside the SQL editor to enable the database integration.
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
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 text-sm font-semibold transition-all ${
            activeTab === 'tickets' ? 'border-b-2 border-stone-900 dark:border-stone-50 text-stone-900 dark:text-stone-50' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          Maintenance Tickets ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-3 text-sm font-semibold transition-all ${
            activeTab === 'assets' ? 'border-b-2 border-stone-900 dark:border-stone-50 text-stone-900 dark:text-stone-50' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          Resort Assets ({assets.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-stone-900/10 border-t-stone-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div>
          {activeTab === 'tickets' ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
                  <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Total Reports</p>
                  <p className="text-3xl font-serif text-stone-900 dark:text-stone-100 mt-1">{requests.length}</p>
                </div>
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
                  <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Active Requests</p>
                  <p className="text-3xl font-serif text-amber-600 mt-1">{requests.filter(r => !['Completed', 'Verified'].includes(r.status)).length}</p>
                </div>
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
                  <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Emergency Priority</p>
                  <p className="text-3xl font-serif text-rose-600 mt-1">{requests.filter(r => r.priority === 'Emergency' && r.status !== 'Completed').length}</p>
                </div>
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
                  <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Resolved</p>
                  <p className="text-3xl font-serif text-emerald-600 mt-1">{requests.filter(r => ['Completed', 'Verified'].includes(r.status)).length}</p>
                </div>
              </div>

              {/* Toolbar Filters */}
              <div className="flex flex-col gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm mb-6">
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-stone-500 font-semibold w-16">Category:</span>
                  {['All', ...CATEGORIES].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        filterCategory === cat ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 items-center text-xs justify-between">
                  <div className="flex gap-2 items-center">
                    <span className="text-stone-500 font-semibold w-16">Priority:</span>
                    {['All', ...PRIORITIES].map(pri => (
                      <button
                        key={pri}
                        onClick={() => setFilterPriority(pri)}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                          filterPriority === pri ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {pri}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={openReportModal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-gold text-stone-900 hover:bg-brand-gold/90 font-semibold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    File Maintenance Request
                  </button>
                </div>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 text-center py-16 px-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
                  <p className="text-stone-400 text-sm">No maintenance requests logged under filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequests.map(req => (
                    <div key={req.id} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800 overflow-hidden shadow-sm flex flex-col justify-between">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{req.category}</span>
                            <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 mt-0.5">Room {req.room?.room_number || 'General premises'}</h3>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${getPriorityColor(req.priority)}`}>
                            {req.priority}
                          </span>
                        </div>

                        <p className="text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-850 p-3 rounded-xl border border-stone-100 dark:border-stone-800 mb-4 h-16 overflow-y-auto">
                          {req.description}
                        </p>

                        <div className="space-y-1.5 text-xs text-stone-500 mb-2">
                          <div className="flex justify-between">
                            <span>Logged Date:</span>
                            <span className="font-medium text-stone-700 dark:text-stone-300">{new Date(req.created_at).toLocaleDateString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Assigned Agent:</span>
                            <span className="font-medium text-stone-700 dark:text-stone-300">{req.assigned_staff?.full_name || 'Unassigned'}</span>
                          </div>
                          {req.resolution_notes && (
                            <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50/50 border border-emerald-100 p-2 rounded-lg">
                              <span className="font-bold">Resolution: </span>
                              {req.resolution_notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-6 py-4 bg-stone-50 dark:bg-stone-850 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-4">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>

                        <div className="flex gap-2">
                          <select
                            value={req.status}
                            onChange={(e) => handleQuickStatusChange(req.id, e.target.value)}
                            className="text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 focus:outline-none text-stone-700 dark:text-stone-300 font-semibold"
                          >
                            {STATUSES.map(stat => (
                              <option key={stat} value={stat}>{stat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Assets Tab List */
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
                <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">Resort Equipment & Assets Inventory</h3>
                <button
                  onClick={() => setIsAssetModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 font-semibold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Register New Asset
                </button>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-500 uppercase tracking-widest">
                      <th className="p-4">Asset Name</th>
                      <th className="p-4">Serial Number</th>
                      <th className="p-4">Location Room</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Installed Date</th>
                      <th className="p-4">Condition Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
                    {assets.map(asset => (
                      <tr key={asset.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/10 text-xs">
                        <td className="p-4 font-semibold text-stone-800 dark:text-stone-200">{asset.name}</td>
                        <td className="p-4 font-mono text-stone-500">{asset.serial_number}</td>
                        <td className="p-4 font-semibold">Room {asset.room_number}</td>
                        <td className="p-4">{asset.category}</td>
                        <td className="p-4">{asset.install_date}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            asset.status === 'Operational'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {asset.status}
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

      {/* Ticket Modal */}
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
                <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50">Log Maintenance Request</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Select Room (Optional)</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="">-- Resort Premises / General --</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>Room {room.room_number}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Category *</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Priority *</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    >
                      {PRIORITIES.map(pri => (
                        <option key={pri} value={pri}>{pri}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Fault Description *</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    placeholder="Provide details about the issue..."
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Assign Agent / Staff</label>
                  <select
                    value={assignedStaffId}
                    onChange={(e) => setAssignedStaffId(e.target.value)}
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                  >
                    <option value="">-- Unassigned --</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
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
                    Log Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Asset Modal */}
      <AnimatePresence>
        {isAssetModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800"
            >
              <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-850 flex justify-between items-center bg-stone-50 dark:bg-stone-850">
                <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50">Register Resort Asset</h2>
                <button onClick={() => setIsAssetModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddAsset} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="e.g. Geyser 15L"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={assetSerial}
                    onChange={(e) => setAssetSerial(e.target.value)}
                    placeholder="e.g. SN-84920"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Associated Room</label>
                    <input
                      type="text"
                      value={assetRoom}
                      onChange={(e) => setAssetRoom(e.target.value)}
                      placeholder="e.g. 101"
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Category</label>
                    <select
                      value={assetCat}
                      onChange={(e) => setAssetCat(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Condition Status</label>
                  <select
                    value={assetStatus}
                    onChange={(e) => setAssetStatus(e.target.value)}
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Requires Maintenance">Requires Maintenance</option>
                    <option value="Out of Order">Out of Order</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAssetModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl"
                  >
                    Register Asset
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
