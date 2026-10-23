import React from 'react';

export const FooterBar: React.FC = () => {
  return (
    <footer style={{
      height: '36px',
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      fontSize: '0.75rem',
      color: '#64748B',
      flexShrink: 0
    }}>
      {/* Status indicator on bottom left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: '#10B981',
          display: 'inline-block'
        }} />
        <span style={{ fontWeight: 500 }}>Ready</span>
      </div>

      {/* Copyright in center */}
      <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>
        &copy; 2026 OomniEye. All rights reserved.
      </div>

      {/* Right spacer */}
      <div style={{ width: '80px' }} />
    </footer>
  );
};
