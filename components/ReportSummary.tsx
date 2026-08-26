'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Criterion } from '@/lib/wcag-criteria';
import { ChevronDownIcon, ChevronRightIcon, FileIcon, CheckIcon } from './icons';

type Failure = {
  criterion: Criterion;
  result: {
    id: string;
    status: string;
    severity: string | null;
    notes: string;
  };
};

type ReportPage = {
  id: string;
  title: string;
  url: string;
  lighthouseScore: number | null;
  failures: Failure[];
  stats: {
    passed: number;
    failed: number;
    na: number;
    tested: number;
    passRate: number;
    progress: number;
  };
};

const severityColor = (severity: string | null) => {
  switch (severity) {
    case 'critical': return 'badge-danger';
    case 'serious':  return 'badge-warning';
    case 'moderate': return 'badge-neutral';
    case 'minor':    return 'badge-neutral';
    default:         return 'badge-neutral';
  }
};

export function ReportSummary({
  pages,
  auditId,
}: {
  pages: ReportPage[];
  auditId: string;
}) {
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});

  const togglePage = (pageId: string) => {
    setExpandedPages((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Results by Page</h2>
      </div>

      {pages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FileIcon size={24} /></div>
          <h3>No pages audited</h3>
          <p>Add pages to your audit and complete the checklist to generate a report.</p>
        </div>
      ) : (
        <div>
          {pages.map((page) => (
            <div key={page.id} style={{
              borderBottom: '1px solid var(--color-border)',
            }}>
              {/* Page header row */}
              <button
                onClick={() => togglePage(page.id)}
                style={{
                  width: '100%',
                  padding: '20px 28px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'left',
                  transition: 'background var(--transition-fast)',
                }}
                aria-expanded={expandedPages[page.id] ?? false}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary)',
                  flexShrink: 0,
                  width: '20px',
                }} aria-hidden="true">
                  {expandedPages[page.id] ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '16px', marginBottom: '3px' }}>
                    {page.title}
                  </div>
                  <div className="text-muted" style={{
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {page.url}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  flexShrink: 0,
                }}>
                  {page.lighthouseScore !== null && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        color: page.lighthouseScore >= 90 ? '#2d5a1e'
                          : page.lighthouseScore >= 70 ? '#4a3a10'
                          : '#6e0d2a',
                        lineHeight: 1,
                      }}>
                        {page.lighthouseScore}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#555',
                      }}>
                        LH
                      </div>
                    </div>
                  )}

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: page.stats.failed > 0 ? '#6e0d2a' : '#2d5a1e',
                      lineHeight: 1,
                    }}>
                      {page.stats.failed}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#555',
                    }}>
                      Failed
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: page.stats.passRate >= 90 ? '#2d5a1e'
                        : page.stats.passRate >= 70 ? '#4a3a10'
                        : '#6e0d2a',
                      lineHeight: 1,
                    }}>
                      {page.stats.passRate > 0 ? `${page.stats.passRate}%` : '—'}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#555',
                    }}>
                      Pass Rate
                    </div>
                  </div>

                  <div style={{ width: '100px' }}>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${
                          page.stats.progress === 100
                            ? page.stats.failed > 0 ? 'danger' : 'success'
                            : ''
                        }`}
                        style={{ width: `${page.stats.progress}%` }}
                      />
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#555',
                      marginTop: '4px',
                      textAlign: 'right',
                    }}>
                      {page.stats.progress}%
                    </div>
                  </div>

                  <Link
                    href={`/audit/${auditId}/page/${page.id}`}
                    className="btn btn-outline btn-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {page.stats.progress < 100 ? 'Continue' : 'Review'}
                  </Link>
                </div>
              </button>

              {/* Expanded failures */}
              {expandedPages[page.id] && (
                <div style={{
                  background: 'var(--color-bg)',
                  borderTop: '1px solid var(--color-border)',
                }}>
                  {page.failures.length === 0 ? (
                    <div style={{
                      padding: '24px 28px',
                      color: '#2d5a1e',
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <CheckIcon size={16} />
                      <span>No failures recorded for this page.</span>
                    </div>
                  ) : (
                    <div>
                      {page.failures.map((failure, i) => (
                        <div key={i} style={{
                          padding: '16px 28px 16px 64px',
                          borderBottom: '1px solid var(--color-border)',
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'flex-start',
                        }}>
                          <div style={{ flexShrink: 0 }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '13px',
                              color: 'var(--color-primary)',
                              background: 'var(--color-primary-light)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                            }}>
                              {failure.criterion.id}
                            </span>
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span style={{ fontWeight: 500, fontSize: '15px' }}>
                                {failure.criterion.title}
                              </span>
                              {failure.result.severity && (
                                <span className={`badge ${severityColor(failure.result.severity)}`}>
                                  {failure.result.severity}
                                </span>
                              )}
                              <span className="badge badge-neutral">
                                WCAG {failure.criterion.level}
                              </span>
                            </div>
                            <div className="text-muted" style={{ fontSize: '14px', marginBottom: '6px' }}>
                              {failure.criterion.principle} — {failure.criterion.guideline}
                            </div>
                            {failure.result.notes && (
                              <div style={{
                                fontSize: '14px',
                                color: '#333',
                                background: 'var(--color-surface)',
                                padding: '10px 14px',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--color-border)',
                                marginTop: '6px',
                              }}>
                                {failure.result.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}