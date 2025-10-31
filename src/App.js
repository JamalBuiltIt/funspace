import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { socket } from "./api/socket";
import Chat from "./pages/Chat";
import OnlineUsersModal from "./components/OnlineUsersModal"; // New component
import "./App.css";

function AppContent() {
  const { user, login, logout, loginError, clearLoginError, isLoggingIn } = useAuth();
  const [usernameInput, setUsernameInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false); // Modal state

  // ... existing socket useEffect ...

  const handleLogin = () => {
    const name = usernameInput.trim();
    if (!name) return;
    login(name);
    setUsernameInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>FunSpace Chat</h1>
          <p>Join the global conversation!</p>
          {loginError && (
            <div className="error-message">
              {loginError}
              <button className="dismiss-error" onClick={clearLoginError}>×</button>
            </div>
          )}
          <div className="input-group">
            <input
              type="text"
              placeholder="Choose a username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={20}
              autoFocus
            />
            <button onClick={handleLogin} disabled={isLoggingIn || !usernameInput.trim()}>
              {isLoggingIn ? "Joining..." : "Enter Chat"}
            </button>
          </div>
          <small>2–20 chars, letters, numbers, _ only</small>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="chat-header">
        <div className="header-left">
          <h2>FunSpace</h2>
          <span className="status-indicator">
            {isConnecting ? "Connecting..." : socket.connected ? "Online" : "Offline"}
          </span>
        </div>

        <div className="header-right">
          {/* Clickable user count button */}
          <button 
            className="users-trigger" 
            onClick={() => setShowUsersModal(true)}
          >
            👥 {user.onlineCount || 0}
          </button>
          
          <div className="user-info">
            <strong>{user.username}</strong>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="chat-main">
        <Chat />
      </main>

      {/* Modal — only shows when triggered */}
      {showUsersModal && (
        <OnlineUsersModal 
          onClose={() => setShowUsersModal(false)}
          currentUser={user.username}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;