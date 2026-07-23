const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export interface FeedbackResult {
  summary: string;
  strengths: string[];
  improvements: string[];
  score: number; // 1-10
}

export async function getCodeFeedback(
  code: string,
  problemTitle: string,
  problemDescription: string
): Promise<FeedbackResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not set");

  const prompt = `You are a senior software engineer reviewing a candidate's code during a technical interview.

Problem: ${problemTitle}
Description: ${problemDescription}

Candidate's code:
\`\`\`
${code}
\`\`\`

Respond ONLY with a JSON object in this exact format, no markdown, no extra text:
{
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "score": 7
}`;

  const res = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    throw new Error(`DeepSeek API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices[0].message.content as string;

  try {
    return JSON.parse(text) as FeedbackResult;
  } catch {
    throw new Error(`Failed to parse DeepSeek response: ${text}`);
  }
}