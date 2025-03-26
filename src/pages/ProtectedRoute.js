// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
    const user = JSON.parse(localStorage.getItem('user'));
  
    if (!user) {
      return <Navigate to="/login" />;
    }
  
    if (allowedRole && user.role !== allowedRole) {
      return <Navigate to={`/${user.role}`} />;
    }
  
    return children;
  };
  

export default ProtectedRoute;
