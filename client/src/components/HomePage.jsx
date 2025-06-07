import NavbarPublic from "./NavbarPublic";
import React from "react";

import Dashboard from "./Dashboard";

const HomePage = () => {
  const token = localStorage.getItem("access_token");

  return <>{!token ? <NavbarPublic /> : <Dashboard />}</>;
};

export default HomePage;
