import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { aiRouter } from './routes/ai.routes';
import { queueRouter } from './routes/queue.routes';

export const app: Express = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Rate Limiter per Technical Requirement §3:
// "Basic per-session throttling on the AI endpoints (express-rate-limit or equivalent)"
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 120, // Limit each IP to 120 AI requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many AI requests from this session. Rate limit reached.',
    retryAfterMinutes: 15
  }
});

// Mount Routes
app.use('/api', aiRateLimiter, aiRouter);
app.use('/api/queue', queueRouter);

// Serve OpenAPI Specification
app.get('/api/openapi.json', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'contracts', 'openapi.json'));
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'OomniEye Approvals Assistant AI Backend',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler — ensures failures never surface as raw 500 without structure
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[CommandCentre API Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    degraded: true,
    fallbackReason: 'Global error interceptor caught uncaught exception'
  });
});
