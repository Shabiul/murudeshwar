import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';

const MOCK_ROOMS = [
  { id: '1', room_number: '101', room_type: 'Standard Room' },
  { id: '2', room_number: '102', room_type: 'Standard Room' },
  { id: '3', room_number: '201', room_type: 'Deluxe Room' },
  { id: '4', room_number: '202', room_type: 'Suite' },
  { id: '5', room_number: '301', room_type: 'Beachfront Villa' }
];

const MOCK_CALENDAR_EVENTS = [
  { room_id: '1', guest: 'Rohan Sharma', status: 'Confirmed', startDay: 24, endDay: 28 },
  { room_id: '2', guest: 'John Doe', status: 'Confirmed', startDay: 10, endDay: 15 },
  { room_id: '3', guest: 'Maintenance Block', status: 'Maintenance', startDay: 15, endDay: 17 },
  { room_id: '4', guest: 'Anjali Desai', status: 'Pending', startDay: 20, endDay: 22 },
  { room_id: '5', guest: 'Vikram Malhotra', status: 'Confirmed', startDay: 1, endDay: 6 },
];

export default function RoomCalendarPage() {
  const [view, setView] = useState('weekly'); // daily, weekly, monthly
  const [rooms, setRooms] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null); // for booking modal
  const [guestName, setGuestName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRoomsAndEvents();
  }, []);

  async function fetchRoomsAndEvents() {
    setLoading(true);
    try {
      const { data: dbRooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*');

      if (roomsError) throw roomsError;
      setRooms(dbRooms || MOCK_ROOMS);
      setEvents(MOCK_CALENDAR_EVENTS);
    } catch (err) {
      console.warn('Rooms table not available, using mock data.', err.message);
      setRooms(MOCK_ROOMS);
      setEvents(MOCK_CALENDAR_EVENTS);
    } finally {
      setLoading(false);
    }
  }

  // Days in current July 2026 timeline window (days 1 to 31)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const weeklyDays = Array.from({ length: 7 }, (_, i) => i + 15); // July 15 to 21

  const activeDays = view === 'monthly' ? daysInMonth : weeklyDays;

  const getEventForDay = (roomId, day) => {
    return events.find(e => e.room_id === roomId && day >= e.startDay && day <= e.endDay);
  };

  const handleCellClick = (room, day) => {
    setSelectedCell({ room, day });
    setIsModalOpen(true);
  };

  const handleCreateReservation = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newEvent = {
      room_id: selectedCell.room.id,
      guest: guestName,
      status: 'Confirmed',
      startDay: selectedCell.day,
      endDay: selectedCell.day + 2
    };

    setEvents([...events, newEvent]);
    setGuestName('');
    setIsModalOpen(false);
  };

  return (
    <CrmLayout title="Room Availability Calendar" subtitle="Interactive daily, weekly, and monthly schedule overlays.">
      
      {/* View Switchers */}
      <div className="flex justify-between items-center mb-6 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/65 shadow-sm">
        <div className="flex gap-2">
          {['weekly', 'monthly'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                view === v
                  ? 'bg-stone-950 text-white'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
              }`}
            >
              {v} View
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Confirmed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span> Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span> Maintenance
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-stone-900/10 border-t-stone-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-850 border-b border-stone-150 dark:border-stone-800">
                  <th className="p-4 text-left text-xs font-bold text-stone-400 uppercase tracking-widest min-w-[140px] sticky left-0 bg-stone-50 dark:bg-stone-850 z-10">Room</th>
                  {activeDays.map(day => (
                    <th key={day} className="p-3 text-center text-xs font-semibold text-stone-600 dark:text-stone-300 min-w-[45px]">
                      Jul {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {rooms.map(room => (
                  <tr key={room.id} className="hover:bg-stone-50/40 dark:hover:bg-stone-800/10">
                    <td className="p-4 font-semibold text-xs text-stone-800 dark:text-stone-200 sticky left-0 bg-white dark:bg-stone-900 shadow-[2px_0_5px_rgba(0,0,0,0.02)] z-10">
                      <p>{room.room_number}</p>
                      <p className="text-[10px] text-stone-400 font-normal">{room.room_type}</p>
                    </td>
                    {activeDays.map(day => {
                      const event = getEventForDay(room.id, day);
                      return (
                        <td
                          key={day}
                          onClick={() => handleCellClick(room, day)}
                          className="p-1 border border-stone-100 dark:border-stone-800/60 text-center align-middle cursor-pointer hover:bg-stone-100/50"
                        >
                          {event ? (
                            <div className={`p-1.5 rounded-lg text-[9px] font-bold truncate leading-tight shadow-sm text-white ${
                              event.status === 'Confirmed' ? 'bg-emerald-500' :
                              event.status === 'Maintenance' ? 'bg-rose-500' :
                              'bg-amber-500'
                            }`} title={`${event.guest} (${event.status})`}>
                              {event.guest.split(' ')[0]}
                            </div>
                          ) : (
                            <div className="h-6 w-full hover:border hover:border-brand-gold/40 hover:bg-brand-gold/10 rounded transition-all"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Booking Modal */}
      {isModalOpen && selectedCell && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-6 border border-stone-200 dark:border-stone-850 shadow-2xl">
            <h3 className="font-serif text-lg text-stone-900 dark:text-stone-50 mb-2">Reserve Room {selectedCell.room.room_number}</h3>
            <p className="text-xs text-stone-400 mb-4">Create quick reservation starting July {selectedCell.day}, 2026.</p>
            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">Guest Name</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Ramesh Hegde"
                  className="w-full text-xs border border-stone-200 dark:border-stone-750 bg-transparent rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-gold text-stone-900 hover:bg-brand-gold/90 text-xs font-bold rounded-lg"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CrmLayout>
  );
}
