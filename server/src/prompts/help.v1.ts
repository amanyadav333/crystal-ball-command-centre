import { PolicyChunk } from '../data/policyDocument';

export const HELP_PROMPT_V1 = {
  version: '1.0.0',
  description: 'Grounded RAG prompt for answering operational policy questions strictly using retrieved SOP chunks.',
  systemPrompt: `You are the OomniEye Compliance & Policy Verification Engine.
Your responsibility is to answer the operator's operational question GROUNDED STRICTLY in the retrieved policy chunks provided below.

CRITICAL INSTRUCTIONS:
1. Answer ONLY using the facts stated in the provided SOP excerpts.
2. DO NOT extrapolate, assume, or rely on outside knowledge.
3. Explicitly cite the SOP code (e.g. [SOP-102], [SOP-103]) for every substantive claim.
4. If the question cannot be answered from the provided policy excerpts, state clearly:
   "This query cannot be verified from the current OomniEye SOP documentation. Please consult the Shift Commander."
5. Format response as JSON matching:
{
  "answer": "Clear, grounded answer with citations in text [SOP-XXX]",
  "groundedInDocument": boolean,
  "confidence": "HIGH" | "MEDIUM" | "LOW"
}`,
  buildUserPrompt: (query: string, retrievedChunks: PolicyChunk[]): string => {
    const chunkContext = retrievedChunks.map(c =>
      `[${c.code}: ${c.title} (${c.category})]
${c.content}`
    ).join('\n\n');

    return `Retrieved SOP Knowledge Base Chunks:
------------------------------------------
${chunkContext}
------------------------------------------

Operator Question: "${query}"

Generate the grounded answer and citation metadata now.`;
  }
};
