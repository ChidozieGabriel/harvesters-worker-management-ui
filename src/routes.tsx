import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Login from './pages/auth/login';
import Dashboard from './pages/dashboard';
import AdminDashboard from './pages/admin/dashboard';
import Workers from './pages/admin/workers';
import Teams from './pages/admin/teams';
import Departments from './pages/admin/departments';
import HabitsManagement from './pages/habits';
import Devotionals from './pages/devotionals';
import Profile from './pages/profile';
import Layout from './components/layout';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" />;
  }

  return <Layout>{children}</Layout>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      <Route path="/admin" element={
        <PrivateRoute adminOnly>
          <AdminDashboard />
        </PrivateRoute>
      } />

      <Route path="/admin/workers" element={
        <PrivateRoute adminOnly>
          <Workers />
        </PrivateRoute>
      } />

      <Route path="/admin/teams" element={
        <PrivateRoute adminOnly>
          <Teams />
        </PrivateRoute>
      } />

      <Route path="/admin/departments" element={
        <PrivateRoute adminOnly>
          <Departments />
        </PrivateRoute>
      } />

      <Route path="/admin/habit-management" element={
        <PrivateRoute adminOnly>
          <HabitsManagement />
        </PrivateRoute>
      } />

      <Route path="/devotionals" element={
        <PrivateRoute>
          <Devotionals />
        </PrivateRoute>
      } />

      <Route path="/profile" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}