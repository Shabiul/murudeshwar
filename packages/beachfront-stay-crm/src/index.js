// @murudeshwara/beachfront-stay-crm Barrel Export
import './index.css';

// Main Drop-in Reusable Component
export { BeachfrontStayCRM, default as default } from './BeachfrontStayCRM';

// Beach Front Stay CRM Components
export { default as CrmLayout } from './components/CrmLayout';
export { default as CrmOverview } from './components/CrmOverview';
export { default as CrmProtectedRoute } from './components/CrmProtectedRoute';
export { default as CrmDashboard } from './components/CrmDashboard';
export { default as LeadDetailPage } from './components/LeadDetailPage';
export { default as CreateBookingModal } from './components/CreateBookingModal';
export { default as RoomManagementPage } from './components/RoomManagementPage';
export { default as RoomDetailsPage } from './components/RoomDetailsPage';
export { default as RoomCalendarPage } from './components/RoomCalendarPage';
export { default as HousekeepingPage } from './components/HousekeepingPage';
export { default as MaintenancePage } from './components/MaintenancePage';
export { default as CustomerProfilePage } from './components/CustomerProfilePage';
export { default as PropertySwitcher } from './components/PropertySwitcher';
export { default as NotificationsPage } from './components/NotificationsPage';
export { default as ForecastWidgets } from './components/ForecastWidgets';
export { default as RecommendationCards } from './components/RecommendationCards';

// Staff Management Components
export { default as StaffManagementPage } from './components/StaffManagementPage';
export { default as CreateStaffPage } from './components/CreateStaffPage';
export { default as StaffDetailPage } from './components/StaffDetailPage';
export { default as ShiftManagementPage } from './components/ShiftManagementPage';
export { default as LeaveManagementPage } from './components/LeaveManagementPage';
export { default as TaskManagerPage } from './components/TaskManagerPage';

// Services
export * from './services/AnalyticsEngine';
export * from './services/PredictionService';
export * from './services/EmailService';
export * from './services/WhatsAppService';
export * from './services/PropertyService';

// Utils
export * from './utils/AutomationEngine';
export * from './utils/crmConstants';
export * from './utils/crmHelpers';
export * from './utils/crmUpload';

// Auth Context
export * from './context/AuthContext';
