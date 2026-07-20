import { ReactLenis } from '@studio-freight/react-lenis'
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HeroCanvas from './components/HeroCanvas';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';
import GenericPage from './components/GenericPage';
import ServicePage from './components/ServicePage';
import HomePage from './components/HomePage';
import GalleryPage from './components/GalleryPage';
import ContactPage from './components/ContactPage';
import CoursesPage from './components/CoursesPage';
import CourseDetailPage from './components/CourseDetailPage';
import CrewPage from './components/CrewPage';
import AttractionsPage from './components/AttractionsPage';
import CrewDetailPage from './components/CrewDetailPage';

import AboutPage from './components/AboutPage';
import BeachFrontStayPage from './components/BeachFrontStayPage';
import RoomDetailPage from './components/RoomDetailPage';
import LoginPage from './components/LoginPage';
import CrmDashboard from './components/CrmDashboard';
import CrmOverview from './components/crm/CrmOverview';
import CrmProtectedRoute from './components/crm/CrmProtectedRoute';
import StaffManagementPage from './components/StaffManagementPage';
import CreateStaffPage from './components/CreateStaffPage';
import StaffDetailPage from './components/StaffDetailPage';
import LeadDetailPage from './components/LeadDetailPage';
import RoomManagementPage from './components/RoomManagementPage';
import HousekeepingPage from './components/HousekeepingPage';
import MaintenancePage from './components/MaintenancePage';
import TaskManagerPage from './components/TaskManagerPage';
import CustomerProfilePage from './components/CustomerProfilePage';
import RoomDetailsPage from './components/RoomDetailsPage';
import RoomCalendarPage from './components/RoomCalendarPage';
import LostFoundPage from './components/LostFoundPage';
import NotificationsPage from './components/NotificationsPage';
import ReportsPage from './components/ReportsPage';
import InventoryPage from './components/InventoryPage';
import DocumentsPage from './components/DocumentsPage';
import CommunicationPage from './components/crm/CommunicationPage';
import { AuthProvider } from './context/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ConditionalShell({ children }) {
  const { pathname } = useLocation();
  const isCrm = pathname.startsWith('/crm') || pathname === '/login';
  return (
    <>
      {!isCrm && <Header />}
      {children}
      {!isCrm && <Footer />}
    </>
  );
}

const initialMockLeads = [
  {
    id: 'lead_mock_1',
    serviceType: 'Stay',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@gmail.com',
    phone: '+91 98765 43210',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending',
    adminNotes: 'Interested in early check-in.',
    details: {
      roomTitle: 'Deluxe Sea View Room',
      guests: '2 Guests',
      dates: '24 Jul - 28 Jul 2026'
    }
  },
  {
    id: 'lead_mock_2',
    serviceType: 'Scuba',
    name: 'Anjali Desai',
    email: 'anjali.d@yahoo.com',
    phone: '+91 94481 23456',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'confirmed',
    adminNotes: 'Assigned Instructor Prajwal. Advance payment received.',
    details: {
      courseName: 'PADI Open Water Diver',
      level: 'Beginner',
      duration: '4 Days'
    }
  },
  {
    id: 'lead_mock_3',
    serviceType: 'Bike',
    name: 'David Miller',
    email: 'david.miller@hotmail.com',
    phone: '+1 555-019-2834',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'completed',
    adminNotes: 'Rented Royal Enfield Bullet. Returned on time in perfect condition.',
    details: {
      bikeType: 'Royal Enfield Bullet 350',
      duration: '3 Days'
    }
  },
  {
    id: 'lead_mock_4',
    serviceType: 'Contact',
    name: 'Vikram Malhotra',
    email: 'vikram.m@rediffmail.com',
    phone: '+91 91102 98765',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'pending',
    adminNotes: 'Needs corporate package for 15 scuba divers.',
    details: {
      message: 'Hello, do you offer group discounts for team building events (around 15 people) including both beach stays and beginner scuba diving sessions?'
    }
  },
  {
    id: 'lead_mock_5',
    serviceType: 'Stay',
    name: 'Priyah Patel',
    email: 'priyah.patel@outlook.com',
    phone: '+91 88844 55566',
    timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
    status: 'confirmed',
    adminNotes: 'Room 204 assigned.',
    details: {
      roomTitle: 'Deluxe Double Room',
      guests: '3 Guests',
      dates: '01 Aug - 05 Aug 2026'
    }
  },
  {
    id: 'lead_mock_6',
    serviceType: 'Scuba',
    name: 'Siddharth Sen',
    email: 'siddharth.s@outlook.com',
    phone: '+91 99001 12233',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'pending',
    adminNotes: 'Checking certification level prerequisites.',
    details: {
      courseName: 'PADI Advanced Open Water',
      level: 'Advanced',
      duration: '3 Days'
    }
  },
  {
    id: 'lead_mock_7',
    serviceType: 'Bike',
    name: 'Karan Mehra',
    email: 'karan.m@gmail.com',
    phone: '+91 77609 88877',
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: 'cancelled',
    adminNotes: 'Cancelled by customer due to travel plan changes.',
    details: {
      bikeType: 'Activa Scooter',
      duration: '1 Day'
    }
  },
  {
    id: 'lead_mock_8',
    serviceType: 'Stay',
    name: 'John Doe',
    email: 'johndoe@gmail.com',
    phone: '+1 234-567-8900',
    timestamp: new Date(Date.now() - 3600000 * 96).toISOString(),
    status: 'completed',
    adminNotes: 'Checked out today morning. Left a 5-star review.',
    details: {
      roomTitle: 'Standard Double Room',
      guests: '2 Guests',
      dates: '10 Jul - 15 Jul 2026'
    }
  },
  {
    id: 'lead_mock_9',
    serviceType: 'Scuba',
    name: 'Meera Nair',
    email: 'meera.nair@gmail.com',
    phone: '+91 95443 22110',
    timestamp: new Date(Date.now() - 3600000 * 120).toISOString(),
    status: 'confirmed',
    adminNotes: 'Medical clearance form signed.',
    details: {
      courseName: 'Discover Scuba Diving',
      level: 'Beginner',
      duration: '1 Day'
    }
  },
  {
    id: 'lead_mock_10',
    serviceType: 'Contact',
    name: 'Amit Varma',
    email: 'amit.varma@gmail.com',
    phone: '+91 98860 98860',
    timestamp: new Date(Date.now() - 3600000 * 150).toISOString(),
    status: 'completed',
    adminNotes: 'Replied to email, sent pricing leaflet.',
    details: {
      message: 'Can you please let me know the rental price for Scooty for a week, and is a security deposit required?'
    }
  }
];

function App() {
  const lenisOptions = {
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  };

  useEffect(() => {
    // Seed initial mock CRM leads if empty
    const storedLeads = localStorage.getItem('crm_leads');
    if (!storedLeads || JSON.parse(storedLeads).length === 0) {
      localStorage.setItem('crm_leads', JSON.stringify(initialMockLeads));
    }
  }, []);

  return (
    <AuthProvider>
      <ReactLenis root options={lenisOptions}>
        <Router>
          <div className="bg-[#faf9f7] min-h-screen text-stone-900 selection:bg-brand-gold selection:text-white font-sans">
            <ScrollToTop />
            <ConditionalShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/attractions" element={<AttractionsPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/crew" element={<CrewPage />} />
              <Route path="/crew/:crewId" element={<CrewDetailPage />} />
              <Route path="/beach-front-stay" element={<BeachFrontStayPage />} />
              <Route path="/beach-front-stay/:roomId" element={<RoomDetailPage />} />
              <Route path="/bike-rental" element={
                <ServicePage
                  title="Bike Rental Services"
                  subtitle="Explore at Your Own Pace"
                  heroImage="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2670&auto=format&fit=crop"
                  description="Uncover Murudeshwar’s hidden trails, scenic viewpoints, and local heritage with our premium bike rental fleet. Whether you need a rugged mountain bike for off-road trails or a comfortable cruiser for scenic coastal roads, we provide high-performance gear to make your exploration safe, convenient, and thrilling."
                  features={[
                    { title: "Premium Fleet", desc: "All-terrain mountain bikes and comfortable cruisers" },
                    { title: "Safety Gear Included", desc: "Helmets, safety locks, and high-visibility gear" },
                    { title: "Flexible Rentals", desc: "Hourly, half-day, full-day, and multi-day packages" },
                    { title: "Curated Route Maps", desc: "Expert tips on local trails and hidden beaches" }
                  ]}
                />
              } />
              <Route path="/private-jets" element={
                <ServicePage
                  title="Private Aviation"
                  subtitle="Fly on Your Terms"
                  heroImage="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2574&auto=format&fit=crop"
                  description="Bypass long lines and commercial terminals. Experience the ultimate freedom of private aviation with our fleet of long-range jets, tailored catering, and seamless ground transport."
                  features={[
                    { title: "Global Reach", desc: "Access to 5,000+ airports" },
                    { title: "On-Demand", desc: "Ready in as little as 4 hours" },
                    { title: "Pet Friendly", desc: "Bring your companions" },
                    { title: "Privacy", desc: "Discrete terminals & lounges" }
                  ]}
                />
              } />
              <Route path="/villas" element={
                <ServicePage
                  title="Luxury Villas"
                  subtitle="Your Private Sanctuary"
                  heroImage="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop"
                  description="From clifftop estates in Amalfi to beachfront mansions in Turks & Caicos. Our portfolio of private villas offers the space, privacy, and amenities of a five-star resort, exclusively for you."
                  features={[
                    { title: "Private Staff", desc: "Chefs, butlers, & housekeeping" },
                    { title: "Exclusive Access", desc: "Beaches & golf courses" },
                    { title: "Concierge", desc: "24/7 Itinerary planning" },
                    { title: "Design", desc: "Award-winning architecture" }
                  ]}
                />
              } />
              <Route path="/experiences" element={
                <ServicePage
                  title="Curated Experiences"
                  subtitle="Memories for a Lifetime"
                  heroImage="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2621&auto=format&fit=crop"
                  description="Go beyond the guidebook. Whether it's a private after-hours tour of the Vatican, shark diving in South Africa, or truffle hunting in Piedmont, we unlock the world's most exclusive moments."
                  features={[
                    { title: "Access", desc: "Behind closed doors" },
                    { title: "Guides", desc: "Local experts & historians" },
                    { title: "Adventure", desc: "Custom expeditions" },
                    { title: "Culture", desc: "Immersive workshops" }
                  ]}
                />
              } />
              <Route path="/concierge" element={
                <ServicePage
                  title="Global Concierge"
                  subtitle="Your Wish, Granted"
                  heroImage="https://images.unsplash.com/photo-1565551984260-60a674488a0b?q=80&w=2574&auto=format&fit=crop"
                  description="Our dedicated lifestyle managers are at your service 24/7. From last-minute restaurant reservations to sourcing rare gifts, we handle the details so you can enjoy the journey."
                  features={[
                    { title: "24/7 Support", desc: "Always available" },
                    { title: "Dining", desc: "Priority reservations" },
                    { title: "Events", desc: "VIP tickets & access" },
                    { title: "Logistics", desc: "Seamless transfers" }
                  ]}
                />
              } />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/crm" element={
                <CrmProtectedRoute>
                  <CrmOverview />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/login" element={<LoginPage />} />
              <Route path="/crm/bookings" element={
                <CrmProtectedRoute>
                  <CrmDashboard />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/bookings/:id" element={
                <CrmProtectedRoute>
                  <LeadDetailPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/leads/:id" element={
                <CrmProtectedRoute>
                  <LeadDetailPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/staff" element={
                <CrmProtectedRoute adminOnly>
                  <StaffManagementPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/staff/new" element={
                <CrmProtectedRoute adminOnly>
                  <CreateStaffPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/create-staff" element={
                <CrmProtectedRoute adminOnly>
                  <CreateStaffPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/staff/:id" element={
                <CrmProtectedRoute adminOnly>
                  <StaffDetailPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/rooms" element={
                <CrmProtectedRoute>
                  <RoomManagementPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/housekeeping" element={
                <CrmProtectedRoute>
                  <HousekeepingPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/maintenance" element={
                <CrmProtectedRoute>
                  <MaintenancePage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/tasks" element={
                <CrmProtectedRoute>
                  <TaskManagerPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/customers" element={
                <CrmProtectedRoute>
                  <CustomerProfilePage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/rooms/:roomId" element={
                <CrmProtectedRoute>
                  <RoomDetailsPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/room-calendar" element={
                <CrmProtectedRoute>
                  <RoomCalendarPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/lost-found" element={
                <CrmProtectedRoute>
                  <LostFoundPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/notifications" element={
                <CrmProtectedRoute>
                  <NotificationsPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/reports" element={
                <CrmProtectedRoute>
                  <ReportsPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/inventory" element={
                <CrmProtectedRoute>
                  <InventoryPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/documents" element={
                <CrmProtectedRoute>
                  <DocumentsPage />
                </CrmProtectedRoute>
              } />
              <Route path="/crm/communications" element={
                <CrmProtectedRoute>
                  <CommunicationPage />
                </CrmProtectedRoute>
              } />
            </Routes>
            </ConditionalShell>
          </div>
        </Router>
      </ReactLenis>
    </AuthProvider>
  )
}

export default App
