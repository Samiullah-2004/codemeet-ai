"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function usePeerConnection(localStream: MediaStream | null, roomId: string) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<string>("new");

  // Keep a ref in sync with the latest stream, and run anything that was
  // waiting on it becoming ready (see waitForStreamThen below).
  useEffect(() => {
    localStreamRef.current = localStream;
    if (localStream && pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      action();
    }
  }, [localStream]);

  useEffect(() => {
    const socket = getSocket();

    function createPeerConnection(): RTCPeerConnection {
      if (pcRef.current) return pcRef.current;

      const pc = new RTCPeerConnection(ICE_SERVERS);

      pc.ontrack = (event) => {
        setRemoteStream((prev) => {
          const stream = prev ?? new MediaStream();
          stream.addTrack(event.track);
          return stream;
        });
      };

      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-ice-candidate", { roomId, candidate: event.candidate });
        }
      };

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pcRef.current = pc;
      return pc;
    }

    // If the local camera/mic isn't ready yet, defer the action instead
    // of dropping it, runs automatically once localStream becomes ready.
    function waitForStreamThen(action: () => void) {
      if (localStreamRef.current) {
        action();
      } else {
        pendingActionRef.current = action;
      }
    }

    function handlePeerJoined() {
      waitForStreamThen(async () => {
        const pc = createPeerConnection();
        if (pc.signalingState !== "stable") {
          console.warn("Skipping duplicate offer, already negotiating:", pc.signalingState);
          return;
        }
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc-offer", { roomId, offer });
      });
    }

    function handleOffer({ offer }: { offer: RTCSessionDescriptionInit }) {
      waitForStreamThen(async () => {
        const pc = createPeerConnection();
        if (pc.signalingState !== "stable") {
          console.warn("Ignoring offer, connection not in stable state:", pc.signalingState);
          return;
        }
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-answer", { roomId, answer });
      });
    }

    async function handleAnswer({ answer }: { answer: RTCSessionDescriptionInit }) {
      const pc = pcRef.current;
      if (!pc) return;
      if (pc.signalingState !== "have-local-offer") {
        console.warn("Ignoring unexpected answer, state:", pc.signalingState);
        return;
      }
      await pc.setRemoteDescription(answer);
    }

    async function handleIceCandidate({ candidate }: { candidate: RTCIceCandidateInit }) {
      const pc = pcRef.current;
      if (pc) await pc.addIceCandidate(candidate);
    }

    socket.on("peer-joined", handlePeerJoined);
    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("webrtc-ice-candidate", handleIceCandidate);

    return () => {
      socket.off("peer-joined", handlePeerJoined);
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("webrtc-ice-candidate", handleIceCandidate);

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      pendingActionRef.current = null;
    };
  }, [roomId]);

  return { remoteStream, connectionState };
}