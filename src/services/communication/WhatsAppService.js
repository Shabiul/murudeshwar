import { supabase } from '../../utils/supabaseClient';

const DEFAULT_TEMPLATES = [
  {
    id: 'booking_confirm',
    name: 'Booking Confirmation',
    body: 'Hello {{guest_name}}, your booking at {{resort_name}} is confirmed! Room: {{room_number}}, Check-in: {{check_in}}.'
  },
  {
    id: 'payment_confirm',
    name: 'Payment Receipt',
    body: 'Dear {{guest_name}}, we have successfully received your payment of INR {{amount}} for invoice {{invoice_number}}.'
  },
  {
    id: 'staff_assignment',
    name: 'Task Assignment',
    body: 'Hi {{staff_name}}, you have been assigned a new {{task_type}} task: {{task_details}}.'
  },
  {
    id: 'feedback_request',
    name: 'Post-Stay Feedback',
    body: 'Hi {{guest_name}}, thank you for staying at {{resort_name}}! We would appreciate your feedback here: {{feedback_link}}.'
  },
  {
    id: 'admin_daily_summary',
    name: 'Daily Summary Report',
    body: 'Resort Daily Summary - Revenue Today: INR {{revenue}}, Occupancy: {{occupancy}}%, Pending Maintenance: {{maint_count}}.'
  }
];

export const WhatsAppService = {
  getTemplates() {
    const saved = localStorage.getItem('whatsapp_templates');
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
    localStorage.setItem('whatsapp_templates', JSON.stringify(templates));
  },

  async sendMessage(recipient, message, templateName = null, propertyId = null) {
    console.log(`[WhatsAppService] Sending to ${recipient}: "${message}"`);

    // Log to whatsapp_logs
    const { error: logError } = await supabase.from('whatsapp_logs').insert([{
      property_id: propertyId || '00000000-0000-0000-0000-000000000001',
      recipient,
      message,
      template_name: templateName,
      status: 'sent'
    }]);

    if (logError) console.error("Error writing WhatsApp log", logError);

    // Log to unified communication_logs
    const { error: commError } = await supabase.from('communication_logs').insert([{
      property_id: propertyId || '00000000-0000-0000-0000-000000000001',
      recipient,
      channel: 'whatsapp',
      type: templateName || 'Custom Message',
      template_name: templateName,
      status: 'sent',
      payload: { message }
    }]);

    if (commError) console.error("Error writing comm log", commError);

    return { success: true };
  },

  async sendBookingConfirmation(booking, customer, propertyId = null) {
    const templates = this.getTemplates();
    const tmpl = templates.find(t => t.id === 'booking_confirm') || DEFAULT_TEMPLATES[0];
    
    let body = tmpl.body
      .replace('{{guest_name}}', customer.full_name)
      .replace('{{resort_name}}', 'Murudeshwara Resort')
      .replace('{{room_number}}', booking.room_number || booking.room_id || 'Assigned')
      .replace('{{check_in}}', booking.check_in);

    return this.sendMessage(customer.phone || 'Guest Phone', body, 'Booking Confirmation', propertyId);
  },

  async sendPaymentConfirmation(payment, customer, propertyId = null) {
    const templates = this.getTemplates();
    const tmpl = templates.find(t => t.id === 'payment_confirm') || DEFAULT_TEMPLATES[1];
    
    let body = tmpl.body
      .replace('{{guest_name}}', customer.full_name)
      .replace('{{amount}}', payment.amount)
      .replace('{{invoice_number}}', payment.invoice_id || 'N/A');

    return this.sendMessage(customer.phone || 'Guest Phone', body, 'Payment Receipt', propertyId);
  },

  async sendInvoiceReady(invoice, customer, propertyId = null) {
    const message = `Hello ${customer.full_name}, your invoice ${invoice.id} for INR ${invoice.total_amount || invoice.amount} is ready. Thank you!`;
    return this.sendMessage(customer.phone || 'Guest Phone', message, 'Invoice Ready', propertyId);
  },

  async sendCheckInReminder(booking, customer, propertyId = null) {
    const message = `Dear ${customer.full_name}, we look forward to welcoming you tomorrow! Check-in starts at 12:00 PM.`;
    return this.sendMessage(customer.phone || 'Guest Phone', message, 'Check-in Reminder', propertyId);
  },

  async sendCheckOutReminder(booking, customer, propertyId = null) {
    const message = `Dear ${customer.full_name}, this is a reminder that checkout is tomorrow at 10:00 AM. Safe travels!`;
    return this.sendMessage(customer.phone || 'Guest Phone', message, 'Check-out Reminder', propertyId);
  },

  async sendFeedbackRequest(booking, customer, propertyId = null) {
    const templates = this.getTemplates();
    const tmpl = templates.find(t => t.id === 'feedback_request') || DEFAULT_TEMPLATES[3];
    
    let body = tmpl.body
      .replace('{{guest_name}}', customer.full_name)
      .replace('{{resort_name}}', 'Murudeshwara Resort')
      .replace('{{feedback_link}}', 'https://murudeshwararesort.com/feedback');

    return this.sendMessage(customer.phone || 'Guest Phone', body, 'Post-Stay Feedback', propertyId);
  },

  async sendStaffAssignment(staff, taskTitle, type = 'housekeeping', propertyId = null) {
    const templates = this.getTemplates();
    const tmpl = templates.find(t => t.id === 'staff_assignment') || DEFAULT_TEMPLATES[2];
    
    let body = tmpl.body
      .replace('{{staff_name}}', staff.full_name)
      .replace('{{task_type}}', type)
      .replace('{{task_details}}', taskTitle);

    return this.sendMessage(staff.phone || 'Staff Phone', body, 'Task Assignment', propertyId);
  },

  async sendAdminSummary(adminPhone, summary, propertyId = null) {
    const templates = this.getTemplates();
    const tmpl = templates.find(t => t.id === 'admin_daily_summary') || DEFAULT_TEMPLATES[4];
    
    let body = tmpl.body
      .replace('{{revenue}}', summary.revenue)
      .replace('{{occupancy}}', summary.occupancy)
      .replace('{{maint_count}}', summary.pendingMaintenance);

    return this.sendMessage(adminPhone, body, 'Daily Summary Report', propertyId);
  }
};
