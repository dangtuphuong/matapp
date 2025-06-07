import React from "react";

import Dashboard from "./home-page/Dashboard";
import PublicHome from "./home-page/PublicHome";

const HomePage = () => {
  const token = localStorage.getItem("access_token");

  return <>{!token ? <PublicHome /> : <Dashboard />}</>;
};

export default HomePage;
