"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { isValidRoomId } from "@/lib/validateRoomId";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const [joinError, setJoinError] = useState<string | null>(null);
  const [usernameOverride, setUsernameOverride] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [roleOverride, setRoleOverride] = useState<"recruiter" | "candidate" | null>(null);
  const [problems, setProblems] = useState<{ problemId: string; title: string }[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const { data: session, status } = useSession();

  useEffect(() => {
    fetch("/api/problems")
      .then((res) => res.json())
      .then((data) => setProblems(data.problems ?? []))
      .catch(() => setProblems([]));
  }, []);

  const sessionRole = (session?.user as { role?: string } | undefined)?.role;
  const username = usernameOverride ?? session?.user?.name ?? "";
  const role: "recruiter" | "candidate" =
    roleOverride ?? (sessionRole === "recruiter" || sessionRole === "candidate" ? sessionRole : "recruiter");

  function setUsername(value: string) {
    setUsernameOverride(value);
  }
  function setRole(value: "recruiter" | "candidate") {
    setRoleOverride(value);
  }

  async function createSession() {
    if (!username.trim()) return;

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recruiterName: username, problemId: selectedProblemId || undefined }),
    });

    if (!res.ok) {
      setJoinError("Failed to create session. Try again.");
      return;
    }

    const { roomId, sessionId } = await res.json();
    router.push(`/session/${roomId}?username=${encodeURIComponent(username)}&role=${role}&sessionId=${sessionId}`);
  }

  function joinSession() {
    if (!username.trim() || !joinCode.trim()) return;

    if (!isValidRoomId(joinCode)) {
      setJoinError("That room code doesn't look right.");
      return;
    }

    setJoinError(null);
    router.push(`/session/${joinCode.trim()}?username=${encodeURIComponent(username)}&role=${role}`);
  }

  return (
    <main className="grid-bg flex flex-1 flex-col items-center gap-8 p-8 py-20 relative overflow-hidden">
      {session && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="absolute top-6 right-6 text-xs font-mono text-[var(--foreground)]/40 hover:text-[var(--color-accent)] transition-colors"
        >
          [ log out ]
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--color-accent)] mono-tag"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
        LIVE INTERVIEW PLATFORM
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        className="text-4xl sm:text-5xl font-bold text-center tracking-tight"
      >
        CodeMeet <span className="text-[var(--color-accent)]">AI</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
        className="max-w-md text-center text-[var(--foreground)]/60 text-sm leading-relaxed"
      >
        Video, a live-synced code editor, and AI-generated feedback,{" "}
        <span className="font-mono text-[var(--color-accent)]/80">in one room</span>.
      </motion.p>

      {status === "loading" && (
        <p className="text-sm font-mono text-[var(--foreground)]/40">loading_session...</p>
      )}

      <AnimatePresence mode="wait">
        {status === "unauthenticated" && (
          <motion.div
            key="unauth"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="terminal-window w-full max-w-sm"
          >
            <div className="terminal-titlebar">
              <span className="terminal-dot bg-red-500/70" />
              <span className="terminal-dot bg-yellow-500/70" />
              <span className="terminal-dot bg-green-500/70" />
              <span className="ml-2 text-[10px] font-mono text-[var(--foreground)]/40">auth.sh</span>
            </div>
            <div className="flex flex-col gap-3 p-6">
              <p className="text-xs font-mono text-[var(--foreground)]/50">
                <span className="text-[var(--color-accent)]">$</span> auth --required
              </p>
              <p className="text-sm text-[var(--foreground)]/70">
                Log in or create an account to start or join a session.
              </p>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/login"
                className="btn-primary w-full py-2.5 rounded-md text-sm text-center"
              >
                Log In
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/signup"
                className="btn-ghost w-full py-2.5 rounded-md text-sm text-center"
              >
                Sign Up
              </motion.a>
            </div>
          </motion.div>
        )}

        {status === "authenticated" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="terminal-window w-full max-w-sm"
          >
            <div className="terminal-titlebar">
              <span className="terminal-dot bg-red-500/70" />
              <span className="terminal-dot bg-yellow-500/70" />
              <span className="terminal-dot bg-green-500/70" />
              <span className="ml-2 text-[10px] font-mono text-[var(--foreground)]/40">new-session.sh</span>
            </div>
            <div className="flex flex-col gap-3 p-6">
              <input
                type="text"
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md bg-black/30 border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setRole("recruiter")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border transition-all ${
                    role === "recruiter"
                      ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)] glow-accent"
                      : "border-[var(--border-subtle)] text-[var(--foreground)]/60 hover:border-[var(--border-strong)]"
                  }`}
                >
                  Recruiter
                </button>
                <button
                  onClick={() => setRole("candidate")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border transition-all ${
                    role === "candidate"
                      ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)] glow-accent"
                      : "border-[var(--border-subtle)] text-[var(--foreground)]/60 hover:border-[var(--border-strong)]"
                  }`}
                >
                  Candidate
                </button>
              </div>

              <AnimatePresence>
                {role === "recruiter" && (
                  <motion.select
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    value={selectedProblemId}
                    onChange={(e) => setSelectedProblemId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md bg-black/30 border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
                  >
                    <option value="">No problem selected</option>
                    {problems.map((p) => (
                      <option key={p.problemId} value={p.problemId}>
                        {p.title}
                      </option>
                    ))}
                  </motion.select>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createSession}
                className="btn-primary w-full py-2.5 rounded-md text-sm mt-1"
              >
                Create Session
              </motion.button>

              <div className="flex items-center gap-2 text-[var(--foreground)]/25 text-[10px] font-mono uppercase tracking-wider">
                <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                or join existing
                <div className="flex-1 h-px bg-[var(--border-subtle)]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="room-code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-md bg-black/30 border border-[var(--border-subtle)] text-sm font-mono outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={joinSession}
                    className="btn-ghost px-5 py-2.5 rounded-md text-sm"
                  >
                    Join
                  </motion.button>
                </div>
                <AnimatePresence>
                  {joinError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-400"
                    >
                      {joinError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}