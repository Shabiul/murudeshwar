import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_PAYMENTS = [
  { id: 'pay-1', booking_id: 'BK-1002', amount: 15000, payment_method: 'UPI', payment_type: 'Advance', status: 'Completed', created_at: '2026-07-17T09:30:00Z' },
  { id: 'pay-2', booking_id: 'BK-1004', amount: 4500, payment_method: 'Card', payment_type: 'Final Payment', status: 'Completed', created_at: '2026-07-17T11:15:00Z' },
  { id: 'pay-3', booking_id: 'BK-1005', amount: 800, payment_method: 'Cash', payment_type: 'Advance', status: 'Pending', created_at: '2026-07-17T12:00:00Z' },
  { id: 'pay-4', booking_id: 'BK-1006', amount: 12000, payment_method: 'Bank Transfer', payment_type: 'Final Payment', status: 'Completed', created_at: '2026-07-16T14:45:00Z' },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form State
  const [form, setForm] = useState({
    booking_id: '',
    amount: '',
    payment_method: 'UPI',
    payment_type: 'Advance',
    status: 'Completed'
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data && data.length > 0 ? data : MOCK_PAYMENTS);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setPayments(MOCK_PAYMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        booking_id: form.booking_id,
        amount: parseFloat(form.amount),
        payment_method: form.payment_method,
        payment_type: form.payment_type,
        status: form.status
      };

      const { data, error } = await supabase
        .from('crm_payments')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setPayments(prev => [data[0], ...prev]);
      } else {
        const newMock = {
          id: `pay-mock-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString()
        };
        setPayments(prev => [newMock, ...prev]);
      }

      setIsLogOpen(false);
      setForm({
        booking_id: '',
        amount: '',
        payment_method: 'UPI',
        payment_type: 'Advance',
        status: 'Completed'
      });
    } catch (err) {
      console.error('Error creating payment:', err);
    }
  };

  const handleVerifyPayment = async (id) => {
    try {
      const { error } = await supabase
        .from('crm_payments')
        .update({ status: 'Completed' })
        .eq('id', id);

      if (error) throw error;

      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Completed' } : p));
    } catch (err) {
      console.error('Error verifying payment:', err);
      // fallback mock update
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Completed' } : p));
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchMethod = filterMethod === 'All' || p.payment_method === filterMethod;
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchMethod && matchStatus;
  });

  const totalCollected = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const pendingVerification = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const upiCollected = payments
    .filter(p => p.status === 'Completed' && p.payment_method === 'UPI')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const cashCollected = payments
    .filter(p => p.status === 'Completed' && p.payment_method === 'Cash')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <CrmLayout title="Payment Ledger" subtitle="Trace resort payments, verify UPI transfers, and manage offline collections.">
      <div className="relative font-sans text-slate-800">
        
        {/* KPI Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Verified</p>
            <h3 className="text-3xl font-serif text-slate-900">₹{totalCollected.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-emerald-600 mt-2">● Active resort revenue</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">UPI Ledger</p>
            <h3 className="text-3xl font-serif text-slate-900 font-medium">₹{upiCollected.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-indigo-600 mt-2">⚡ Direct scan & pay</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Cash Counter</p>
            <h3 className="text-3xl font-serif text-slate-900">₹{cashCollected.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-amber-600 mt-2">💵 Handover receipts</p>
          </div>

          <div className={`border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-colors ${pendingVerification > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200/80'}`}>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${pendingVerification > 0 ? 'text-amber-700' : 'text-slate-400'}`}>Pending Verification</p>
              <h3 className={`text-3xl font-serif ${pendingVerification > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
                ₹{pendingVerification.toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-slate-500 mt-2">
                {pendingVerification > 0 ? '⚠️ Awaiting reference validation' : '✅ Ledger fully clean'}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Filter Method</label>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-700 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="All">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-700 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setIsLogOpen(true)}
            className="w-full lg:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            💳 Log Offline Payment
          </button>
        </div>

        {/* Payments Table */}
        <div className="bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-serif text-xl text-slate-900">Transaction Logs</h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-medium">
              {filteredPayments.length} entries shown
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  <th className="py-4 px-8">Booking ID</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Logged At</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">Loading ledger records...</td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">No payment logs match filter queries.</td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-8 font-mono font-semibold text-slate-900">{p.booking_id}</td>
                      <td className="py-4 px-6 font-bold text-slate-900">₹{parseFloat(p.amount).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6 font-semibold">{p.payment_method}</td>
                      <td className="py-4 px-6 text-slate-500">{p.payment_type}</td>
                      <td className="py-4 px-6 text-slate-400">{new Date(p.created_at).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          p.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          p.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-8 text-right">
                        {p.status === 'Pending' && (
                          <button
                            onClick={() => handleVerifyPayment(p.id)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 font-bold uppercase text-[9px] tracking-wider px-3 py-1.5 rounded-xl transition-all"
                          >
                            ✓ Verify Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Log Payment Modal */}
        <AnimatePresence>
          {isLogOpen && (
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
                  onClick={() => setIsLogOpen(false)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-800 transition-colors"
                >
                  ✕
                </button>

                <h3 className="font-serif text-3xl text-slate-900 mb-1">Log Offline Payment</h3>
                <p className="text-slate-500 text-xs mb-6 font-medium">Record a manual UPI, Card, Transfer, or Cash reception.</p>

                <form onSubmit={handleCreatePayment} className="space-y-4 text-left font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Booking Reference / ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BK-1002"
                      value={form.booking_id}
                      onChange={(e) => setForm(prev => ({ ...prev, booking_id: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Method</label>
                      <select
                        value={form.payment_method}
                        onChange={(e) => setForm(prev => ({ ...prev, payment_method: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                      >
                        <option value="UPI">UPI Scan</option>
                        <option value="Card">Card Swipe</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash payment</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Payment Type</label>
                      <select
                        value={form.payment_type}
                        onChange={(e) => setForm(prev => ({ ...prev, payment_type: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                      >
                        <option value="Advance">Advance deposit</option>
                        <option value="Final Payment">Final checkout pay</option>
                        <option value="Refund">Refund processing</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                    >
                      <option value="Completed">Verified Completed</option>
                      <option value="Pending">Pending Verification</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Register Payment Entry
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
