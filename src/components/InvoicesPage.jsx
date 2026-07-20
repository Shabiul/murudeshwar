import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_INVOICES = [
  { id: 'inv-1', invoice_number: 'INV-2026-001', booking_id: 'BK-1002', customer_name: 'Akash Hegde', total_amount: 22500, discount: 1500, tax: 3780, status: 'Paid', created_at: '2026-07-17T09:30:00Z' },
  { id: 'inv-2', invoice_number: 'INV-2026-002', booking_id: 'BK-1004', customer_name: 'Sarah Mitchell', total_amount: 11200, discount: 500, tax: 1926, status: 'Partially Paid', created_at: '2026-07-17T11:15:00Z' },
  { id: 'inv-3', invoice_number: 'INV-2026-003', booking_id: 'BK-1005', customer_name: 'Karan Malhotra', total_amount: 4500, discount: 0, tax: 810, status: 'Unpaid', created_at: '2026-07-17T12:00:00Z' }
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    invoice_number: '',
    booking_id: '',
    customer_name: '',
    total_amount: '',
    discount: '0',
    tax: '0',
    status: 'Unpaid'
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data && data.length > 0 ? data : MOCK_INVOICES);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setInvoices(MOCK_INVOICES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        invoice_number: form.invoice_number || `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        booking_id: form.booking_id,
        customer_name: form.customer_name,
        total_amount: parseFloat(form.total_amount),
        discount: parseFloat(form.discount || 0),
        tax: parseFloat(form.tax || 0),
        status: form.status
      };

      const { data, error } = await supabase
        .from('crm_invoices')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setInvoices(prev => [data[0], ...prev]);
      } else {
        const newMock = {
          id: `inv-mock-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString()
        };
        setInvoices(prev => [newMock, ...prev]);
      }

      setIsCreateOpen(false);
      setForm({
        invoice_number: '',
        booking_id: '',
        customer_name: '',
        total_amount: '',
        discount: '0',
        tax: '0',
        status: 'Unpaid'
      });
    } catch (err) {
      console.error('Error creating invoice:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalInvoiced = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
  const totalPaid = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
  const outstandingAmount = totalInvoiced - totalPaid;

  return (
    <CrmLayout title="Invoice Center" subtitle="Generate dynamic invoices, configure discount models, and print resort statements.">
      <div className="relative font-sans text-slate-800 print:bg-white print:p-0">
        
        {/* Style tag specifically for pristine print layouts */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-invoice-area, #printable-invoice-area * {
              visibility: visible;
            }
            #printable-invoice-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 40px;
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}} />

        {/* KPI Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Invoiced</p>
            <h3 className="text-3xl font-serif text-slate-900">₹{totalInvoiced.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-emerald-600 mt-2">● Active resort accounts</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Receipts</p>
            <h3 className="text-3xl font-serif text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-emerald-600 mt-2">✓ Fully settled invoices</p>
          </div>

          <div className={`border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-colors ${outstandingAmount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200/80'}`}>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${outstandingAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>Outstanding Balance</p>
              <h3 className={`text-3xl font-serif ${outstandingAmount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                ₹{outstandingAmount.toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-slate-500 mt-2">
                {outstandingAmount > 0 ? '⚠️ Uncollected resort payments' : '✅ All dues collected'}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm no-print">
          <h3 className="font-serif text-lg text-slate-800">Resort Statements</h3>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full lg:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            🧾 Create New Invoice
          </button>
        </div>

        {/* Table & Invoice detail view flex container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-sm no-print">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-serif text-xl text-slate-900">Statements Log</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    <th className="py-4 px-8">Invoice #</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Booking Ref</th>
                    <th className="py-4 px-6">Total Dues</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-8 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">Loading invoice statements...</td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">No invoice records logged yet.</td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className={`hover:bg-slate-50/40 transition-colors cursor-pointer ${selectedInvoice?.id === inv.id ? 'bg-amber-50/20' : ''}`} onClick={() => setSelectedInvoice(inv)}>
                        <td className="py-4 px-8 font-mono font-semibold text-slate-900">{inv.invoice_number}</td>
                        <td className="py-4 px-6 font-semibold text-slate-900">{inv.customer_name}</td>
                        <td className="py-4 px-6 text-slate-500 font-mono">{inv.booking_id}</td>
                        <td className="py-4 px-6 font-bold text-slate-900">₹{parseFloat(inv.total_amount).toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            inv.status === 'Partially Paid' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-4 px-8 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvoice(inv);
                              setTimeout(handlePrint, 100);
                            }}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold uppercase text-[9px] tracking-wider px-3 py-1.5 rounded-xl transition-all"
                          >
                            🖨️ Print
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Display card */}
          <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-[32px] p-8 shadow-md" id="printable-invoice-area">
            {selectedInvoice ? (
              <div className="space-y-6">
                
                {/* Invoice Header */}
                <div className="border-b border-slate-100 pb-6 text-left">
                  <h2 className="font-serif text-2xl text-slate-900 tracking-wide uppercase">Murudeshwar Resort</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Bhatkal Taluk, Uttara Kannada, Karnataka</p>
                  <p className="text-[10px] text-slate-400 font-medium">GSTIN: 29AAAAA0000A1Z5</p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-xs text-left">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Bill To</p>
                    <p className="font-semibold text-slate-800 mt-1">{selectedInvoice.customer_name}</p>
                    <p className="text-slate-500 mt-1">Booking: <span className="font-mono">{selectedInvoice.booking_id}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Statement Details</p>
                    <p className="font-semibold text-slate-800 mt-1">{selectedInvoice.invoice_number}</p>
                    <p className="text-slate-400 mt-1">{new Date(selectedInvoice.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {/* Ledger Items Table */}
                <div className="border-t border-slate-100 pt-6">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100 pb-2">
                        <th>Description</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      <tr>
                        <td className="py-3">Resort Room & Activities Packages</td>
                        <td className="py-3 text-right">₹{(selectedInvoice.total_amount - selectedInvoice.tax + selectedInvoice.discount).toLocaleString('en-IN')}</td>
                      </tr>
                      {parseFloat(selectedInvoice.discount) > 0 && (
                        <tr className="text-emerald-600">
                          <td className="py-3">Discount applied</td>
                          <td className="py-3 text-right">-₹{parseFloat(selectedInvoice.discount).toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-3 text-slate-400">Resort GST/SGST (18%)</td>
                        <td className="py-3 text-right text-slate-400">₹{parseFloat(selectedInvoice.tax).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr className="font-bold text-sm text-slate-900 border-t border-slate-200 pt-3">
                        <td className="py-3">Grand Total Due</td>
                        <td className="py-3 text-right">₹{parseFloat(selectedInvoice.total_amount).toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Payment Status Label */}
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Settlement Status</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedInvoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    selectedInvoice.status === 'Partially Paid' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>

                {/* Print button on card */}
                <div className="pt-4 no-print flex gap-4">
                  <button
                    onClick={handlePrint}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs uppercase tracking-widest font-bold shadow-md transition-all"
                  >
                    🖨️ Print Statement
                  </button>
                </div>

              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 font-medium">
                Select an invoice statement from the ledger to view details & print receipt.
              </div>
            )}
          </div>

        </div>

        {/* Create Invoice Modal */}
        <AnimatePresence>
          {isCreateOpen && (
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
                  onClick={() => setIsCreateOpen(false)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-800 transition-colors"
                >
                  ✕
                </button>

                <h3 className="font-serif text-3xl text-slate-900 mb-1">Create Invoice Statement</h3>
                <p className="text-slate-500 text-xs mb-6 font-medium">Generate a new itemized resort bill record.</p>

                <form onSubmit={handleCreateInvoice} className="space-y-4 text-left font-sans">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Invoice Number</label>
                      <input
                        type="text"
                        placeholder="Auto-generated"
                        value={form.invoice_number}
                        onChange={(e) => setForm(prev => ({ ...prev, invoice_number: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Booking Reference</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BK-1002"
                        value={form.booking_id}
                        onChange={(e) => setForm(prev => ({ ...prev, booking_id: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Customer Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Akash Hegde"
                      value={form.customer_name}
                      onChange={(e) => setForm(prev => ({ ...prev, customer_name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Total Amount (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="0"
                        value={form.total_amount}
                        onChange={(e) => setForm(prev => ({ ...prev, total_amount: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Discount (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.discount}
                        onChange={(e) => setForm(prev => ({ ...prev, discount: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Resort Tax (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.tax}
                        onChange={(e) => setForm(prev => ({ ...prev, tax: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Payment Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Paid">Fully Paid</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Confirm & Create Invoice
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
