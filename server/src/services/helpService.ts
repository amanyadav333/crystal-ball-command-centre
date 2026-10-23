import { RAGService } from './ragService';
import { HELP_PROMPT_V1 } from '../prompts/help.v1';
import { LLMService, LLMRequestOptions } from './llmService';
import { HelpResponse, HelpResponseSchema } from '../contracts/schemas';

export class HelpService {
  public static async answerQuestion(
    query: string,
    options: LLMRequestOptions = {}
  ): Promise<HelpResponse> {
    // 1. Retrieve grounded policy chunks
    const retrieval = RAGService.retrieve(query, 3);

    // If query completely unrelated or ungrounded
    if (!retrieval.isGrounded) {
      return HelpResponseSchema.parse({
        answer: "This operational question cannot be verified from the current OomniEye SOP documentation. Please consult the Shift Commander.",
        citations: [],
        confidence: 'LOW',
        groundedInDocument: false,
        degraded: false
      });
    }

    // 2. Build prompt with only retrieved chunks
    const userPrompt = HELP_PROMPT_V1.buildUserPrompt(query, retrieval.chunks);

    const llmResult = await LLMService.complete(
      HELP_PROMPT_V1.systemPrompt,
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

        const validated = HelpResponseSchema.parse({
          answer: parsed.answer,
          citations: retrieval.citations,
          confidence: parsed.confidence || 'HIGH',
          groundedInDocument: parsed.groundedInDocument ?? true,
          degraded: false
        });

        return validated;
      } catch (parseErr) {
        // Fall through to deterministic fallback
      }
    }

    // Fallback: Use deterministic policy synthesis
    const fallback = LLMService.generateFallbackHelp(query, retrieval.chunks);
    return HelpResponseSchema.parse(fallback);
  }
}
