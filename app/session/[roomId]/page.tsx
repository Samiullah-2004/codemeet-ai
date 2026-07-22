"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "motion/react";
import VideoCall from "@/components/video/VideoCall";
import MonacoEditor from "@/components/editor/MonacoEditor";
import ChatPanel from "@/components/chat/ChatPanel";
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

function SessionRoom() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [isAlone, setIsAlone] = useState(false);


  const roomId = params.roomId as string;
  const username = searchParams.get("username") ?? "anonymous";
  const role = searchParams.get("role") ?? "candidate";


  useEffect(() => {
    const socket = getSocket();
    const timer = setTimeout(() => {
      socket.emit("check-room", roomId, (count: number) => {
        setIsAlone(count <= 1);
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [roomId]);

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] overflow-hidden">
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
        <span className="text-xs text-[var(--foreground)]/50 capitalize">
          {username} - {role}
        </span>
      </motion.header>

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
          <MonacoEditor roomId={roomId} />
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