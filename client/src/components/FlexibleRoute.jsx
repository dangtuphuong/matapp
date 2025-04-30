// components/FlexibleRoute.jsx
import React from "react";
import NavbarPublic from "./NavbarPublic";
import NavbarPrivate from "./NavbarPrivate";

const FlexibleRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");

  return (
    <>
      {token ? <NavbarPrivate /> : <NavbarPublic />}
      <main style={{ padding: "2rem" }}>{children}</main>
    </>
  );
};

export default FlexibleRoute;
