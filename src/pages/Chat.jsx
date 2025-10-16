// src/pages/Chat.jsx
import React, { useEffect, useState } from "react";
import OnlineUsers from "../components/OnlineUsers";
import socket from "../socket";

function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  // Join chat
  useEffect(() => {
    if (!user) return;
    socket.emit("join", user.username);

    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [user]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const msgData = { user: user.username, text: messageInput.trim() };
    socket.emit("send_message", msgData);
    setMessageInput("");
  };

  const handleEnterPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      <OnlineUsers socket={socket} />

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.user === user.username ? "own-message" : ""}`}
          >
            <strong>{msg.user}: </strong>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleEnterPress}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
