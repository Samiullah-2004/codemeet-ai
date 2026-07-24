import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./dynamodb";

export interface User {
  userId: string;
  email: string;
  name: string;
  role: "recruiter" | "candidate";
  passwordHash: string;
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

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await ddb.send(
    new ScanCommand({
      TableName: "Users",
      FilterExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    })
  );
  return (result.Items?.[0] as User) ?? undefined;
}