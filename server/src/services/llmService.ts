import { ApprovalItem } from '../data/mockQueue';
import { PolicyChunk } from '../data/policyDocument';

export interface LLMRequestOptions {
  timeoutMs?: number;
  temperature?: number;
  forceTimeout?: boolean;
  forceError?: boolean;
}

export interface LLMResponse {
  rawText: string;
  isDegraded: boolean;
  fallbackReason?: string;
}

const DEFAULT_TIMEOUT_MS = 8000; // 8 seconds per assignment specification

export class LLMService {
  /**
   * Universal completion handler with 8-second strict timeout and degradation path
   */
  public static async complete(
    systemPrompt: string,
    userPrompt: string,
    options: LLMRequestOptions = {}
  ): Promise<LLMResponse> {
    const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

    // Test simulation hook for evaluation (§6: "Killing your API key or forcing a timeout")
    if (options.forceTimeout) {
      await new Promise(resolve => setTimeout(resolve, Math.min(timeoutMs + 100, 2000)));
      return {
        rawText: '',
        isDegraded: true,
        fallbackReason: 'Simulated LLM call timeout (>8s threshold reached)'
      };
    }

    if (options.forceError) {
      return {
        rawText: '',
        isDegraded: true,
        fallbackReason: 'Simulated LLM provider service failure (503)'
      };
    }

    // Check for OpenAI API Key
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey && !openAiKey.startsWith('mock_')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: options.temperature ?? 0.3
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as any;
        const text = data.choices?.[0]?.message?.content || '';
        return {
          rawText: text,
          isDegraded: false
        };
      } catch (err: any) {
        const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
        return {
          rawText: '',
          isDegraded: true,
          fallbackReason: isTimeout ? 'OpenAI call timed out (>8s)' : `LLM call failed: ${err.message}`
        };
      }
    }

    // Check for Anthropic API Key
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && !anthropicKey.startsWith('mock_')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            max_tokens: 1024,
            temperature: options.temperature ?? 0.3
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as any;
        const text = data.content?.[0]?.text || '';
        return {
          rawText: text,
          isDegraded: false
        };
      } catch (err: any) {
        const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
        return {
          rawText: '',
          isDegraded: true,
          fallbackReason: isTimeout ? 'Anthropic call timed out (>8s)' : `Anthropic API error: ${err.message}`
        };
      }
    }

    // Check for Google Gemini API Key
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey && !geminiKey.startsWith('mock_')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
              }
            ],
            generationConfig: {
              temperature: options.temperature ?? 0.3
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return {
          rawText: text,
          isDegraded: false
        };
      } catch (err: any) {
        const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
        return {
          rawText: '',
          isDegraded: true,
          fallbackReason: isTimeout ? 'Gemini call timed out (>8s)' : `Gemini API error: ${err.message}`
        };
      }
    }

    // Graceful degradation when no external API key is configured
    return {
      rawText: '',
      isDegraded: true,
      fallbackReason: 'Operating in heuristic fallback mode (no external LLM API key configured or fallback active)'
    };
  }

  /**
   * Deterministic Heuristic Fallback Generator for Greeting
   */
  public static generateFallbackGreeting(operatorName: string, items: ApprovalItem[]): string {
    const pending = items.filter(i => i.status === 'Pending Review');
    const critical = pending.filter(i => i.urgency === 'CRITICAL');
    const high = pending.filter(i => i.urgency === 'HIGH');

    if (critical.length > 0) {
      return `Good day, ${operatorName}. Command queue has ${pending.length} pending items with ${critical.length} critical priority action: ${critical[0].item} requires your immediate review.`;
    } else if (high.length > 0) {
      return `Welcome back, ${operatorName}. You have ${pending.length} items awaiting signoff, led by high-priority asset: ${high[0].item}.`;
    } else if (pending.length > 0) {
      return `Systems operational, ${operatorName}. ${pending.length} pending approval requests in queue across site checkpoints.`;
    } else {
      return `All clear, ${operatorName}. Approvals queue is fully processed and zero items require attention.`;
    }
  }

  /**
   * Deterministic Heuristic Fallback Generator for Structured Summary
   */
  public static generateFallbackSummary(items: ApprovalItem[], operatorRole: string) {
    const pending = items.filter(i => i.status === 'Pending Review');
    const critical = pending.filter(i => i.urgency === 'CRITICAL');
    const high = pending.filter(i => i.urgency === 'HIGH');

    // Priority sort: CRITICAL -> HIGH -> MEDIUM -> LOW
    const urgencyWeight: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    const sorted = [...pending].sort((a, b) => (urgencyWeight[b.urgency] || 0) - (urgencyWeight[a.urgency] || 0));

    const topItem = sorted[0];

    const prioritizedItems = sorted.map(item => ({
      id: item.id,
      title: item.item,
      urgency: item.urgency,
      category: item.type,
      recommendedAction: item.suggestedAction,
      reason: item.summary
    }));

    const headline = `${pending.length} Approvals Pending: ${critical.length} Critical & ${high.length} High-Risk Gates Active`;
    const spokenScript = topItem
      ? `Attention ${operatorRole}. You have ${pending.length} items pending approval. Primary priority is ${topItem.item}, classified as ${topItem.urgency}. ${topItem.suggestedAction}. Following that, please inspect the remaining ${pending.length - 1} submissions.`
      : `All items have been approved or processed. Queue clear for current shift.`;

    const recommendedFirstAction = topItem
      ? `Review and verify "${topItem.item}" (${topItem.urgency}) submitted by ${topItem.submittedBy} - ${topItem.suggestedAction}`
      : `No pending items in queue.`;

    return {
      headline,
      spokenScript,
      totalPending: pending.length,
      criticalCount: critical.length,
      highCount: high.length,
      prioritizedItems,
      recommendedFirstAction,
      generatedAt: new Date().toISOString(),
      degraded: true,
      fallbackReason: 'Generated via deterministic rules engine due to LLM timeout/unavailability'
    };
  }

  /**
   * Fallback Grounded Answer for RAG Policy
   */
  public static generateFallbackHelp(_query: string, retrievedChunks: PolicyChunk[]) {
    if (retrievedChunks.length === 0) {
      return {
        answer: "This operational question cannot be verified from current OomniEye SOP documentation. Please consult the Shift Commander.",
        citations: [],
        confidence: "LOW" as const,
        groundedInDocument: false,
        degraded: true,
        fallbackReason: 'No relevant policy chunks matched query threshold'
      };
    }

    const primaryChunk = retrievedChunks[0];
    const citations = retrievedChunks.map(c => ({
      code: c.code,
      title: c.title,
      category: c.category,
      relevanceScore: 0.85
    }));

    return {
      answer: `According to [${primaryChunk.code}: ${primaryChunk.title}], ${primaryChunk.content}`,
      citations,
      confidence: "HIGH" as const,
      groundedInDocument: true,
      degraded: true,
      fallbackReason: 'Direct deterministic policy chunk match (grounded RAG fallback)'
    };
  }
}
