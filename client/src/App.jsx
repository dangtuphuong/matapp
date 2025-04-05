import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import Register from "./components/RegisterPage";
import Login from "./components/LoginPage";
import Home from "./components/HomePage";
import Landing from "./components/LandingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route exact path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
