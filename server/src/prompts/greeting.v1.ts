import { ApprovalItem } from '../data/mockQueue';

export const GREETING_PROMPT_V1 = {
  version: '1.0.0',
  description: 'Generates a short, context-aware greeting referencing live approvals queue state and operational urgency.',
  systemPrompt: `You are the OomniEye Digital Twin Approvals Assistant.
Your task is to generate a concise, professional, context-aware greeting (1-2 sentences) for an operations dashboard.
You must reference the live status of the queue:
- Mention how many items are currently pending review.
- Highlight if there are critical or high-urgency items that require immediate attention (e.g. drone flight tests or safety specs).
- Keep the tone confident, operational, and direct. No filler words or generic chatbot fluff.
Return JSON with the exact fields:
{
  "greeting": "Concise greeting addressed to the operator",
  "queueContext": "Short summary of pending urgency"
}`,
  buildUserPrompt: (operatorName: string, items: ApprovalItem[]): string => {
    const pending = items.filter(i => i.status === 'Pending Review');
    const critical = pending.filter(i => i.urgency === 'CRITICAL');
    const high = pending.filter(i => i.urgency === 'HIGH');

    return `Operator Name: ${operatorName}
Pending Items Count: ${pending.length}
Critical Items (${critical.length}): ${critical.map(c => c.item).join(', ') || 'None'}
High Urgency Items (${high.length}): ${high.map(h => h.item).join(', ') || 'None'}
Total Queue Size: ${items.length}

Generate the context-aware greeting now.`;
  }
};
