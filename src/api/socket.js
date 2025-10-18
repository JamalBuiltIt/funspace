// src/api/socket.js
import { io } from "socket.io-client";

// ✅ Use your deployed Render backend URL
// Example: replace with your actual backend link from Render
const BACKEND_URL = "https://funspace-backend.onrender.com";

export const socket = io(BACKEND_URL, {
  autoConnect: false, // We'll still manually connect after login
  transports: ["websocket"], // Ensures stable real-time connection on mobile & web
  withCredentials: true, // Allows CORS cookies if needed
});
