// src/pages/Chat.jsx
import React, { useEffect, useState, useRef } from "react";
import OnlineUsers from "../components/OnlineUsers";
import socket from "../socket";

function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeout = useRef(null);

  // Join chat
  useEffect(() => {
    if (!user) return;
    socket.emit("join", user.username);

    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleUserTyping = (username) => {
      setTypingUsers((prev) => {
        if (!prev.includes(username)) return [...prev, username];
        return prev;
      });
    };

    const handleUserStoppedTyping = (username) => {
      setTypingUsers((prev) => prev.filter((name) => name !== username));
    };

    socket.on("receive_message", handleReceive);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stopped_typing", handleUserStoppedTyping);
    };
  }, [user]);

  // Send message
  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const msgData = {
      user: user.username,
      text: messageInput.trim(),
    };
    socket.emit("send_message", msgData);
    setMessageInput("");
    socket.emit("stop_typing");
  };

  // Handle typing
  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    socket.emit("typing");

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing");
    }, 1000);
  };

  const handleEnterPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Format timestamps nicely
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-container">
      <OnlineUsers socket={socket} />

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.user === user.username ? "own-message" : ""
            }`}
          >
            <div>
              <strong>{msg.user}: </strong>
              <span>{msg.text}</span>
            </div>
            <small className="timestamp">{formatTime(msg.timestamp)}</small>
          </div>
        ))}
      </div>

      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
        </div>
      )}

      <div className="chat-input">
        <input
          type="text"
          value={messageInput}
          onChange={handleTyping}
          onKeyDown={handleEnterPress}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
