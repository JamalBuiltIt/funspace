// src/api/socket.js
import { io } from "socket.io-client";


const BACKEND_URL = "https://funspace-backend.onrender.com";

export const socket = io(BACKEND_URL, {
  autoConnect: false, 
  transports: ["websocket", "polling"],
  withCredentials: true,
});
