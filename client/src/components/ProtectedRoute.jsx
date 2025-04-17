// components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import SessionTimeout from "./SessionTimeout";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <SessionTimeout timeout={15 * 60 * 1000} /> {/* 15 minutes */}
      {children}
    </>
  );
};

export default ProtectedRoute;
