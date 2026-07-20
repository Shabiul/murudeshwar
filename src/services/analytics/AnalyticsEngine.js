import { supabase } from '../../utils/supabaseClient';

export const AnalyticsEngine = {
  async getRevenueMetrics(propertyId = 'all') {
    let query = supabase.from('crm_payments').select('amount, payment_date, status');
    if (propertyId && propertyId !== 'all') {
      query = query.eq('property_id', propertyId);
    }
    const { data, error } = await query;
    if (error) throw error;

    const successfulPayments = (data || []).filter(p => p.status === 'Successful');

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let today = 0, week = 0, month = 0, year = 0;

    successfulPayments.forEach(p => {
      const pDate = new Date(p.payment_date);
      const amt = parseFloat(p.amount) || 0;
      const pDateStr = p.payment_date.split('T')[0];

      if (pDateStr === todayStr) today += amt;
      if (pDate >= startOfWeek) week += amt;
      if (pDate >= startOfMonth) month += amt;
      if (pDate >= startOfYear) year += amt;
    });

    return { today, week, month, year };
  },

  async getOccupancyMetrics(propertyId = 'all') {
    let query = supabase.from('rooms').select('status');
    if (propertyId && propertyId !== 'all') {
      query = query.eq('property_id', propertyId);
    }
    const { data, error } = await query;
    if (error) throw error;

    const rooms = data || [];
    const total = rooms.length;
    const occupied = rooms.filter(r => r.status === 'Occupied').length;
    const reserved = rooms.filter(r => r.status === 'Reserved').length;
    const available = rooms.filter(r => r.status === 'Available').length;
    const cleaning = rooms.filter(r => r.status === 'Cleaning').length;
    const maintenance = rooms.filter(r => r.status === 'Maintenance').length;
    
    const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;

    return {
      percentage,
      total,
      occupied,
      reserved,
      available,
      cleaning,
      maintenance
    };
  },

  async getGuestMetrics(propertyId = 'all') {
    let customerQuery = supabase.from('customers').select('*');
    let bookingsQuery = supabase.from('bookings').select('customer_id, total_price, check_in, check_out');
    
    if (propertyId && propertyId !== 'all') {
      customerQuery = customerQuery.eq('property_id', propertyId);
      bookingsQuery = bookingsQuery.eq('property_id', propertyId);
    }

    const [custRes, bookRes] = await Promise.all([customerQuery, bookingsQuery]);
    if (custRes.error) throw custRes.error;
    if (bookRes.error) throw bookRes.error;

    const customers = custRes.data || [];
    const bookings = bookRes.data || [];

    const vipCount = customers.filter(c => c.vip_tag === true || c.vip_tag === 'true').length;

    const guestBookingCounts = {};
    let totalSpend = 0;
    let totalDays = 0;

    bookings.forEach(b => {
      guestBookingCounts[b.customer_id] = (guestBookingCounts[b.customer_id] || 0) + 1;
      totalSpend += parseFloat(b.total_price) || 0;
      
      const inDate = new Date(b.check_in);
      const outDate = new Date(b.check_out);
      const diffTime = Math.abs(outDate - inDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      totalDays += diffDays;
    });

    let newGuests = 0;
    let returningGuests = 0;

    customers.forEach(c => {
      const count = guestBookingCounts[c.id] || 0;
      if (count > 1) {
        returningGuests++;
      } else {
        newGuests++;
      }
    });

    const avgStay = bookings.length > 0 ? parseFloat((totalDays / bookings.length).toFixed(1)) : 0;
    const avgSpend = customers.length > 0 ? Math.round(totalSpend / customers.length) : 0;

    return {
      newGuests,
      returningGuests,
      vipGuests: vipCount,
      averageStay: avgStay,
      averageSpend: avgSpend
    };
  },

  async getOperationsMetrics(propertyId = 'all') {
    let housekeepingQuery = supabase.from('housekeeping_tasks').select('status');
    let maintenanceQuery = supabase.from('maintenance_requests').select('status');
    let tasksQuery = supabase.from('tasks').select('status');
    let inventoryQuery = supabase.from('inventory_items').select('quantity, min_quantity');

    if (propertyId && propertyId !== 'all') {
      housekeepingQuery = housekeepingQuery.eq('property_id', propertyId);
      maintenanceQuery = maintenanceQuery.eq('property_id', propertyId);
      tasksQuery = tasksQuery.eq('property_id', propertyId);
      inventoryQuery = inventoryQuery.eq('property_id', propertyId);
    }

    const [hkRes, maintRes, taskRes, invRes] = await Promise.all([
      housekeepingQuery,
      maintenanceQuery,
      tasksQuery,
      inventoryQuery
    ]);

    const pendingHk = (hkRes.data || []).filter(t => t.status !== 'Completed').length;
    const pendingMaint = (maintRes.data || []).filter(t => t.status !== 'Completed' && t.status !== 'Verified').length;
    const pendingTasks = (taskRes.data || []).filter(t => t.status !== 'completed').length;
    const openComplaints = pendingMaint;
    const inventoryAlerts = (invRes.data || []).filter(i => i.quantity <= i.min_quantity).length;

    return {
      pendingHousekeeping: pendingHk,
      pendingMaintenance: pendingMaint,
      pendingTasks,
      openComplaints,
      inventoryAlerts
    };
  },

  async getBusinessKPIs(propertyId = 'all') {
    let paymentsQuery = supabase.from('crm_payments').select('amount, payment_date, status');
    let bookingsQuery = supabase.from('bookings').select('id, total_price, customer_id, created_at');

    if (propertyId && propertyId !== 'all') {
      paymentsQuery = paymentsQuery.eq('property_id', propertyId);
      bookingsQuery = bookingsQuery.eq('property_id', propertyId);
    }

    const [payRes, bookRes] = await Promise.all([paymentsQuery, bookingsQuery]);
    const payments = (payRes.data || []).filter(p => p.status === 'Successful');
    const bookings = bookRes.data || [];

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    let revenueThisMonth = 0;
    let revenueLastMonth = 0;
    let bookingsThisMonth = 0;
    let bookingsLastMonth = 0;

    payments.forEach(p => {
      const pDate = new Date(p.payment_date);
      const amt = parseFloat(p.amount) || 0;
      if (pDate >= thisMonthStart) revenueThisMonth += amt;
      else if (pDate >= lastMonthStart && pDate <= lastMonthEnd) revenueLastMonth += amt;
    });

    bookings.forEach(b => {
      const bDate = new Date(b.created_at || b.check_in);
      if (bDate >= thisMonthStart) bookingsThisMonth++;
      else if (bDate >= lastMonthStart && bDate <= lastMonthEnd) bookingsLastMonth++;
    });

    const revenueGrowth = revenueLastMonth > 0 
      ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100) 
      : 0;

    const bookingGrowth = bookingsLastMonth > 0 
      ? Math.round(((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100) 
      : 0;

    const guestBookings = {};
    bookings.forEach(b => {
      guestBookings[b.customer_id] = (guestBookings[b.customer_id] || 0) + 1;
    });

    const totalCustomers = Object.keys(guestBookings).length;
    const repeatCustomers = Object.values(guestBookings).filter(c => c > 1).length;

    const repeatGuestRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;
    const customerRetention = repeatGuestRate;

    const totalBookingValue = bookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
    const averageBookingValue = bookings.length > 0 ? Math.round(totalBookingValue / bookings.length) : 0;

    return {
      revenueGrowth,
      bookingGrowth,
      customerRetention,
      repeatGuestRate,
      averageBookingValue
    };
  }
};
