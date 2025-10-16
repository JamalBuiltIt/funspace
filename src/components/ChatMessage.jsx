// src/components/ChatMessage.jsx
import React from "react";

const ChatMessage = ({ message, isOwnMessage }) => {
  const { username = "Unknown", text = "", timestamp = new Date().toISOString() } = message || {};

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
        marginBottom: "8px",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "8px 12px",
          borderRadius: "15px",
          backgroundColor: isOwnMessage ? "#4caf50" : "#e0e0e0",
          color: isOwnMessage ? "#fff" : "#000",
          wordBreak: "break-word",
        }}
      >
        {!isOwnMessage && <strong>{username}: </strong>}
        {text}
        <div style={{ fontSize: "10px", textAlign: "right", marginTop: "2px" }}>
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
