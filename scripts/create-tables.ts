import { CreateTableCommand, DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

async function createSessionsTable() {
  const { TableNames } = await client.send(new ListTablesCommand({}));

  if (TableNames?.includes("Sessions")) {
    console.log("Sessions table already exists, skipping.");
    return;
  }

  await client.send(
    new CreateTableCommand({
      TableName: "Sessions",
      AttributeDefinitions: [{ AttributeName: "sessionId", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "sessionId", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    })
  );

  console.log("Sessions table created.");
}

createSessionsTable().catch((err) => {
  console.error("Failed to create table:", err);
  process.exit(1);
});