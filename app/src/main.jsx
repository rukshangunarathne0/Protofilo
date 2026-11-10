import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hand control back from the instant splash (index.html) once React has painted.
// Two frames guarantee the first React commit is on screen before the fade starts.
const dismissBoot = () => {
  const boot = document.getElementById("boot");
  if (!boot) return;
  boot.classList.add("boot-out");
  window.setTimeout(() => boot.remove(), 420);
};

requestAnimationFrame(() => requestAnimationFrame(dismissBoot));

// Safety net: never let the splash trap the user if the app throws while mounting.
window.setTimeout(dismissBoot, 6000);
