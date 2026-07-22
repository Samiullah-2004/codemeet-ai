import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Points at DynamoDB Local (Docker) for now. Once real AWS access is
// available, remove endpoint/credentials overrides and this connects
// to real AWS DynamoDB with zero other code changes.
const client = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

export const ddb = DynamoDBDocumentClient.from(client);