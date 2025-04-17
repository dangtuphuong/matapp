// components/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicRoute;
