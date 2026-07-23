import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./dynamodb";

export interface Problem {
  problemId: string;
  title: string;
  description: string;
  starterCode: string;
}

export async function createProblem(problem: Problem): Promise<void> {
  await ddb.send(
    new PutCommand({
      TableName: "Problems",
      Item: problem,
    })
  );
}

export async function getProblem(problemId: string): Promise<Problem | undefined> {
  const result = await ddb.send(
    new GetCommand({
      TableName: "Problems",
      Key: { problemId },
    })
  );
  return result.Item as Problem | undefined;
}

export async function listProblems(): Promise<Problem[]> {
  const result = await ddb.send(new ScanCommand({ TableName: "Problems" }));
  return (result.Items ?? []) as Problem[];
}