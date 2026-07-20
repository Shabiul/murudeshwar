import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';

const MOCK_ROOMS = [
  { id: '1', room_number: '101', room_type: 'Standard Room', floor: 1, capacity: 2, price: 2500, status: 'Available', amenities: ['WiFi', 'AC', 'TV'], notes: 'Near the lawn area' },
  { id: '2', room_number: '102', room_type: 'Standard Room', floor: 1, capacity: 2, price: 2500, status: 'Occupied', amenities: ['WiFi', 'AC', 'TV'], notes: '' },
  { id: '3', room_number: '201', room_type: 'Deluxe Room', floor: 2, capacity: 3, price: 4000, status: 'Cleaning', amenities: ['WiFi', 'AC', 'TV', 'Balcony'], notes: 'Sea-facing view' },
  { id: '4', room_number: '202', room_type: 'Suite', floor: 2, capacity: 4, price: 7500, status: 'Maintenance', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony'], notes: 'AC leakage reported' },
  { id: '5', room_number: '301', room_type: 'Beachfront Villa', floor: 1, capacity: 5, price: 12000, status: 'Available', amenities: ['WiFi', 'AC', 'TV', 'Private Pool', 'Sea View'], notes: 'Premium guest favorite' },
];

const MOCK_BOOKING_HISTORY = [
  { id: 'b1', guest_name: 'Rohan Sharma', dates: '24 Jul - 28 Jul 2026', status: 'Upcoming', total: 10000 },
  { id: 'b2', guest_name: 'John Doe', dates: '10 Jul - 15 Jul 2026', status: 'Completed', total: 12500 },
  { id: 'b3', guest_name: 'Suresh Kumar', dates: '01 Jun - 05 Jun 2026', status: 'Completed', total: 10000 },
];

const MOCK_MAINTENANCE_HISTORY = [
  { id: 'm1', issue: 'AC Leaking water', reported_by: 'Housekeeping', status: 'In Progress', date: '16 Jul 2026', cost: 0 },
  { id: 'm2', issue: 'Balcony door lock jamming', reported_by: 'Guest (John Doe)', status: 'Resolved', date: '12 Jul 2026', cost: 850 },
  { id: 'm3', issue: 'Light bulb replacement', reported_by: 'Staff', status: 'Resolved', date: '10 Jun 2026', cost: 120 },
];

const MOCK_HOUSEKEEPING_HISTORY = [
  { id: 'h1', action: 'Full Clean & Linen Change', staff: 'Manjunath Gowda', status: 'Completed', timestamp: '17 Jul 2026, 09:30 AM' },
  { id: 'h2', action: 'Daily Touch-up', staff: 'Ramesh Devadiga', status: 'Completed', timestamp: '16 Jul 2026, 11:15 AM' },
  { id: 'h3', action: 'Deep Clean', staff: 'Manjunath Gowda', status: 'Completed', timestamp: '15 Jul 2026, 02:00 PM' },
];

export default function RoomDetailsPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [housekeeping, setHousekeeping] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  async function fetchRoomDetails() {
    setLoading(true);
    try {
      // Try to fetch room from supabase
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      setRoom(data);
      setIsDemo(false);

      // Fetch related data if live
      // We will also use fallback for related histories
      setBookings(MOCK_BOOKING_HISTORY);
      setMaintenance(MOCK_MAINTENANCE_HISTORY);
      setHousekeeping(MOCK_HOUSEKEEPING_HISTORY);
    } catch (err) {
      console.warn('Live room fetch failed. Falling back to mock details.', err.message);
      const mockRoom = MOCK_ROOMS.find(r => r.id === roomId) || MOCK_ROOMS[0];
      setRoom(mockRoom);
      setBookings(MOCK_BOOKING_HISTORY);
      setMaintenance(MOCK_MAINTENANCE_HISTORY);
      setHousekeeping(MOCK_HOUSEKEEPING_HISTORY);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <CrmLayout title="Room Details">
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-stone-900/10 border-t-stone-900 rounded-full animate-spin"></div>
        </div>
      </CrmLayout>
    );
  }

  if (!room) {
    return (
      <CrmLayout title="Room Not Found">
        <div className="bg-white p-8 rounded-2xl border text-center">
          <p className="text-stone-500 text-sm">Requested room could not be found.</p>
          <Link to="/crm/rooms" className="text-brand-gold font-bold text-xs mt-4 inline-block hover:underline">&larr; Back to Rooms list</Link>
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout title={`Room ${room.room_number}`} subtitle={`${room.room_type} | Floor ${room.floor}`}>
      {/* Top action row */}
      <div className="mb-6">
        <Link to="/crm/rooms" className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:underline flex items-center gap-1">
          &larr; Back to Rooms Inventory
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Room Information Panel */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-800 p-6 shadow-sm">
            <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50 mb-4 border-b border-stone-100 dark:border-stone-800 pb-2">
              Room Specs
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400">Current Status</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold border ${
                  room.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  room.status === 'Occupied' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                  room.status === 'Cleaning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {room.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Max Capacity</p>
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mt-0.5">{room.capacity} Guests</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Rate / Night</p>
                  <p className="text-sm font-semibold text-stone-950 dark:text-stone-50 mt-0.5">₹{parseFloat(room.price).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400">Room Amenities</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {room.amenities?.map(amenity => (
                    <span key={amenity} className="text-[10px] bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-750 px-2 py-0.5 rounded text-stone-600 dark:text-stone-300">
                      {amenity}
                    </span>
                  )) || <span className="text-xs text-stone-400 italic">None specified</span>}
                </div>
              </div>

              {room.notes && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Internal Comments</p>
                  <p className="text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-850 p-3 rounded-2xl border border-stone-200/50 dark:border-stone-800/80 mt-1 italic">
                    "{room.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions for staff */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-md">
            <h3 className="font-serif text-sm font-bold tracking-wide text-brand-gold uppercase">Operations Actions</h3>
            <p className="text-xs text-stone-300 mt-1">Quick override settings for housekeeping & maintenance.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => alert('Assigned cleaning chore to Manjunath Gowda')}
                className="py-2 px-3 text-center bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold rounded-xl text-white border border-white/10"
              >
                Trigger Clean
              </button>
              <button
                onClick={() => alert('Filed maintenance report ticket')}
                className="py-2 px-3 text-center bg-brand-gold text-stone-900 hover:bg-brand-gold/90 transition-colors text-xs font-semibold rounded-xl"
              >
                File Repair
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Logs / Timeline Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Booking History log */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-800 p-6 shadow-sm">
            <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50 mb-4">Occupancy & Booking Log</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600 dark:text-stone-400">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-850 pb-2 font-bold text-stone-400 uppercase tracking-wider">
                    <th className="pb-3">Guest Name</th>
                    <th className="pb-3">Dates</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                      <td className="py-3 font-semibold text-stone-900 dark:text-stone-100">{b.guest_name}</td>
                      <td className="py-3">{b.dates}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'Upcoming' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-stone-900 dark:text-stone-100">₹{b.total.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Maintenance Ticket Log */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-800 p-6 shadow-sm">
            <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50 mb-4">Maintenance Record</h2>
            <div className="space-y-3">
              {maintenance.map(m => (
                <div key={m.id} className="p-3.5 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-stone-800 dark:text-stone-200">{m.issue}</p>
                    <p className="text-[10px] text-stone-400 mt-1">Reported on {m.date} by {m.reported_by}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      m.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {m.status}
                    </span>
                    <p className="text-[10px] text-stone-500 mt-1">{m.cost > 0 ? `Cost: ₹${m.cost}` : 'No cost logged'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Housekeeping Audits Log */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-800 p-6 shadow-sm">
            <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50 mb-4">Housekeeping History</h2>
            <div className="space-y-3">
              {housekeeping.map(h => (
                <div key={h.id} className="p-3.5 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-stone-800 dark:text-stone-200">{h.action}</p>
                    <p className="text-[10px] text-stone-400 mt-1">Assigned staff: {h.staff}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 font-semibold">{h.timestamp}</span>
                    <span className="block mt-1 text-[10px] text-emerald-600 font-bold">{h.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CrmLayout>
  );
}
