// src/components/ChatWindow.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ChatWindow.css";

const ChatWindow = ({ messages, currentUser }) => {
  return (
    <div className="chat-window">
      <AnimatePresence>
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`chat-message ${
              msg.username === currentUser ? "own-message" : "other-message"
            }`}
          >
            <span className="chat-username">{msg.username}</span>:{" "}
            <span className="chat-text">{msg.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ChatWindow;
