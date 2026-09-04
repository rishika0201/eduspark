/** Groq OpenAI-compatible chat API (https://console.groq.com/) */

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqChatParams {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

export async function groqChatCompletion(params: GroqChatParams): Promise<string> {
  const res = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: 'system', content: params.system },
        { role: 'user', content: params.user },
      ],
      temperature: params.temperature ?? 0.55,
      max_tokens: params.maxTokens ?? 8192,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Groq HTTP ${res.status}: ${raw.slice(0, 500)}`);
  }

  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    throw new Error(`Groq returned non-JSON: ${raw.slice(0, 240)}`);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('Groq returned empty content');
  }
  return text;
}
