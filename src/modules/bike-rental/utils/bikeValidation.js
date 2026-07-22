/**
 * Bike Rental Validation Rules (Dates, DL format, Pricing)
 */

export function validateBikeBookingForm(formData) {
  const errors = {};

  if (!formData.customer_name || formData.customer_name.trim().length < 2) {
    errors.customer_name = 'Customer full name is required.';
  }

  if (!formData.customer_phone || !/^[+\d\s-]{10,15}$/.test(formData.customer_phone.trim())) {
    errors.customer_phone = 'Valid 10-digit phone number is required.';
  }

  if (!formData.driving_license_no || formData.driving_license_no.trim().length < 5) {
    errors.driving_license_no = 'Driving license number is required.';
  }

  if (!formData.start_time || !formData.end_time) {
    errors.dates = 'Start date and return date are required.';
  } else {
    const start = new Date(formData.start_time);
    const end = new Date(formData.end_time);
    if (end <= start) {
      errors.dates = 'Return date must be strictly after pickup date.';
    }
  }

  if (!formData.bike_id) {
    errors.bike_id = 'A bike must be selected for reservation.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function calculateBikeRentalCost(dailyRate, startTime, endTime) {
  if (!startTime || !endTime || !dailyRate) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffHours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
  const days = Math.max(1, Math.ceil(diffHours / 24));
  return days * dailyRate;
}
