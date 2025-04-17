// components/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  // Check if user is already authenticated
  const token = localStorage.getItem("access_token");

  // If authenticated, redirect to home page
  if (token) {
    return <Navigate to="/home" replace />;
  }

  // Otherwise, allow access to public route (e.g., login, register)
  return children;
};

export default PublicRoute;
