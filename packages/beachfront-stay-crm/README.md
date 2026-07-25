# `@murudeshwara/beachfront-stay-crm`

A modular, production-ready React library for **Beach Front Stay CRM & Staff Management**, built for hospitality, hotel, and resort operations.

## Features

- 🏨 **Beach Front Stay Management**: Room Inventory, Availability Calendar, Reservations, Guest Profiles.
- 🧹 **Operations & Maintenance**: Housekeeping status tracking & room repair ticketing.
- 👥 **Staff Management**: Staff Directory, Role Management, Onboarding, Shift Scheduling (`ShiftManagementPage`), Leave Approvals (`LeaveManagementPage`), and Task Kanban (`TaskManagerPage`).
- 📊 **Analytics & Predictions**: Revenue analytics and occupancy forecasting engines.
- 💬 **Omnichannel Messaging**: Built-in Email and WhatsApp communication services.

## Installation

```bash
npm install @murudeshwara/beachfront-stay-crm
```

### Peer Dependencies

Ensure your project has the required peer dependencies installed:

```bash
npm install react react-dom react-router-dom framer-motion @supabase/supabase-js classnames
```

## Usage Example

```jsx
import React from 'react';
import { 
  CrmLayout, 
  CrmOverview, 
  RoomManagementPage, 
  StaffManagementPage, 
  HousekeepingPage 
} from '@murudeshwara/beachfront-stay-crm';

export default function StayApp() {
  return (
    <CrmLayout title="Beachfront Stay Operations">
      <CrmOverview />
    </CrmLayout>
  );
}
```

## Available Components & Services

### Components
- `CrmLayout`
- `CrmOverview`
- `CrmProtectedRoute`
- `CrmDashboard`
- `LeadDetailPage`
- `CreateBookingModal`
- `RoomManagementPage`
- `RoomDetailsPage`
- `RoomCalendarPage`
- `HousekeepingPage`
- `MaintenancePage`
- `CustomerProfilePage`
- `PropertySwitcher`
- `NotificationsPage`
- `StaffManagementPage`
- `CreateStaffPage`
- `StaffDetailPage`
- `ShiftManagementPage`
- `LeaveManagementPage`
- `TaskManagerPage`

### Services & Utils
- `AnalyticsEngine`
- `PredictionService`
- `EmailService`
- `WhatsAppService`
- `PropertyService`
- `AutomationEngine`
- `crmConstants`
- `crmHelpers`
- `crmUpload`

## License

MIT © Murudeshwara Engineering Team
