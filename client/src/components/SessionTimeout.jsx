import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SessionTimeout = ({ timeout = 15 * 60 * 1000 }) => {
  const navigate = useNavigate();
  const timer = useRef(null);

  // Resets the logout timer on user activity
  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      // Auto-logout: clear session data and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("username");
      navigate("/login");
    }, timeout);
  };

  useEffect(() => {
    // Events that count as user activity
    const events = ["mousemove", "keydown", "click", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Start the timer on component mount
    resetTimer();

    // Clean up listeners and timer on component unmount
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null; // No UI rendered
};

export default SessionTimeout;
