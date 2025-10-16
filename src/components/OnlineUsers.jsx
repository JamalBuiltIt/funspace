// src/components/OnlineUsers.jsx
import React, { useEffect, useState } from "react";

function OnlineUsers({ socket }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdateUsers = (usersList) => {
      setOnlineUsers(usersList);
    };

    socket.on("update_users", handleUpdateUsers);

    return () => {
      socket.off("update_users", handleUpdateUsers);
    };
  }, [socket]);

  return (
    <div className="online-users">
      <h3>Online Users ({onlineUsers.length})</h3>
      <ul>
        {onlineUsers.map((username, index) => (
          <li key={index}>{username}</li>
        ))}
      </ul>
    </div>
  );
}

export default OnlineUsers;
