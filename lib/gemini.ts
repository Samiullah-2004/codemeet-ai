const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

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

  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${errorBody}`);
  }

  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text as string;

  try {
    return JSON.parse(text) as FeedbackResult;
  } catch {
    throw new Error(`Failed to parse Gemini response: ${text}`);
  }
}