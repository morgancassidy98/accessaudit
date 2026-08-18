'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Criterion } from '@/lib/wcag-criteria';
import { ContrastChecker } from './ContrastChecker';

type Result = {
  id: string;
  status: string;
  severity: string | null;
  notes: string;
  automatedStatus: string | null;
  automatedSource: string | null;
};

type LighthouseAudit = {
  id: string;
  data: {
    title: string;
    description: string;
    score: number;
    displayValue?: string;
  };
};

const methodIcon = (method: string) => {
  switch (method) {
    case 'keyboard':      return { icon: '⌨', label: 'Keyboard',     color: '#2D5D7B', bg: '#e8f1f7' };
    case 'screen_reader': return { icon: '🔊', label: 'Screen Reader', color: '#5a3d7a', bg: '#f0eaf7' };
    case 'visual':        return { icon: '👁', label: 'Visual',        color: '#3a6b2a', bg: '#f0f5ee' };
    case 'automated':     return { icon: '🤖', label: 'Automated',     color: '#7b652d', bg: '#faf5ea' };
    case 'manual':        return { icon: '📋', label: 'Manual',        color: '#555',    bg: '#f0f0f0' };
    default:              return { icon: '📋', label: method,          color: '#555',    bg: '#f0f0f0' };
  }
};

export function CriterionCard({
  criterion,
  result,
  lighthouseAudits,
  allCriteria,
  auditId,
  pageId,
}: {
  criterion: Criterion;
  result: Result;
  lighthouseAudits: LighthouseAudit[];
  allCriteria: Criterion[];
  auditId: string;
  pageId: string;
}) {
  const router = useRouter();
  const [status, setStatus]     = useState(result?.status ?? 'untested');
  const [severity, setSeverity] = useState(result?.severity ?? '');
  const [notes, setNotes]       = useState(result?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('');

  // Reset state when criterion changes
  useEffect(() => {
    setStatus(result?.status ?? 'untested');
    setSeverity(result?.severity ?? '');
    setNotes(result?.notes ?? '');
    setLastSaved('');
  }, [criterion.id, result]);

  const save = useCallback(async (
    newStatus: string,
    newSeverity: string,
    newNotes: string
  ) => {
    if (!result?.id) return;
    setIsSaving(true);
    try {
      await fetch(`/api/results/${result.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          severity: newSeverity || null,
          notes: newNotes,
        }),
      });
      setLastSaved('Saved');
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }, [result?.id, router]);

  const handleStatus = (newStatus: string) => {
    setStatus(newStatus);
    if (newStatus !== 'fail') setSeverity('');
    save(newStatus, newStatus !== 'fail' ? '' : severity, notes);
  };

  const handleSeverity = (newSeverity: string) => {
    setSeverity(newSeverity);
    save(status, newSeverity, notes);
  };

  // Auto-save notes after 1 second of no typing
  useEffect(() => {
    if (!result?.id) return;
    const timer = setTimeout(() => {
      save(status, severity, notes);
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case '1': handleStatus('pass'); break;
        case '2': handleStatus('fail'); break;
        case '3': handleStatus('na'); break;
        case '4': handleStatus('untested'); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, severity, notes]);

  // Prev/next navigation
  const currentIndex = allCriteria.findIndex((c) => c.id === criterion.id);
  const prevCriterion = allCriteria[currentIndex - 1];
  const nextCriterion = allCriteria[currentIndex + 1];

  // Unique tools used by this criterion
  const uniqueTools = criterion.tools.filter(
    (tool, index, self) => index === self.findIndex((t) => t.name === tool.name)
  );

  return (
    <div className="criterion-card">

      {/* Header */}
      <div className="criterion-header">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="criterion-id">{criterion.id}</span>
          <span className={`badge ${criterion.level === 'A' ? 'badge-primary' : 'badge-neutral'}`}>
            WCAG {criterion.level}
          </span>
          <span className="badge badge-neutral">{criterion.principle}</span>
          {result?.automatedStatus === 'fail' && (
            <span className="badge badge-warning">⚡ Auto-flagged</span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span style={{ fontSize: '13px', color: '#555' }}>
            {criterion.guideline}
          </span>
          <span style={{ fontSize: '13px', color: '#aaa' }}>·</span>
          
            <a href={criterion.wcagUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '13px' }}
          >
            WCAG Spec ↗
          </a>
        </div>

        <h2 className="criterion-title">{criterion.title}</h2>
        <p className="criterion-description">{criterion.description}</p>
      </div>

      {/* Lighthouse banner */}
      {lighthouseAudits.length > 0 && (
        <div className="criterion-lighthouse-banner">
          <div className="criterion-lighthouse-header">
            ⚡ Lighthouse flagged {lighthouseAudits.length} issue{lighthouseAudits.length !== 1 ? 's' : ''} — verify manually
          </div>
          {lighthouseAudits.map((audit) => (
            <div key={audit.id} className="criterion-lighthouse-item">
              <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '2px' }}>
                {audit.data.title}
              </div>
              {audit.data.displayValue && (
                <div style={{ fontSize: '13px', color: '#555' }}>
                  {audit.data.displayValue}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tools needed */}
      <div className="criterion-section">
        <div className="criterion-section-label">Tools Needed</div>
        <div className="flex gap-2 flex-wrap">
          {uniqueTools.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tool-badge"
              style={tool.url ? {} : { pointerEvents: 'none', textDecoration: 'none' }}
            >
              {tool.name}
              {tool.free && <span style={{ opacity: 0.6, marginLeft: '4px' }}>Free</span>}
            </a>
          ))}
        </div>
      </div>

      {/* How to test */}
      <div className="criterion-section">
        <div className="criterion-section-label">How to Test</div>
        <ol className="criterion-steps">
          {criterion.howToTest.map((step) => {
            const method = methodIcon(step.method);
            return (
              <li key={step.order} className="criterion-step">
                <div className="criterion-step-method">
                  <span
                    className="method-badge"
                    style={{ background: method.bg, color: method.color }}
                    title={method.label}
                    aria-label={method.label}
                  >
                    <span aria-hidden="true">{method.icon}</span>
                    <span>{method.label}</span>
                  </span>
                </div>
                <div className="criterion-step-text">
                  {step.instruction}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Contrast checker — only for 1.4.3 */}
      {criterion.id === '1.4.3' && (
        <div className="criterion-section">
          <div className="criterion-section-label">Contrast Checker</div>
          <ContrastChecker />
        </div>
      )}

      {/* Mark result */}
      <div className="criterion-section">
        <div className="criterion-section-label">
          Mark Result
          <span className="criterion-shortcuts">
            Shortcuts: 1 Pass · 2 Fail · 3 N/A · 4 Untested
          </span>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {[
            { value: 'pass',     label: '✓ Pass',     style: 'success' },
            { value: 'fail',     label: '✕ Fail',     style: 'danger'  },
            { value: 'na',       label: '— N/A',      style: 'neutral' },
            { value: 'untested', label: '○ Untested', style: 'outline' },
          ].map((option) => (
            <button
              key={option.value}
              className={`btn ${
                status === option.value
                  ? option.style === 'success' ? 'btn-success-active'
                  : option.style === 'danger'  ? 'btn-danger'
                  : option.style === 'neutral' ? 'btn-neutral-active'
                  : 'btn-outline-active'
                  : 'btn-outline'
              } btn-sm`}
              onClick={() => handleStatus(option.value)}
              aria-pressed={status === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Severity — only when failed */}
        {status === 'fail' && (
          <div className="form-group mb-4" style={{ maxWidth: '280px' }}>
            <label className="form-label" htmlFor="severity">
              Severity
            </label>
            <select
              id="severity"
              className="form-input"
              value={severity}
              onChange={(e) => handleSeverity(e.target.value)}
            >
              <option value="">Select severity</option>
              <option value="critical">Critical — blocks access entirely</option>
              <option value="serious">Serious — major barrier</option>
              <option value="moderate">Moderate — some impact</option>
              <option value="minor">Minor — low impact</option>
            </select>
          </div>
        )}

        {/* Notes */}
        <div className="form-group">
          <label className="form-label" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            className="form-input"
            rows={3}
            placeholder="Document specific issues, elements affected, or testing observations…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        {/* Save status */}
        <div style={{ height: '20px', marginTop: '8px' }}>
          {isSaving && (
            <span style={{ fontSize: '13px', color: '#555' }}>Saving…</span>
          )}
          {!isSaving && lastSaved && (
            <span style={{ fontSize: '13px', color: '#2d5a1e' }}>✓ {lastSaved}</span>
          )}
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div className="criterion-nav">
        {prevCriterion ? (
          <Link
            href={`/audit/${auditId}/page/${pageId}?criterion=${prevCriterion.id}`}
            className="btn btn-outline btn-sm"
          >
            ← {prevCriterion.id} {prevCriterion.title}
          </Link>
        ) : (
          <div />
        )}
        {nextCriterion ? (
          <Link
            href={`/audit/${auditId}/page/${pageId}?criterion=${nextCriterion.id}`}
            className="btn btn-outline btn-sm"
          >
            {nextCriterion.id} {nextCriterion.title} →
          </Link>
        ) : (
          <Link
            href={`/audit/${auditId}`}
            className="btn btn-primary btn-sm"
          >
            Finish Page ✓
          </Link>
        )}
      </div>

    </div>
  );
}