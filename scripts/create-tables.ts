import { CreateTableCommand, DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

async function createTableIfMissing(
  tableName: string,
  keyAttributeName: string,
  existingTables: string[] | undefined
) {
  if (existingTables?.includes(tableName)) {
    console.log(`${tableName} table already exists, skipping.`);
    return;
  }

  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [{ AttributeName: keyAttributeName, AttributeType: "S" }],
      KeySchema: [{ AttributeName: keyAttributeName, KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    })
  );

  console.log(`${tableName} table created.`);
}

async function createAllTables() {
  const { TableNames } = await client.send(new ListTablesCommand({}));

  await createTableIfMissing("Sessions", "sessionId", TableNames);
  await createTableIfMissing("Users", "userId", TableNames);
  await createTableIfMissing("Problems", "problemId", TableNames);
}

createAllTables().catch((err) => {
  console.error("Failed to create tables:", err);
  process.exit(1);
});