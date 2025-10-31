import { io } from "socket.io-client";

const url =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_URL
    ? import.meta.env.VITE_BACKEND_URL
    : typeof process !== "undefined" && process.env?.REACT_APP_BACKEND_URL
    ? process.env.REACT_APP_BACKEND_URL
    : typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://funspace-backend.onrender.com";

export const socket = io(url, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
});