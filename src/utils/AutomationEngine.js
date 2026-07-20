/**
 * Murudeshwara Resort CRM Automation Engine
 * Runs rule-based triggers on operational tables to raise real-time alert logs.
 */
export function runAutomationRules({ bookings = [], rooms = [], rentals = [], orders = [] }) {
  const alerts = [];
  const now = new Date();

  // 1. Checkout Reminders
  bookings.forEach(b => {
    if (b.status === 'Confirmed') {
      const checkoutDate = new Date(b.checkout_date);
      const diffTime = checkoutDate - now;
      const diffHours = diffTime / (1000 * 60 * 60);

      // If check-out is within 24 hours
      if (diffHours > 0 && diffHours <= 24) {
        alerts.push({
          id: `alert-checkout-${b.id}`,
          type: 'Checkout Reminder',
          severity: 'info',
          message: `Guest ${b.customer_name} (Room ${b.room_number}) scheduled checkout in ${Math.round(diffHours)} hours.`,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // 2. Room Double Bookings (Conflicts)
  const roomBookings = {};
  bookings.forEach(b => {
    if (b.status === 'Confirmed') {
      if (!roomBookings[b.room_number]) roomBookings[b.room_number] = [];
      roomBookings[b.room_number].push(b);
    }
  });

  Object.keys(roomBookings).forEach(roomNum => {
    const list = roomBookings[roomNum];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const b1 = list[i];
        const b2 = list[j];
        const start1 = new Date(b1.checkin_date);
        const end1 = new Date(b1.checkout_date);
        const start2 = new Date(b2.checkin_date);
        const end2 = new Date(b2.checkout_date);

        if (start1 < end2 && start2 < end1) {
          alerts.push({
            id: `alert-conflict-${b1.id}-${b2.id}`,
            type: 'Booking Overlap',
            severity: 'critical',
            message: `Room Conflict! Room ${roomNum} has overlapping bookings: ${b1.customer_name} & ${b2.customer_name}.`,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  });

  // 3. Rental Overdue Alerts
  rentals.forEach(r => {
    if (r.status === 'Active') {
      const startTime = new Date(r.rental_start);
      const diffHours = (now - startTime) / (1000 * 60 * 60);

      // If checked out for more than 24 hours and still not returned
      if (diffHours > 24) {
        alerts.push({
          id: `alert-rental-${r.id}`,
          type: 'Overdue Rental',
          severity: 'warning',
          message: `Rental vehicle ${r.model_name} (${r.license_plate}) check-out overdue by ${Math.floor(diffHours - 24)} hours.`,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // 4. Large F&B Orders (Alert for kitchen prioritization)
  orders.forEach(o => {
    if (o.status === 'Pending' || o.status === 'Preparing') {
      if (parseFloat(o.total_amount) > 1000) {
        alerts.push({
          id: `alert-fb-${o.id}`,
          type: 'High Priority KOT',
          severity: 'warning',
          message: `High value food order logged for ${o.table_number || o.room_number || 'Takeaway'} (Total: ₹${o.total_amount}).`,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  return alerts;
}
