import { createProblem } from "../lib/problems";

async function seed() {
  await createProblem({
    problemId: "two-sum",
    title: "Two Sum",
    description: "Given an array of integers and a target, return the indices of the two numbers that add up to the target.",
    starterCode: "function twoSum(nums, target) {\n  // your code here\n}\n",
  });

  await createProblem({
    problemId: "reverse-string",
    title: "Reverse a String",
    description: "Write a function that reverses a string without using the built-in reverse method.",
    starterCode: "function reverseString(str) {\n  // your code here\n}\n",
  });

  console.log("Seeded 2 problems.");
}

seed().catch(console.error);