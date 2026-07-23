"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
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

    // Also clear the banner immediately the moment someone actually joins,
    // instead of waiting for the next timed check.
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

    // Get current code from Monaco - we'll use a ref for this
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
    <div className="flex flex-col h-screen bg-[var(--background)] overflow-hidden relative">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-accent-dim)]"
      >
        <span className="text-sm font-bold text-[var(--foreground)]">
          CodeMeet <span className="text-[var(--color-accent)]">AI</span>
        </span>
        <span className="text-xs text-[var(--foreground)]/50">
          Room: <span className="text-[var(--color-accent)]">{roomId}</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--foreground)]/50 capitalize">
            {username} - {role}
          </span>
          {role === "recruiter" && !feedback && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEndSession}
              disabled={isEnding}
              className="px-3 py-1 rounded-md bg-red-500/80 text-white text-xs font-medium disabled:opacity-50"
            >
              {isEnding ? "Generating feedback..." : "End Session"}
            </motion.button>
          )}
        </div>
      </motion.header>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 z-50 bg-[var(--background)]/95 flex items-center justify-center p-8"
        >
          <div className="w-full max-w-2xl flex flex-col gap-4 rounded-xl border border-[var(--color-accent-dim)] p-6 bg-black/60">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                AI Feedback
              </h2>
              <span className="text-2xl font-bold text-[var(--color-accent)]">
                {feedback.score}/10
              </span>
            </div>

            <p className="text-sm text-[var(--foreground)]/80">{feedback.summary}</p>

            <div>
              <p className="text-xs font-semibold text-green-400 mb-1">Strengths</p>
              <ul className="flex flex-col gap-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-[var(--foreground)]/70">- {s}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-yellow-400 mb-1">Areas to improve</p>
              <ul className="flex flex-col gap-1">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="text-xs text-[var(--foreground)]/70">- {s}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {isAlone && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 text-xs text-center bg-yellow-500/10 text-yellow-400 border-b border-yellow-500/20"
        >
          You&apos;re the only one in this room. Double-check the room code, or wait for the other participant to join.
        </motion.div>
      )}
      
      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: editor */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 p-3 overflow-hidden"
        >
          <MonacoEditor
            roomId={roomId}
            onCodeChange={(code) => { editorCodeRef.current = code; }}
          />
        </motion.div>

        {/* Right: video + chat */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="w-80 flex flex-col border-l border-[var(--color-accent-dim)] overflow-hidden"
        >
          <VideoCall roomId={roomId} />
          <div className="flex-1 overflow-hidden p-2">
            <ChatPanel roomId={roomId} username={username} />
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