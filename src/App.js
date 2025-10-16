// src/App.js
import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Chat from "./pages/Chat";
import "./App.css";

function AppContent() {
  const { user, login } = useAuth();
  const [usernameInput, setUsernameInput] = useState("");

  // Handle login button click
  const handleLogin = () => {
    const trimmed = usernameInput.trim();
    if (trimmed) login(trimmed);
  };

  if (!user) {
    return (
      <div className="login-container">
        <h2>Welcome! Enter your username:</h2>
        <input
          type="text"
          placeholder="Username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
        />
        <button onClick={handleLogin}>Enter Chat</button>
      </div>
    );
  }

  // Pass current user as prop to Chat
  return <Chat user={user} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
