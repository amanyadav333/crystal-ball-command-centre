import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Sparkles,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useApprovalsStore } from '../store/useApprovalsStore';

export const ItemInspectorModal: React.FC = () => {
  const {
    selectedItem,
    setSelectedItem,
    updateItemStatus,
    setActiveTab,
    setAssistantOpen,
    askHelpQuestion
  } = useApprovalsStore();

  const [notes, setNotes] = useState('');

  if (!selectedItem) return null;

  const handleApprove = () => {
    updateItemStatus(selectedItem.id, 'Approved', notes || 'Approved after operational gate inspection');
    setSelectedItem(null);
  };

  const handleReject = () => {
    updateItemStatus(selectedItem.id, 'Rejected', notes || 'Rejected per SOP compliance guidelines');
    setSelectedItem(null);
  };

  const handleAskAICopilot = () => {
    setAssistantOpen(true);
    setActiveTab('chat');
  };

  const handleCheckSOP = () => {
    setAssistantOpen(true);
    setActiveTab('help');
    askHelpQuestion(`What are the review requirements and SOP thresholds for ${selectedItem.item}?`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '680px',
        maxWidth: '100%',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-widget)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              backgroundColor: 'rgba(0, 240, 255, 0.1)',
              color: 'var(--accent-cyan)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)'
            }}>
              {selectedItem.id}
            </span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>
              {selectedItem.item}
            </h2>
          </div>

          <button
            onClick={() => setSelectedItem(null)}
            className="btn-icon"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Asset Type</div>
              <div style={{ fontWeight: 600, marginTop: '4px', color: '#F8FAFC' }}>{selectedItem.type}</div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submitted By</div>
              <div style={{ fontWeight: 600, marginTop: '4px', color: '#F8FAFC' }}>{selectedItem.submittedBy}</div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Urgency Level</div>
              <div style={{ fontWeight: 600, marginTop: '4px', color: selectedItem.urgency === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                {selectedItem.urgency} ({selectedItem.riskLevel})
              </div>
            </div>
          </div>

          {/* Operational Details Callout */}
          <div style={{
            backgroundColor: 'rgba(0, 240, 255, 0.04)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.85rem' }}>
              <AlertTriangle size={16} />
              <span>Inspection Summary & Telemetry Findings</span>
            </div>
            <p style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {selectedItem.details}
            </p>
          </div>

          {/* Suggested Gate Action */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Required Verification Checklist
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              {selectedItem.suggestedAction}
            </div>
          </div>

          {/* AI Assistance Handoff Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={handleAskAICopilot}
              className="btn-ghost"
              style={{ flex: 1, borderColor: 'rgba(0, 240, 255, 0.4)', color: 'var(--accent-cyan)' }}
            >
              <Sparkles size={14} />
              <span>Ask Copilot About This Asset</span>
            </button>

            <button
              onClick={handleCheckSOP}
              className="btn-ghost"
              style={{ flex: 1 }}
            >
              <Shield size={14} />
              <span>Check Governing SOP Policy</span>
            </button>
          </div>

          {/* Reviewer Note Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Operator Ledger Notes & Justification
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter audit signoff notes or cite specific SOP code for rejection (e.g. SOP-102.3)..."
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setSelectedItem(null)}
            className="btn-ghost"
          >
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleReject}
              className="btn-ghost"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: 'var(--accent-rose)'
              }}
            >
              <XCircle size={16} />
              <span>Reject Asset</span>
            </button>

            <button
              onClick={handleApprove}
              className="btn-primary"
            >
              <CheckCircle2 size={16} />
              <span>Approve & Commit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
