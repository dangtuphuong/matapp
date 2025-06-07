import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

// Component imports
import Register from "./components/RegisterPage";
import Login from "./components/LoginPage";
import Home from "./components/HomePage";
import Profile from "./components/ProfilePage";
import EditUsers from "./components/EditUsers";
import Material from "./components/MaterialPage";
import Search from "./components/Searchpage";
import SmartSearch from "./components/SmartSearch";
import UploadPage from "./components/UploadPage";
import ComparePage from "./components/compare-page/ComparePage";
import SettingsPage from "./components/settings-page/Settings";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import FlexibleRoute from "./components/FlexibleRoute";
import AboutUsPage from "./components/AboutUsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes (accessible only when not logged in) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        {/* Flexible routes (accessible on both status) */}
        <Route
          path="/aboutus"
          element={
            <FlexibleRoute>
              <AboutUsPage />
            </FlexibleRoute>
          }
        />

        {/* Protected routes (require login) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-users"
          element={
            <ProtectedRoute>
              <EditUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/material/:matGUID"
          element={
            <ProtectedRoute>
              <Material />
            </ProtectedRoute>
          }
        />
        <Route
          path="/smart-search"
          element={
            <ProtectedRoute>
              <SmartSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare-page"
          element={
            <ProtectedRoute>
              <ComparePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Public landing page (root route) */}
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
