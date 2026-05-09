const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 600;
const SYSTEM = 'You are Anchor, a calm support app for neurodivergent users. Be literal, direct, and clear. No motivational language. No unnecessary filler.';

export async function callClaude(userPrompt, systemOverride = null) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemOverride || SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || 'Could not process. Please try again.';
}

export const TLDR_PROMPTS = {
  full: (msg) => `Analyze this message and respond in this EXACT format with no preamble:

MAIN POINT
[one sentence]

KEY DETAILS
[2-4 bullet points, each starting with ·]

WHAT YOU NEED TO DO
[numbered action items, or "Nothing required" if none]

DATES AND DEADLINES
[list any, or "None mentioned"]

TONE
[one phrase describing the tone]

Message: ${msg}`,

  tone: (msg) => `Analyze the tone of this message. Format:

LIKELY TONE
[one phrase]

WHAT IS CLEAR
[1-2 bullet points]

WHAT IS NOT CLEAR
[1-2 points]

DO NOT ASSUME
[what might be being over-read]

SAFEST REPLY
[one sentence reply if needed]

Message: ${msg}`,

  actions: (msg) => `Extract only the action items from this message. Format as a numbered list starting with "YOU NEED TO:". If none, say "No action required." Be literal, no interpretation. Message: ${msg}`,

  reply: (msg) => `Write a short, calm, professional reply to this message. One paragraph max. No excessive politeness. Literal and clear. Start with the reply directly, no preamble. Message: ${msg}`,
};

export const BREAKDOWN_SYSTEM = `You are Anchor, a calm support app for neurodivergent users. Break down the user's task into simple, numbered steps using the structure: Prepare → Start → Continue → Finish → Recover. Each step should be one short sentence. Use gentle, literal language. No motivational phrases. Format as a plain numbered list with section headers in ALL CAPS. Max 10 steps total. No preamble.`;
