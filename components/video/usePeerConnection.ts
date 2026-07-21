"use client";

import { useRef, useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function usePeerConnection(localStream: MediaStream | null, roomId: string) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<string>("new");

  useEffect(() => {
    // Don't set up signaling until we have the local stream
    if (!localStream) return;

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
          socket.emit("webrtc-ice-candidate", {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      // localStream is guaranteed non-null here since we checked above
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pcRef.current = pc;
      return pc;
    }

    async function handlePeerJoined() {
      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc-offer", { roomId, offer });
    }

    async function handleOffer({ offer }: { offer: RTCSessionDescriptionInit }) {
      const pc = createPeerConnection();
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc-answer", { roomId, answer });
    }

    async function handleAnswer({ answer }: { answer: RTCSessionDescriptionInit }) {
      const pc = pcRef.current;
      if (pc) await pc.setRemoteDescription(answer);
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
    };
  }, [localStream, roomId]);

  return { remoteStream, connectionState };
}