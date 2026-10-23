import React from 'react';
import {
  FolderKanban,
  LayoutGrid,
  UserCheck,
  Share2,
  Ticket,
  Building2,
  BarChart3,
  FlaskConical
} from 'lucide-react';

export const SidebarNav: React.FC = () => {
  return (
    <aside style={{
      width: '58px',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px 0',
      gap: '20px',
      height: 'calc(100vh - 62px)',
      flexShrink: 0
    }}>
      {/* 1. Project / Layers Icon */}
      <button className="btn-icon-subtle" title="Projects & Digital Twin Workspaces" style={{ color: '#475569' }}>
        <FolderKanban size={20} />
      </button>

      {/* 2. Grid Dashboard Icon (Active / Blue) */}
      <button
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          color: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Approvals & Review Workspace (Active)"
      >
        <LayoutGrid size={20} />
      </button>

      {/* 3. Humanoid / Field Patrols (Cyan) */}
      <button className="btn-icon-subtle" title="Field Patrols & Personnel" style={{ color: '#06B6D4' }}>
        <UserCheck size={20} />
      </button>

      {/* 4. Collaboration Mesh (Pink) */}
      <button className="btn-icon-subtle" title="Collaboration & Multi-Operator Mesh" style={{ color: '#EC4899' }}>
        <Share2 size={20} />
      </button>

      {/* 5. Ticket / SLA Gate (Green) */}
      <button className="btn-icon-subtle" title="SLA Compliance & Passes" style={{ color: '#10B981' }}>
        <Ticket size={20} />
      </button>

      {/* 6. Warehouse Spatial Model (Amber) */}
      <button className="btn-icon-subtle" title="Warehouse 3D Digital Model" style={{ color: '#F59E0B' }}>
        <Building2 size={20} />
      </button>

      {/* 7. Analytics & Telemetry (Purple) */}
      <button className="btn-icon-subtle" title="Telemetry Analytics" style={{ color: '#8B5CF6' }}>
        <BarChart3 size={20} />
      </button>

      {/* 8. Experimental Labs (Rose) */}
      <button className="btn-icon-subtle" title="Simulations & Diagnostics" style={{ color: '#F43F5E' }}>
        <FlaskConical size={20} />
      </button>
    </aside>
  );
};
