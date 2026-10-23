import React, { useState } from 'react';
import {
  Eye,
  FolderOpen,
  Crosshair,
  CheckCircle2,
  XCircle,
  FileCheck
} from 'lucide-react';
import { useApprovalsStore } from '../store/useApprovalsStore';

export const AssetInspectorCard: React.FC = () => {
  const { selectedItem, updateItemStatus, queue } = useApprovalsStore();
  const [activeTab, setActiveTab] = useState<'snapshot' | 'media'>('snapshot');

  const activeItem = selectedItem || queue[0];
  if (!activeItem) return null;

  const isPending = activeItem.status === 'Pending Review';

  return (
    <div className="dashboard-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* 1. Header & Breadcrumb */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginBottom: '4px' }}>
          My Site Patrol &gt; My Site Patrol Card &gt; {activeItem.item.slice(0, 16)}...
        </div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
          {activeItem.item}
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px', lineHeight: 1.4 }}>
          {activeItem.summary}
        </p>

        {/* Tab Switcher: Snapshot & Control / Media & Content */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button
            onClick={() => setActiveTab('snapshot')}
            style={{
              backgroundColor: activeTab === 'snapshot' ? '#F1F5F9' : '#FFFFFF',
              color: activeTab === 'snapshot' ? '#0F172A' : '#64748B',
              border: activeTab === 'snapshot' ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
              borderRadius: '9999px',
              padding: '5px 14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Eye size={13} />
            <span>Snapshot &amp; Control</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            style={{
              backgroundColor: activeTab === 'media' ? '#F1F5F9' : '#FFFFFF',
              color: activeTab === 'media' ? '#0F172A' : '#64748B',
              border: activeTab === 'media' ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
              borderRadius: '9999px',
              padding: '5px 14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FolderOpen size={13} />
            <span>Media / Content</span>
          </button>
        </div>
      </div>

      {/* 2. Middle Snapshot Content View */}
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
        {activeTab === 'snapshot' ? (
          <div>
            {/* Snapshot Section Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B5CF6', marginBottom: '10px' }}>
              <Crosshair size={16} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Screen Snapshot Target
              </span>
            </div>

            {/* Embedded Digital Twin Viewport Image */}
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              backgroundColor: '#0F172A',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              position: 'relative'
            }}>
              <img
                src="/assets/screen_snapshot.jpg"
                alt="Digital Twin Screen Snapshot"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />

              {/* Status Overlay Badge */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#38BDF8',
                backdropFilter: 'blur(4px)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}>
                Telemetry: Live Feed Sync
              </div>
            </div>

            {/* Quick Decision Action Strip */}
            {isPending && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '10px 14px',
                marginTop: '12px'
              }}>
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                  Take immediate decision on this asset:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => updateItemStatus(activeItem.id, 'Approved', 'Approved from snapshot inspection panel')}
                    style={{
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => updateItemStatus(activeItem.id, 'Rejected', 'Rejected pending revised telemetry sync')}
                    style={{
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <XCircle size={13} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '16px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Operational Asset Artifacts &amp; Telemetry
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
              {activeItem.details}
            </div>
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              borderRadius: '8px',
              padding: '10px 12px',
              marginTop: '12px',
              fontSize: '0.75rem',
              color: '#1E40AF'
            }}>
              <strong>Suggested Verification Gate:</strong> {activeItem.suggestedAction}
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer Note matching reference screen */}
      <div style={{
        padding: '10px 20px',
        borderTop: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        fontSize: '0.72rem',
        color: '#64748B'
      }}>
        Help Admin View — Approvals and rejections are recorded in the compliance audit ledger.
      </div>
    </div>
  );
};
