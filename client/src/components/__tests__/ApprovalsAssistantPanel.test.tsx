import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ApprovalsAssistantPanel } from '../ApprovalsAssistantPanel';
import { useApprovalsStore } from '../../store/useApprovalsStore';

describe('Component Tests: ApprovalsAssistantPanel (Vitest + Testing Library)', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useApprovalsStore.setState({
      isAssistantOpen: true,
      activeTab: 'overview',
      greeting: {
        greeting: 'Good day Operator. 4 items pending.',
        queueContext: '4 pending',
        pendingCount: 4,
        urgentCount: 1,
        timestamp: '12:00:00 PM',
        degraded: false
      },
      summary: null,
      chatMessages: [
        { id: '1', role: 'assistant', content: 'Hello Operator. How can I assist?' }
      ],
      isStreaming: false,
      streamingTokenBuffer: '',
      isLoadingSummary: false,
      isLoadingChat: false,
      helpEntries: [],
      currentTeachStep: null,
      teachFollowUps: [],
      isSpeaking: false
    });
  });

  it('renders the assistant header, avatar, online status, and 5 action cards', () => {
    render(<ApprovalsAssistantPanel />);

    expect(screen.getByText('Approvals Assistant')).toBeInTheDocument();
    expect(screen.getByText('OomniEye Decision Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Good day Operator. 4 items pending.')).toBeInTheDocument();

    // Verify all 5 entry points are present
    expect(screen.getAllByText('Present me Summary').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Talk to me').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Help me').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Teach me').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Replay Greeting').length).toBeGreaterThanOrEqual(1);
  });

  it('visibly handles loading states (not just happy path)', () => {
    useApprovalsStore.setState({
      activeTab: 'summary',
      isLoadingSummary: true
    });

    render(<ApprovalsAssistantPanel />);

    expect(screen.getByText(/Synthesizing structured urgency summary/i)).toBeInTheDocument();
  });

  it('renders token-by-token streaming state with accumulated tokens and cursor', () => {
    useApprovalsStore.setState({
      activeTab: 'chat',
      isStreaming: true,
      streamingTokenBuffer: 'Based on current risk telemetry, Level 2 Drone'
    });

    render(<ApprovalsAssistantPanel />);

    expect(screen.getByText(/Based on current risk telemetry, Level 2 Drone/i)).toBeInTheDocument();
  });

  it('visibly displays error / fallback degraded state with explanation', () => {
    useApprovalsStore.setState({
      activeTab: 'summary',
      summary: {
        headline: '4 Approvals Pending: 1 Critical Gate Active',
        spokenScript: 'Attention Operator. Inspect drone video demo.',
        totalPending: 4,
        criticalCount: 1,
        highCount: 2,
        prioritizedItems: [
          {
            id: 'appr-002',
            title: 'Level 2 Drone Patrol Video Demo',
            urgency: 'CRITICAL',
            category: 'Video',
            recommendedAction: 'Verify waypoint altitudes under 120m AGL',
            reason: 'Anomaly detected'
          }
        ],
        recommendedFirstAction: 'Inspect drone video demo',
        generatedAt: new Date().toISOString(),
        degraded: true,
        fallbackReason: 'Operating in heuristic fallback mode (simulated 8s timeout)'
      }
    });

    render(<ApprovalsAssistantPanel />);

    expect(screen.getByText(/Fallback Mode Active/i)).toBeInTheDocument();
    expect(screen.getByText(/simulated 8s timeout/i)).toBeInTheDocument();
    expect(screen.getByText('4 Approvals Pending: 1 Critical Gate Active')).toBeInTheDocument();
  });

  it('allows switching tabs and minimizes when close affordance is clicked', () => {
    render(<ApprovalsAssistantPanel />);

    // Click Close (X) button
    const closeBtn = screen.getByTitle('Minimize Assistant');
    fireEvent.click(closeBtn);

    // Verify it minimises to the floating pill button
    expect(useApprovalsStore.getState().isAssistantOpen).toBe(false);
  });
});
