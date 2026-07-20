import React, { useState } from 'react';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'WhatsApp', recipient: 'John Doe (+91 98765 43210)', message: 'Your Scuba session tomorrow is confirmed for 07:00 AM. Please reach the deck 10 mins early.', status: 'Delivered', sent_at: '2026-07-17T11:30:00Z' },
  { id: '2', type: 'Email', recipient: 'anita.shah@gmail.com', message: 'Invoice for Room 102 stay has been processed. Thank you for staying at Murudeshwara!', status: 'Sent', sent_at: '2026-07-17T10:15:00Z' },
  { id: '3', type: 'In-App', recipient: 'All Staff', message: 'Room 201 maintenance is completed. Ready for housekeeping check.', status: 'Delivered', sent_at: '2026-07-17T09:00:00Z' },
  { id: '4', type: 'WhatsApp', recipient: 'Rahul Verma (+91 99000 11223)', message: 'Welcome to Murudeshwara Resort! Checkout time is 11:00 AM. Have a wonderful stay.', status: 'Sent', sent_at: '2026-07-16T14:00:00Z' }
];

const TEMPLATES = [
  { name: 'Custom Message', type: 'Custom', text: '' },
  { name: 'Welcome Greetings (WhatsApp)', type: 'WhatsApp', text: 'Welcome to Murudeshwara Resort! Your check-in is verified. Checkout time is 11:00 AM. Let us know if you need room assistance.' },
  { name: 'Scuba Waiver Alert (WhatsApp)', type: 'WhatsApp', text: 'Dear Guest, your Scuba Diving session is scheduled for tomorrow at 08:30 AM. Kindly verify your medical waiver at the desk before boarding.' },
  { name: 'Checkout Receipt (Email)', type: 'Email', text: 'Thank you for choosing Murudeshwara Resort! Your final statement invoice is ready. Please find the receipt copy attached.' },
  { name: 'Housekeeping Dispatch (In-App)', type: 'In-App', text: 'Housekeeping alert: Room check-out completed. Please clean and sanitize for the next guest arrival.' }
];

export default function NotificationsPage() {
  const [logs, setLogs] = useState(MOCK_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('All'); // All, WhatsApp, Email, In-App
  
  // Broadcast fields
  const [channel, setChannel] = useState('WhatsApp');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!recipient || !message) return;

    const newLog = {
      id: Date.now().toString(),
      type: channel,
      recipient,
      message,
      status: 'Sent',
      sent_at: new Date().toISOString()
    };

    setLogs([newLog, ...logs]);
    setRecipient('');
    setMessage('');
    alert(`${channel} broadcast queued for delivery.`);
  };

  const handleSelectTemplate = (tpl) => {
    if (tpl.type !== 'Custom') {
      setChannel(tpl.type);
    }
    setMessage(tpl.text);
  };

  const filteredLogs = logs.filter(l => activeFilter === 'All' || l.type === activeFilter);

  return (
    <CrmLayout title="Notification Center" subtitle="Dispatch and track WhatsApp broadcasts, guest Emails, and internal staff alerts.">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Broadcast Trigger Panel */}
        <div className="bg-white dark:bg-stone-900 p-8 rounded-[32px] border border-stone-200/60 dark:border-stone-800 shadow-sm h-fit">
          <h3 className="font-serif text-lg text-stone-900 dark:text-stone-50 mb-1">Trigger Message Broadcast</h3>
          <p className="text-xs text-stone-400 mb-6">Send customized alerts directly to guests or staff via chosen gateways.</p>
          
          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Select Gateway</label>
              <div className="grid grid-cols-3 gap-2">
                {['WhatsApp', 'Email', 'In-App'].map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      channel === ch
                        ? 'bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-900 border-transparent'
                        : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-850 hover:bg-stone-50'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Select Template</label>
              <select
                onChange={(e) => handleSelectTemplate(TEMPLATES[e.target.selectedIndex])}
                className="w-full text-xs border border-stone-200 dark:border-stone-750 bg-slate-50 text-stone-800 rounded-xl px-3 py-2.5 focus:outline-none"
              >
                {TEMPLATES.map((t, idx) => (
                  <option key={idx} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">
                {channel === 'WhatsApp' ? 'Phone Number *' : channel === 'Email' ? 'Email Address *' : 'Audience / Staff Roll *'}
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={channel === 'WhatsApp' ? '+91 98765 43210' : channel === 'Email' ? 'guest@gmail.com' : 'e.g. Scuba Team'}
                className="w-full text-xs border border-stone-200 dark:border-stone-750 bg-slate-50 text-stone-800 rounded-xl px-4 py-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Message Content *</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="4"
                placeholder="Type your alert message here..."
                className="w-full text-xs border border-stone-200 dark:border-stone-750 bg-slate-50 text-stone-800 rounded-xl px-4 py-2.5 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Dispatch Broadcast
            </button>
          </form>
        </div>

        {/* Message Delivery Logs */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
            <div className="flex gap-2">
              {['All', 'WhatsApp', 'Email', 'In-App'].map(filt => (
                <button
                  key={filt}
                  onClick={() => setActiveFilter(filt)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeFilter === filt
                      ? 'bg-stone-950 text-white dark:bg-stone-55'
                      : 'bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {filt}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Live Logs</span>
          </div>

          <div className="space-y-4">
            {filteredLogs.map(log => (
              <div key={log.id} className="bg-white dark:bg-stone-900 p-6 rounded-[32px] border border-stone-200/60 dark:border-stone-800 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      log.type === 'WhatsApp'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : log.type === 'Email'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-purple-50 border-purple-200 text-purple-700'
                    }`}>
                      {log.type} Gateway
                    </span>
                    <p className="text-xs text-stone-900 dark:text-stone-50 font-semibold mt-2">To: {log.recipient}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-md">
                      {log.status}
                    </span>
                    <span className="block text-[9px] text-stone-400 mt-1">
                      {new Date(log.sent_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 bg-stone-50/50 dark:bg-stone-850/40 p-3 rounded-xl border border-stone-100 dark:border-stone-850 mt-3 font-serif">
                  {log.message}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>

    </CrmLayout>
  );
}
