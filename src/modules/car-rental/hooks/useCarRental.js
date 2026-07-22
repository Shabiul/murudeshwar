import { useState, useEffect, useCallback } from 'react';
import {
  fetchCarInventory,
  fetchDrivers,
  fetchCarBookings,
  createCarItem,
  createDriverItem,
  createCarBooking,
  updateCarBookingStatus
} from '../services/carRentalService';

export function useCarRental() {
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [carData, drvData, bkData] = await Promise.all([
        fetchCarInventory(),
        fetchDrivers(),
        fetchCarBookings()
      ]);
      setCars(carData);
      setDrivers(drvData);
      setBookings(bkData);
    } catch (err) {
      console.error('Error loading car rental dataset:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addCar = async (carData) => {
    const created = await createCarItem(carData);
    setCars(prev => [created, ...prev]);
    return created;
  };

  const addDriver = async (driverData) => {
    const created = await createDriverItem(driverData);
    setDrivers(prev => [created, ...prev]);
    return created;
  };

  const addBooking = async (bookingData) => {
    const created = await createCarBooking(bookingData);
    setBookings(prev => [created, ...prev]);
    if (bookingData.car_id) {
      setCars(prev => prev.map(c => c.id === bookingData.car_id ? { ...c, status: 'Reserved' } : c));
    }
    if (bookingData.driver_id) {
      setDrivers(prev => prev.map(d => d.id === bookingData.driver_id ? { ...d, status: 'On Trip' } : d));
    }
    return created;
  };

  const advanceStatus = async (bookingId, nextStatus, extraFields = {}) => {
    const updated = await updateCarBookingStatus(bookingId, nextStatus, extraFields);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: nextStatus, ...extraFields } : b));

    const targetBooking = bookings.find(b => b.id === bookingId);
    if (targetBooking?.car_id) {
      let carNextStatus = 'Available';
      if (['Pickup', 'Trip'].includes(nextStatus)) carNextStatus = 'On Trip';
      if (['Driver Assignment', 'Reservation', 'Confirmation'].includes(nextStatus)) carNextStatus = 'Reserved';
      if (['Inspection', 'Invoice', 'Completed'].includes(nextStatus)) carNextStatus = 'Available';

      setCars(prev => prev.map(c => c.id === targetBooking.car_id ? { ...c, status: carNextStatus } : c));
    }

    if (targetBooking?.driver_id && ['Inspection', 'Invoice', 'Completed'].includes(nextStatus)) {
      setDrivers(prev => prev.map(d => d.id === targetBooking.driver_id ? { ...d, status: 'Available' } : d));
    }

    return updated;
  };

  return {
    cars,
    drivers,
    bookings,
    loading,
    error,
    refresh: loadData,
    addCar,
    addDriver,
    addBooking,
    advanceStatus
  };
}
