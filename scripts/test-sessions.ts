import { createSession, getSession, endSession } from "../lib/sessions";
import { generateRoomId } from "../lib/roomId";

async function run() {
  const sessionId = `session-${Date.now()}`;
  const roomId = generateRoomId();

  console.log("Creating session...");
  await createSession({
    sessionId,
    roomId,
    recruiterName: "Sami",
    status: "waiting",
    createdAt: Date.now(),
  });

  console.log("Reading session back...");
  const session = await getSession(sessionId);
  console.log(session);

  console.log("Ending session...");
  await endSession(sessionId);

  console.log("Reading session after end...");
  const ended = await getSession(sessionId);
  console.log(ended);
}

run().catch(console.error);