// src/backend/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// === CORS CONFIG ===
const allowedOrigins = process.env.CORS_ORIGINS?.split(",").map(s => s.trim()) || [
  "http://localhost:3000",
  "https://funspace.onrender.com"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: false,
  },
  pingTimeout: 60000,    // Keep Render free tier awake
  pingInterval: 25000,
});

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: false,
  })
);

// === PERSISTENT STATE (File-based for Render) ===
const STATE_FILE = path.join(__dirname, "chat-state.json");
let users = new Map(); // socket.id → { username, joinedAt }
let messages = [];     // Rolling buffer: last 100 messages

const loadState = async () => {
  try {
    const data = await fs.readFile(STATE_FILE, "utf8");
    const state = JSON.parse(data);
    users = new Map(state.users || []);
    messages = state.messages || [];
    console.log(`Loaded state: ${users.size} users, ${messages.length} messages`);
  } catch (err) {
    console.log("No persisted state. Starting fresh.");
  }
};

const saveState = async () => {
  try {
    const state = {
      users: Array.from(users.entries()),
      messages: messages.slice(-100), // Keep last 100
    };
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Failed to save state:", err);
  }
};

// Load state on startup
loadState();

// === HELPERS ===
const sanitize = (str) =>
  typeof str === "string"
    ? str.replace(/[<>"'&]/g, "").trim().slice(0, 100)
    : "";

const broadcastUsers = () => {
  io.emit("update_users", Array.from(users.values()).map(u => u.username));
};

const broadcastHistory = () => {
  io.emit("receive_history", messages.slice(-50));
};

// === SOCKET.IO ===
io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  // Send chat history to new user
  socket.emit("receive_history", messages.slice(-50));

  // --- JOIN ---
  socket.on("join", async (username) => {
    username = sanitize(username);
    if (!username) {
      socket.emit("error", "Username cannot be empty");
      return;
    }
  
    // inside io.on("connection", (socket) => { … })
socket.on("request_user_list", () => {
  socket.emit(
    "update_users",
    Array.from(users.values()).map((u) => u.username)
  );
    });
    // Prevent duplicate usernames
    if (Array.from(users.values()).some(u => u.username === username)) {
      socket.emit("username_taken", username);
      return;
    }

    users.set(socket.id, { username, joinedAt: Date.now() });
    await saveState();

    console.log(`Joined: ${username} (${socket.id})`);
    socket.emit("joined", { username });
    broadcastUsers();
    broadcastHistory();
  });

  // --- SEND MESSAGE ---
  socket.on("send_message", async (data) => {
    const text = sanitize(data?.text);
    if (!text || text.length > 500) return;

    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      user: user.username,
      text,
      timestamp: new Date().toISOString(),
    };

    messages.push(message);
    if (messages.length > 100) messages.shift(); // Rolling buffer

    await saveState();
    io.emit("receive_message", message); // Send to all
    console.log(`Message from ${user.username}: ${text}`);
  });

  // --- TYPING ---
  socket.on("typing", () => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit("user_typing", user.username);
    }
  });

  socket.on("stop_typing", () => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit("user_stopped_typing", user.username);
    }
  });

  // --- DISCONNECT ---
  socket.on("disconnect", async (reason) => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`Disconnected: ${user.username} (${reason})`);
      users.delete(socket.id);
      await saveState();
      broadcastUsers();
    }
  });

  socket.on("error", (err) => console.error("Socket error:", err));
});

// === API ENDPOINTS ===
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    activeUsers: users.size,
    totalMessages: messages.length,
    timestamp: new Date().toISOString(),
  });
});

app.get("/history", (req, res) => {
  res.json(messages.slice(-50));
});

// === START SERVER ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// === GRACEFUL SHUTDOWN ===
let shuttingDown = false;

const shutdown = async () => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log("\nShutting down gracefully...");
  await saveState();
  server.close(() => {
    io.close();
    process.exit(0);
  });
};

// Only attach once
if (!process.listeners("SIGINT").includes(shutdown)) {
  process.on("SIGINT", shutdown);
}
if (!process.listeners("SIGTERM").includes(shutdown)) {
  process.on("SIGTERM", shutdown);
}