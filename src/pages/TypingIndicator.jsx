// src/components/TypingIndicator.jsx
import React from "react";

const TypingIndicator = ({ typingUsers, currentUser }) => {
  const otherUsers = typingUsers.filter((u) => u !== currentUser);
  if (otherUsers.length === 0) return null;

  return (
    <div className="typing-indicator">
      {otherUsers.join(", ")} {otherUsers.length > 1 ? "are" : "is"} typing...
    </div>
  );
};

export default TypingIndicator;
