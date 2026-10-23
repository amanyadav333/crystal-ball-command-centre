import React, { useEffect } from 'react';
import {
  Folder,
  Video,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Eye,
  AlertOctagon,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useApprovalsStore, ApprovalItem } from '../store/useApprovalsStore';

export const ApprovalsTable: React.FC = () => {
  const {
    queue,
    isLoadingQueue,
    fetchQueue,
    updateItemStatus,
    setSelectedItem,
    searchFilter,
    urgencyFilter,
    setUrgencyFilter,
    setActiveTab,
    setAssistantOpen
  } = useApprovalsStore();

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const filteredQueue = queue.filter(item => {
    const matchesSearch = item.item.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          item.submittedBy.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          item.type.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesUrgency = urgencyFilter === 'ALL' || item.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'Folder': return <Folder size={18} color="#60A5FA" />;
      case 'Video': return <Video size={18} color="#F87171" />;
      case 'PDF': return <FileText size={18} color="#FBBF24" />;
      case 'Image': return <ImageIcon size={18} color="#34D399" />;
      default: return <FileText size={18} color="#94A3B8" />;
    }
  };

  const pendingCount = queue.filter(q => q.status === 'Pending Review').length;
  const criticalCount = queue.filter(q => q.status === 'Pending Review' && q.urgency === 'CRITICAL').length;
  const approvedCount = queue.filter(q => q.status === 'Approved').length;

  return (
    <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
      {/* Title & Quick Stats Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#F8FAFC' }}>
              Approvals & Review
            </h1>
            <span style={{
              background: 'rgba(0, 240, 255, 0.12)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: 'var(--radius-full)',
              padding: '2px 10px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {pendingCount} PENDING
            </span>
            <button
              onClick={() => fetchQueue()}
              className="btn-icon"
              title="Refresh Queue"
            >
              <RefreshCw size={15} className={isLoadingQueue ? 'animate-spin' : ''} />
            </button>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Evaluate and verify operational digital-twin assets, telemetry streams, and compliance specifications.
          </p>
        </div>

        {/* Action button to open AI Copilot */}
        <button
          onClick={() => {
            setAssistantOpen(true);
            setActiveTab('summary');
          }}
          className="btn-primary"
          style={{ padding: '9px 18px' }}
        >
          <Sparkles size={16} />
          <span>Present AI Summary</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>PENDING REVIEW</span>
            <Clock size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#F8FAFC' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '4px' }}>
            Active turnaround gate
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderColor: criticalCount > 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>CRITICAL RISKS</span>
            <AlertOctagon size={16} color="var(--accent-rose)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: criticalCount > 0 ? 'var(--accent-rose)' : '#F8FAFC' }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: criticalCount > 0 ? '#FCA5A5' : 'var(--text-muted)', marginTop: '4px' }}>
            {criticalCount > 0 ? 'Requires immediate gate action' : 'No critical alerts'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>APPROVED</span>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#F8FAFC' }}>
            {approvedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>
            Committed to live twin
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>SOP GOVERNANCE</span>
            <Sparkles size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-cyan)' }}>
            SOP 101-105
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Grounded RAG active
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(level => (
            <button
              key={level}
              onClick={() => setUrgencyFilter(level)}
              style={{
                background: urgencyFilter === level ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: urgencyFilter === level ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: `1px solid ${urgencyFilter === level ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {level === 'ALL' ? 'All Urgencies' : `${level}`}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filteredQueue.length} of {queue.length} items
        </span>
      </div>

      {/* Approvals Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              <th style={{ padding: '14px 20px' }}>Item Name</th>
              <th style={{ padding: '14px 16px' }}>Type</th>
              <th style={{ padding: '14px 16px' }}>Submitted By</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px' }}>Urgency</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.map(item => {
              const isApproved = item.status === 'Approved';
              const isRejected = item.status === 'Rejected';
              const isCritical = item.urgency === 'CRITICAL';

              return (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: isCritical && item.status === 'Pending Review'
                      ? 'rgba(239, 68, 68, 0.05)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isCritical && item.status === 'Pending Review'
                      ? 'rgba(239, 68, 68, 0.05)'
                      : 'transparent';
                  }}
                >
                  {/* Item Name & Details */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getItemIcon(item.type)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.item}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.summary}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td style={{ padding: '16px 16px', color: 'var(--text-secondary)' }}>
                    <span style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {item.type}
                    </span>
                  </td>

                  {/* Submitted By */}
                  <td style={{ padding: '16px 16px' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.submittedBy}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sep 18, 2026</div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '16px 16px' }}>
                    {isApproved ? (
                      <span className="badge badge-approved">
                        <CheckCircle2 size={12} /> Approved
                      </span>
                    ) : isRejected ? (
                      <span className="badge badge-rejected">
                        <XCircle size={12} /> Rejected
                      </span>
                    ) : (
                      <span className="badge badge-amber">
                        <Clock size={12} /> Pending Review
                      </span>
                    )}
                  </td>

                  {/* Urgency */}
                  <td style={{ padding: '16px 16px' }}>
                    {item.urgency === 'CRITICAL' && (
                      <span className="badge badge-critical">
                        <AlertOctagon size={12} /> Critical
                      </span>
                    )}
                    {item.urgency === 'HIGH' && (
                      <span className="badge badge-high">High</span>
                    )}
                    {item.urgency === 'MEDIUM' && (
                      <span className="badge badge-medium">Medium</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px 20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="btn-ghost"
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        title="Inspect asset details"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>

                      {item.status === 'Pending Review' && (
                        <>
                          <button
                            onClick={() => updateItemStatus(item.id, 'Approved', 'Quick approved via queue row')}
                            className="btn-ghost"
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.75rem',
                              borderColor: 'rgba(16, 185, 129, 0.4)',
                              color: 'var(--accent-emerald)'
                            }}
                            title="Approve asset"
                          >
                            <CheckCircle2 size={13} />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => updateItemStatus(item.id, 'Rejected', 'Rejected pending SOP revisions')}
                            className="btn-ghost"
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.75rem',
                              borderColor: 'rgba(239, 68, 68, 0.4)',
                              color: 'var(--accent-rose)'
                            }}
                            title="Reject asset"
                          >
                            <XCircle size={13} />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
