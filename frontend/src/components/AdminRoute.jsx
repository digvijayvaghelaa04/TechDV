import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth);

    // If user is not authenticated or not an admin, redirect
    if (!user || user.role !== 'admin') {
        // You might want to redirect to a "Not Authorized" page instead of home
        return <Navigate to="/" replace />;
    }

    // If authenticated and admin, render children or Outlet
    return children ? children : <Outlet />;
};

export default AdminRoute;
