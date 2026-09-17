import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import Home from './pages/Home.jsx';
import OpenWall from './pages/OpenWall.jsx';
import TeacherDirectory from './pages/TeacherDirectory.jsx';
import TeacherTimeline from './pages/TeacherTimeline.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export function App() {
  return (
    <Routes>
      {/* Public Pages wrapped with shared Header */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/wall" element={<OpenWall />} />
        <Route path="/open-wall" element={<OpenWall />} />
        <Route path="/teachers" element={<TeacherDirectory />} />
        <Route path="/teachers/:slug" element={<TeacherTimeline />} />
        <Route path="/login" element={<AdminLogin />} />
      </Route>

      {/* Admin Dashboard Protected Route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
