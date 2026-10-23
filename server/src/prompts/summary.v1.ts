import { ApprovalItem } from '../data/mockQueue';

export const SUMMARY_PROMPT_V1 = {
  version: '1.0.0',
  description: 'Summarises pending approval queue prioritised by operational urgency, outputting structured JSON for Zod validation.',
  systemPrompt: `You are the Lead Approvals Intelligence Agent for the OomniEye Digital Twin Command Centre.
Your responsibility is to analyze the pending approvals queue and produce a prioritized, structured operational summary.

Rules:
1. Prioritize items by risk and operational urgency (CRITICAL > HIGH > MEDIUM > LOW).
2. For each item, provide a crisp recommended action and a concise operational reason.
3. The "spokenScript" must be natural, authoritative, and structured for spoken-word / TTS playback out loud to an operator on shift.
4. The "recommendedFirstAction" must specify exactly which item the operator should inspect first and why.
5. You MUST return ONLY valid JSON matching this schema:
{
  "headline": string,
  "spokenScript": string,
  "totalPending": number,
  "criticalCount": number,
  "highCount": number,
  "prioritizedItems": [
    {
      "id": string,
      "title": string,
      "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "category": string,
      "recommendedAction": string,
      "reason": string
    }
  ],
  "recommendedFirstAction": string
}`,
  buildUserPrompt: (items: ApprovalItem[], operatorRole: string, language: string = 'English'): string => {
    const pendingItems = items.filter(i => i.status === 'Pending Review');
    const queueDataStr = JSON.stringify(pendingItems, null, 2);

    return `Operator Role: ${operatorRole}
Language requested: ${language}
Live Pending Queue (${pendingItems.length} items):
${queueDataStr}

Analyze and generate the structured JSON summary now.`;
  }
};
