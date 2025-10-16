// src/api/socket.js
import { io } from "socket.io-client";

// Connect to server
// Replace with your backend URL if hosted somewhere
export const socket = io("http://localhost:5000", {
  autoConnect: false, // We'll manually connect after login
});

// Optional: event listeners can also be set here if needed
