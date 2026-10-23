import { z } from 'zod';

// ==========================================
// 1. SUMMARY SCHEMAS (Structured Output)
// ==========================================
export const SummaryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  urgency: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  category: z.string(),
  recommendedAction: z.string(),
  reason: z.string()
});

export const SummaryResponseSchema = z.object({
  headline: z.string(),
  spokenScript: z.string(),
  totalPending: z.number(),
  criticalCount: z.number(),
  highCount: z.number(),
  prioritizedItems: z.array(SummaryItemSchema),
  recommendedFirstAction: z.string(),
  generatedAt: z.string(),
  degraded: z.boolean().default(false),
  fallbackReason: z.string().optional()
});

export const SummaryRequestSchema = z.object({
  language: z.string().default('English'),
  operatorRole: z.string().default('Command Operator'),
  filterStatus: z.string().optional()
});

export type SummaryRequest = z.infer<typeof SummaryRequestSchema>;
export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;
export type SummaryItem = z.infer<typeof SummaryItemSchema>;

// ==========================================
// 2. TALK TO ME (CHAT) SCHEMAS
// ==========================================
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string()
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1, 'At least one message is required'),
  activeItemId: z.string().optional()
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ==========================================
// 3. HELP ME (RAG Grounded Q&A) SCHEMAS
// ==========================================
export const PolicyCitationSchema = z.object({
  code: z.string(),
  title: z.string(),
  category: z.string(),
  relevanceScore: z.number()
});

export const HelpRequestSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters'),
  activeItemId: z.string().optional()
});

export const HelpResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(PolicyCitationSchema),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  groundedInDocument: z.boolean(),
  degraded: z.boolean().default(false),
  fallbackReason: z.string().optional()
});

export type HelpRequest = z.infer<typeof HelpRequestSchema>;
export type HelpResponse = z.infer<typeof HelpResponseSchema>;
export type PolicyCitation = z.infer<typeof PolicyCitationSchema>;

// ==========================================
// 4. TEACH ME (Step-by-Step Operator Guidance) SCHEMAS
// ==========================================
export const TeachStepSchema = z.object({
  stepNumber: z.number(),
  totalSteps: z.number(),
  stepTitle: z.string(),
  instruction: z.string(),
  uiTargetElement: z.string(),
  checklistVerification: z.array(z.string()),
  nextActionPrompt: z.string()
});

export const TeachRequestSchema = z.object({
  stepNumber: z.number().min(1).max(5).default(1),
  userFollowUp: z.string().optional(),
  targetItemId: z.string().optional()
});

export const TeachResponseSchema = z.object({
  step: TeachStepSchema,
  followUpAnswer: z.string().optional(),
  adaptedExplanation: z.string().optional(),
  isCompleted: z.boolean(),
  degraded: z.boolean().default(false),
  fallbackReason: z.string().optional()
});

export type TeachRequest = z.infer<typeof TeachRequestSchema>;
export type TeachResponse = z.infer<typeof TeachResponseSchema>;
export type TeachStep = z.infer<typeof TeachStepSchema>;

// ==========================================
// 5. REPLAY GREETING SCHEMAS
// ==========================================
export const GreetingRequestSchema = z.object({
  operatorName: z.string().default('Operator'),
  language: z.string().default('English')
});

export const GreetingResponseSchema = z.object({
  greeting: z.string(),
  queueContext: z.string(),
  pendingCount: z.number(),
  urgentCount: z.number(),
  timestamp: z.string(),
  degraded: z.boolean().default(false),
  fallbackReason: z.string().optional()
});

export type GreetingRequest = z.infer<typeof GreetingRequestSchema>;
export type GreetingResponse = z.infer<typeof GreetingResponseSchema>;

// ==========================================
// 6. QUEUE ACTION SCHEMAS
// ==========================================
export const QueueActionRequestSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
  notes: z.string().optional()
});

export type QueueActionRequest = z.infer<typeof QueueActionRequestSchema>;
