import React from 'react';
import {
  LayoutDashboard,
  Layers,
  FileCheck,
  Cpu,
  Video,
  Radio,
  Sliders,
  HelpCircle
} from 'lucide-react';

export const SidebarNav: React.FC = () => {
  return (
    <aside style={{
      width: '68px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
      gap: '24px',
      height: 'calc(100vh - 61px)'
    }}>
      <button className="btn-icon" title="Dashboard Home">
        <LayoutDashboard size={20} />
      </button>

      <button className="btn-icon" title="Digital Twin Layers">
        <Layers size={20} />
      </button>

      {/* Active Tab: Approvals */}
      <button
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'rgba(0, 240, 255, 0.15)',
          border: '1px solid var(--accent-cyan)',
          color: 'var(--accent-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)'
        }}
        title="Approvals & Review (Active)"
      >
        <FileCheck size={22} />
      </button>

      <button className="btn-icon" title="Autonomous Drone Patrols">
        <Video size={20} />
      </button>

      <button className="btn-icon" title="Sensor Mesh Network">
        <Cpu size={20} />
      </button>

      <button className="btn-icon" title="Telemetry Feeds">
        <Radio size={20} />
      </button>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <button className="btn-icon" title="System Settings">
          <Sliders size={20} />
        </button>
        <button className="btn-icon" title="Help & Documentation">
          <HelpCircle size={20} />
        </button>
      </div>
    </aside>
  );
};
