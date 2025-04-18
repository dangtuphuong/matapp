// Entry point of the React app
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Render the root React component into the DOM
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {" "}
    {/* Helps catch potential issues in development */}
    <App />
  </StrictMode>
);
