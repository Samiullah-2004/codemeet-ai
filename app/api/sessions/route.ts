import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/sessions";
import { generateRoomId } from "@/lib/roomId";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { recruiterName } = body;

  if (!recruiterName || typeof recruiterName !== "string") {
    return NextResponse.json({ error: "recruiterName is required" }, { status: 400 });
  }

  const roomId = generateRoomId();
  const sessionId = `session-${Date.now()}`;

  await createSession({
    sessionId,
    roomId,
    recruiterName,
    status: "waiting",
    createdAt: Date.now(),
  });

  return NextResponse.json({ sessionId, roomId });
}