import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import CrmLayout from './CrmLayout';
import {
  SERVICES,
  statusStyles,
  serviceStyles,
  getServiceLabel,
  getStatusLabel,
} from '../../utils/crmConstants';
import { formatDate, isToday } from '../../utils/crmHelpers';

function KpiCard({ label, value, sub, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">{label}</p>
      <p className={classNames('text-3xl font-serif font-bold', accent || 'text-stone-900')}>{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function CrmOverview() {
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [bookingsRes, staffRes] = await Promise.all([
      supabase.from('leads').select('*, assigned:assigned_to(id, full_name)').order('created_at', { ascending: false }),
      isAdmin ? supabase.from('staff').select('*').eq('is_active', true) : Promise.resolve({ data: [] }),
    ]);
    setBookings(bookingsRes.data || []);
    setStaff(staffRes.data || []);
    setLoading(false);
  };

  const stats = useMemo(() => {
    const todayCheckIns = bookings.filter(
      (b) => b.service_type === 'Stay' && b.details?.checkIn && isToday(b.details.checkIn)
    ).length;
    const active = bookings.filter((b) => ['confirmed', 'checked_in'].includes(b.status)).length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const byService = SERVICES.reduce((acc, s) => {
      acc[s.key] = bookings.filter((b) => b.service_type === s.key).length;
      return acc;
    }, {});
    return { todayCheckIns, active, pending, byService, total: bookings.length };
  }, [bookings]);

  if (loading) {
    return (
      <CrmLayout title="Overview">
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-brand-gold border-t-transparent" />
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout title="Overview" subtitle="Your hospitality operations at a glance">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total Bookings" value={stats.total} sub="All services" />
        <KpiCard label="Active" value={stats.active} sub="Confirmed & checked in" accent="text-emerald-600" />
        <KpiCard label="Pending" value={stats.pending} sub="Awaiting confirmation" accent="text-amber-600" />
        <KpiCard label="Today's Check-ins" value={stats.todayCheckIns} sub="Beach front stay" accent="text-sky-600" />
      </div>

      {/* Service breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {SERVICES.filter((s) => s.key !== 'Contact').map((s) => (
          <Link
            key={s.key}
            to={`/crm/bookings?service=${s.key}`}
            className="bg-white rounded-2xl border border-black/5 p-5 hover:border-brand-gold/40 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <svg className="w-7 h-7 text-stone-500 group-hover:text-brand-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
              <span className="text-2xl font-serif font-bold text-stone-900 group-hover:text-brand-gold transition-colors">
                {stats.byService[s.key] || 0}
              </span>
            </div>
            <p className="text-sm font-medium text-stone-700 mt-2">{s.label}</p>
            <p className="text-xs text-stone-400">View bookings →</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent bookings */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
            <h2 className="font-serif text-lg text-stone-900">Recent Bookings</h2>
            <Link to="/crm/bookings" className="text-xs font-semibold text-brand-gold hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-black/5">
            {bookings.slice(0, 6).map((b) => (
              <Link
                key={b.id}
                to={`/crm/bookings/${b.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-sm font-bold text-stone-500 shrink-0">
                  {b.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{b.name}</p>
                  <p className="text-xs text-stone-400">{formatDate(b.created_at)}</p>
                </div>
                <span className={classNames('text-[10px] font-semibold px-2.5 py-1 rounded-full border', serviceStyles[b.service_type])}>
                  {getServiceLabel(b.service_type)}
                </span>
                <span className={classNames('text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize', statusStyles[b.status])}>
                  {getStatusLabel(b.status)}
                </span>
              </Link>
            ))}
            {bookings.length === 0 && (
              <p className="px-6 py-12 text-center text-sm text-stone-400">No bookings yet</p>
            )}
          </div>
        </div>

        {/* Staff on duty */}
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
            <h2 className="font-serif text-lg text-stone-900">Staff</h2>
            {isAdmin && (
              <Link to="/crm/staff" className="text-xs font-semibold text-brand-gold hover:underline">
                Manage
              </Link>
            )}
          </div>
          <div className="p-4 space-y-3">
            {staff.slice(0, 5).map((s) => (
              <Link
                key={s.id}
                to={`/crm/staff/${s.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors"
              >
                {s.avatar_url ? (
                  <img src={s.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-bold">
                    {s.full_name?.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{s.full_name}</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {(s.categories || []).slice(0, 2).map((c) => (
                      <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">{c}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
            {staff.length === 0 && (
              <p className="text-sm text-stone-400 text-center py-8">No staff members</p>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Fleet & Rentals Overview Section */}
      <div className="mt-8 bg-white dark:bg-stone-900 rounded-2xl border border-black/5 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div>
            <h2 className="font-serif text-lg text-stone-900 dark:text-white font-bold">Vehicle Fleet & Logistics</h2>
            <p className="text-xs text-stone-400">Live operational status of bikes, scooters, cars, and chauffeur trips.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/crm/bikes/inventory" className="text-xs font-bold text-brand-gold hover:underline">
              Bike Fleet →
            </Link>
            <span className="text-stone-300">|</span>
            <Link to="/crm/cars/inventory" className="text-xs font-bold text-brand-gold hover:underline">
              Car Fleet →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800">
            <p className="text-stone-400 font-bold uppercase text-[9px] tracking-wider mb-1">Active Bike Rentals</p>
            <p className="text-2xl font-serif font-bold text-stone-900 dark:text-white">4 Units</p>
            <p className="text-[10px] text-emerald-600 mt-1">✓ Ka30 Scooters & RE Classic</p>
          </div>

          <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800">
            <p className="text-stone-400 font-bold uppercase text-[9px] tracking-wider mb-1">Car & Chauffeur Trips</p>
            <p className="text-2xl font-serif font-bold text-indigo-600 dark:text-indigo-400">3 Active</p>
            <p className="text-[10px] text-stone-400 mt-1">Thar 4x4 & Innova Crysta</p>
          </div>

          <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800">
            <p className="text-stone-400 font-bold uppercase text-[9px] tracking-wider mb-1">Fleet Availability</p>
            <p className="text-2xl font-serif font-bold text-emerald-600">82% Available</p>
            <p className="text-[10px] text-stone-400 mt-1">Ready for pickup</p>
          </div>

          <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800">
            <p className="text-stone-400 font-bold uppercase text-[9px] tracking-wider mb-1">Maintenance & Damage</p>
            <p className="text-2xl font-serif font-bold text-rose-500">2 Alerts</p>
            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">Inspection required</p>
          </div>
        </div>
      </div>
    </CrmLayout>
  );
}
