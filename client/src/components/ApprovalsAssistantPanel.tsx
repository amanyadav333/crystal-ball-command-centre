import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Info,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Send,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  HelpCircle,
  GraduationCap,
  MessageSquare
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
    fetchTeachStep,
    queue,
    isLoadingSummary,
    isLoadingGreeting,
    isLoadingHelp,
    isLoadingTeach
  } = useApprovalsStore();

  const [chatInput, setChatInput] = useState('');
  const [helpInput, setHelpInput] = useState('');
  const [teachQuestion, setTeachQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleSelectCard = (tab: AssistantTab) => {
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

  const pendingCount = queue.filter(q => q.status === 'Pending Review').length;

  return (
    <>
      {/* Floating Circular Action Trigger Button in lower-right */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 55
      }}>
        <button
          onClick={() => setAssistantOpen(!isAssistantOpen)}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#0B1536',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 24px rgba(11, 21, 54, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#FFFFFF',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          title={isAssistantOpen ? "Close Approvals Panel" : "Open Approvals Assistant"}
        >
          {isAssistantOpen ? (
            <X size={20} />
          ) : (
            <>
              <img
                src="/assets/avatar.jpg"
                alt="Avatar"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
              {pendingCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #0B1536'
                }}>
                  {pendingCount}
                </span>
              )}
            </>
          )}
        </button>
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: '#059669',
          marginTop: '4px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}>
          ALL CAD
        </span>
      </div>

      {/* Main Approvals Panel Popup */}
      {isAssistantOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            width: isExpanded ? '520px' : '410px',
            height: isExpanded ? '720px' : '590px',
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 18px 45px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 50,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* 1. Header Bar (Dark Navy matching reference #0C1838) */}
          <div style={{
            backgroundColor: '#0C1838',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#FFFFFF'
          }}>
            {/* Left: Avatar + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img
                  src="/assets/avatar.jpg"
                  alt="Approvals Assistant"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Approvals
              </span>
            </div>

            {/* Right Affordances: Info, Expand, Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => toggleSpeech()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isSpeaking ? '#38BDF8' : '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isSpeaking ? "Mute Voice" : "Audio TTS Summary"}
              >
                {isSpeaking ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>

              <button
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                title="About OomniEye Approvals AI"
              >
                <Info size={17} />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                title={isExpanded ? "Collapse View" : "Expand View"}
              >
                <Maximize2 size={16} />
              </button>

              <button
                onClick={() => setAssistantOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                title="Minimize Assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 2. Subheader Bar (Breadcrumb + Replay Greeting) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {activeTab === 'overview' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.82rem', fontWeight: 600 }}>
                <Home size={15} color="#64748B" />
                <span>Approvals</span>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <ArrowLeft size={14} />
                <span>Back to Approvals</span>
              </button>
            )}

            {/* Replay Greeting Orange Action Link */}
            <button
              onClick={() => fetchGreeting()}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#D97706',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                padding: '2px 4px'
              }}
              title="Regenerate context-aware greeting"
            >
              <RotateCcw size={12} className={isLoadingGreeting ? "animate-spin" : ""} />
              <span>Replay Greeting</span>
            </button>
          </div>

          {/* Context Greeting Banner */}
          {greeting && (
            <div style={{
              backgroundColor: '#FFFBEB',
              borderBottom: '1px solid #FEF3C7',
              padding: '8px 16px',
              fontSize: '0.75rem',
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ fontSize: '0.9rem' }}>💬</span>
              <span style={{ fontWeight: 500 }}>{greeting.greeting}</span>
            </div>
          )}

          {/* 3. Main Content Area */}
          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
            {/* ==================== 2X2 GRID OVERVIEW MODE (MATCHING SCREENSHOT) ==================== */}
            {activeTab === 'overview' && (
              <div style={{
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '14px',
                height: '100%'
              }}>
                {/* Card 1: Present me Summary */}
                <div
                  onClick={() => handleSelectCard('summary')}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '16px 12px 14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    minHeight: '190px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#94A3B8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{
                    width: '120px',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderRadius: '12px'
                  }}>
                    <img
                      src="/assets/present_summary.jpg"
                      alt="Present me Summary"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginTop: '8px' }}>
                    Present me Summary
                  </span>
                </div>

                {/* Card 2: Talk to me */}
                <div
                  onClick={() => handleSelectCard('chat')}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '16px 12px 14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    minHeight: '190px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#94A3B8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{
                    width: '120px',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderRadius: '12px'
                  }}>
                    <img
                      src="/assets/talk_to_me.jpg"
                      alt="Talk to me"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginTop: '8px' }}>
                    Talk to me
                  </span>
                </div>

                {/* Card 3: Help me */}
                <div
                  onClick={() => handleSelectCard('help')}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '16px 12px 14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    minHeight: '190px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#94A3B8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{
                    width: '120px',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderRadius: '12px'
                  }}>
                    <img
                      src="/assets/help_me.jpg"
                      alt="Help me"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginTop: '8px' }}>
                    Help me
                  </span>
                </div>

                {/* Card 4: Teach me */}
                <div
                  onClick={() => handleSelectCard('teach')}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '16px 12px 14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    minHeight: '190px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#94A3B8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{
                    width: '120px',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderRadius: '12px'
                  }}>
                    <img
                      src="/assets/teach_me.jpg"
                      alt="Teach me"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginTop: '8px' }}>
                    Teach me
                  </span>
                </div>
              </div>
            )}

            {/* ==================== INNER VIEW: SUMMARY ==================== */}
            {activeTab === 'summary' && (
              <div style={{ padding: '16px' }}>
                {isLoadingSummary ? (
                  <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748B' }}>
                    <Sparkles size={24} className="animate-spin" color="#0284C7" />
                    <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>Synthesizing structured urgency summary...</p>
                  </div>
                ) : summary ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Fallback Banner */}
                    {summary.degraded && (
                      <div style={{
                        backgroundColor: '#FEF3C7',
                        border: '1px solid #FCD34D',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        fontSize: '0.75rem',
                        color: '#92400E',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div><strong>Fallback Mode Active:</strong> {summary.fallbackReason}</div>
                      </div>
                    )}

                    {/* Headline Card */}
                    <div style={{
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '12px',
                      padding: '14px'
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase' }}>
                        Operational Overview
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginTop: '4px' }}>
                        {summary.headline}
                      </div>
                    </div>

                    {/* Spoken Script / TTS Audio Player */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                          Spoken Audio Summary
                        </span>
                        <button
                          onClick={() => toggleSpeech(summary.spokenScript)}
                          style={{
                            backgroundColor: isSpeaking ? '#EFF6FF' : '#F1F5F9',
                            color: isSpeaking ? '#2563EB' : '#475569',
                            border: '1px solid #CBD5E1',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          <span>{isSpeaking ? 'Stop Audio' : 'Play Audio'}</span>
                        </button>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{summary.spokenScript}"
                      </p>
                    </div>

                    {/* Recommended Immediate Action */}
                    <div style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '12px',
                      padding: '12px'
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>
                        Recommended Immediate Gate Check
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#991B1B', marginTop: '4px' }}>
                        {summary.recommendedFirstAction}
                      </div>
                    </div>

                    {/* Item Breakdown List */}
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Prioritized Items:
                    </div>
                    {summary.prioritizedItems.map((item, idx) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderLeft: `4px solid ${item.urgency === 'CRITICAL' ? '#EF4444' : item.urgency === 'HIGH' ? '#F59E0B' : '#0284C7'}`,
                          borderRadius: '8px',
                          padding: '10px 12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1E293B' }}>
                            #{idx + 1} {item.title}
                          </span>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: item.urgency === 'CRITICAL' ? '#FEE2E2' : item.urgency === 'HIGH' ? '#FEF3C7' : '#E0F2FE',
                            color: item.urgency === 'CRITICAL' ? '#B91C1C' : item.urgency === 'HIGH' ? '#B45309' : '#0369A1'
                          }}>
                            {item.urgency}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#0369A1', marginTop: '4px' }}>
                          👉 {item.recommendedAction}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => fetchSummary()} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Generate Summary
                  </button>
                )}
              </div>
            )}

            {/* ==================== INNER VIEW: TALK TO ME ==================== */}
            {activeTab === 'chat' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px' }}>
                <div
                  ref={chatScrollRef}
                  style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '10px' }}
                >
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        backgroundColor: msg.role === 'user' ? '#0C1838' : '#FFFFFF',
                        color: msg.role === 'user' ? '#FFFFFF' : '#1E293B',
                        border: msg.role === 'user' ? 'none' : '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        fontSize: '0.82rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      border: '1px solid #38BDF8',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                      boxShadow: '0 1px 4px rgba(56, 189, 248, 0.2)'
                    }}>
                      {streamingTokenBuffer || 'Reasoning...'}
                      <span className="streaming-cursor" style={{ backgroundColor: '#0284C7' }} />
                    </div>
                  )}
                </div>

                {/* Prompt Suggestions */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '6px 0' }}>
                  {[
                    "Which of these needs my attention first and why?",
                    "Inspect Level 2 Drone Video",
                    "Can I approve sensor specs?"
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setChatInput(chip);
                        sendChatMessage(chip);
                      }}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#475569',
                        borderRadius: '9999px',
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

                {/* Input Form */}
                <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="text"
                    placeholder="Ask about approvals queue..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isStreaming}
                    style={{
                      flex: 1,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#0F172A',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isStreaming}
                    style={{
                      backgroundColor: '#0C1838',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}

            {/* ==================== INNER VIEW: HELP ME ==================== */}
            {activeTab === 'help' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px' }}>
                <form onSubmit={handleAskHelp} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Ask operational policy question (e.g. drone altitude limit)..."
                    value={helpInput}
                    onChange={(e) => setHelpInput(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#0F172A',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!helpInput.trim() || isLoadingHelp}
                    style={{
                      backgroundColor: '#0C1838',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer'
                    }}
                  >
                    {isLoadingHelp ? <Sparkles size={14} className="animate-spin" /> : <HelpCircle size={14} />}
                  </button>
                </form>

                {/* Quick Policy Questions */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '12px' }}>
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
                        backgroundColor: '#FEF3C7',
                        border: '1px solid #FCD34D',
                        color: '#92400E',
                        borderRadius: '9999px',
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

                {/* Results List */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {helpEntries.map(entry => (
                    <div key={entry.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                        Q: {entry.query}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5, marginBottom: '8px' }}>
                        {entry.answer}
                      </p>
                      {entry.citations.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {entry.citations.map(c => (
                            <span key={c.code} style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600 }}>
                              📜 [{c.code}] {c.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {helpEntries.length === 0 && !isLoadingHelp && (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8', fontSize: '0.8rem' }}>
                      Ask any question regarding SOP compliance, turnaround SLAs, drone altitude ceilings, or sensor drift thresholds.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== INNER VIEW: TEACH ME ==================== */}
            {activeTab === 'teach' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px' }}>
                {currentTeachStep ? (
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {/* Step Dots */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                      {[1, 2, 3, 4].map(num => (
                        <button
                          key={num}
                          onClick={() => fetchTeachStep(num)}
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            borderRadius: '6px',
                            backgroundColor: currentTeachStep.stepNumber === num ? '#0C1838' : currentTeachStep.stepNumber > num ? '#D1FAE5' : '#E2E8F0',
                            color: currentTeachStep.stepNumber === num ? '#FFFFFF' : currentTeachStep.stepNumber > num ? '#065F46' : '#64748B',
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

                    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284C7', textTransform: 'uppercase' }}>
                        Operator Walkthrough
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>
                        {currentTeachStep.stepTitle}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5, marginTop: '6px' }}>
                        {currentTeachStep.instruction}
                      </p>

                      <div style={{
                        backgroundColor: '#F0F9FF',
                        border: '1px dashed #0284C7',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        color: '#0369A1',
                        marginTop: '10px'
                      }}>
                        🎯 <strong>UI Target:</strong> {currentTeachStep.uiTargetElement}
                      </div>
                    </div>

                    {/* Verification Checklist */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Checklist Verification:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {currentTeachStep.checklistVerification.map((check, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#334155' }}>
                            <CheckCircle size={13} color="#059669" />
                            <span>{check}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Follow-up adaptations history */}
                    {teachFollowUps.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284C7', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Adapted Follow-ups:
                        </div>
                        {teachFollowUps.map((fu, idx) => (
                          <div key={idx} style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 10px', borderRadius: '6px', marginBottom: '4px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E293B' }}>Q: {fu.question}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{fu.answer}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button
                        onClick={() => {
                          if (currentTeachStep.stepNumber < 4) {
                            fetchTeachStep(currentTeachStep.stepNumber + 1);
                          } else {
                            fetchTeachStep(1);
                          }
                        }}
                        style={{
                          backgroundColor: '#0C1838',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{currentTeachStep.stepNumber < 4 ? 'Next Step' : 'Restart Walkthrough'}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fetchTeachStep(1)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Start Operator Tutorial
                  </button>
                )}

                {/* Follow-up question form */}
                <form onSubmit={handleTeachFollowUp} style={{ display: 'flex', gap: '8px', marginTop: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                  <input
                    type="text"
                    placeholder="Ask follow-up question (adapts explanation)..."
                    value={teachQuestion}
                    onChange={(e) => setTeachQuestion(e.target.value)}
                    disabled={isLoadingTeach}
                    style={{
                      flex: 1,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#0F172A',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                  <button type="submit" disabled={!teachQuestion.trim() || isLoadingTeach} style={{ backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}>
                    <Send size={13} color="#475569" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* 4. Footer Bar (Matching Screenshot: 26 folders / items & HMS Panel ↗) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748B'
          }}>
            <span>{queue.length} folders / items</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <a
                href="#hms-panel"
                onClick={(e) => { e.preventDefault(); }}
                style={{
                  color: '#475569',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600
                }}
              >
                <span>HMS Panel</span>
                <ExternalLink size={12} />
              </a>

              {/* Diagonal resize corner grip lines */}
              <div style={{
                width: '8px',
                height: '8px',
                borderRight: '2px solid #CBD5E1',
                borderBottom: '2px solid #CBD5E1',
                cursor: 'se-resize'
              }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
