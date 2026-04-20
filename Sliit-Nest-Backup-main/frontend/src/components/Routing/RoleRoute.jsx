import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const RoleRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};
