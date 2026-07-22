import React, { useState } from 'react';
import CrmLayout from '../../../components/crm/CrmLayout';
import RentalStatusBadge from '../../../components/shared/rental/RentalStatusBadge';
import DamageReportModal from '../../../components/shared/rental/DamageReportModal';

const MOCK_REPORTS = [
  {
    id: 'dmg-1',
    report_code: 'DMG-2026-001',
    vehicle_type: 'bike',
    vehicle_name: 'Royal Enfield Classic 350 (KA-30-M-9022)',
    reported_by: 'Inspector Ramesh',
    description: 'Left mirror bracket cracked upon return from beach ride.',
    estimated_cost: 850,
    status: 'Pending Review',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'dmg-2',
    report_code: 'DMG-2026-002',
    vehicle_type: 'car',
    vehicle_name: 'Toyota Innova Crysta (KA-30-P-8800)',
    reported_by: 'Driver Subhash',
    description: 'Minor scratch on rear bumper during parking.',
    estimated_cost: 2500,
    status: 'Approved',
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];

export default function MaintenanceDamagePage() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStatusUpdate = (id, newStatus) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <CrmLayout
      title="Vehicle Maintenance & Damage Audit"
      subtitle="Track damage reports, insurance claims, component replacement costs, and repair statuses."
    >
      <div className="space-y-6 font-sans text-stone-800 dark:text-stone-100">
        
        {/* Header Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Incident Resolution</span>
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">Active Damage Reports ({reports.length})</h2>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <span>+</span> File Damage Report
          </button>
        </div>

        {/* Damage Reports Table */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px] text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Vehicle Details</th>
                <th className="py-3 px-4">Inspector / Staff</th>
                <th className="py-3 px-4">Damage Description</th>
                <th className="py-3 px-4">Est. Repair Cost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                  <td className="py-4 px-4 font-mono font-bold text-stone-900 dark:text-white">
                    {r.report_code}
                  </td>

                  <td className="py-4 px-4">
                    <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mb-1 ${
                      r.vehicle_type === 'bike' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {r.vehicle_type}
                    </span>
                    <p className="font-semibold text-stone-900 dark:text-white">{r.vehicle_name}</p>
                  </td>

                  <td className="py-4 px-4 text-stone-600 dark:text-stone-300">
                    {r.reported_by}
                  </td>

                  <td className="py-4 px-4 max-w-xs text-stone-600 dark:text-stone-300">
                    {r.description}
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                    ₹{r.estimated_cost?.toLocaleString('en-IN')}
                  </td>

                  <td className="py-4 px-4">
                    <RentalStatusBadge status={r.status} />
                  </td>

                  <td className="py-4 px-4 text-right space-x-2">
                    {r.status === 'Pending Review' && (
                      <button
                        onClick={() => handleStatusUpdate(r.id, 'Approved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                      >
                        Approve Repair
                      </button>
                    )}
                    {r.status === 'Approved' && (
                      <button
                        onClick={() => handleStatusUpdate(r.id, 'Repaired')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px]"
                      >
                        Mark Repaired
                      </button>
                    )}
                    {r.status === 'Repaired' && (
                      <span className="text-emerald-600 font-bold text-[10px]">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DamageReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicle={{ id: 'v-dummy', model_name: 'Honda Activa 6G', registration_number: 'KA-30-Q-1102', vehicle_type: 'bike' }}
        onSubmit={(newRep) => {
          setReports(prev => [
            {
              id: `dmg-${Date.now()}`,
              report_code: `DMG-2026-00${prev.length + 1}`,
              vehicle_name: 'Honda Activa 6G (KA-30-Q-1102)',
              ...newRep
            },
            ...prev
          ]);
        }}
      />
    </CrmLayout>
  );
}
