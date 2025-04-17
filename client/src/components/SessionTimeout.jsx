import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SessionTimeout = ({ timeout = 15 * 60 * 1000 }) => {
  const navigate = useNavigate();
  const timer = useRef(null);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("username");
      navigate("/login");
    }, timeout);
  };

  useEffect(() => {
    // Events to monitor user activity
    const events = ["mousemove", "keydown", "click", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Start the timer initially
    resetTimer();

    return () => {
      // Clean up on unmount
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null; // No visible component
};

export default SessionTimeout;
