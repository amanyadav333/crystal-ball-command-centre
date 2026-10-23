import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Info,
  Search,
  Filter,
  Layers,
  Folder,
  Video,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Check,
  X as CloseIcon
} from 'lucide-react';
import { useApprovalsStore } from '../store/useApprovalsStore';

export const ApprovalsTable: React.FC = () => {
  const {
    queue,
    fetchQueue,
    selectedItem,
    setSelectedItem,
    searchFilter,
    setSearchFilter,
    updateItemStatus
  } = useApprovalsStore();

  const [viewMode, setViewMode] = useState<'queue' | 'hierarchy'>('queue');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Default select first item if none selected
  useEffect(() => {
    if (!selectedItem && queue.length > 0) {
      setSelectedItem(queue[0]);
    }
  }, [queue, selectedItem, setSelectedItem]);

  const filteredQueue = queue.filter(item => {
    return item.item.toLowerCase().includes(searchFilter.toLowerCase()) ||
           item.submittedBy.toLowerCase().includes(searchFilter.toLowerCase()) ||
           item.type.toLowerCase().includes(searchFilter.toLowerCase());
  });

  const getSubPath = (item: string) => {
    if (item.includes('Site Patrol')) return 'My Site Patrol › My Site Patrol Card';
    if (item.includes('Drone Patrol')) return 'Drawing-Videos › Drawing-Videos Card';
    if (item.includes('Safety Equipment')) return 'Site Recordings › Site Recordings';
    return 'Site Recordings › Site Recordings';
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'Folder':
        return (
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Folder size={16} color="#D97706" />
          </div>
        );
      case 'Video':
        return (
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Video size={16} color="#DC2626" />
          </div>
        );
      case 'PDF':
        return (
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileText size={16} color="#2563EB" />
          </div>
        );
      case 'Image':
        return (
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#ECFDF5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ImageIcon size={16} color="#059669" />
          </div>
        );
      default:
        return <Folder size={16} color="#64748B" />;
    }
  };

  const pendingCount = queue.filter(q => q.status === 'Pending Review').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Header Row: Back to Dashboard + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          className="btn-pill-ghost"
          onClick={() => {}}
          title="Back to digital twin overview"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#0F172A',
            letterSpacing: '-0.01em'
          }}>
            Approvals & Review
          </h1>
          <button style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
            <Info size={17} />
          </button>
        </div>
      </div>

      {/* 2. Global Search Input Bar */}
      <div style={{ position: 'relative', width: '100%' }}>
        <Search
          size={16}
          color="#94A3B8"
          style={{ position: 'absolute', left: '14px', top: '12px' }}
        />
        <input
          type="text"
          placeholder="Search approvals by title, author, folder, or page..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '10px 16px 10px 40px',
            fontSize: '0.85rem',
            color: '#0F172A',
            outline: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#8B5CF6'}
          onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
        />
      </div>

      {/* 3. Approvals Table Card */}
      <div className="dashboard-card" style={{ overflow: 'hidden' }}>
        {/* Table Top Toolbar */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF'
        }}>
          {/* Left Title + Items Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8B5CF6' }}>
              <Filter size={15} />
            </div>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#0F172A',
              textTransform: 'uppercase'
            }}>
              Pending Approval Requests
            </span>
            <span style={{
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              border: '1px solid #DBEAFE'
            }}>
              {pendingCount} items
            </span>
          </div>

          {/* Right View Switcher (Queue View vs Hierarchy View) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setViewMode('queue')}
              style={{
                backgroundColor: viewMode === 'queue' ? '#F1F5F9' : 'transparent',
                color: viewMode === 'queue' ? '#0F172A' : '#64748B',
                border: viewMode === 'queue' ? '1px solid #CBD5E1' : '1px solid transparent',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '12px',
                height: '8px',
                borderTop: '2px solid currentColor',
                borderBottom: '2px solid currentColor'
              }} />
              <span>Queue View</span>
            </button>

            <button
              onClick={() => setViewMode('hierarchy')}
              style={{
                backgroundColor: viewMode === 'hierarchy' ? '#F1F5F9' : 'transparent',
                color: viewMode === 'hierarchy' ? '#0F172A' : '#64748B',
                border: viewMode === 'hierarchy' ? '1px solid #CBD5E1' : '1px solid transparent',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <Layers size={13} />
              <span>Hierarchy View</span>
            </button>
          </div>
        </div>

        {/* Table Head & Body */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid #E2E8F0',
                color: '#64748B',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                backgroundColor: '#F8FAFC'
              }}>
                <th style={{ padding: '12px 20px', width: '38%' }}>Folder / Content Name</th>
                <th style={{ padding: '12px 14px' }}>Type</th>
                <th style={{ padding: '12px 14px' }}>Submitted By</th>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.map(item => {
                const isSelected = selectedItem?.id === item.id;
                const isPending = item.status === 'Pending Review';

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#FAF5FF' : '#FFFFFF',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '4px solid #8B5CF6' : '4px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    {/* Item Name & Folder Path */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {getItemIcon(item.type)}
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontWeight: 600,
                            color: '#0F172A',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '240px'
                          }}>
                            {item.item}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                            {getSubPath(item.item)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type Badge with subtle outline */}
                    <td style={{ padding: '14px 14px' }}>
                      <span className="pill-badge badge-type">
                        {item.type === 'Folder' && <Folder size={11} />}
                        {item.type === 'Video' && <Video size={11} />}
                        {item.type === 'PDF' && <FileText size={11} />}
                        {item.type === 'Image' && <ImageIcon size={11} />}
                        <span>{item.type === 'PDF' ? 'Pdf' : item.type}</span>
                      </span>
                    </td>

                    {/* Submitter */}
                    <td style={{ padding: '14px 14px', color: '#334155', fontWeight: 500 }}>
                      {item.submittedBy}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px 14px', color: '#64748B', fontSize: '0.75rem' }}>
                      Sep 18
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 14px' }}>
                      {isPending ? (
                        <span className="pill-badge badge-pending">
                          Pending Review
                        </span>
                      ) : item.status === 'Approved' ? (
                        <span className="pill-badge badge-approved">
                          Approved
                        </span>
                      ) : (
                        <span className="pill-badge badge-rejected">
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Actions Menu */}
                    <td
                      style={{ padding: '14px 16px', textAlign: 'right', position: 'relative' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        className="btn-icon-subtle"
                        style={{ padding: '4px' }}
                        title="Row Actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div style={{
                          position: 'absolute',
                          right: '16px',
                          top: '40px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                          padding: '6px',
                          width: '140px',
                          zIndex: 30,
                          textAlign: 'left'
                        }}>
                          <button
                            onClick={() => {
                              updateItemStatus(item.id, 'Approved', 'Approved via table menu');
                              setActiveMenuId(null);
                            }}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              border: 'none',
                              background: 'transparent',
                              borderRadius: '4px',
                              color: '#059669',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Check size={13} />
                            <span>Approve Asset</span>
                          </button>
                          <button
                            onClick={() => {
                              updateItemStatus(item.id, 'Rejected', 'Rejected per SOP audit');
                              setActiveMenuId(null);
                            }}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              border: 'none',
                              background: 'transparent',
                              borderRadius: '4px',
                              color: '#DC2626',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <CloseIcon size={13} />
                            <span>Reject Asset</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
