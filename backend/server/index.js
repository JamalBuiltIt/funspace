// src/backend/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend
    methods: ["GET", "POST"],
  },
});

const users = {};

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
    io.emit("receive_message", msg);
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      console.log(`User disconnected: ${users[socket.id]}`);
      delete users[socket.id];
      io.emit("update_users", Object.values(users));
    }
  });
});

app.get("/", (req, res) => {
  res.send("Chat server is running!");
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
