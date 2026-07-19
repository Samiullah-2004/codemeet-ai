"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePeerConnection } from "./usePeerConnection";

type Role = "idle" | "caller" | "callee";

export default function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("idle");

  const [offerText, setOfferText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [pastedOffer, setPastedOffer] = useState("");
  const [pastedAnswer, setPastedAnswer] = useState("");

  const { remoteStream, connectionState, createOffer, createAnswer, acceptAnswer } =
    usePeerConnection(localStream);

  useEffect(() => {
    let stream: MediaStream;

    async function startLocalMedia() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch {
        setError("Could not access camera or microphone. Check browser permissions.");
      }
    }

    startLocalMedia();
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  async function handleCreateOffer() {
    setRole("caller");
    const offer = await createOffer();
    setOfferText(offer);
  }

  async function handleCreateAnswer() {
    if (!pastedOffer) return;
    setRole("callee");
    const answer = await createAnswer(pastedOffer);
    setAnswerText(answer);
  }

  async function handleAcceptAnswer() {
    if (!pastedAnswer) return;
    await acceptAnswer(pastedAnswer);
  }

  const isConnected = connectionState === "connected";

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full max-w-2xl">
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}

      <div className="flex gap-4 w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1"
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg border border-[var(--color-accent-dim)] bg-black -scale-x-100"
          />
          <p className="text-xs text-center text-[var(--foreground)]/50 mt-1">You</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="flex-1"
        >
          <motion.video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            animate={{
              boxShadow: isConnected
                ? "0 0 0 2px var(--color-accent)"
                : "0 0 0 0px transparent",
            }}
            transition={{ duration: 0.4 }}
            className="w-full rounded-lg border border-[var(--color-accent-dim)] bg-black"
          />
          <motion.p
            key={connectionState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-center text-[var(--foreground)]/50 mt-1"
          >
            Peer ({connectionState})
          </motion.p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {role === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreateOffer}
              className="px-4 py-2 rounded-md bg-[var(--color-accent)] text-black text-sm font-medium"
            >
              Start Call (Caller)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setRole("callee")}
              className="px-4 py-2 rounded-md border border-[var(--color-accent-dim)] text-sm"
            >
              Join Call (Callee)
            </motion.button>
          </motion.div>
        )}

        {role === "caller" && (
          <motion.div
            key="caller"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col gap-2 text-sm"
          >
            <label>1. Copy this offer, send it to the other tab:</label>
            <textarea readOnly value={offerText} className="w-full h-24 p-2 bg-black/40 rounded border border-[var(--color-accent-dim)] text-xs" />

            <label>2. Paste the answer you get back:</label>
            <textarea
              value={pastedAnswer}
              onChange={(e) => setPastedAnswer(e.target.value)}
              className="w-full h-24 p-2 bg-black/40 rounded border border-[var(--color-accent-dim)] text-xs"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAcceptAnswer}
              className="px-4 py-2 rounded-md bg-[var(--color-accent)] text-black text-sm font-medium self-start"
            >
              Connect
            </motion.button>
          </motion.div>
        )}

        {role === "callee" && (
          <motion.div
            key="callee"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col gap-2 text-sm"
          >
            <label>1. Paste the offer from the other tab:</label>
            <textarea
              value={pastedOffer}
              onChange={(e) => setPastedOffer(e.target.value)}
              className="w-full h-24 p-2 bg-black/40 rounded border border-[var(--color-accent-dim)] text-xs"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreateAnswer}
              className="px-4 py-2 rounded-md bg-[var(--color-accent)] text-black text-sm font-medium self-start"
            >
              Create Answer
            </motion.button>

            <AnimatePresence>
              {answerText && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-2 overflow-hidden"
                >
                  <label>2. Copy this answer, send it back to the caller tab:</label>
                  <textarea readOnly value={answerText} className="w-full h-24 p-2 bg-black/40 rounded border border-[var(--color-accent-dim)] text-xs" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}