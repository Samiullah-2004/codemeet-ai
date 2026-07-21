"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getSocket } from "@/lib/socket";

interface Message {
  sender: string;
  message: string;
  timestamp: number;
}

interface ChatPanelProps {
  roomId: string;
  username: string;
}

export default function ChatPanel({ roomId, username }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();

    function handleMessage(msg: Message) {
      setMessages((prev) => [...prev, msg]);
    }

    socket.on("chat-message", handleMessage);
    return () => {
      socket.off("chat-message", handleMessage);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const socket = getSocket();
    socket.emit("chat-message", { roomId, message: trimmed, sender: username });
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <div className="flex flex-col h-[420px] w-full rounded-lg border border-[var(--color-accent-dim)] bg-black/30">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isOwn = msg.sender === username;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] text-[var(--foreground)]/40">{msg.sender}</span>
                <span
                  className={`px-3 py-1.5 rounded-lg text-sm max-w-[75%] break-words ${
                    isOwn
                      ? "bg-[var(--color-accent)] text-black"
                      : "bg-white/10 text-[var(--foreground)]"
                  }`}
                >
                  {msg.message}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-2 border-t border-[var(--color-accent-dim)]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm outline-none text-[var(--foreground)] placeholder:text-[var(--foreground)]/30"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage}
          className="px-3 py-1 rounded-md bg-[var(--color-accent)] text-black text-sm font-medium"
        >
          Send
        </motion.button>
      </div>
    </div>
  );
}