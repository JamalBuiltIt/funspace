import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { socket } from "../api/socket";

export default function ChatWindow({ currentUser }) {
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(new Set());
  const endRef = useRef(null);
  const timeoutRef = useRef(null);
  const inputRef = useRef(null);

  /* ---------- scroll ---------- */
  const scroll = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(() => scroll(), [msgs, scroll]);

  /* ---------- socket listeners ---------- */
  useEffect(() => {
    const onMsg = (m) => setMsgs((p) => [...p, m]);
    const onHist = (h) => setMsgs(h);
    const onTyp = (u) => {
      if (u === currentUser) return;               // ignore self
      setTyping((s) => new Set(s).add(u));
    };
    const onStop = (u) => {
      setTyping((s) => {
        const n = new Set(s);
        n.delete(u);
        return n;
      });
    };

    socket.on("receive_message", onMsg);
    socket.on("receive_history", onHist);
    socket.on("user_typing", onTyp);
    socket.on("user_stopped_typing", onStop);

    return () => {
      socket.off("receive_message", onMsg);
      socket.off("receive_history", onHist);
      socket.off("user_typing", onTyp);
      socket.off("user_stopped_typing", onStop);
    };
  }, [currentUser]);

  /* ---------- send ---------- */
  const send = useCallback(() => {
    const txt = inputRef.current?.value.trim();
    if (!txt || !currentUser) return;
    socket.emit("send_message", { text: txt });
    setInput("");
    inputRef.current?.focus();
  }, [currentUser]);

  const [input, setInput] = useState("");

  /* ---------- typing ---------- */
  const clearTyping = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    socket.emit("stop_typing");
  }, []);

  const onChange = useCallback(
    (e) => {
      const v = e.target.value;
      setInput(v);

      if (!currentUser) return;

      if (v.trim() && !timeoutRef.current) socket.emit("typing");

      clearTyping();
      timeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing");
        timeoutRef.current = null;
      }, 1000);
    },
    [currentUser, clearTyping]
  );

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  /* ---------- time format ---------- */
  const fmt = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    return d.toDateString() === now.toDateString()
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const tip =
    typing.size === 0
      ? ""
      : typing.size === 1
      ? `${[...typing][0]} is typing...`
      : typing.size <= 3
      ? `${[...typing].join(", ")} are typing...`
      : "Several people are typing...";

  return (
    <div className="chat-window">
      <div className="messages">
        {msgs.map((m) => (
          <div
            key={`${m.timestamp}-${m.user}`}
            className={`msg ${m.user === currentUser ? "own" : "other"}`}
          >
            <div className="bubble">
              <div className="head">
                <strong>{m.user}</strong>
                <small>{fmt(m.timestamp)}</small>
              </div>
              <p>{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {tip && <div className="typing">{tip}</div>}

      <div className="input-area">
        <input
          ref={inputRef}
          value={input}
          onChange={onChange}
          onKeyDown={onKey}
          placeholder="Type a message..."
          maxLength={500}
          autoFocus
        />
        <button onClick={send} disabled={!input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}