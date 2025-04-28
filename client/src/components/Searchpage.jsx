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

  // Fetch user info on component mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // Redirect to login if token is missing
    if (!token) {
      navigate("/login");
      return;
    }

    // Check if it's the first login
    const isFirstLogin = localStorage.getItem("first_login");

    if (isFirstLogin === "true") {
      setOpenSnackbar(true);
      localStorage.setItem("first_login", "false");
    }

    // Get user's profile data
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
    <>
      <NavbarPrivate />
      <SideNavbar />
    </>
  );
};

export default SearchPage;
