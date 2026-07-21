"use client";

import { motion } from "motion/react";
import VideoCall from "@/components/video/VideoCall";
import MonacoEditor from "@/components/editor/MonacoEditor";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center bg-[var(--background)]">
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
        className="max-w-md text-[var(--foreground)]/70"
      >
        Real-time technical interview platform. Video, shared code editor, and
        AI-generated feedback, in one room.
      </motion.p>

      <VideoCall />

      <div className="w-full max-w-2xl text-left">
        <MonacoEditor onChange={(val) => console.log("editor changed:", val)} />
      </div>
    </main>
  );
}