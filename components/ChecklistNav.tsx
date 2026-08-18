'use client';

import Link from 'next/link';
import type { Criterion } from '@/lib/wcag-criteria';

type Result = {
  id: string;
  criterionId: string;
  status: string;
  automatedStatus: string | null;
};

const statusIcon = (status: string, automatedStatus: string | null) => {
  if (status === 'pass')    return { icon: '✓', color: '#2d5a1e' };
  if (status === 'fail')    return { icon: '✕', color: '#6e0d2a' };
  if (status === 'na')      return { icon: '—', color: '#555' };
  if (automatedStatus === 'fail') return { icon: '!', color: '#7b652d' };
  return { icon: '○', color: '#aaa' };
};

const principles = ['Perceivable', 'Operable', 'Understandable', 'Robust'] as const;

export function ChecklistNav({
  criteria,
  results,
  activeCriterionId,
  auditId,
  pageId,
}: {
  criteria: Criterion[];
  results: Record<string, Result>;
  activeCriterionId: string;
  auditId: string;
  pageId: string;
}) {
  return (
    <nav
      className="checklist-nav"
      aria-label="WCAG criteria navigation"
    >
      {principles.map((principle) => {
        const group = criteria.filter((c) => c.principle === principle);
        if (group.length === 0) return null;

        return (
          <div key={principle} className="checklist-nav-group">
            <div className="checklist-nav-group-label">
              {principle}
            </div>
            {group.map((criterion) => {
              const result = results[criterion.id];
              const { icon, color } = statusIcon(
                result?.status ?? 'untested',
                result?.automatedStatus ?? null
              );
              const isActive = criterion.id === activeCriterionId;
              const isAutomated = result?.automatedStatus === 'fail';

              return (
                <Link
                  key={criterion.id}
                  href={`/audit/${auditId}/page/${pageId}?criterion=${criterion.id}`}
                  className={`checklist-nav-item ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span
                    className="checklist-nav-status"
                    style={{ color }}
                    aria-hidden="true"
                  >
                    {icon}
                  </span>
                  <span className="checklist-nav-id">
                    {criterion.id}
                  </span>
                  <span className="checklist-nav-title">
                    {criterion.title}
                  </span>
                  {isAutomated && result?.status === 'untested' && (
                    <span
                      className="checklist-nav-flag"
                      aria-label="Automated flag"
                    >
                      ⚡
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}