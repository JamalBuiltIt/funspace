// src/components/ChatInput.jsx
import React, { useState, useRef } from "react";

const ChatInput = ({ socket }) => {
  const [message, setMessage] = useState("");
  const typingTimeout = useRef(null);

  const handleSend = () => {
    if (!message.trim()) return;

    const msgData = {
      text: message,
      timestamp: new Date().toISOString(),
      username: socket.auth.username,
    };

    socket.emit("message", msgData);
    setMessage("");
    stopTyping();
  };

  const startTyping = () => {
    socket.emit("typing");
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(stopTyping, 1000);
  };

  const stopTyping = () => socket.emit("stop-typing");

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
    else startTyping();
  };

  return (
    <div className="chat-input">
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatInput;
