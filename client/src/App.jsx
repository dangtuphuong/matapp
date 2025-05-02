import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

// Component imports
import Register from "./components/RegisterPage";
import Login from "./components/LoginPage";
import Home from "./components/HomePage";
import Landing from "./components/LandingPage";
import Profile from "./components/ProfilePage";
import EditUsers from "./components/EditUsers";
import Material from "./components/MaterialPage";
import Search from "./components/SearchPage";
import SmartSearch from "./components/SmartSearch";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import SessionTimeout from "./components/SessionTimeout";
import SearchPage from "./components/SearchPage";
import AboutUs from "./components/AboutUs";
import FlexibleRoute from "./components/FlexibleRoute";
import MaterialDetail from "./components/MaterialDetail";

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
        <Route
          path="/aboutus"
          element={
            <FlexibleRoute>
              <AboutUs />
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
        {/* Public landing page (root route) */}
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
