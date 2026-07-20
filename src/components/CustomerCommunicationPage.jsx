import React, { useState } from 'react';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_COMMUNICATION_HISTORY = [
  { id: '1', guest_name: 'Akash Hegde', channel: 'WhatsApp', subject: 'Diving itinerary confirmation', details: 'Sent details about early morning boat departure times.', date: '2026-07-16 11:20 AM', status: 'Sent' },
  { id: '2', guest_name: 'Akash Hegde', channel: 'Phone Call', subject: 'Room selection request', details: 'Guest requested a sea-facing top floor balcony room. Confirmed room 204.', date: '2026-07-15 04:30 PM', status: 'Completed' },
  { id: '3', guest_name: 'Sarah Mitchell', channel: 'Email', subject: 'Airport pickup confirmation', details: 'Emailed transport confirmation from Goa airport. Driver details attached.', date: '2026-07-14 09:15 AM', status: 'Delivered' },
  { id: '4', guest_name: 'Rohan Sharma', channel: 'Internal Message', subject: 'Early check-in inquiry', details: 'Frontdesk staff note: Rohan called inquiring about a 10 AM early check-in.', date: '2026-07-13 02:00 PM', status: 'Logged' }
];

export default function CustomerCommunicationPage() {
  const [logs, setLogs] = useState(MOCK_COMMUNICATION_HISTORY);
  const [activeChannel, setActiveChannel] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [channel, setChannel] = useState('WhatsApp');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');

  const handleLogCommunication = (e) => {
    e.preventDefault();
    if (!guestName || !subject || !details) return;

    const newLog = {
      id: Date.now().toString(),
      guest_name: guestName,
      channel,
      subject,
      details,
      date: new Date().toLocaleString('en-IN', { hour12: true }),
      status: 'Logged'
    };

    setLogs([newLog, ...logs]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setGuestName('');
    setSubject('');
    setDetails('');
  };

  const filteredLogs = logs.filter(l => activeChannel === 'All' || l.channel === activeChannel);

  return (
    <CrmLayout title="Guest Communications Tracker" subtitle="Record and manage guest interactions across WhatsApp, email, call logs, and staff reminders.">
      
      {/* Category Tabs & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['All', 'Phone Call', 'WhatsApp', 'Email', 'Internal Message'].map(ch => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeChannel === ch
                  ? 'bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-900'
                  : 'bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 text-stone-600 dark:text-stone-300'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 font-semibold rounded-xl text-xs transition-colors shadow-sm"
        >
          Log Interaction
        </button>
      </div>

      {/* Communications list */}
      <div className="space-y-4">
        {filteredLogs.map(log => (
          <div key={log.id} className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-stone-950 dark:text-stone-50">{log.guest_name}</span>
                <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-350 px-2 py-0.5 rounded-md font-semibold">
                  {log.channel}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">{log.status}</span>
              </div>
              <h4 className="font-serif text-base text-stone-900 dark:text-stone-100">{log.subject}</h4>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">{log.details}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-stone-400 font-bold block">{log.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Log Interaction Modal */}
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
                <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50">Log Guest Interaction</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleLogCommunication} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Akash Hegde"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Channel *</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Internal Message">Internal Message</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Subject / Objective *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Scuba diving medical waiver query"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Interaction Details *</label>
                  <textarea
                    required
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows="3.5"
                    placeholder="Provide details about the conversation..."
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none resize-none"
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
                    Save Log
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
