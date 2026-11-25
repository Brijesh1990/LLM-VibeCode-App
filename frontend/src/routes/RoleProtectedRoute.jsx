import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

export default function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Checking role permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
}
