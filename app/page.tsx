"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
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

// Derive the displayed name/role from the session by default, but let
// the user's own typing/clicking override it. No effect needed, this
// is computed fresh on every render instead of synced via setState.
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
    <main className="flex flex-1 flex-col items-center gap-6 p-8 py-16 bg-[var(--background)] relative">
      {session && (
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="absolute top-4 right-4 text-xs text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
        >
          Log out
        </button>
      )}

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

      {status === "loading" && (
        <p className="text-sm text-[var(--foreground)]/50">Loading...</p>
      )}

      {status === "unauthenticated" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col gap-3 w-full max-w-sm text-center"
        >
          <p className="text-sm text-[var(--foreground)]/70">
            Log in or create an account to start or join a session.
          </p>
          <a
            href="/login"
            className="w-full py-2 rounded-md bg-[var(--color-accent)] text-black text-sm font-medium text-center"
          >
            Log In
          </a>
          <a
            href="/signup"
            className="w-full py-2 rounded-md border border-[var(--color-accent-dim)] text-sm text-center"
          >
            Sign Up
          </a>
        </motion.div>
      )}

      {status === "authenticated" && (
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
              className={`flex-1 py-1.5 rounded-md text-sm font-medium border transition-colors ${role === "recruiter"
                ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)]"
                : "border-[var(--color-accent-dim)] text-[var(--foreground)]/60"
                }`}
            >
              Recruiter
            </button>
            <button
              onClick={() => setRole("candidate")}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium border transition-colors ${role === "candidate"
                ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)]"
                : "border-[var(--color-accent-dim)] text-[var(--foreground)]/60"
                }`}
            >
              Candidate
            </button>
          </div>

          {role === "recruiter" && (
            <select
              value={selectedProblemId}
              onChange={(e) => setSelectedProblemId(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-[var(--color-accent-dim)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              <option value="">No problem selected</option>
              {problems.map((p) => (
                <option key={p.problemId} value={p.problemId}>
                  {p.title}
                </option>
              ))}
            </select>
          )}

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

          <div className="flex flex-col gap-1">
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
            {joinError && <p className="text-xs text-red-400">{joinError}</p>}
          </div>
        </motion.div>
      )}
    </main>
  );
}