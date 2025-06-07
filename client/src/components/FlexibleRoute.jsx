// components/FlexibleRoute.jsx
import React, { useState } from "react";
import NavbarPublic from "./NavbarPublic";
import NavbarPrivate from "./NavbarPrivate";

const FlexibleRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <>
      {token ? (
        <NavbarPrivate onSetUser={(user) => setCurrentUser(user)} />
      ) : (
        <NavbarPublic />
      )}
      <main>
        {React.isValidElement(children)
          ? React.cloneElement(children, { token, currentUser })
          : children}
      </main>
    </>
  );
};

export default FlexibleRoute;
