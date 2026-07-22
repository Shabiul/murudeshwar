/**
 * Car Rental Module Types & Constants
 */

export const CAR_CATEGORIES = {
  SUV: 'SUV',
  SEDAN: 'Sedan',
  HATCHBACK: 'Hatchback',
  LUXURY: 'Luxury',
  VAN: 'Van'
};

export const CAR_STATUS = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  ON_TRIP: 'On Trip',
  MAINTENANCE: 'Maintenance'
};

export const CAR_WORKFLOW = [
  'Availability',
  'Driver Assignment',
  'Reservation',
  'Confirmation',
  'Pickup',
  'Trip',
  'Return',
  'Inspection',
  'Invoice'
];
