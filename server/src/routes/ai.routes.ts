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
