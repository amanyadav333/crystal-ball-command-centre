import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  MessageSquare,
  HelpCircle,
  GraduationCap,
  Volume2,
  VolumeX,
  X,
  Send,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useApprovalsStore, AssistantTab } from '../store/useApprovalsStore';

export const ApprovalsAssistantPanel: React.FC = () => {
  const {
    isAssistantOpen,
    setAssistantOpen,
    activeTab,
    setActiveTab,
    isSpeaking,
    toggleSpeech,
    greeting,
    fetchGreeting,
    summary,
    fetchSummary,
    chatMessages,
    isStreaming,
    streamingTokenBuffer,
    sendChatMessage,
    helpEntries,
    askHelpQuestion,
    currentTeachStep,
    teachFollowUps,
    isTeachCompleted,
    fetchTeachStep,
    queue,
    isLoadingSummary,
    isLoadingGreeting,
    isLoadingChat,
    isLoadingHelp,
    isLoadingTeach
  } = useApprovalsStore();

  const [chatInput, setChatInput] = useState('');
  const [helpInput, setHelpInput] = useState('');
  const [teachQuestion, setTeachQuestion] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initialize Greeting on mount
  useEffect(() => {
    fetchGreeting();
  }, [fetchGreeting]);

  // Auto-scroll chat during streaming
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, streamingTokenBuffer]);

  // Handle Tab Change
  const handleSelectTab = (tab: AssistantTab) => {
    setActiveTab(tab);
    if (tab === 'summary' && !summary) {
      fetchSummary();
    } else if (tab === 'teach' && !currentTeachStep) {
      fetchTeachStep(1);
    }
  };

  const handleSendChat = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isStreaming) return;
    const msg = chatInput;
    setChatInput('');
    sendChatMessage(msg);
  };

  const handleAskHelp = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!helpInput.trim() || isLoadingHelp) return;
    const q = helpInput;
    setHelpInput('');
    askHelpQuestion(q);
  };

  const handleTeachFollowUp = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!teachQuestion.trim() || isLoadingTeach) return;
    const q = teachQuestion;
    setTeachQuestion('');
    fetchTeachStep(currentTeachStep?.stepNumber || 1, q);
  };

  // If minimized, show floating pill trigger button
  if (!isAssistantOpen) {
    const pendingCount = queue.filter(q => q.status === 'Pending Review').length;
    return (
      <button
        onClick={() => setAssistantOpen(true)}
        className="glass-panel-glow"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 20px',
          borderRadius: 'var(--radius-full)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 50,
          border: '1px solid var(--accent-cyan)',
          boxShadow: '0 8px 32px rgba(0, 240, 255, 0.35)',
          color: '#F8FAFC'
        }}
      >
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#07090E',
            fontWeight: 800
          }}>
            <Sparkles size={18} />
          </div>
          <div className="pulse-beacon" style={{ position: 'absolute', bottom: 0, right: 0 }} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>Approvals Assistant</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
            {pendingCount > 0 ? `${pendingCount} items pending` : 'Ready to assist'}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      className="glass-panel-glow"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '24px',
        width: '460px',
        maxWidth: 'calc(100vw - 48px)',
        height: '620px',
        maxHeight: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        zIndex: 50,
        overflow: 'hidden',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      {/* 1. Header with Avatar & Controls */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, rgba(14, 19, 31, 0.95) 0%, rgba(14, 19, 31, 0.8) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00F0FF 0%, #7928CA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
            }}>
              <Sparkles size={20} />
            </div>
            <div className="pulse-beacon" style={{ position: 'absolute', bottom: '0', right: '0' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>
                Approvals Assistant
              </span>
              <span style={{
                fontSize: '0.65rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                AI COPILOT
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              OomniEye Decision Intelligence
            </div>
          </div>
        </div>

        {/* Header Affordances */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* TTS Speech Synthesis Button */}
          <button
            onClick={() => toggleSpeech()}
            className="btn-icon"
            title={isSpeaking ? 'Mute Speech' : 'Read Summary Out Loud'}
            style={{ color: isSpeaking ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}
          >
            {isSpeaking ? (
              <div className="audio-waves">
                <span className="audio-bar" />
                <span className="audio-bar" />
                <span className="audio-bar" />
                <span className="audio-bar" />
                <span className="audio-bar" />
              </div>
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          {/* Close Affordance */}
          <button
            onClick={() => setAssistantOpen(false)}
            className="btn-icon"
            title="Minimize Assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. Dynamic Context-Aware Greeting Banner */}
      {greeting && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: 'rgba(0, 240, 255, 0.05)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>👋</span>
            <span style={{ fontWeight: 500 }}>{greeting.greeting}</span>
          </div>

          <button
            onClick={() => fetchGreeting()}
            className="btn-icon"
            title="Replay Greeting"
            style={{ padding: '2px', color: 'var(--text-cyan)' }}
          >
            <RotateCcw size={12} className={isLoadingGreeting ? 'animate-spin' : ''} />
          </button>
        </div>
      )}

      {/* 3. Navigation Tabs Bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(10, 14, 23, 0.85)',
        padding: '4px 8px',
        gap: '4px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: Layers },
          { id: 'summary', label: 'Summary', icon: Sparkles },
          { id: 'chat', label: 'Talk to me', icon: MessageSquare },
          { id: 'help', label: 'Help me', icon: HelpCircle },
          { id: 'teach', label: 'Teach me', icon: GraduationCap }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id as AssistantTab)}
              style={{
                background: isActive ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>

        {/* ===================== TAB: OVERVIEW (5 ACTION CARDS SPEC) ===================== */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Select Assistant Capability:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {/* Card 1: Present me Summary */}
              <div
                onClick={() => handleSelectTab('summary')}
                className="glass-panel"
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.2)'}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F8FAFC' }}>
                    Present me Summary
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Summarise current pending queue out loud/in text, prioritised by urgency.
                  </div>
                </div>
                <ArrowRight size={16} color="var(--accent-cyan)" />
              </div>

              {/* Card 2: Talk to me */}
              <div
                onClick={() => handleSelectTab('chat')}
                className="glass-panel"
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  color: '#A78BFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MessageSquare size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F8FAFC' }}>
                    Talk to me
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Free-form multi-turn reasoning about which item needs attention first and why.
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>

              {/* Card 3: Help me */}
              <div
                onClick={() => handleSelectTab('help')}
                className="glass-panel"
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  color: '#FCD34D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <HelpCircle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F8FAFC' }}>
                    Help me
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Answers operational questions strictly grounded in SOP policies (RAG surface).
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>

              {/* Card 4: Teach me */}
              <div
                onClick={() => handleSelectTab('teach')}
                className="glass-panel"
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#6EE7B7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GraduationCap size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F8FAFC' }}>
                    Teach me
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Walks new operators step-by-step through review actions, adapting to follow-ups.
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>

              {/* Card 5: Replay Greeting */}
              <div
                onClick={() => fetchGreeting()}
                className="glass-panel"
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#F87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <RotateCcw size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F8FAFC' }}>
                    Replay Greeting
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Regenerate a short, context-aware greeting reflecting current queue state.
                  </div>
                </div>
                <RotateCcw size={16} color="var(--text-muted)" />
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: SUMMARY (STRUCTURED OUTPUT) ===================== */}
        {activeTab === 'summary' && (
          <div>
            {isLoadingSummary ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <Sparkles size={24} className="animate-spin" color="var(--accent-cyan)" />
                <p style={{ marginTop: '12px', fontSize: '0.85rem' }}>Synthesizing structured urgency summary...</p>
              </div>
            ) : summary ? (
              <div>
                {/* Fallback Banner if Degraded */}
                {summary.degraded && (
                  <div style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '0.75rem',
                    color: '#FCD34D'
                  }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>Fallback Mode Active:</strong> {summary.fallbackReason}
                    </div>
                  </div>
                )}

                {/* Headline Banner */}
                <div style={{
                  backgroundColor: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid var(--border-accent)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '14px'
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Prioritized Operational Overview
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', marginTop: '4px' }}>
                    {summary.headline}
                  </div>
                </div>

                {/* Spoken Script / TTS Audio Card */}
                <div className="glass-panel" style={{ padding: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Spoken Script (TTS Audio)
                    </span>
                    <button
                      onClick={() => toggleSpeech(summary.spokenScript)}
                      className="btn-ghost"
                      style={{ padding: '3px 8px', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}
                    >
                      {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      <span>{isSpeaking ? 'Stop Audio' : 'Play Audio'}</span>
                    </button>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{summary.spokenScript}"
                  </p>
                </div>

                {/* Recommended First Action */}
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#FCA5A5', fontWeight: 700, textTransform: 'uppercase' }}>
                    Recommended Immediate Action
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#F8FAFC', fontWeight: 600, marginTop: '4px' }}>
                    {summary.recommendedFirstAction}
                  </p>
                </div>

                {/* Prioritized Items List */}
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Urgency Prioritized Queue:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {summary.prioritizedItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="glass-panel"
                      style={{ padding: '10px 12px', borderLeft: `3px solid ${item.urgency === 'CRITICAL' ? 'var(--accent-rose)' : item.urgency === 'HIGH' ? 'var(--accent-amber)' : 'var(--accent-cyan)'}` }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#F8FAFC' }}>
                          #{idx + 1} {item.title}
                        </span>
                        <span className={`badge ${item.urgency === 'CRITICAL' ? 'badge-critical' : item.urgency === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                          {item.urgency}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-cyan)', marginTop: '4px' }}>
                        👉 {item.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <button onClick={() => fetchSummary()} className="btn-primary">
                  <Sparkles size={16} />
                  <span>Generate Summary</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: TALK TO ME (SSE STREAMING CHAT) ===================== */}
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Messages Scroll Area */}
            <div
              ref={chatScrollRef}
              style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '12px' }}
            >
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    backgroundColor: msg.role === 'user' ? 'rgba(0, 180, 216, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(0, 240, 255, 0.4)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    color: '#F8FAFC',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {msg.content}
                </div>
              ))}

              {/* Token Streaming View */}
              {isStreaming && (
                <div style={{
                  alignSelf: 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--accent-cyan)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  color: '#F8FAFC',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line'
                }}>
                  {streamingTokenBuffer || 'Reasoning...'}
                  <span className="streaming-cursor" />
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '6px 0', borderTop: '1px solid var(--border-subtle)' }}>
              {[
                "Which of these needs my attention first and why?",
                "Inspect Level 2 Drone Patrol Video",
                "Can I approve the sensor specs?"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChatInput(chip);
                    sendChatMessage(chip);
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                type="text"
                placeholder="Ask about approvals queue..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isStreaming}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isStreaming}
                className="btn-primary"
                style={{ padding: '8px 12px' }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

        {/* ===================== TAB: HELP ME (RAG GROUNDED Q&A) ===================== */}
        {activeTab === 'help' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Search Box */}
            <form onSubmit={handleAskHelp} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Ask operational policy question (e.g. drone altitude limit)..."
                value={helpInput}
                onChange={(e) => setHelpInput(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button type="submit" disabled={!helpInput.trim() || isLoadingHelp} className="btn-primary">
                {isLoadingHelp ? <Sparkles size={15} className="animate-spin" /> : <HelpCircle size={15} />}
              </button>
            </form>

            {/* Quick Policy Questions */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '14px' }}>
              {[
                "What is max altitude for drone patrols?",
                "What is sensor drift tolerance?",
                "Who verifies Zone 4 spatial layouts?",
                "What happens after 48h unreviewed?"
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => askHelpQuestion(q)}
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    color: '#FCD34D',
                    borderRadius: 'var(--radius-full)',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Grounded Results List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {helpEntries.map(entry => (
                <div key={entry.id} className="glass-panel" style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '8px' }}>
                    Q: {entry.query}
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
                    {entry.answer}
                  </p>

                  {/* Citations Chips */}
                  {entry.citations.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {entry.citations.map(c => (
                        <span
                          key={c.code}
                          style={{
                            backgroundColor: 'rgba(0, 240, 255, 0.1)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '2px 6px',
                            fontSize: '0.68rem',
                            color: 'var(--accent-cyan)',
                            fontWeight: 600
                          }}
                        >
                          📜 [{c.code}] {c.title}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>Confidence: <strong>{entry.confidence}</strong></span>
                    <span>{entry.groundedInDocument ? '✅ Grounded in SOP-101-105' : '⚠️ Ungrounded / General'}</span>
                  </div>
                </div>
              ))}

              {helpEntries.length === 0 && !isLoadingHelp && (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Ask any question regarding SOP compliance, turnaround SLAs, drone altitude ceilings, or sensor drift thresholds.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: TEACH ME (STEP-BY-STEP OPERATOR WALKTHROUGH) ===================== */}
        {activeTab === 'teach' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {currentTeachStep ? (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* Step Progress Dots */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => fetchTeachStep(num)}
                      style={{
                        flex: 1,
                        margin: '0 3px',
                        padding: '6px 0',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: currentTeachStep.stepNumber === num ? 'var(--accent-cyan)' : currentTeachStep.stepNumber > num ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: currentTeachStep.stepNumber === num ? '#000' : currentTeachStep.stepNumber > num ? '#10B981' : 'var(--text-muted)',
                        border: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Step {num}
                    </button>
                  ))}
                </div>

                {/* Step Instruction Card */}
                <div className="glass-panel" style={{ padding: '14px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Operator Onboarding Training
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', marginTop: '4px' }}>
                    {currentTeachStep.stepTitle}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
                    {currentTeachStep.instruction}
                  </p>

                  {/* UI Target Affordance */}
                  <div style={{
                    backgroundColor: 'rgba(0, 240, 255, 0.05)',
                    border: '1px dashed var(--accent-cyan)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    marginTop: '12px'
                  }}>
                    🎯 <strong>UI Target:</strong> {currentTeachStep.uiTargetElement}
                  </div>
                </div>

                {/* Verification Checklist */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Verification Checkpoints:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {currentTeachStep.checklistVerification.map((check, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                        <CheckCircle size={14} color="var(--accent-emerald)" />
                        <span>{check}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adapted Follow-up Explanations History */}
                {teachFollowUps.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-cyan)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Adapted Follow-ups:
                    </div>
                    {teachFollowUps.map((fu, idx) => (
                      <div key={idx} style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '6px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#F8FAFC' }}>Q: {fu.question}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{fu.answer}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      if (currentTeachStep.stepNumber < 4) {
                        fetchTeachStep(currentTeachStep.stepNumber + 1);
                      } else {
                        fetchTeachStep(1);
                      }
                    }}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                  >
                    <span>{currentTeachStep.stepNumber < 4 ? 'Next Step' : 'Restart Walkthrough'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                <button onClick={() => fetchTeachStep(1)} className="btn-primary">
                  <GraduationCap size={16} />
                  <span>Start Operator Tutorial</span>
                </button>
              </div>
            )}

            {/* Follow-up question bar */}
            <form onSubmit={handleTeachFollowUp} style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              <input
                type="text"
                placeholder="Ask follow-up question (adapts explanation)..."
                value={teachQuestion}
                onChange={(e) => setTeachQuestion(e.target.value)}
                disabled={isLoadingTeach}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
              <button type="submit" disabled={!teachQuestion.trim() || isLoadingTeach} className="btn-ghost" style={{ padding: '8px 12px' }}>
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
