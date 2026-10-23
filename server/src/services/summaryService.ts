import { getApprovalQueue } from '../data/mockQueue';
import { SUMMARY_PROMPT_V1 } from '../prompts/summary.v1';
import { LLMService, LLMRequestOptions } from './llmService';
import { SummaryResponse, SummaryResponseSchema } from '../contracts/schemas';

export class SummaryService {
  public static async generateSummary(
    operatorRole: string = 'Command Operator',
    language: string = 'English',
    options: LLMRequestOptions = {}
  ): Promise<SummaryResponse> {
    const queue = getApprovalQueue();
    const userPrompt = SUMMARY_PROMPT_V1.buildUserPrompt(queue, operatorRole, language);

    const llmResult = await LLMService.complete(
      SUMMARY_PROMPT_V1.systemPrompt,
      userPrompt,
      options
    );

    if (!llmResult.isDegraded && llmResult.rawText) {
      try {
        const cleanJsonStr = llmResult.rawText
          .trim()
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '');

        const parsed = JSON.parse(cleanJsonStr);

        // Strict Zod Validation!
        const validated = SummaryResponseSchema.parse({
          ...parsed,
          generatedAt: new Date().toISOString(),
          degraded: false
        });

        return validated;
      } catch (validationErr: any) {
        console.warn('Zod validation of raw LLM output failed, degrading to verified fallback schema:', validationErr.message);
      }
    }

    // Graceful Degradation: Schema-compliant fallback generated deterministically
    const fallback = LLMService.generateFallbackSummary(queue, operatorRole);
    return SummaryResponseSchema.parse(fallback);
  }
}
