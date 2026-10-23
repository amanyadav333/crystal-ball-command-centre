import React from 'react';
import {
  Boxes,
  Bell,
  Search,
  Activity,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useApprovalsStore } from '../store/useApprovalsStore';

export const DashboardHeader: React.FC = () => {
  const {
    searchFilter,
    setSearchFilter,
    simulateTimeout,
    setSimulateTimeout,
    simulateError,
    setSimulateError,
    resetAll
  } = useApprovalsStore();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand & Digital Twin Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00F0FF 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
          }}>
            <Boxes size={22} color="#0B0F19" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em', color: '#F8FAFC' }}>
              OomniEye
            </div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-cyan)', fontWeight: 600 }}>
              Digital Twin Solutions
            </div>
          </div>
        </div>

        {/* Live Telemetry Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <div className="pulse-beacon" />
          <span>Spatial Twin Engine: <strong>Sync Active (12 Nodes)</strong></span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div style={{
        position: 'relative',
        width: '380px'
      }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
        <input
          type="text"
          placeholder="Search approvals by title, author, folder, or page..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 16px 8px 36px',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-cyan)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
        />
      </div>

      {/* Evaluator Controls & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Reviewer Simulation Toolbar (for testing 8s timeout & graceful degradation) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <button
            onClick={() => setSimulateTimeout(!simulateTimeout)}
            title="Simulate 8-Second LLM Timeout to verify fallback handling"
            style={{
              background: simulateTimeout ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
              color: simulateTimeout ? '#FCD34D' : 'var(--text-muted)',
              border: `1px solid ${simulateTimeout ? 'rgba(245, 158, 11, 0.5)' : 'transparent'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '3px 8px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <AlertTriangle size={12} />
            {simulateTimeout ? 'Timeout Simulated (>8s)' : 'Simulate Timeout'}
          </button>

          <button
            onClick={() => setSimulateError(!simulateError)}
            title="Simulate LLM Provider Offline / Missing API Key"
            style={{
              background: simulateError ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
              color: simulateError ? '#FCA5A5' : 'var(--text-muted)',
              border: `1px solid ${simulateError ? 'rgba(239, 68, 68, 0.5)' : 'transparent'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '3px 8px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {simulateError ? 'LLM Offline (Simulated)' : 'Simulate LLM Down'}
          </button>

          <button
            onClick={() => resetAll()}
            title="Reset queue and assistant state to default mock dataset"
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={18} color="var(--text-secondary)" />
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: 'var(--accent-cyan)',
            color: '#000',
            fontSize: '0.65rem',
            fontWeight: 800,
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>3</span>
        </div>

        {/* Operator Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid var(--border-subtle)' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981, #065F46)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8rem',
            color: '#fff',
            border: '2px solid rgba(16, 185, 129, 0.4)'
          }}>
            AY
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Aman Yadav</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lead Inspector</div>
          </div>
        </div>

        {/* + Add help button matching reference product screenshot */}
        <button
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)'
          }}
          title="Add Operational SOP Knowledge Note"
        >
          <span>+ Add help</span>
        </button>
      </div>
    </header>
  );
};
