import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Preload critical fonts for better rendering - Mukta is primary
if ('fonts' in document) {
  // Load fonts in background without blocking render - prioritize Mukta
  Promise.all([
    document.fonts.load('400 1em "Mukta"'),
    document.fonts.load('500 1em "Mukta"'),
    document.fonts.load('600 1em "Mukta"'),
    document.fonts.load('700 1em "Mukta"'),
    document.fonts.load('400 1em "Noto Sans Devanagari"'),
    document.fonts.load('500 1em "Noto Sans Devanagari"'),
    document.fonts.load('600 1em "Noto Sans Devanagari"'),
    document.fonts.load('700 1em "Noto Sans Devanagari"'),
  ]).catch(() => {
    // Silently fail, fallback fonts will be used
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
