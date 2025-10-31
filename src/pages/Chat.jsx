import React, { useEffect, useRef, useState } from "react";
import { socket } from "../api/socket";
import ChatWindow from "../components/ChatWindow";

export default function Chat({ currentUser }) {
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    socket.connect();

    const onJoined = ({ username }) => {
      setJoined(true);
      setError("");
    };
    const onTaken = () => setError("Username already taken");
    const onErr = (msg) => setError(msg);

    socket.on("joined", onJoined);
    socket.on("username_taken", onTaken);
    socket.on("error", onErr);

    return () => {
      socket.off("joined", onJoined);
      socket.off("username_taken", onTaken);
      socket.off("error", onErr);
      socket.disconnect();
    };
  }, []);

  const join = () => {
    const name = inputRef.current?.value.trim();
    if (name) {
      socket.emit("join", name);
      setError("");
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter") join();
  };

  // Update online count in App.js
  useEffect(() => {
    const updateCount = (users) => {
      // This will be passed up to App.js somehow
      // For now, just log
      console.log(`Online users: ${users.length}`);
    };
    socket.on("update_users", updateCount);
    return () => socket.off("update_users", updateCount);
  }, []);

  if (!joined) {
    return (
      <div className="join-screen">
        <h1>Join Chat</h1>
        <input
          ref={inputRef}
          placeholder="Your name"
          maxLength={20}
          onKeyDown={onKey}
          autoFocus
        />
        <button onClick={join}>Join</button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <div className="chat-main">
        <ChatWindow currentUser={currentUser} />
      </div>
    </div>
  );
}