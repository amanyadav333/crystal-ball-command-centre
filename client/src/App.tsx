import React from 'react';
import { DashboardHeader } from './components/DashboardHeader';
import { SidebarNav } from './components/SidebarNav';
import { ApprovalsTable } from './components/ApprovalsTable';
import { ItemInspectorModal } from './components/ItemInspectorModal';
import { ApprovalsAssistantPanel } from './components/ApprovalsAssistantPanel';

export const App: React.FC = () => {
  return (
    <div className="digital-twin-grid" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DashboardHeader />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <SidebarNav />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ApprovalsTable />
        </main>
      </div>

      {/* Asset Inspection Drawer / Modal */}
      <ItemInspectorModal />

      {/* Approvals Assistant Widget (Target UI in lower-right) */}
      <ApprovalsAssistantPanel />
    </div>
  );
};

export default App;
