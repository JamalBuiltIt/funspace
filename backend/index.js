// src/backend/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

// ✅ Allow both your deployed frontend and local dev for testing
const allowedOrigins = [
  "http://localhost:3000", // local dev
  "https://funspace.onrender.com", // 🔁 replace with your actual Render frontend URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

const server = http.createServer(app);

// ✅ Configure Socket.IO with same CORS policy
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

const users = {};

// 🔌 Socket.IO logic
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join", (username) => {
    if (!username) return;
    users[socket.id] = username;
    console.log(`User joined: ${username}`);
    io.emit("update_users", Object.values(users));
  });

  socket.on("send_message", (msg) => {
    if (!msg || !msg.user || !msg.text) return;
    msg.timestamp = new Date().toISOString(); // Add timestamp
    io.emit("receive_message", msg);
  });

  // 📝 Typing indicator events
  socket.on("typing", () => {
    const username = users[socket.id];
    if (username) socket.broadcast.emit("user_typing", username);
  });

  socket.on("stop_typing", () => {
    const username = users[socket.id];
    if (username) socket.broadcast.emit("user_stopped_typing", username);
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      console.log(`User disconnected: ${users[socket.id]}`);
      delete users[socket.id];
      io.emit("update_users", Object.values(users));
    }
  });
});

// ✅ Default route for Render health check
app.get("/", (req, res) => {
  res.send("✅ Chat server is running on Render!");
});

// ✅ Dynamic port binding for Render
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
