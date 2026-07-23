import { NextRequest, NextResponse } from "next/server";
import { getCodeFeedback } from "@/lib/gemini";
import { getSession } from "@/lib/sessions";
import { getProblem } from "@/lib/problems";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "@/lib/dynamodb";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sessionId, code } = body;

  if (!sessionId || !code) {
    return NextResponse.json({ error: "sessionId and code are required" }, { status: 400 });
  }

  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Get the problem for context
  const problem = session.problemId ? await getProblem(session.problemId) : null;

  const feedback = await getCodeFeedback(
    code,
    problem?.title ?? "General coding problem",
    problem?.description ?? "Write clean, efficient code."
  );

  // Store feedback and mark session as ended
  await ddb.send(
    new UpdateCommand({
      TableName: "Sessions",
      Key: { sessionId },
      UpdateExpression:
        "SET #status = :status, endedAt = :endedAt, feedback = :feedback",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": "ended",
        ":endedAt": Date.now(),
        ":feedback": feedback,
      },
    })
  );

  return NextResponse.json({ feedback });
}