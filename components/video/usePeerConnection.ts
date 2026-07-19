"use client";

import { useRef, useState } from "react";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function usePeerConnection(localStream: MediaStream | null) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<string>("new");

  function ensurePeerConnection() {
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

    // Send our local camera/mic tracks to the other side
    localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pcRef.current = pc;
    return pc;
  }

  // Waits until ICE gathering finishes so the offer/answer we copy-paste
  // includes all network candidates in one shot, no manual candidate exchange.
function waitForIceGatheringComplete(pc: RTCPeerConnection, timeoutMs = 2000): Promise<void> {
  if (pc.iceGatheringState === "complete") return Promise.resolve();

  return new Promise((resolve) => {
    let done = false;

    function finish() {
      if (done) return;
      done = true;
      pc.removeEventListener("icegatheringstatechange", check);
      resolve();
    }

    function check() {
      if (pc.iceGatheringState === "complete") finish();
    }

    pc.addEventListener("icegatheringstatechange", check);

    // Don't wait forever, a couple seconds of gathering is enough
    // for a STUN-based connection in almost all cases.
    setTimeout(finish, timeoutMs);
  });
}

  async function createOffer(): Promise<string> {
    const pc = ensurePeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await waitForIceGatheringComplete(pc);
    return JSON.stringify(pc.localDescription);
  }

  async function createAnswer(remoteOfferJson: string): Promise<string> {
    const pc = ensurePeerConnection();
    const offer = JSON.parse(remoteOfferJson);
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await waitForIceGatheringComplete(pc);
    return JSON.stringify(pc.localDescription);
  }

  async function acceptAnswer(remoteAnswerJson: string) {
    const pc = ensurePeerConnection();
    const answer = JSON.parse(remoteAnswerJson);
    await pc.setRemoteDescription(answer);
  }

  return { remoteStream, connectionState, createOffer, createAnswer, acceptAnswer };
}