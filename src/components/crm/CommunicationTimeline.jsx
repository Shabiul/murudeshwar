import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { WhatsAppService } from '../../services/communication/WhatsAppService';
import { EmailService } from '../../services/communication/EmailService';

export default function CommunicationTimeline({ propertyId = 'all' }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterChannel, setFilterChannel] = useState('all'); // 'all' | 'whatsapp' | 'email'
  const [retryingId, setRetryingId] = useState(null);

  async function fetchLogs() {
    setLoading(true);
    try {
      let query = supabase
        .from('communication_logs')
        .select('*')
        .order('sent_at', { ascending: false });

      if (propertyId !== 'all') {
        query = query.eq('property_id', propertyId);
      }
      if (filterChannel !== 'all') {
        query = query.eq('channel', filterChannel);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.warn("Failed to fetch communication logs, loading mock history", err);
      // Fallback local state mock logs
      setLogs([
        {
          id: 'log-1',
          recipient: '+91 9999988888',
          channel: 'whatsapp',
          type: 'booking_confirmation',
          template_name: 'booking_confirm_inbound',
          status: 'sent',
          sent_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          payload: { guest_name: 'Rohan Sharma' }
        },
        {
          id: 'log-2',
          recipient: 'rohan@example.com',
          channel: 'email',
          type: 'booking_confirmation',
          template_name: 'guest_welcome',
          status: 'failed',
          error_message: 'SMTP connection timeout',
          sent_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          payload: { guest_name: 'Rohan Sharma' }
        },
        {
          id: 'log-3',
          recipient: '+91 9876543210',
          channel: 'whatsapp',
          type: 'stock_alert',
          template_name: 'low_stock_notification',
          status: 'sent',
          sent_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          payload: { item_name: 'Towel' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, [propertyId, filterChannel]);

  const handleRetry = async (log) => {
    setRetryingId(log.id);
    try {
      if (log.channel === 'whatsapp') {
        await WhatsAppService.sendTemplateMessage(
          log.recipient,
          log.template_name || 'booking_confirm_inbound',
          log.payload || {}
        );
      } else {
        await EmailService.sendTemplateEmail(
          log.recipient,
          log.template_name || 'guest_welcome',
          log.payload || {}
        );
      }
      alert('Message retried and logged successfully!');
      fetchLogs();
    } catch (err) {
      alert(`Retry failed: ${err.message}`);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-3xl p-6 shadow-sm font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100">Communication Ledger</h3>
          <p className="text-xs text-stone-400">Transaction history of automated and manual outbound triggers</p>
        </div>
        <div className="flex bg-stone-100 dark:bg-stone-850 p-1 rounded-xl self-start">
          {[
            { id: 'all', label: 'All Logs' },
            { id: 'whatsapp', label: 'WhatsApp' },
            { id: 'email', label: 'Email' }
          ].map(ch => (
            <button
              key={ch.id}
              onClick={() => setFilterChannel(ch.id)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                filterChannel === ch.id
                  ? 'bg-white dark:bg-stone-900 text-brand-gold shadow-sm'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-[10px] text-stone-400">Loading timeline...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-xs text-stone-400">
          No communication records matching search filters.
        </div>
      ) : (
        <div className="relative border-l border-stone-200 dark:border-stone-800 ml-3 pl-6 space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Status Circle indicator */}
              <span className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-stone-900 ${
                log.status === 'sent' ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
              
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 block mb-1">
                    {new Date(log.sent_at).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 text-xs">
                      {log.recipient}
                    </span>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      log.channel === 'whatsapp'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                        : 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                    }`}>
                      {log.channel}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-1">
                    Template: <code className="font-mono text-stone-500">{log.template_name}</code> ({log.type})
                  </p>
                  
                  {log.status === 'failed' && log.error_message && (
                    <p className="text-[10px] text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-1 rounded-lg mt-2 border border-rose-100 dark:border-rose-900/30">
                      Error: {log.error_message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {log.status === 'failed' && (
                    <button
                      onClick={() => handleRetry(log)}
                      disabled={retryingId === log.id}
                      className="px-2.5 py-1 bg-stone-900 hover:bg-stone-850 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-semibold text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {retryingId === log.id ? (
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                        </svg>
                      )}
                      Retry Send
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
