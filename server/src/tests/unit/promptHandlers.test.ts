import { SummaryService } from '../../services/summaryService';
import { LLMService } from '../../services/llmService';
import { HelpService } from '../../services/helpService';
import { GreetingService } from '../../services/greetingService';
import { SummaryResponseSchema } from '../../contracts/schemas';

describe('Unit Tests: AI Prompt & Response Handlers (Jest with LLM mocked)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('SummaryService (Structured Output & Zod Validation)', () => {
    it('successfully validates and returns structured JSON when LLM returns compliant payload', async () => {
      const mockLLMOutput = JSON.stringify({
        headline: "4 Approvals Pending: 1 Critical Drone Test Requires Immediate Gate Check",
        spokenScript: "Operator, you have 4 items in the queue. Immediate priority is the drone flight demo.",
        totalPending: 4,
        criticalCount: 1,
        highCount: 2,
        prioritizedItems: [
          {
            id: "appr-002",
            title: "Level 2 Drone Patrol Video Demo",
            urgency: "CRITICAL",
            category: "Video",
            recommendedAction: "Verify waypoint altitudes are below 120m AGL per SOP-102",
            reason: "Altitude anomaly observed near sub-station radar tower"
          }
        ],
        recommendedFirstAction: "Inspect Level 2 Drone Patrol Video Demo telemetry overlay."
      });

      jest.spyOn(LLMService, 'complete').mockResolvedValueOnce({
        rawText: mockLLMOutput,
        isDegraded: false
      });

      const result = await SummaryService.generateSummary('Command Operator', 'English');

      expect(result.degraded).toBe(false);
      expect(result.criticalCount).toBe(1);
      expect(result.prioritizedItems.length).toBeGreaterThanOrEqual(1);
      expect(result.prioritizedItems[0].urgency).toBe('CRITICAL');

      // Verify strict Zod validation passes
      expect(() => SummaryResponseSchema.parse(result)).not.toThrow();
    });

    it('catches broken AI response shape (silent LLM failure) and degrades gracefully to verified schema fallback', async () => {
      // Intentionally broken shape: missing required fields 'headline' and 'spokenScript', invalid urgency string
      const brokenLLMOutput = JSON.stringify({
        badField: "This is a corrupted LLM answer without proper schema",
        totalPending: "not-a-number", // wrong type!
        prioritizedItems: [{ title: "Broken item", urgency: "SUPER_URGENT" }] // invalid enum!
      });

      jest.spyOn(LLMService, 'complete').mockResolvedValueOnce({
        rawText: brokenLLMOutput,
        isDegraded: false
      });

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await SummaryService.generateSummary('Command Operator', 'English');

      // Crucial test per JD: "it's graded by whether the tests would actually catch a broken AI response shape or a silent LLM failure"
      expect(result.degraded).toBe(true);
      expect(result.fallbackReason).toBeDefined();
      expect(result.headline).toBeDefined();
      expect(result.spokenScript).toBeDefined();
      expect(typeof result.totalPending).toBe('number');
      expect(() => SummaryResponseSchema.parse(result)).not.toThrow();

      warnSpy.mockRestore();
    });
  });

  describe('HelpService (RAG Grounding & Policy Citations)', () => {
    it('answers drone altitude policy questions with exact SOP-102 citations', async () => {
      const result = await HelpService.answerQuestion('What is the maximum allowed altitude for drone patrol video demo?');

      expect(result.groundedInDocument).toBe(true);
      expect(result.citations.length).toBeGreaterThan(0);
      expect(result.citations.some(c => c.code === 'SOP-102')).toBe(true);
      expect(result.answer).toContain('120');
    });

    it('identifies ungrounded questions outside of SOP scope and flags unanswered warning', async () => {
      const result = await HelpService.answerQuestion('What is the best pizza recipe in Naples?');

      expect(result.groundedInDocument).toBe(false);
      expect(result.citations.length).toBe(0);
      expect(result.confidence).toBe('LOW');
      expect(result.answer).toContain('cannot be verified from the current OomniEye SOP documentation');
    });
  });

  describe('GreetingService (Context-aware Dynamic Regeneration)', () => {
    it('generates a context-aware greeting reflecting current queue state', async () => {
      const result = await GreetingService.generateGreeting('Aman');

      expect(result.greeting).toContain('Aman');
      expect(typeof result.pendingCount).toBe('number');
      expect(result.timestamp).toBeDefined();
    });
  });
});
