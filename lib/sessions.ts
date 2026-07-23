import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./dynamodb";

export interface Session {
  sessionId: string;
  roomId: string;
  recruiterName: string;
  candidateName?: string;
  problemId?: string;
  status: "waiting" | "active" | "ended";
  createdAt: number;
  endedAt?: number;
  feedback?: {
    summary: string;
    strengths: string[];
    improvements: string[];
    score: number;
  };
}

export async function createSession(session: Session): Promise<void> {
  await ddb.send(
    new PutCommand({
      TableName: "Sessions",
      Item: session,
    })
  );
}

export async function getSession(sessionId: string): Promise<Session | undefined> {
  const result = await ddb.send(
    new GetCommand({
      TableName: "Sessions",
      Key: { sessionId },
    })
  );
  return result.Item as Session | undefined;
}

export async function endSession(sessionId: string): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: "Sessions",
      Key: { sessionId },
      UpdateExpression: "SET #status = :status, endedAt = :endedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": "ended",
        ":endedAt": Date.now(),
      },
    })
  );
}