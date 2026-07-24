"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import VideoCall from "@/components/video/VideoCall";
import MonacoEditor from "@/components/editor/MonacoEditor";
import ChatPanel from "@/components/chat/ChatPanel";
import { getSocket } from "@/lib/socket";

function SessionRoom() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [isAlone, setIsAlone] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [feedback, setFeedback] = useState<null | {
    summary: string;
    strengths: string[];
    improvements: string[];
    score: number;
  }>(null);

  const roomId = params.roomId as string;
  const sessionId = searchParams.get("sessionId");
  const username = searchParams.get("username") ?? "anonymous";
  const role = searchParams.get("role") ?? "candidate";
  const editorCodeRef = useRef<string>("// Start coding here\n");

  useEffect(() => {
    const socket = getSocket();

    const timer = setTimeout(() => {
      socket.emit("check-room", roomId, (count: number) => {
        setIsAlone(count <= 1);
      });
    }, 4000);

    function handlePeerJoined() {
      setIsAlone(false);
    }

    socket.on("peer-joined", handlePeerJoined);

    return () => {
      clearTimeout(timer);
      socket.off("peer-joined", handlePeerJoined);
    };
  }, [roomId]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join-room", roomId);
  }, [roomId]);

  async function handleEndSession() {
    if (!sessionId) return;
    setIsEnding(true);

    const code = editorCodeRef.current ?? "// No code written";

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, code }),
    });

    if (res.ok) {
      const data = await res.json();
      setFeedback(data.feedback);
    }

    setIsEnding(false);
  }

  return (
    <div className="grid-bg flex flex-col min-h-screen relative">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[var(--border-subtle)] bg-black/30 backdrop-blur-sm"
      >
        <span className="text-sm font-bold tracking-tight">
          CodeMeet <span className="text-[var(--color-accent)]">AI</span>
        </span>

        <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--color-accent)] mono-tag">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
          room/{roomId}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[var(--foreground)]/50 capitalize">
            {username} <span className="text-[var(--foreground)]/25">·</span> {role}
          </span>
          {role === "recruiter" && !feedback && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEndSession}
              disabled={isEnding}
              className="px-3 py-1.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium disabled:opacity-50 hover:bg-red-500/25 transition-colors"
            >
              {isEnding ? "Generating feedback..." : "End Session"}
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* Feedback overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[var(--background)]/95 backdrop-blur-sm flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="terminal-window w-full max-w-xl"
            >
              <div className="terminal-titlebar">
                <span className="terminal-dot bg-red-500/70" />
                <span className="terminal-dot bg-yellow-500/70" />
                <span className="terminal-dot bg-green-500/70" />
                <span className="ml-2 text-[10px] font-mono text-[var(--foreground)]/40">feedback.json</span>
              </div>
              <div className="flex flex-col gap-4 p-6">
                <p className="text-xs font-mono text-[var(--foreground)]/50">
                  <span className="text-[var(--color-accent)]">$</span> ai-review --session {sessionId?.slice(-6) ?? "complete"}
                </p>

                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">AI Feedback</h2>
                  <span className="text-2xl font-bold text-[var(--color-accent)]">
                    {feedback.score}<span className="text-sm text-[var(--foreground)]/40">/10</span>
                  </span>
                </div>

                <p className="text-sm text-[var(--foreground)]/80 leading-relaxed">{feedback.summary}</p>

                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-green-400 mb-1.5">Strengths</p>
                  <ul className="flex flex-col gap-1">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-[var(--foreground)]/70">
                        <span className="text-green-400/60">+</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-yellow-400 mb-1.5">Areas to improve</p>
                  <ul className="flex flex-col gap-1">
                    {feedback.improvements.map((s, i) => (
                      <li key={i} className="text-xs text-[var(--foreground)]/70">
                        <span className="text-yellow-400/60">-</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/"
                  className="btn-primary w-full py-2.5 rounded-md text-sm text-center mt-1 inline-block"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alone banner */}
      <AnimatePresence>
        {isAlone && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-2 text-xs font-mono text-center bg-yellow-500/10 text-yellow-400 border-b border-yellow-500/20"
          >
            You&apos;re the only one in this room. Double-check the room code, or wait for the other participant to join.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Left: editor */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 p-3 min-h-[400px] lg:min-h-0"
        >
          <div className="terminal-window h-full flex flex-col">
            <div className="terminal-titlebar">
              <span className="terminal-dot bg-red-500/70" />
              <span className="terminal-dot bg-yellow-500/70" />
              <span className="terminal-dot bg-green-500/70" />
              <span className="ml-2 text-[10px] font-mono text-[var(--foreground)]/40">solution.js</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <MonacoEditor
                roomId={roomId}
                onCodeChange={(code) => { editorCodeRef.current = code; }}
              />
            </div>
          </div>
        </motion.div>

        {/* Right: video + chat */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="w-full lg:w-80 flex flex-col gap-3 p-3 lg:pl-0"
        >
          <div className="terminal-window">
            <div className="terminal-titlebar">
              <span className="terminal-dot bg-red-500/70" />
              <span className="terminal-dot bg-yellow-500/70" />
              <span className="terminal-dot bg-green-500/70" />
              <span className="ml-2 text-[10px] font-mono text-[var(--foreground)]/40">call.mp4</span>
            </div>
            <VideoCall roomId={roomId} />
          </div>

          <div className="terminal-window flex-1 flex flex-col overflow-hidden">
            <div className="terminal-titlebar">
              <span className="terminal-dot bg-red-500/70" />
              <span className="terminal-dot bg-yellow-500/70" />
              <span className="terminal-dot bg-green-500/70" />
              <span className="ml-2 text-[10px] font-mono text-[var(--foreground)]/40">chat.log</span>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <ChatPanel roomId={roomId} username={username} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense>
      <SessionRoom />
    </Suspense>
  );
}