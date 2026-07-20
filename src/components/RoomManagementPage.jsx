import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const ROOM_TYPES = ['Standard Room', 'Deluxe Room', 'Suite', 'Family Room', 'Beachfront Villa'];
const ROOM_STATUSES = ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance', 'Inspection', 'Out of Service'];

const MOCK_ROOMS = [
  { id: '1', room_number: '101', room_type: 'Standard Room', floor: 1, capacity: 2, price: 2500, status: 'Available', amenities: ['WiFi', 'AC', 'TV'], notes: 'Near the lawn area' },
  { id: '2', room_number: '102', room_type: 'Standard Room', floor: 1, capacity: 2, price: 2500, status: 'Occupied', amenities: ['WiFi', 'AC', 'TV'], notes: '' },
  { id: '3', room_number: '201', room_type: 'Deluxe Room', floor: 2, capacity: 3, price: 4000, status: 'Cleaning', amenities: ['WiFi', 'AC', 'TV', 'Balcony'], notes: 'Sea-facing view' },
  { id: '4', room_number: '202', room_type: 'Suite', floor: 2, capacity: 4, price: 7500, status: 'Maintenance', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony'], notes: 'AC leakage reported' },
  { id: '5', room_number: '301', room_type: 'Beachfront Villa', floor: 1, capacity: 5, price: 12000, status: 'Available', amenities: ['WiFi', 'AC', 'TV', 'Private Pool', 'Sea View'], notes: 'Premium guest favorite' },
];

export default function RoomManagementPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form states
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Standard Room');
  const [floor, setFloor] = useState(1);
  const [capacity, setCapacity] = useState(2);
  const [price, setPrice] = useState(2500);
  const [status, setStatus] = useState('Available');
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number', { ascending: true });

      if (error) {
        throw error;
      }
      setRooms(data || []);
      setIsDemo(false);
    } catch (err) {
      console.warn('Rooms table not ready. Using demo simulation.', err.message);
      setRooms(MOCK_ROOMS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }

  const openAddModal = () => {
    setSelectedRoom(null);
    setRoomNumber('');
    setRoomType('Standard Room');
    setFloor(1);
    setCapacity(2);
    setPrice(2500);
    setStatus('Available');
    setAmenities([]);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setRoomNumber(room.room_number);
    setRoomType(room.room_type);
    setFloor(room.floor);
    setCapacity(room.capacity);
    setPrice(room.price);
    setStatus(room.status);
    setAmenities(room.amenities || []);
    setNotes(room.notes || '');
    setIsModalOpen(true);
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (indexToRemove) => {
    setAmenities(amenities.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      room_number: roomNumber,
      room_type: roomType,
      floor: parseInt(floor) || 1,
      capacity: parseInt(capacity) || 2,
      price: parseFloat(price) || 0.0,
      status,
      amenities,
      notes,
    };

    if (isDemo) {
      if (selectedRoom) {
        // Edit in demo
        setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, ...payload } : r));
      } else {
        // Add in demo
        setRooms([...rooms, { id: Date.now().toString(), ...payload }]);
      }
      setIsModalOpen(false);
      return;
    }

    try {
      if (selectedRoom) {
        const { error } = await supabase
          .from('rooms')
          .update(payload)
          .eq('id', selectedRoom.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rooms')
          .insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (err) {
      alert('Error saving room: ' + err.message);
    }
  };

  const updateRoomStatusDirect = async (roomId, newStatus) => {
    if (isDemo) {
      setRooms(rooms.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
      return;
    }

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status: newStatus })
        .eq('id', roomId);
      if (error) throw error;
      fetchRooms();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesType = filterType === 'All' || room.room_type === filterType;
    const matchesStatus = filterStatus === 'All' || room.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Reserved': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Occupied': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Cleaning': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Maintenance': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Inspection': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <CrmLayout title="Room Inventory" subtitle="Manage rooms, pricing, configurations, and operations state.">
      {isDemo && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="font-semibold text-sm">Demo Simulation Active</p>
            <p className="text-xs text-amber-800/90 mt-0.5">
              The SQL tables for Room operations have not been executed in Supabase yet. Run the schema script `scripts/supabase_phase1_setup.sql` in the Supabase SQL editor to connect live.
            </p>
          </div>
          <button
            onClick={fetchRooms}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-medium transition-colors shrink-0"
          >
            Retry Database Connection
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-sm">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Total Rooms</p>
          <p className="text-3xl font-serif text-stone-900 mt-1">{rooms.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-sm">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Available</p>
          <p className="text-3xl font-serif text-emerald-600 mt-1">{rooms.filter(r => r.status === 'Available').length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-sm">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Occupied</p>
          <p className="text-3xl font-serif text-indigo-600 mt-1">{rooms.filter(r => r.status === 'Occupied').length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-sm">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Cleaning / Maint.</p>
          <p className="text-3xl font-serif text-amber-600 mt-1">{rooms.filter(r => ['Cleaning', 'Maintenance'].includes(r.status)).length}</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6 bg-white p-4 rounded-2xl border border-stone-200/60 shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-stone-500 font-medium mr-2">Type:</span>
          {['All', ...ROOM_TYPES].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === type
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-stone-500 font-medium mr-2">Status:</span>
          {['All', ...ROOM_STATUSES].map(stat => (
            <button
              key={stat}
              onClick={() => setFilterStatus(stat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === stat
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
              }`}
            >
              {stat}
            </button>
          ))}
          <button
            onClick={openAddModal}
            className="ml-auto md:ml-4 flex items-center gap-1.5 px-4 py-2 bg-brand-gold text-stone-900 hover:bg-brand-gold/90 font-semibold rounded-xl text-xs transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Room
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-stone-900/10 border-t-stone-900 rounded-full animate-spin"></div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white text-center py-16 px-4 rounded-2xl border border-stone-200/60 shadow-sm">
          <p className="text-stone-400 text-sm">No rooms match the filter selections.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Floor {room.floor}</span>
                    <h3 className="font-serif text-xl text-stone-900 mt-0.5">Room {room.room_number}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs border-b border-stone-100 pb-2">
                    <span className="text-stone-500">Type</span>
                    <span className="font-semibold text-stone-800">{room.room_type}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-stone-100 pb-2">
                    <span className="text-stone-500">Capacity</span>
                    <span className="font-semibold text-stone-800">{room.capacity} Guests</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-stone-100 pb-2">
                    <span className="text-stone-500">Price / Night</span>
                    <span className="font-semibold text-stone-900">₹{parseFloat(room.price).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {room.amenities.map(amenity => (
                      <span key={amenity} className="text-[10px] bg-stone-50 border border-stone-150 px-2 py-0.5 rounded text-stone-600">
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}

                {room.notes && (
                  <p className="text-[11px] text-stone-500 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50 line-clamp-2">
                    {room.notes}
                  </p>
                )}
              </div>

              <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(room)}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900 py-1.5 px-3 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    Edit
                  </button>
                  <Link
                    to={`/crm/rooms/${room.id}`}
                    className="text-xs font-bold text-brand-gold hover:underline py-1.5 px-2 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
                <div className="flex gap-1">
                  <select
                    value={room.status}
                    onChange={(e) => updateRoomStatusDirect(room.id, e.target.value)}
                    className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-700 font-semibold"
                  >
                    {ROOM_STATUSES.map(stat => (
                      <option key={stat} value={stat}>{stat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200"
            >
              <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h2 className="font-serif text-lg text-stone-900">{selectedRoom ? `Edit Room ${selectedRoom.room_number}` : 'Add New Room'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Room Number *</label>
                    <input
                      type="text"
                      required
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="e.g. 101"
                      className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Room Type *</label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    >
                      {ROOM_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Floor</label>
                    <input
                      type="number"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      min="1"
                      className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Max Guests</label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      min="1"
                      className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Price / Night (₹)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                  >
                    {ROOM_STATUSES.map(stat => (
                      <option key={stat} value={stat}>{stat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Amenities</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      placeholder="e.g. Minibar"
                      className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md text-stone-700 flex items-center gap-1"
                      >
                        {amenity}
                        <button type="button" onClick={() => removeAmenity(idx)} className="text-stone-400 hover:text-stone-600 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Notes / Operational Comments</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    placeholder="e.g. Sea View, next to staircase"
                    className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 text-stone-600 text-xs font-semibold rounded-xl hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-gold text-stone-900 hover:bg-brand-gold/90 text-xs font-semibold rounded-xl"
                  >
                    Save Room
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
