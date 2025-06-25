import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import PlaceOrderPage from './pages/customer/PlaceOrderPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';
import OrderDetailsPage from './pages/customer/OrderDetailsPage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffOrdersPage from './pages/staff/StaffOrdersPage';
import StaffCustomersPage from './pages/staff/StaffCustomersPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import useAuthStore from './store/authStore';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Auto redirect based on role
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/';
    
    switch (user?.role) {
      case 'customer':
        return '/customer/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer Routes */}
            <Route path="/customer/*" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Layout userType="customer">
                  <Routes>
                    <Route path="dashboard" element={<CustomerDashboard />} />
                    <Route path="place-order" element={<PlaceOrderPage />} />
                    <Route path="orders" element={<MyOrdersPage />} />
                    <Route path="orders/:orderId" element={<OrderDetailsPage />} />
                    <Route path="profile" element={<CustomerProfilePage />} />
                    <Route path="*" element={<Navigate to="/customer/dashboard" />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />

            {/* Staff Routes */}
            <Route path="/staff/*" element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <Layout userType="staff">
                  <Routes>
                    <Route path="dashboard" element={<StaffDashboard />} />
                    <Route path="orders" element={<StaffOrdersPage />} />
                    <Route path="customers" element={<StaffCustomersPage />} />
                    <Route path="*" element={<Navigate to="/staff/dashboard" />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout userType="admin">
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="orders" element={<StaffOrdersPage />} />
                    <Route path="services" element={<AdminServicesPage />} />
                    <Route path="reports" element={<AdminReportsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/dashboard" element={<Navigate to={getDefaultRoute()} />} />
            
            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;