import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME_PATHS } from '../constants';
import Loader from '../components/common/Loader';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Verifying session..." />;
  }

  if (user) {
    return <Navigate to={ROLE_HOME_PATHS[user.role] || '/student/dashboard'} replace />;
  }

  return children || <Outlet />;
}
