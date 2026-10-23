import React from 'react';
import { DashboardHeader } from './components/DashboardHeader';
import { SidebarNav } from './components/SidebarNav';
import { ApprovalsTable } from './components/ApprovalsTable';
import { AssetInspectorCard } from './components/AssetInspectorCard';
import { FooterBar } from './components/FooterBar';
import { ApprovalsAssistantPanel } from './components/ApprovalsAssistantPanel';

export const App: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#F5F7FA',
      color: '#334155',
      overflow: 'hidden'
    }}>
      {/* 1. Top Navigation Bar */}
      <DashboardHeader />

      {/* 2. Middle Body: Left Sidebar + Two-Column Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <SidebarNav />

        <main style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.95fr)',
          gap: '20px',
          padding: '20px 24px',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {/* Left Column: Approvals & Review Table */}
          <div style={{ minWidth: 0 }}>
            <ApprovalsTable />
          </div>

          {/* Right Column: Asset Snapshot & Inspector Card */}
          <div style={{ minWidth: 0 }}>
            <AssetInspectorCard />
          </div>
        </main>
      </div>

      {/* 3. Bottom Footer Bar */}
      <FooterBar />

      {/* 4. Target UI: Approvals Assistant Panel (Floating in Lower Right) */}
      <ApprovalsAssistantPanel />
    </div>
  );
};

export default App;
