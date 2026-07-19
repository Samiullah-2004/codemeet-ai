"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream;

    async function startLocalMedia() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setIsReady(true);
      } catch (err) {
        console.error("Failed to access camera/mic:", err);
        setError("Could not access camera or microphone. Check browser permissions.");
      }
    }

    startLocalMedia();

    // Cleanup: stop all tracks when the component unmounts,
    // otherwise the camera light stays on after leaving the page.
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-md rounded-lg border border-[var(--color-accent-dim)] bg-black -scale-x-100"
      />

      <p className="text-sm text-[var(--foreground)]/60">
        {isReady ? "Camera connected" : "Requesting camera access..."}
      </p>
    </div>
  );
}