import { supabase } from '../../utils/supabaseClient';

const DEFAULT_TEMPLATES = [
  {
    id: 'booking_confirm_email',
    name: 'Booking Confirmation Email',
    subject: 'Your Booking at Murudeshwara Resort is Confirmed!',
    body: 'Dear {{guest_name}},\n\nThank you for booking with us. Your reservation is confirmed.\nRoom: {{room_number}}\nCheck-in: {{check_in}}\nCheck-out: {{check_out}}\nTotal Price: INR {{total_price}}\n\nWarm regards,\nMurudeshwara Resort Team'
  },
  {
    id: 'welcome_email',
    name: 'Welcome Email',
    subject: 'Welcome to Murudeshwara Resort',
    body: 'Dear {{guest_name}},\n\nWe are delighted to have you stay with us! Murudeshwara is known for its beautiful coastline and temple attractions. Let us know if you would like to book any Scuba Diving or Bike Rental activities during your stay.\n\nWarm regards,\nFront Desk Team'
  },
  {
    id: 'invoice_email',
    name: 'Invoice Ready',
    subject: 'Your Resort Invoice is Ready',
    body: 'Dear {{guest_name}},\n\nYour invoice for Room {{room_number}} is ready. The outstanding amount is INR {{amount}}.\nPlease review the details attached.\n\nThank you,\nFinance Department'
  },
  {
    id: 'review_request_email',
    name: 'Post-Stay Review Request',
    subject: 'How was your stay at Murudeshwara Resort?',
    body: 'Dear {{guest_name}},\n\nWe hope you had a wonderful holiday at Murudeshwara. Please take 2 minutes to share your feedback. Your suggestions help us improve our services.\n\nRate us here: https://murudeshwararesort.com/feedback\n\nThank you,\nResort Manager'
  },
  {
    id: 'inventory_alert_email',
    name: 'Inventory Stock Alert',
    subject: 'CRITICAL WARNING: Low Inventory Stock',
    body: 'Attention Management,\n\nThe following inventory items have fallen below their minimum replenishment levels:\n\n{{alert_details}}\n\nPlease restock these immediately.'
  }
];

export const EmailService = {
  getTemplates() {
    const saved = localStorage.getItem('email_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_TEMPLATES;
      }
    }
    return DEFAULT_TEMPLATES;
  },

  saveTemplates(templates) {
    localStorage.setItem('email_templates', JSON.stringify(templates));
  },

  async sendEmail(recipient, subject, body, templateName = null, propertyId = null) {
    console.log(`[EmailService] Sending Email to ${recipient} | Subject: "${subject}"`);

    // Log to email_logs
    const { error: logError } = await supabase.from('email_logs').insert([{
      property_id: propertyId || '00000000-0000-0000-0000-000000000001',
      recipient,
      subject,
      body,
      status: 'sent'
    }]);

    if (logError) console.error("Error writing Email log", logError);

    // Log to unified communication_logs
    const { error: commError } = await supabase.from('communication_logs').insert([{
      property_id: propertyId || '00000000-0000-0000-0000-000000000001',
      recipient,
      channel: 'email',
      type: templateName || 'Custom Email',
      template_name: templateName,
      status: 'sent',
      payload: { subject, body }
    }]);

    if (commError) console.error("Error writing comm log", commError);

    return { success: true };
  },

  async sendBookingConfirmation(booking, customer, propertyId = null) {
    const templates = this.getTemplates();
    const tmpl = templates.find(t => t.id === 'booking_confirm_email') || DEFAULT_TEMPLATES[0];

    let body = tmpl.body
      .replace('{{guest_name}}', customer.full_name)
      .replace('{{room_number}}', booking.room_number || booking.room_id || 'Assigned')
      .replace('{{check_in}}', booking.check_in)
      .replace('{{check_out}}', booking.check_out)
      .replace('{{total_price}}', booking.total_price);

    return this.sendEmail(customer.email || 'guest@example.com', tmpl.subject, body, 'Booking Confirmation', propertyId);
  },

  async sendWelcomeEmail(customer, propertyId = null) {
    const templates = this.getTemplates();
    const tmpl = templates.find(t => t.id === 'welcome_email') || DEFAULT_TEMPLATES[1];

    let body = tmpl.body.replace('{{guest_name}}', customer.full_name);

    return this.sendEmail(customer.email || 'guest@example.com', tmpl.subject, body, 'Welcome Email', propertyId);
  },

  async sendPaymentReceipt(payment, customer, propertyId = null) {
    const subject = `Payment Receipt - INR ${payment.amount}`;
    const body = `Dear ${customer.full_name},\n\nWe have successfully received payment of INR ${payment.amount} for your booking.\nPayment Date: ${payment.payment_date}\nTransaction ID: ${payment.id}\n\nThank you,\nAccounting Team`;

    return this.sendEmail(customer.email || 'guest@example.com', subject, body, 'Payment Receipt', propertyId);
  },

  async sendInvoice(invoice, customer, booking, propertyId = null) {
    const templates = this.getTemplates();
    const tmpl = templates.find(t => t.id === 'invoice_email') || DEFAULT_TEMPLATES[2];

    let body = tmpl.body
      .replace('{{guest_name}}', customer.full_name)
      .replace('{{room_number}}', booking?.room_number || 'Reserved')
      .replace('{{amount}}', invoice.total_amount || invoice.amount);

    return this.sendEmail(customer.email || 'guest@example.com', tmpl.subject, body, 'Invoice Ready', propertyId);
  },

  async sendCheckInGuide(booking, customer, propertyId = null) {
    const subject = 'Your Check-in Guide for Murudeshwara Resort';
    const body = `Dear ${customer.full_name},\n\nWelcome! Here is your quick resort guide:\n1. Front desk check-in: 12:00 PM\n2. Keycards can be fetched using your phone booking ID.\n3. Free Wi-Fi: Murudeshwar_Resort_Guest (no password).\n4. Breakfast: 7:30 AM - 10:30 AM at OceanView Restaurant.\n\nEnjoy your stay!`;

    return this.sendEmail(customer.email || 'guest@example.com', subject, body, 'Check-in Guide', propertyId);
  },

  async sendCheckOutSummary(booking, customer, propertyId = null) {
    const subject = 'Your Stay Summary - Murudeshwara Resort';
    const body = `Dear ${customer.full_name},\n\nThank you for choosing to stay with us. Your checkout has been processed.\nStay duration: ${booking.check_in} to ${booking.check_out}.\nWe look forward to welcoming you back!`;

    return this.sendEmail(customer.email || 'guest@example.com', subject, body, 'Check-out Summary', propertyId);
  },

  async sendReviewRequest(booking, customer, propertyId = null) {
    const templates = this.getTemplates();
    const tmpl = templates.find(t => t.id === 'review_request_email') || DEFAULT_TEMPLATES[3];

    let body = tmpl.body.replace('{{guest_name}}', customer.full_name);

    return this.sendEmail(customer.email || 'guest@example.com', tmpl.subject, body, 'Post-Stay Review Request', propertyId);
  },

  async sendInventoryAlert(lowItems, propertyId = null) {
    const templates = this.getTemplates();
    const tmpl = templates.find(t => t.id === 'inventory_alert_email') || DEFAULT_TEMPLATES[4];

    const alertDetails = lowItems.map(i => `- ${i.name} (Qty: ${i.quantity}, Min Qty: ${i.min_quantity})`).join('\n');
    let body = tmpl.body.replace('{{alert_details}}', alertDetails);

    // Send to default administration email
    return this.sendEmail('admin@murudeshwararesort.com', tmpl.subject, body, 'Inventory Stock Alert', propertyId);
  },

  async sendMaintenanceAlert(request, staff = null, propertyId = null) {
    const subject = `NEW Maintenance Alert - Room ${request.room_number || 'General'}`;
    const body = `Dear Staff,\n\nA new urgent maintenance request has been logged:\n\nRoom: ${request.room_number || 'General'}\nCategory: ${request.category}\nPriority: ${request.priority}\nDescription: ${request.description}\nAssigned Staff: ${staff?.full_name || 'Unassigned'}\n\nPlease attend to this promptly.`;

    return this.sendEmail('maintenance@murudeshwararesort.com', subject, body, 'Maintenance Alert', propertyId);
  },

  async sendInternalReport(reportType, reportData, propertyId = null) {
    const subject = `CRM Internal Report - ${reportType}`;
    const body = `Management Daily/Weekly Report for ${new Date().toLocaleDateString()}\n\nSummary details:\n- Revenue Total: INR ${reportData.revenue}\n- Occupancy Rate: ${reportData.occupancy}%\n- Pending Repairs: ${reportData.pendingMaintenance}\n- Pending Housekeeping Tasks: ${reportData.pendingHousekeeping}\n- Inventory Warnings: ${reportData.inventoryAlerts}\n\nGenerated automatically by Murudeshwara CRM.`;

    return this.sendEmail('reports@murudeshwararesort.com', subject, body, 'Internal Report', propertyId);
  }
};
