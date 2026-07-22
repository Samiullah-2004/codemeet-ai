"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { usePeerConnection } from "./usePeerConnection";

interface VideoCallProps {
  roomId: string;
}

export default function VideoCall({ roomId }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { remoteStream, connectionState } = usePeerConnection(localStream, roomId);

  useEffect(() => {
    let stream: MediaStream;

    async function startLocalMedia() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  } catch (err) {
        console.error("getUserMedia failed:", err);
        setError(
          err instanceof DOMException
            ? `Could not access camera/mic: ${err.name} - ${err.message}`
            : "Could not access camera or microphone. Check browser permissions."
        );
      }
    }

    startLocalMedia();
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [roomId]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const isConnected = connectionState === "connected";

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full max-w-2xl">
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400">
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
    </div>
  );
}