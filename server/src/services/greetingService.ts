import { getApprovalQueue } from '../data/mockQueue';
import { GREETING_PROMPT_V1 } from '../prompts/greeting.v1';
import { LLMService, LLMRequestOptions } from './llmService';
import { GreetingResponse, GreetingResponseSchema } from '../contracts/schemas';

export class GreetingService {
  public static async generateGreeting(
    operatorName: string = 'Operator',
    options: LLMRequestOptions = {}
  ): Promise<GreetingResponse> {
    const queue = getApprovalQueue();
    const pending = queue.filter(q => q.status === 'Pending Review');
    const urgent = pending.filter(q => q.urgency === 'CRITICAL' || q.urgency === 'HIGH');

    const userPrompt = GREETING_PROMPT_V1.buildUserPrompt(operatorName, queue);

    const llmResult = await LLMService.complete(
      GREETING_PROMPT_V1.systemPrompt,
      userPrompt,
      options
    );

    if (!llmResult.isDegraded && llmResult.rawText) {
      try {
        const parsedJson = JSON.parse(llmResult.rawText.trim().replace(/^```json\s*|\s*```$/g, ''));
        const validated = GreetingResponseSchema.parse({
          greeting: parsedJson.greeting,
          queueContext: parsedJson.queueContext || `${pending.length} items awaiting review`,
          pendingCount: pending.length,
          urgentCount: urgent.length,
          timestamp: new Date().toLocaleTimeString(),
          degraded: false
        });
        return validated;
      } catch (parseErr) {
        // Fall through to graceful degradation
      }
    }

    // Heuristic Fallback
    const fallbackText = LLMService.generateFallbackGreeting(operatorName, queue);
    return {
      greeting: fallbackText,
      queueContext: `${pending.length} items pending (${urgent.length} urgent)`,
      pendingCount: pending.length,
      urgentCount: urgent.length,
      timestamp: new Date().toLocaleTimeString(),
      degraded: true,
      fallbackReason: llmResult.fallbackReason || 'Parsed fallback activated'
    };
  }
}
