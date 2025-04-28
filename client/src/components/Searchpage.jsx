import { getUserProfile } from "../services/user-service";
import NavbarPrivate from "./NavbarPrivate";
import SideNavbar from "./SideNavbar";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/navbar.css";
import "./styles/Home.css";

const SearchPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const isFirstLogin = localStorage.getItem("first_login");
    if (isFirstLogin === "true") {
      setOpenSnackbar(true);
      localStorage.setItem("first_login", "false");
    }

    const fetchUser = async () => {
      try {
        const data = await getUserProfile(token);
        setUsername(data.firstName || "User");
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="search-page-container">
      <NavbarPrivate username={username} />
      <div className="search-page-body">
        <SideNavbar />
      </div>
    </div>
  );
};

export default SearchPage;
