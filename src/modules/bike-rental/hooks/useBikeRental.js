import { useState, useEffect, useCallback } from 'react';
import {
  fetchBikeInventory,
  fetchBikeBookings,
  createBikeInventoryItem,
  createBikeBooking,
  updateBikeBookingStatus
} from '../services/bikeRentalService';

export function useBikeRental() {
  const [bikes, setBikes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [invData, bkData] = await Promise.all([
        fetchBikeInventory(),
        fetchBikeBookings()
      ]);
      setBikes(invData);
      setBookings(bkData);
    } catch (err) {
      console.error('Error loading bike rental data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addBike = async (newBikeData) => {
    const created = await createBikeInventoryItem(newBikeData);
    setBikes(prev => [created, ...prev]);
    return created;
  };

  const addBooking = async (newBookingData) => {
    const created = await createBikeBooking(newBookingData);
    setBookings(prev => [created, ...prev]);
    
    // Auto update bike status to Reserved
    if (newBookingData.bike_id) {
      setBikes(prev => prev.map(b => b.id === newBookingData.bike_id ? { ...b, status: 'Reserved' } : b));
    }
    return created;
  };

  const advanceBookingStatus = async (bookingId, nextStatus, extraFields = {}) => {
    const updated = await updateBikeBookingStatus(bookingId, nextStatus, extraFields);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: nextStatus, ...extraFields } : b));

    // Handle vehicle status transitions based on workflow
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (targetBooking?.bike_id) {
      let bikeNextStatus = 'Available';
      if (['Pickup', 'On Trip'].includes(nextStatus)) bikeNextStatus = 'On Trip';
      if (['Reserve', 'Confirm', 'Vehicle Inspection'].includes(nextStatus)) bikeNextStatus = 'Reserved';
      if (['Complete', 'Completed'].includes(nextStatus)) bikeNextStatus = 'Available';

      setBikes(prev => prev.map(b => b.id === targetBooking.bike_id ? { ...b, status: bikeNextStatus } : b));
    }
    return updated;
  };

  return {
    bikes,
    bookings,
    loading,
    error,
    refresh: loadData,
    addBike,
    addBooking,
    advanceBookingStatus
  };
}
