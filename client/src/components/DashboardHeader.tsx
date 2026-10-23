import React, { useState } from 'react';
import {
  History,
  RotateCw,
  Maximize2,
  MessageSquare,
  Users,
  Settings,
  Bell,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useApprovalsStore } from '../store/useApprovalsStore';

export const DashboardHeader: React.FC = () => {
  const {
    simulateTimeout,
    setSimulateTimeout,
    simulateError,
    setSimulateError,
    resetAll,
    fetchQueue,
    fetchGreeting,
    setAssistantOpen,
    setActiveTab
  } = useApprovalsStore();

  const [showSimMenu, setShowSimMenu] = useState(false);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '62px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand: OomniEye DIGITAL TWIN SOLUTIONS */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#0C1838',
          letterSpacing: '-0.02em',
          lineHeight: 1.1
        }}>
          OomniEye
        </div>
        <div style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          color: '#64748B',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginTop: '2px'
        }}>
          Digital Twin Solutions
        </div>
      </div>

      {/* Right Toolbar Actions matching reference screenshot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Tool Icons: History, Refresh, Maximize, Message */}
        <button
          className="btn-icon-subtle"
          title="Audit History"
          onClick={() => fetchGreeting()}
        >
          <History size={18} />
        </button>

        <button
          className="btn-icon-subtle"
          title="Refresh Queue"
          onClick={() => {
            fetchQueue();
            fetchGreeting();
          }}
        >
          <RotateCw size={18} />
        </button>

        <button
          className="btn-icon-subtle"
          title="Toggle Fullscreen"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen?.();
            } else {
              document.exitFullscreen?.();
            }
          }}
        >
          <Maximize2 size={17} />
        </button>

        <button
          className="btn-icon-subtle"
          title="Live Discussion"
          onClick={() => {
            setAssistantOpen(true);
            setActiveTab('chat');
          }}
        >
          <MessageSquare size={18} />
        </button>

        {/* Collaboration icon with badge 3 */}
        <div style={{ position: 'relative', cursor: 'pointer' }} title="Active Operators (3 Online)">
          <button className="btn-icon-subtle" style={{ padding: '6px' }}>
            <Users size={19} />
          </button>
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            fontSize: '0.62rem',
            fontWeight: 800,
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            3
          </span>
        </div>

        <button className="btn-icon-subtle" title="Settings">
          <Settings size={18} />
        </button>

        {/* Notification Bell with red alert dot */}
        <div style={{ position: 'relative', cursor: 'pointer' }} title="Pending Alerts">
          <button className="btn-icon-subtle" style={{ padding: '6px' }}>
            <Bell size={18} />
          </button>
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: '#EF4444',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            boxShadow: '0 0 4px #EF4444'
          }} />
        </div>

        {/* Evaluator Simulation Menu Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSimMenu(!showSimMenu)}
            style={{
              backgroundColor: simulateTimeout || simulateError ? '#FEF3C7' : '#F1F5F9',
              color: simulateTimeout || simulateError ? '#92400E' : '#475569',
              border: `1px solid ${simulateTimeout || simulateError ? '#F59E0B' : '#E2E8F0'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Evaluator Failure Simulation Controls (§6)"
          >
            <AlertTriangle size={12} color={simulateTimeout || simulateError ? '#D97706' : '#64748B'} />
            <span>{simulateTimeout ? 'Timeout Mode' : simulateError ? 'LLM Down' : 'Simulate'}</span>
          </button>

          {showSimMenu && (
            <div style={{
              position: 'absolute',
              top: '34px',
              right: 0,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '8px',
              width: '210px',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', padding: '2px 4px' }}>
                JD Failure Tests (§6)
              </div>
              <button
                onClick={() => {
                  setSimulateTimeout(!simulateTimeout);
                  setShowSimMenu(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  backgroundColor: simulateTimeout ? '#FEF3C7' : 'transparent',
                  color: simulateTimeout ? '#92400E' : '#334155',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {simulateTimeout ? '✓ Timeout (>8s) Active' : 'Simulate 8s Timeout'}
              </button>
              <button
                onClick={() => {
                  setSimulateError(!simulateError);
                  setShowSimMenu(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  backgroundColor: simulateError ? '#FEE2E2' : 'transparent',
                  color: simulateError ? '#991B1B' : '#334155',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {simulateError ? '✓ LLM Offline Active' : 'Simulate LLM Offline'}
              </button>
              <button
                onClick={() => {
                  resetAll();
                  setShowSimMenu(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  color: '#64748B',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={12} />
                <span>Reset to Seed Data</span>
              </button>
            </div>
          )}
        </div>

        {/* User Profile Avatar with letter 'R' */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#F59E0B',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)',
            cursor: 'pointer'
          }}
          title="Reviewer Profile (R)"
        >
          R
        </div>

        {/* + Add help button (Purple gradient matching screenshot) */}
        <button
          onClick={() => {
            setAssistantOpen(true);
            setActiveTab('help');
          }}
          className="btn-purple"
          title="Open SOP Help Guidance"
        >
          <span>+ Add help</span>
        </button>
      </div>
    </header>
  );
};
