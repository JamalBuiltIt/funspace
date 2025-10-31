// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = useCallback((rawUsername) => {
    const username = rawUsername.trim();

    if (!username) {
      setLoginError("Username cannot be empty.");
      return;
    }
    if (username.length < 2 || username.length > 20) {
      setLoginError("Username must be 2–20 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setLoginError("Only letters, numbers, and underscores allowed.");
      return;
    }

    setLoginError("");
    setIsLoggingIn(true);
    setUser({ username }); // Optimistic UI
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setLoginError("");
    setIsLoggingIn(false);
  }, []);

  const clearLoginError = useCallback(() => setLoginError(""), []);

  const value = {
    user,
    login,
    logout,
    loginError,
    clearLoginError,
    isLoggingIn,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};