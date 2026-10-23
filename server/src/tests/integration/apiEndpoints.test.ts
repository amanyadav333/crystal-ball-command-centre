import request from 'supertest';
import { app } from '../../app';

describe('Integration Tests: AI Endpoints (Supertest)', () => {
  describe('POST /api/summary', () => {
    it('Success Path: returns structured summary with 200 OK and Zod-compliant fields', async () => {
      const res = await request(app)
        .post('/api/summary')
        .send({
          operatorRole: 'Senior Operations Lead',
          language: 'English'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('headline');
      expect(res.body).toHaveProperty('spokenScript');
      expect(res.body).toHaveProperty('totalPending');
      expect(res.body).toHaveProperty('prioritizedItems');
      expect(Array.isArray(res.body.prioritizedItems)).toBe(true);
      expect(res.body.prioritizedItems.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('recommendedFirstAction');
    });

    it('Fallback / Timeout Path: gracefully degrades when LLM call exceeds 8s timeout threshold', async () => {
      // Simulate timeout using custom evaluation header
      const res = await request(app)
        .post('/api/summary')
        .set('x-simulate-timeout', 'true')
        .send({
          operatorRole: 'Command Operator'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('degraded', true);
      expect(res.body.fallbackReason).toContain('timeout');
      expect(res.body).toHaveProperty('headline');
      expect(res.body).toHaveProperty('prioritizedItems');
      // UI never crashes or receives raw 500 error
    });
  });

  describe('POST /api/help (RAG Policy Grounding)', () => {
    it('returns grounded answer with citations for sensor calibration query', async () => {
      const res = await request(app)
        .post('/api/help')
        .send({
          query: 'What is the required calibration drift tolerance for safety equipment sensors?'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('groundedInDocument', true);
      expect(res.body.citations.some((c: any) => c.code === 'SOP-103')).toBe(true);
      expect(res.body.answer).toContain('1.5%');
    });

    it('rejects malformed requests with 400 Bad Request and Zod validation issues', async () => {
      const res = await request(app)
        .post('/api/help')
        .send({
          query: '' // empty query violates min(2)
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('details');
    });
  });

  describe('POST /api/greeting', () => {
    it('regenerates context-aware greeting reflecting live queue size', async () => {
      const res = await request(app)
        .post('/api/greeting')
        .send({ operatorName: 'Elena' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('greeting');
      expect(res.body.greeting).toContain('Elena');
      expect(res.body).toHaveProperty('pendingCount');
      expect(typeof res.body.pendingCount).toBe('number');
    });
  });

  describe('POST /api/teach', () => {
    it('returns Step 1 guidance for new operator onboarding', async () => {
      const res = await request(app)
        .post('/api/teach')
        .send({ stepNumber: 1 });

      expect(res.status).toBe(200);
      expect(res.body.step.stepNumber).toBe(1);
      expect(res.body.step).toHaveProperty('instruction');
      expect(res.body.step).toHaveProperty('checklistVerification');
    });

    it('adapts explanation when operator asks a follow-up question', async () => {
      const res = await request(app)
        .post('/api/teach')
        .send({
          stepNumber: 2,
          userFollowUp: 'What do I do if LiDAR telemetry is missing from the drone video?'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('followUpAnswer');
    });
  });

  describe('GET & PATCH /api/queue', () => {
    it('returns full queue and allows status update with audit note', async () => {
      const queueRes = await request(app).get('/api/queue');
      expect(queueRes.status).toBe(200);
      expect(queueRes.body.length).toBe(4);

      const patchRes = await request(app)
        .patch('/api/queue/appr-001')
        .send({
          status: 'Approved',
          notes: 'Verified checklist items against supervisor log'
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.status).toBe('Approved');
      expect(patchRes.body.reviewNotes).toContain('supervisor log');

      // Reset queue back for subsequent runs
      await request(app).post('/api/queue/reset');
    });
  });
});
