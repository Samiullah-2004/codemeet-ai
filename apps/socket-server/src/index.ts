import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.SOCKET_PORT ? Number(process.env.SOCKET_PORT) : 4000;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join-room", (roomId: string) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
    // Tell everyone else in the room a new peer arrived
    socket.to(roomId).emit("peer-joined", socket.id);
  });

  // Code sync
  socket.on("code-change", ({ roomId, code }: { roomId: string; code: string }) => {
    socket.to(roomId).emit("code-change", code);
  });

  // WebRTC signaling - just relay between peers, server doesn't touch the content
  socket.on("webrtc-offer", ({ roomId, offer }: { roomId: string; offer: RTCSessionDescriptionInit }) => {
    socket.to(roomId).emit("webrtc-offer", { offer, from: socket.id });
  });

  socket.on("webrtc-answer", ({ roomId, answer }: { roomId: string; answer: RTCSessionDescriptionInit }) => {
    socket.to(roomId).emit("webrtc-answer", { answer, from: socket.id });
  });

  socket.on("webrtc-ice-candidate", ({ roomId, candidate }: { roomId: string; candidate: RTCIceCandidateInit }) => {
    socket.to(roomId).emit("webrtc-ice-candidate", { candidate, from: socket.id });
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  socket.on("check-room", (roomId: string, callback: (participantCount: number) => void) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const count = room ? room.size : 0;
    callback(count);
  });

  // Chat
  socket.on("chat-message", ({ roomId, message, sender }: { roomId: string; message: string; sender: string }) => {
    // Broadcast to everyone in the room including the sender
    io.to(roomId).emit("chat-message", { message, sender, timestamp: Date.now() });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});