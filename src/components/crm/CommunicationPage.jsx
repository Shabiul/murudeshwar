import React, { useState, useEffect } from 'react';
import CrmLayout from './CrmLayout';
import CommunicationTimeline from './CommunicationTimeline';
import { WhatsAppService } from '../../services/communication/WhatsAppService';
import { EmailService } from '../../services/communication/EmailService';

export default function CommunicationPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState(() => {
    return localStorage.getItem('crm_selected_property_id') || 'all';
  });

  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'timeline'
  const [testForm, setTestForm] = useState({
    recipient: '',
    channel: 'whatsapp',
    template: 'booking_confirm_inbound',
    guestName: 'Rohan Sharma',
    roomNumber: '101',
    checkInDate: '2026-07-20'
  });
  
  const [sending, setSending] = useState(false);

  // Sample editable templates loaded from localStorage if exists
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('crm_communication_templates');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'booking_confirm_inbound',
        channel: 'whatsapp',
        name: 'Booking Confirmation',
        content: 'Namaste {{guest_name}}! Your booking for Room {{room_number}} at Murudeshwara Resort is confirmed. Check-in: {{check_in_date}}. Looking forward to welcoming you!'
      },
      {
        id: 'guest_welcome',
        channel: 'email',
        name: 'Guest Welcome Email',
        content: 'Subject: Welcome to Murudeshwara Resort!\n\nDear {{guest_name}},\n\nThank you for choosing Murudeshwara Resort. Your room {{room_number}} is prepared for check-in on {{check_in_date}}.\n\nWarm regards,\nManagement'
      },
      {
        id: 'low_stock_notification',
        channel: 'email',
        name: 'Inventory Restock Request',
        content: 'Subject: [Restock Warning] Safety Level Reached\n\nAttention Operations,\n\nItem {{item_name}} quantity has fallen below minimum reserve levels. Please dispatch restock request immediately.'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('crm_communication_templates', JSON.stringify(templates));
  }, [templates]);

  // Listen for global property switch
  useEffect(() => {
    const handleScopeChange = () => {
      setSelectedPropertyId(localStorage.getItem('crm_selected_property_id') || 'all');
    };
    window.addEventListener('crmPropertyScopeChanged', handleScopeChange);
    return () => window.removeEventListener('crmPropertyScopeChanged', handleScopeChange);
  }, []);

  const handleTemplateChange = (id, newContent) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, content: newContent } : t));
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testForm.recipient) {
      alert('Please fill in recipient details (phone or email)');
      return;
    }
    setSending(true);
    try {
      const vars = {
        guest_name: testForm.guestName,
        room_number: testForm.roomNumber,
        check_in_date: testForm.checkInDate,
        item_name: 'Premium Towels'
      };

      if (testForm.channel === 'whatsapp') {
        await WhatsAppService.sendTemplateMessage(testForm.recipient, testForm.template, vars);
      } else {
        await EmailService.sendTemplateEmail(testForm.recipient, testForm.template, vars);
      }
      alert('Test communication dispatched and logged successfully!');
      setTestForm(prev => ({ ...prev, recipient: '' }));
      // Switch tab to trigger refresh in timeline
      setActiveTab('timeline');
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <CrmLayout title="Communication Center" subtitle="Manage templates, send automated updates, and monitor transactional message logs.">
      
      {/* Upper Navigation and Trigger Panel */}
      <div className="flex border-b border-stone-200 dark:border-stone-850 mb-8">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-3.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'templates'
              ? 'border-brand-gold text-brand-gold bg-brand-gold/5'
              : 'border-transparent text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          Message Templates
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-6 py-3.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'timeline'
              ? 'border-brand-gold text-brand-gold bg-brand-gold/5'
              : 'border-transparent text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          Delivery Ledger & History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left font-sans">
        
        {/* Left Columns - Content Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'templates' && (
            <div className="space-y-6">
              {templates.map(tmpl => (
                <div key={tmpl.id} className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-serif text-base text-stone-900 dark:text-stone-100">{tmpl.name}</h4>
                      <code className="text-[10px] font-mono text-stone-400">{tmpl.id}</code>
                    </div>
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                      tmpl.channel === 'whatsapp'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                        : 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                    }`}>
                      {tmpl.channel}
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={tmpl.content}
                    onChange={(e) => handleTemplateChange(tmpl.id, e.target.value)}
                    className="w-full text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl p-3 focus:outline-none focus:border-brand-gold/50 text-stone-800 dark:text-stone-200 font-mono leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-3 text-[10px] text-stone-400">
                    <span>Variables available: <code>{"{{guest_name}}"}</code>, <code>{"{{room_number}}"}</code>, <code>{"{{check_in_date}}"}</code></span>
                    <span className="text-brand-gold font-semibold">Saved automatically</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'timeline' && (
            <CommunicationTimeline propertyId={selectedPropertyId} />
          )}
        </div>

        {/* Right Column - Send Test Tool */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-3xl p-6 shadow-sm h-fit">
          <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 mb-2">Test Delivery Simulator</h4>
          <p className="text-xs text-stone-400 mb-6">Fire a simulated transaction event to verify logging & template layout outputs.</p>
          
          <form onSubmit={handleSendTest} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Target Channel</label>
              <select
                value={testForm.channel}
                onChange={(e) => setTestForm(prev => ({
                  ...prev,
                  channel: e.target.value,
                  template: e.target.value === 'whatsapp' ? 'booking_confirm_inbound' : 'guest_welcome'
                }))}
                className="w-full text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 focus:outline-none text-stone-800 dark:text-stone-200 font-semibold"
              >
                <option value="whatsapp">WhatsApp Message</option>
                <option value="email">Email Notification</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Template Preset</label>
              <select
                value={testForm.template}
                onChange={(e) => setTestForm(prev => ({ ...prev, template: e.target.value }))}
                className="w-full text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 focus:outline-none text-stone-800 dark:text-stone-200 font-semibold"
              >
                {templates
                  .filter(t => t.channel === testForm.channel)
                  .map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                {testForm.channel === 'whatsapp' ? 'Recipient Phone Number' : 'Recipient Email address'}
              </label>
              <input
                type="text"
                placeholder={testForm.channel === 'whatsapp' ? '+91 9999999999' : 'name@example.com'}
                value={testForm.recipient}
                onChange={(e) => setTestForm(prev => ({ ...prev, recipient: e.target.value }))}
                className="w-full text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 focus:outline-none text-stone-800 dark:text-stone-200"
              />
            </div>

            <div className="border-t border-stone-100 dark:border-stone-800 my-4 pt-4 space-y-3">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Template Variables</span>
              
              <div>
                <label className="text-[9px] text-stone-400 block mb-1">Guest Name</label>
                <input
                  type="text"
                  value={testForm.guestName}
                  onChange={(e) => setTestForm(prev => ({ ...prev, guestName: e.target.value }))}
                  className="w-full text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl p-2 focus:outline-none text-stone-800 dark:text-stone-200"
                />
              </div>

              <div>
                <label className="text-[9px] text-stone-400 block mb-1">Room Title/No.</label>
                <input
                  type="text"
                  value={testForm.roomNumber}
                  onChange={(e) => setTestForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                  className="w-full text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl p-2 focus:outline-none text-stone-800 dark:text-stone-200"
                />
              </div>

              <div>
                <label className="text-[9px] text-stone-400 block mb-1">Arrival Date</label>
                <input
                  type="date"
                  value={testForm.checkInDate}
                  onChange={(e) => setTestForm(prev => ({ ...prev, checkInDate: e.target.value }))}
                  className="w-full text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl p-2 focus:outline-none text-stone-800 dark:text-stone-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-stone-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Dispatch Alert</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </CrmLayout>
  );
}
