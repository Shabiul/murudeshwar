/**
 * Car Rental Validation Helpers
 */

export function validateCarBooking(formData) {
  const errors = {};

  if (!formData.customer_name || formData.customer_name.trim().length < 2) {
    errors.customer_name = 'Customer name is required.';
  }

  if (!formData.customer_phone || !/^[+\d\s-]{10,15}$/.test(formData.customer_phone.trim())) {
    errors.customer_phone = 'Valid phone number is required.';
  }

  if (!formData.car_id) {
    errors.car_id = 'A vehicle must be selected.';
  }

  if (!formData.is_chauffeur_driven && (!formData.driving_license_no || formData.driving_license_no.trim().length < 5)) {
    errors.driving_license_no = 'Self-drive rentals require a valid Driving License.';
  }

  if (!formData.start_time || !formData.end_time) {
    errors.dates = 'Pickup and return dates are required.';
  } else {
    const s = new Date(formData.start_time);
    const e = new Date(formData.end_time);
    if (e <= s) {
      errors.dates = 'Return date must be strictly after pickup date.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function calculateCarRentalCost(dailyRate, isChauffeur, chauffeurAllowance, startTime, endTime) {
  if (!startTime || !endTime || !dailyRate) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffHours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
  const days = Math.max(1, Math.ceil(diffHours / 24));
  
  const baseCost = days * dailyRate;
  const chauffeurCost = isChauffeur ? days * (chauffeurAllowance || 500) : 0;
  return baseCost + chauffeurCost;
}
