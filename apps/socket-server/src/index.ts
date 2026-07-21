import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.SOCKET_PORT ? Number(process.env.SOCKET_PORT) : 4000;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*", // tighten this to the real frontend URL once deployed
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join-room", (roomId: string) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("code-change", ({ roomId, code }: { roomId: string; code: string }) => {
    // Broadcast to everyone else in the room except the sender
    socket.to(roomId).emit("code-change", code);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});