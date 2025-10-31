import React, { useEffect, useState } from "react";
import { socket } from "../api/socket";

export default function OnlineUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const update = (list) => setUsers(list);

    socket.on("update_users", update);
    // ask the server for the current list when we mount
    socket.emit("request_user_list");

    return () => socket.off("update_users", update);
  }, []);

  return (
    <div className="online-users">
      <h3>Online ({users.length})</h3>
      <ul>
        {users.map((u) => (
          <li key={u}>{u}</li>
        ))}
      </ul>
    </div>
  );
}