// Generates a short, URL-safe room ID for a session link,
// e.g. /session/x7k2p9

export function generateRoomId(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}