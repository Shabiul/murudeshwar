import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CrmOverview from './components/CrmOverview';
import CrmDashboard from './components/CrmDashboard';
import LeadDetailPage from './components/LeadDetailPage';
import CustomerProfilePage from './components/CustomerProfilePage';
import StaffManagementPage from './components/StaffManagementPage';
import CreateStaffPage from './components/CreateStaffPage';
import StaffDetailPage from './components/StaffDetailPage';
import RoomManagementPage from './components/RoomManagementPage';
import RoomDetailsPage from './components/RoomDetailsPage';
import RoomCalendarPage from './components/RoomCalendarPage';
import HousekeepingPage from './components/HousekeepingPage';
import MaintenancePage from './components/MaintenancePage';
import TaskManagerPage from './components/TaskManagerPage';
import NotificationsPage from './components/NotificationsPage';
import ShiftManagementPage from './components/ShiftManagementPage';
import LeaveManagementPage from './components/LeaveManagementPage';
import CrmProtectedRoute from './components/CrmProtectedRoute';

/**
 * BeachfrontStayCRM Component
 * Reusable drop-in React component providing full Beach Front Stay CRM & Staff Management UI.
 *
 * @param {Object} props
 * @param {string} [props.className] - Optional container CSS class name
 */
export function BeachfrontStayCRM({ className = '' }) {
  return (
    <AuthProvider>
      <div className={`beachfront-stay-crm-container min-h-screen bg-[#faf9f7] text-stone-900 font-sans ${className}`}>
        <Routes>
          <Route path="/" element={<CrmProtectedRoute><CrmOverview /></CrmProtectedRoute>} />
          <Route path="/bookings" element={<CrmProtectedRoute><CrmDashboard /></CrmProtectedRoute>} />
          <Route path="/bookings/:id" element={<CrmProtectedRoute><LeadDetailPage /></CrmProtectedRoute>} />
          <Route path="/leads/:id" element={<CrmProtectedRoute><LeadDetailPage /></CrmProtectedRoute>} />
          <Route path="/customers" element={<CrmProtectedRoute><CustomerProfilePage /></CrmProtectedRoute>} />
          <Route path="/staff" element={<CrmProtectedRoute adminOnly><StaffManagementPage /></CrmProtectedRoute>} />
          <Route path="/staff/new" element={<CrmProtectedRoute adminOnly><CreateStaffPage /></CrmProtectedRoute>} />
          <Route path="/staff/:id" element={<CrmProtectedRoute adminOnly><StaffDetailPage /></CrmProtectedRoute>} />
          <Route path="/rooms" element={<CrmProtectedRoute><RoomManagementPage /></CrmProtectedRoute>} />
          <Route path="/rooms/:roomId" element={<CrmProtectedRoute><RoomDetailsPage /></CrmProtectedRoute>} />
          <Route path="/room-calendar" element={<CrmProtectedRoute><RoomCalendarPage /></CrmProtectedRoute>} />
          <Route path="/housekeeping" element={<CrmProtectedRoute><HousekeepingPage /></CrmProtectedRoute>} />
          <Route path="/maintenance" element={<CrmProtectedRoute><MaintenancePage /></CrmProtectedRoute>} />
          <Route path="/tasks" element={<CrmProtectedRoute><TaskManagerPage /></CrmProtectedRoute>} />
          <Route path="/notifications" element={<CrmProtectedRoute><NotificationsPage /></CrmProtectedRoute>} />
          <Route path="/shifts" element={<CrmProtectedRoute><ShiftManagementPage /></CrmProtectedRoute>} />
          <Route path="/leaves" element={<CrmProtectedRoute><LeaveManagementPage /></CrmProtectedRoute>} />
          <Route path="*" element={<CrmProtectedRoute><CrmOverview /></CrmProtectedRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default BeachfrontStayCRM;
