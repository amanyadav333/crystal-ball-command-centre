import { Response } from 'express';
import { getApprovalQueue, getApprovalItemById } from '../data/mockQueue';
import { CHAT_PROMPT_V1 } from '../prompts/chat.v1';
import { ChatMessage } from '../contracts/schemas';

export class ChatService {
  /**
   * Stream response token-by-token via Server-Sent Events (SSE)
   */
  public static async streamChatResponse(
    messages: ChatMessage[],
    activeItemId: string | undefined,
    res: Response,
    options: { forceTimeout?: boolean; forceError?: boolean } = {}
  ): Promise<void> {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    if (options.forceError) {
      sendEvent('error', { message: 'Simulated LLM streaming connection failure' });
      res.end();
      return;
    }

    if (options.forceTimeout) {
      await new Promise(r => setTimeout(r, 1000));
      sendEvent('token', { token: '[Degraded Mode: Response generated via local reasoning due to simulated timeout] ' });
    }

    const queue = getApprovalQueue();
    const activeItem = activeItemId ? getApprovalItemById(activeItemId) : undefined;
    const systemPrompt = CHAT_PROMPT_V1.systemPrompt(queue, activeItem);

    const openAiKey = process.env.OPENAI_API_KEY;

    // Check if live OpenAI streaming is possible
    if (openAiKey && !openAiKey.startsWith('mock_') && !options.forceTimeout) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const openAiMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: openAiMessages,
            stream: true,
            temperature: 0.3
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let done = false;

          while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;
            if (value) {
              const textChunk = decoder.decode(value, { stream: true });
              const lines = textChunk.split('\n').filter(l => l.trim().startsWith('data: '));
              for (const line of lines) {
                const jsonStr = line.replace(/^data:\s*/, '').trim();
                if (jsonStr === '[DONE]') {
                  done = true;
                  break;
                }
                try {
                  const parsed = JSON.parse(jsonStr);
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (delta) {
                    sendEvent('token', { token: delta });
                  }
                } catch {
                  // ignore partial chunk json parse errors
                }
              }
            }
          }

          sendEvent('done', { completed: true });
          res.end();
          return;
        }
      } catch (err: any) {
        sendEvent('token', { token: '\n[Note: Switched to fallback reasoning stream due to provider latency/timeout]\n' });
      }
    }

    // High-Fidelity Heuristic Stream Generator
    const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
    const pending = queue.filter(q => q.status === 'Pending Review');
    const criticalItem = pending.find(q => q.urgency === 'CRITICAL');

    let streamResponse = '';

    if (lastUserMsg.includes('attention') || lastUserMsg.includes('first') || lastUserMsg.includes('priority')) {
      streamResponse = `Based on current digital twin operational risk, **${criticalItem?.item || 'Level 2 Drone Patrol Video Demo'}** requires your attention first.

**Why this needs immediate action:**
1. **Urgency Classification:** It is the only **CRITICAL** item in the pending queue.
2. **Safety Impact:** Submitted by ${criticalItem?.submittedBy || 'Alex HelpAdmin'}, flight logs indicate an altitude anomaly near the sub-station radar tower at timestamp 03:42.
3. **SLA Compliance:** Under SOP-101, Critical tier drone routes mandate review within 24 hours. Bypassing this blocks perimeter surveillance operations.

**Recommended Next Step:** Open the video telemetry overlay, check that altitude remains strictly under 120m AGL, and cross-reference collision-avoidance LiDAR logs before approving.`;
    } else if (lastUserMsg.includes('drone') || lastUserMsg.includes('alex')) {
      streamResponse = `Regarding the **Level 2 Drone Patrol Video Demo** (Alex HelpAdmin):
- **Status:** Pending Review (Critical)
- **Primary Gate:** Inspect the flight waypoints near the sub-station radar tower.
- **Governing SOP:** [SOP-102] Drone Patrol Verification mandates altitude below 120m AGL and uninterrupted LiDAR telemetry synchronization.
- **Action:** If the radar tower breach is confirmed, reject with reference to SOP-102 and request telemetry realignment.`;
    } else if (lastUserMsg.includes('sensor') || lastUserMsg.includes('sam')) {
      streamResponse = `The **Safety Equipment & Sensor Specs** (Sam HelpAdmin) is a **MEDIUM** urgency submission:
- Document contains calibration records for thermal infrared and methane sniffers across chemical storage.
- Key check: Drift tolerance is currently at 1.2%, which satisfies the < 1.5% limit under SOP-103.
- You can safely approve once you verify the ISO 14001 calibration stamp is present.`;
    } else if (lastUserMsg.includes('spatial') || lastUserMsg.includes('elena') || lastUserMsg.includes('camera')) {
      streamResponse = `The **360° Spatial Zone Layout & Camera Map** (Elena HelpAdmin) is **HIGH** urgency:
- Elena flagged a potential 15° blind spot behind the North Warehouse container stack.
- Per SOP-104, Zone 4 spatial digital-twin commits require dual-operator signoff.
- Recommend requesting a secondary PTZ dome camera overlay before giving final clearance.`;
    } else if (activeItem) {
      streamResponse = `You are currently inspecting **${activeItem.item}** (${activeItem.type}):
- **Submitter:** ${activeItem.submittedBy}
- **Current Status:** ${activeItem.status}
- **Urgency Level:** ${activeItem.urgency}
- **Details:** ${activeItem.details}
- **Required Action:** ${activeItem.suggestedAction}

Would you like me to guide you through the review steps or check relevant SOP compliance?`;
    } else {
      streamResponse = `I am tracking **${pending.length} pending approval items** in the digital-twin queue:
- **Critical (1):** Level 2 Drone Patrol Video Demo (Alex HelpAdmin)
- **High (2):** Site Patrol Onboarding (Sam HelpAdmin) & 360° Spatial Zone Map (Elena HelpAdmin)
- **Medium (1):** Safety Equipment & Sensor Specs (Sam HelpAdmin)

You can ask me to evaluate risk, verify SOP requirements for any item, or guide you through a step-by-step signoff.`;
    }

    // Stream token-by-token with realistic human-readable cadence
    const words = streamResponse.split(/(\s+)/);
    for (const chunk of words) {
      sendEvent('token', { token: chunk });
      await new Promise(r => setTimeout(r, 18));
    }

    sendEvent('done', { completed: true });
    res.end();
  }
}
