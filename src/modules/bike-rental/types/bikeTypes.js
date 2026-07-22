/**
 * Bike Rental Module Type Definitions & Enum Constants
 */

export const BIKE_TYPES = {
  SCOOTER: 'Scooter',
  CRUISER: 'Cruiser',
  SPORTS: 'Sports',
  ADVENTURE: 'Adventure'
};

export const BIKE_STATUS = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  ON_TRIP: 'On Trip',
  MAINTENANCE: 'Maintenance',
  RETIRED: 'Retired'
};

export const BOOKING_WORKFLOW = [
  'Availability',
  'Reserve',
  'Confirm',
  'Vehicle Inspection',
  'Pickup',
  'Return',
  'Inspection',
  'Invoice',
  'Complete'
];
