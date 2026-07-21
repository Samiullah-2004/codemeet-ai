"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { generateRoomId } from "@/lib/roomId";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [role, setRole] = useState<"recruiter" | "candidate">("recruiter");

  function createSession() {
    if (!username.trim()) return;
    const roomId = generateRoomId();
    router.push(`/session/${roomId}?username=${encodeURIComponent(username)}&role=${role}`);
  }

  function joinSession() {
    if (!username.trim() || !joinCode.trim()) return;
    router.push(`/session/${joinCode.trim()}?username=${encodeURIComponent(username)}&role=candidate`);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 bg-[var(--background)]">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-3xl font-bold text-[var(--foreground)]"
      >
        CodeMeet <span className="text-[var(--color-accent)]">AI</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="max-w-md text-center text-[var(--foreground)]/70"
      >
        Real-time technical interview platform. Video, shared code editor, and AI-generated feedback in one room.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <input
          type="text"
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-white/5 border border-[var(--color-accent-dim)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setRole("recruiter")}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              role === "recruiter"
                ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)]"
                : "border-[var(--color-accent-dim)] text-[var(--foreground)]/60"
            }`}
          >
            Recruiter
          </button>
          <button
            onClick={() => setRole("candidate")}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              role === "candidate"
                ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)]"
                : "border-[var(--color-accent-dim)] text-[var(--foreground)]/60"
            }`}
          >
            Candidate
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={createSession}
          className="w-full py-2 rounded-md bg-[var(--color-accent)] text-black text-sm font-medium"
        >
          Create Session
        </motion.button>

        <div className="flex items-center gap-2 text-[var(--foreground)]/30 text-xs">
          <div className="flex-1 h-px bg-[var(--foreground)]/10" />
          or join existing
          <div className="flex-1 h-px bg-[var(--foreground)]/10" />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md bg-white/5 border border-[var(--color-accent-dim)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={joinSession}
            className="px-4 py-2 rounded-md border border-[var(--color-accent-dim)] text-sm"
          >
            Join
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}