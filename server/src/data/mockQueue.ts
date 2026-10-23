import mockQueueData from './mockQueue.json';

export interface ApprovalItem {
  id: string;
  item: string;
  type: 'Folder' | 'Video' | 'PDF' | 'Image';
  submittedBy: string;
  submittedAt: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  riskLevel: string;
  details: string;
  suggestedAction: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

let currentQueue: ApprovalItem[] = JSON.parse(JSON.stringify(mockQueueData));

export const getApprovalQueue = (): ApprovalItem[] => {
  return currentQueue;
};

export const getApprovalItemById = (id: string): ApprovalItem | undefined => {
  return currentQueue.find(item => item.id === id);
};

export const updateApprovalStatus = (
  id: string,
  status: 'Approved' | 'Rejected',
  notes?: string
): ApprovalItem | null => {
  const index = currentQueue.findIndex(item => item.id === id);
  if (index === -1) return null;
  currentQueue[index] = {
    ...currentQueue[index],
    status,
    reviewedAt: new Date().toISOString(),
    reviewNotes: notes || `Action marked as ${status} by operator`
  };
  return currentQueue[index];
};

export const resetApprovalQueue = (): ApprovalItem[] => {
  currentQueue = JSON.parse(JSON.stringify(mockQueueData));
  return currentQueue;
};
