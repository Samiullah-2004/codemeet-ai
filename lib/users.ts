import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./dynamodb";

export interface User {
  userId: string;
  email: string;
  name: string;
  role: "recruiter" | "candidate";
}

export async function createUser(user: User): Promise<void> {
  await ddb.send(
    new PutCommand({
      TableName: "Users",
      Item: user,
    })
  );
}

export async function getUser(userId: string): Promise<User | undefined> {
  const result = await ddb.send(
    new GetCommand({
      TableName: "Users",
      Key: { userId },
    })
  );
  return result.Item as User | undefined;
}