import { Router, Request, Response } from 'express';
import {
  getApprovalQueue,
  getApprovalItemById,
  updateApprovalStatus,
  resetApprovalQueue
} from '../data/mockQueue';
import { QueueActionRequestSchema } from '../contracts/schemas';

export const queueRouter = Router();

// GET all approval items
queueRouter.get('/', (_req: Request, res: Response) => {
  const queue = getApprovalQueue();
  res.json(queue);
});

// GET single item by ID
queueRouter.get('/:id', (req: Request, res: Response) => {
  const item = getApprovalItemById(req.params.id);
  if (!item) {
    res.status(404).json({ error: `Item with id ${req.params.id} not found` });
    return;
  }
  res.json(item);
});

// PATCH update status (Approve / Reject)
queueRouter.patch('/:id', (req: Request, res: Response) => {
  const parsed = QueueActionRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid action payload',
      details: parsed.error.issues
    });
    return;
  }

  const updated = updateApprovalStatus(req.params.id, parsed.data.status, parsed.data.notes);
  if (!updated) {
    res.status(404).json({ error: `Item with id ${req.params.id} not found` });
    return;
  }

  res.json(updated);
});

// POST reset queue
queueRouter.post('/reset', (_req: Request, res: Response) => {
  const queue = resetApprovalQueue();
  res.json({ message: 'Queue reset to initial reference dataset', queue });
});
