import { listProblems } from "../lib/problems";

async function run() {
  const problems = await listProblems();
  console.log(`Found ${problems.length} problems:`);
  console.log(problems);
}

run().catch(console.error);