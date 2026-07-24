import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamodb";

async function run() {
  const result = await ddb.send(new ScanCommand({ TableName: "Users" }));
  console.log(`Found ${result.Items?.length ?? 0} users:`);
  console.log(result.Items);
}

run().catch(console.error);