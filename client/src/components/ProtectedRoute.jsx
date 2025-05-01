// components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import SessionTimeout from "./SessionTimeout";

const ProtectedRoute = ({ children }) => {
  // Check for authentication token
  const token = localStorage.getItem("access_token");

  // Redirect to login if token is missing
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {/* Auto-logout after 15 minutes of inactivity */}
      <SessionTimeout timeout={60 * 60 * 1000} />

      {/* Render the protected content */}
      {children}
    </>
  );
};

export default ProtectedRoute;
