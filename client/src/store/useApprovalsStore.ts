import { create } from 'zustand';

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

export interface SummaryData {
  headline: string;
  spokenScript: string;
  totalPending: number;
  criticalCount: number;
  highCount: number;
  prioritizedItems: Array<{
    id: string;
    title: string;
    urgency: string;
    category: string;
    recommendedAction: string;
    reason: string;
  }>;
  recommendedFirstAction: string;
  generatedAt: string;
  degraded: boolean;
  fallbackReason?: string;
}

export interface Citation {
  code: string;
  title: string;
  category: string;
  relevanceScore: number;
}

export interface HelpItem {
  id: string;
  query: string;
  answer: string;
  citations: Citation[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  groundedInDocument: boolean;
  degraded: boolean;
  fallbackReason?: string;
  timestamp: string;
}

export interface TeachStepData {
  stepNumber: number;
  totalSteps: number;
  stepTitle: string;
  instruction: string;
  uiTargetElement: string;
  checklistVerification: string[];
  nextActionPrompt: string;
}

export interface GreetingData {
  greeting: string;
  queueContext: string;
  pendingCount: number;
  urgentCount: number;
  timestamp: string;
  degraded: boolean;
  fallbackReason?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  degraded?: boolean;
}

export type AssistantTab = 'overview' | 'summary' | 'chat' | 'help' | 'teach';

interface ApprovalsState {
  // Queue Data
  queue: ApprovalItem[];
  selectedItem: ApprovalItem | null;
  searchFilter: string;
  urgencyFilter: string;

  // Assistant UI State
  isAssistantOpen: boolean;
  activeTab: AssistantTab;
  isSpeaking: boolean;

  // AI Feature States
  greeting: GreetingData | null;
  summary: SummaryData | null;
  chatMessages: ChatMessage[];
  isStreaming: boolean;
  streamingTokenBuffer: string;
  helpEntries: HelpItem[];
  currentTeachStep: TeachStepData | null;
  teachFollowUps: Array<{ question: string; answer: string; adaptedExplanation?: string }>;
  isTeachCompleted: boolean;

  // Evaluation Simulation Toggles (§6)
  simulateTimeout: boolean;
  simulateError: boolean;

  // Loading & Error States
  isLoadingQueue: boolean;
  isLoadingGreeting: boolean;
  isLoadingSummary: boolean;
  isLoadingChat: boolean;
  isLoadingHelp: boolean;
  isLoadingTeach: boolean;
  generalError: string | null;

  // Actions
  setAssistantOpen: (open: boolean) => void;
  setActiveTab: (tab: AssistantTab) => void;
  setSelectedItem: (item: ApprovalItem | null) => void;
  setSearchFilter: (filter: string) => void;
  setUrgencyFilter: (filter: string) => void;
  setSimulateTimeout: (enabled: boolean) => void;
  setSimulateError: (enabled: boolean) => void;
  toggleSpeech: (textToSpeak?: string) => void;

  // API Calls
  fetchQueue: () => Promise<void>;
  updateItemStatus: (id: string, status: 'Approved' | 'Rejected', notes?: string) => Promise<void>;
  fetchGreeting: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  sendChatMessage: (content: string) => Promise<void>;
  askHelpQuestion: (query: string) => Promise<void>;
  fetchTeachStep: (stepNumber?: number, followUp?: string) => Promise<void>;
  resetAll: () => Promise<void>;
}

export const useApprovalsStore = create<ApprovalsState>((set, get) => ({
  queue: [],
  selectedItem: null,
  searchFilter: '',
  urgencyFilter: 'ALL',

  isAssistantOpen: true,
  activeTab: 'overview',
  isSpeaking: false,

  greeting: null,
  summary: null,
  chatMessages: [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'Hello Operator. I am your Digital Twin Approvals Assistant. Ask me anything about the pending items, which asset needs your attention first, or verify SOP compliance.'
    }
  ],
  isStreaming: false,
  streamingTokenBuffer: '',
  helpEntries: [],
  currentTeachStep: null,
  teachFollowUps: [],
  isTeachCompleted: false,

  simulateTimeout: false,
  simulateError: false,

  isLoadingQueue: false,
  isLoadingGreeting: false,
  isLoadingSummary: false,
  isLoadingChat: false,
  isLoadingHelp: false,
  isLoadingTeach: false,
  generalError: null,

  setAssistantOpen: (open) => set({ isAssistantOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setSearchFilter: (searchFilter) => set({ searchFilter }),
  setUrgencyFilter: (urgencyFilter) => set({ urgencyFilter }),
  setSimulateTimeout: (simulateTimeout) => set({ simulateTimeout }),
  setSimulateError: (simulateError) => set({ simulateError }),

  toggleSpeech: (textToSpeak) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const { isSpeaking } = get();
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      set({ isSpeaking: false });
    } else {
      const script = textToSpeak || get().summary?.spokenScript || get().greeting?.greeting || 'Approvals Assistant operational.';
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => set({ isSpeaking: false });
      utterance.onerror = () => set({ isSpeaking: false });
      window.speechSynthesis.speak(utterance);
      set({ isSpeaking: true });
    }
  },

  fetchQueue: async () => {
    set({ isLoadingQueue: true, generalError: null });
    try {
      const res = await fetch('/api/queue');
      if (!res.ok) throw new Error(`Queue fetch failed: ${res.statusText}`);
      const data = await res.json();
      set({ queue: data, isLoadingQueue: false });
    } catch (err: any) {
      set({ isLoadingQueue: false, generalError: err.message });
    }
  },

  updateItemStatus: async (id, status, notes) => {
    try {
      const res = await fetch(`/api/queue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (!res.ok) throw new Error(`Update failed: ${res.statusText}`);
      const updated = await res.json();
      set(state => ({
        queue: state.queue.map(item => item.id === id ? updated : item),
        selectedItem: state.selectedItem?.id === id ? updated : state.selectedItem
      }));
      // Auto-refresh greeting and summary with new queue state!
      get().fetchGreeting();
    } catch (err: any) {
      set({ generalError: err.message });
    }
  },

  fetchGreeting: async () => {
    set({ isLoadingGreeting: true });
    const { simulateTimeout, simulateError } = get();
    try {
      const res = await fetch('/api/greeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulate-timeout': simulateTimeout ? 'true' : 'false',
          'x-simulate-error': simulateError ? 'true' : 'false'
        },
        body: JSON.stringify({ operatorName: 'Aman Yadav' })
      });
      const data = await res.json();
      set({ greeting: data, isLoadingGreeting: false });
    } catch {
      set({ isLoadingGreeting: false });
    }
  },

  fetchSummary: async () => {
    set({ isLoadingSummary: true, generalError: null });
    const { simulateTimeout, simulateError } = get();
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulate-timeout': simulateTimeout ? 'true' : 'false',
          'x-simulate-error': simulateError ? 'true' : 'false'
        },
        body: JSON.stringify({ operatorRole: 'Lead Inspector' })
      });
      const data = await res.json();
      set({ summary: data, isLoadingSummary: false });
    } catch (err: any) {
      set({ isLoadingSummary: false, generalError: err.message });
    }
  },

  sendChatMessage: async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content
    };

    const currentMessages = get().chatMessages;
    const newMessages = [...currentMessages, userMessage];

    set({
      chatMessages: newMessages,
      isStreaming: true,
      streamingTokenBuffer: '',
      isLoadingChat: true
    });

    const { selectedItem, simulateTimeout, simulateError } = get();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulate-timeout': simulateTimeout ? 'true' : 'false',
          'x-simulate-error': simulateError ? 'true' : 'false'
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          activeItemId: selectedItem?.id
        })
      });

      if (!response.body) throw new Error('ReadableStream not supported by browser.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let accumulatedText = '';

      set({ isLoadingChat: false });

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('event: token')) {
              const dataMatch = line.match(/data: (.*)/);
              if (dataMatch) {
                try {
                  const parsed = JSON.parse(dataMatch[1]);
                  accumulatedText += parsed.token;
                  set({ streamingTokenBuffer: accumulatedText });
                } catch {
                  // ignore parse error on partial chunks
                }
              }
            } else if (line.startsWith('event: error')) {
              accumulatedText += '\n[Stream Error: Fallback interrupted]';
            }
          }
        }
      }

      // Commit finalized message to chat history
      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: accumulatedText || 'Unable to retrieve response from stream.'
      };

      set(state => ({
        chatMessages: [...state.chatMessages, assistantMessage],
        isStreaming: false,
        streamingTokenBuffer: ''
      }));
    } catch (err: any) {
      set(state => ({
        chatMessages: [
          ...state.chatMessages,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `Degraded stream fallback: ${err.message}`,
            degraded: true
          }
        ],
        isStreaming: false,
        isLoadingChat: false,
        streamingTokenBuffer: ''
      }));
    }
  },

  askHelpQuestion: async (query: string) => {
    if (!query.trim()) return;
    set({ isLoadingHelp: true, generalError: null });
    const { simulateTimeout, simulateError, selectedItem } = get();

    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulate-timeout': simulateTimeout ? 'true' : 'false',
          'x-simulate-error': simulateError ? 'true' : 'false'
        },
        body: JSON.stringify({
          query,
          activeItemId: selectedItem?.id
        })
      });

      const data = await res.json();
      const newHelpItem: HelpItem = {
        id: `help-${Date.now()}`,
        query,
        answer: data.answer,
        citations: data.citations || [],
        confidence: data.confidence || 'HIGH',
        groundedInDocument: data.groundedInDocument ?? true,
        degraded: data.degraded ?? false,
        fallbackReason: data.fallbackReason,
        timestamp: new Date().toLocaleTimeString()
      };

      set(state => ({
        helpEntries: [newHelpItem, ...state.helpEntries],
        isLoadingHelp: false
      }));
    } catch (err: any) {
      set({ isLoadingHelp: false, generalError: err.message });
    }
  },

  fetchTeachStep: async (stepNumber = 1, followUp?: string) => {
    set({ isLoadingTeach: true, generalError: null });
    const { simulateTimeout, simulateError, selectedItem } = get();

    try {
      const res = await fetch('/api/teach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulate-timeout': simulateTimeout ? 'true' : 'false',
          'x-simulate-error': simulateError ? 'true' : 'false'
        },
        body: JSON.stringify({
          stepNumber,
          userFollowUp: followUp,
          targetItemId: selectedItem?.id
        })
      });

      const data = await res.json();

      if (followUp && data.followUpAnswer) {
        set(state => ({
          teachFollowUps: [
            ...state.teachFollowUps,
            {
              question: followUp,
              answer: data.followUpAnswer,
              adaptedExplanation: data.adaptedExplanation
            }
          ],
          isLoadingTeach: false
        }));
      } else {
        set({
          currentTeachStep: data.step,
          isTeachCompleted: data.isCompleted,
          isLoadingTeach: false
        });
      }
    } catch (err: any) {
      set({ isLoadingTeach: false, generalError: err.message });
    }
  },

  resetAll: async () => {
    try {
      await fetch('/api/queue/reset', { method: 'POST' });
      await get().fetchQueue();
      await get().fetchGreeting();
      set({
        summary: null,
        chatMessages: [
          {
            id: 'welcome-reset',
            role: 'assistant',
            content: 'Approvals queue reset to initial state. How can I assist you with today\'s reviews?'
          }
        ],
        helpEntries: [],
        currentTeachStep: null,
        teachFollowUps: [],
        activeTab: 'overview'
      });
    } catch (e: any) {
      set({ generalError: e.message });
    }
  }
}));
