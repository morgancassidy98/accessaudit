'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Criterion } from '@/lib/wcag-criteria';
import { BoltIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon, CircleIcon, XIcon } from './icons';

type Result = {
  id: string;
  criterionId: string;
  status: string;
  automatedStatus: string | null;
};

const statusIcon = (status: string, automatedStatus: string | null) => {
  if (status === 'pass') return { icon: <CheckIcon size={16} />, color: '#2d5a1e' };
  if (status === 'fail') return { icon: <XIcon size={16} />, color: '#6e0d2a' };
  if (status === 'na') return { icon: '—', color: '#3b3b3b' };
  if (automatedStatus === 'fail') return { icon: <BoltIcon size={16} />, color: '#7b652d' };
  return { icon: <CircleIcon size={16} />, color: '#6b6b6b' };
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
  const [isMobile, setIsMobile] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    Perceivable: false,
    Operable: false,
    Understandable: false,
    Robust: false,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const update = () => {
      const mobile = mediaQuery.matches;
      setIsMobile(mobile);
      setCollapsedGroups((current) => {
        const nextState = { ...current };
        principles.forEach((principle) => {
          nextState[principle] = mobile;
        });
        return nextState;
      });
    };

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  const toggleGroup = (principle: string) => {
    setCollapsedGroups((current) => ({
      ...current,
      [principle]: !current[principle],
    }));
  };

  return (
    <>
      <button
        type="button"
        className="checklist-nav-toggle"
        onClick={() => setIsNavOpen((open) => !open)}
        aria-expanded={isMobile ? isNavOpen : true}
        aria-controls="checklist-criteria-nav"
      >
        <span>Criteria</span>
        <span className="checklist-nav-toggle-count">{criteria.length}</span>
        <span className="checklist-nav-group-caret" aria-hidden="true">
          {isNavOpen ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
        </span>
      </button>

      <nav
        id="checklist-criteria-nav"
        className={`checklist-nav ${isNavOpen ? 'open' : ''}`}
        aria-label="WCAG criteria navigation"
        hidden={isMobile && !isNavOpen}
      >
        <div className="checklist-nav-scroll-hint" aria-hidden="true">
          <span>Scroll for more criteria</span>
        </div>

        {principles.map((principle) => {
        const group = criteria.filter((c) => c.principle === principle);
        if (group.length === 0) return null;

        const isCollapsed = (collapsedGroups[principle] ?? (isMobile ? true : false))
          && !group.some((criterion) => criterion.id === activeCriterionId);

        return (
          <div key={principle} className="checklist-nav-group">
            <button
              type="button"
              className="checklist-nav-group-label checklist-nav-group-toggle"
              onClick={() => toggleGroup(principle)}
              aria-expanded={!isCollapsed}
              aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${principle} section`}
            >
              <span>{principle}</span>
              <span className="checklist-nav-group-caret" aria-hidden="true">
                {isCollapsed ? <ChevronRightIcon size={14} /> : <ChevronDownIcon size={14} />}
              </span>
            </button>

            {!isCollapsed && (
              <div className="checklist-nav-group-items">
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
                      onClick={() => setIsNavOpen(false)}
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
                          <BoltIcon size={12} />
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
        })}
      </nav>
    </>
  );
}