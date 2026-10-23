import { Router, Request, Response } from 'express';
import {
  SummaryRequestSchema,
  ChatRequestSchema,
  HelpRequestSchema,
  TeachRequestSchema,
  GreetingRequestSchema
} from '../contracts/schemas';
import { SummaryService } from '../services/summaryService';
import { GreetingService } from '../services/greetingService';
import { HelpService } from '../services/helpService';
import { TeachService } from '../services/teachService';
import { ChatService } from '../services/chatService';

export const aiRouter = Router();

/**
 * 0. AI STATUS & DIAGNOSTIC ENDPOINT
 * Checks whether OpenAI, Anthropic, or Gemini API keys are active, valid, and responding
 */
aiRouter.get('/ai-status', async (_req: Request, res: Response) => {
  const openAiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (openAiKey && !openAiKey.startsWith('mock_')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5
        })
      });

      const data = (await response.json()) as any;

      if (response.ok) {
        res.json({
          provider: 'OpenAI',
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          status: 'LIVE_AND_CONNECTED',
          statusCode: 200,
          message: 'OpenAI API key is valid and returning live completions.',
          liveResponseSample: data.choices?.[0]?.message?.content?.trim() || 'pong',
          degradedFallbackActive: false
        });
        return;
      } else {
        res.json({
          provider: 'OpenAI',
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          status: 'API_ERROR_OR_QUOTA_EXHAUSTED',
          statusCode: response.status,
          errorCode: data.error?.code || data.error?.type || 'unknown_error',
          errorMessage: data.error?.message || response.statusText,
          degradedFallbackActive: true,
          explanation: response.status === 429
            ? 'Your OpenAI API key has exhausted its credit balance / hit quota limits. The application is running smoothly in Graceful Degradation Fallback Mode.'
            : 'OpenAI rejected the request. Running in Graceful Degradation Fallback Mode.'
        });
        return;
      }
    } catch (err: any) {
      res.json({
        provider: 'OpenAI',
        status: 'NETWORK_ERROR',
        errorMessage: err.message,
        degradedFallbackActive: true
      });
      return;
    }
  }

  if (anthropicKey && !anthropicKey.startsWith('mock_')) {
    res.json({
      provider: 'Anthropic Claude',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      status: 'KEY_CONFIGURED',
      degradedFallbackActive: false
    });
    return;
  }

  if (geminiKey && !geminiKey.startsWith('mock_')) {
    res.json({
      provider: 'Google Gemini',
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      status: 'KEY_CONFIGURED',
      degradedFallbackActive: false
    });
    return;
  }

  res.json({
    provider: 'None / Heuristic',
    status: 'NO_EXTERNAL_KEY_CONFIGURED',
    message: 'Operating in deterministic offline reasoning mode.',
    degradedFallbackActive: true
  });
});

/**
 * 1. REPLAY GREETING
 * Regenerates short, context-aware greeting referencing live queue count
 */
aiRouter.post('/greeting', async (req: Request, res: Response) => {
  try {
    const parsedBody = GreetingRequestSchema.safeParse(req.body);
    const operatorName = parsedBody.success ? parsedBody.data.operatorName : 'Operator';

    const forceTimeout = req.headers['x-simulate-timeout'] === 'true';
    const forceError = req.headers['x-simulate-error'] === 'true';

    const greeting = await GreetingService.generateGreeting(operatorName, {
      forceTimeout,
      forceError
    });

    res.json(greeting);
  } catch (error: any) {
    // Failsafe fallback
    res.json({
      greeting: "Welcome to OomniEye Command Centre. Telemetry and approvals systems online.",
      queueContext: "Queue active",
      pendingCount: 4,
      urgentCount: 1,
      timestamp: new Date().toLocaleTimeString(),
      degraded: true,
      fallbackReason: `Failsafe handler: ${error.message}`
    });
  }
});

/**
 * 2. PRESENT ME SUMMARY
 * Structured summary of pending approvals prioritised by urgency
 */
aiRouter.post('/summary', async (req: Request, res: Response) => {
  try {
    const parsedBody = SummaryRequestSchema.safeParse(req.body);
    const { operatorRole = 'Command Operator', language = 'English' } = parsedBody.success ? parsedBody.data : {};

    const forceTimeout = req.headers['x-simulate-timeout'] === 'true';
    const forceError = req.headers['x-simulate-error'] === 'true';

    const summary = await SummaryService.generateSummary(operatorRole, language, {
      forceTimeout,
      forceError
    });

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate summary', details: error.message });
  }
});

/**
 * 3. TALK TO ME (SSE Streaming)
 * Free-form multi-turn conversation about approvals queue
 */
aiRouter.post('/chat', async (req: Request, res: Response) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid chat request schema',
      details: parsed.error.issues
    });
    return;
  }

  const forceTimeout = req.headers['x-simulate-timeout'] === 'true';
  const forceError = req.headers['x-simulate-error'] === 'true';

  await ChatService.streamChatResponse(
    parsed.data.messages,
    parsed.data.activeItemId,
    res,
    { forceTimeout, forceError }
  );
});

/**
 * 4. HELP ME (Grounded RAG Q&A)
 * Answers operational question grounded in SOP policy chunks
 */
aiRouter.post('/help', async (req: Request, res: Response) => {
  const parsed = HelpRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid help request schema',
      details: parsed.error.issues
    });
    return;
  }

  const forceTimeout = req.headers['x-simulate-timeout'] === 'true';
  const forceError = req.headers['x-simulate-error'] === 'true';

  const result = await HelpService.answerQuestion(parsed.data.query, {
    forceTimeout,
    forceError
  });

  res.json(result);
});

/**
 * 5. TEACH ME
 * Step-by-step interactive operator walkthrough with follow-up support
 */
aiRouter.post('/teach', async (req: Request, res: Response) => {
  const parsed = TeachRequestSchema.safeParse(req.body);
  const { stepNumber = 1, userFollowUp, targetItemId } = parsed.success ? parsed.data : {};

  const forceTimeout = req.headers['x-simulate-timeout'] === 'true';
  const forceError = req.headers['x-simulate-error'] === 'true';

  const guidance = await TeachService.getStepGuidance(
    stepNumber,
    userFollowUp,
    targetItemId,
    { forceTimeout, forceError }
  );

  res.json(guidance);
});
