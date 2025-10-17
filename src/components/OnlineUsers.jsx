// src/components/OnlineUsers.jsx
import React, { useEffect, useState } from "react";
import "./OnlineUsers.css"; // we'll add modal styling here

function OnlineUsers({ socket }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div>
      <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
        Online Users ({onlineUsers.length})
      </button>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Online Users ({onlineUsers.length})</h3>
            <ul>
              {onlineUsers.map((username, index) => (
                <li key={index}>{username}</li>
              ))}
            </ul>
            <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OnlineUsers;
