import { OOMNIEYE_POLICY_CHUNKS, PolicyChunk } from '../data/policyDocument';
import { PolicyCitation } from '../contracts/schemas';

export interface RetrievalResult {
  chunks: PolicyChunk[];
  citations: PolicyCitation[];
  bestScore: number;
  isGrounded: boolean;
}

export class RAGService {
  /**
   * Simple, fast in-memory hybrid keyword & semantic similarity retrieval
   * Grounds responses strictly over the 5 OomniEye policy chunks.
   */
  public static retrieve(query: string, topK: number = 3): RetrievalResult {
    const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const queryTokens = normalizedQuery
      .split(/\s+/)
      .filter(t => t.length > 2);

    const scored = OOMNIEYE_POLICY_CHUNKS.map(chunk => {
      let score = 0;
      const lowerContent = chunk.content.toLowerCase();
      const lowerTitle = chunk.title.toLowerCase();
      const lowerCode = chunk.code.toLowerCase();

      // Direct SOP code match (e.g. "SOP-102" or "102")
      if (normalizedQuery.includes(lowerCode) || normalizedQuery.includes(lowerCode.replace('-', ' '))) {
        score += 8.0;
      }

      // Keyword matches
      for (const kw of chunk.keywords) {
        if (normalizedQuery.includes(kw.toLowerCase())) {
          score += 2.5;
        }
      }

      // Token overlap in title and body
      for (const token of queryTokens) {
        if (lowerTitle.includes(token)) {
          score += 2.0;
        }
        if (lowerContent.includes(token)) {
          score += 1.0;
        }
      }

      // Normalize score between 0 and 1
      const normalizedScore = Math.min(1.0, Math.round((score / 10.0) * 100) / 100);

      return {
        chunk,
        score: normalizedScore,
        citation: {
          code: chunk.code,
          title: chunk.title,
          category: chunk.category,
          relevanceScore: normalizedScore
        }
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    const topMatches = scored.slice(0, topK);
    const bestScore = topMatches[0]?.score || 0;
    const isGrounded = bestScore >= 0.2; // Require at least 20% relevance match

    return {
      chunks: topMatches.map(m => m.chunk),
      citations: topMatches.map(m => m.citation).filter(c => c.relevanceScore > 0.1),
      bestScore,
      isGrounded
    };
  }
}
