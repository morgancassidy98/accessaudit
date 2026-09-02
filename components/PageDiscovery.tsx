'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Candidate = {
  url: string;
  title: string;
};

export function PageDiscovery({ auditId }: { auditId: string }) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [source, setSource] = useState<'sitemap' | 'homepage' | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const discover = async () => {
    setIsDiscovering(true);
    setError('');
    setCandidates([]);
    setSelected(new Set());
    try {
      const response = await fetch(`/api/audits/${auditId}/discover`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Unable to discover pages.');
      setCandidates(data.candidates ?? []);
      setSource(data.source ?? null);
    } catch (discoveryError) {
      setError(discoveryError instanceof Error ? discoveryError.message : 'Unable to discover pages.');
    } finally {
      setIsDiscovering(false);
    }
  };

  const toggleCandidate = (url: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const allSelected = candidates.length > 0 && selected.size === candidates.length;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(candidates.map((candidate) => candidate.url)));
  };

  const addSelected = async () => {
    setIsAdding(true);
    setError('');
    try {
      const pages = candidates.filter((candidate) => selected.has(candidate.url));
      const response = await fetch(`/api/audits/${auditId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.details ?? data?.error ?? 'Failed to add selected pages.');
      }
      setCandidates((current) => current.filter((candidate) => !selected.has(candidate.url)));
      setSelected(new Set());
      router.refresh();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Unable to add selected pages.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="page-discovery">
      <div className="page-discovery-intro">
        <div>
          <div className="page-tool-kicker">Automatic discovery</div>
          <h3>Find pages from this website</h3>
          <p className="text-muted">
            We will check the website sitemap first, then use links from the homepage if no sitemap is available.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={discover} disabled={isDiscovering}>
          {isDiscovering ? 'Looking…' : 'Find Pages'}
        </button>
      </div>

      {error && <div className="form-error-box" role="alert">{error}</div>}

      {candidates.length > 0 && (
        <div className="page-discovery-results">
          <div className="page-discovery-results-header">
            <div>
              <h4>{source === 'sitemap' ? 'Pages from sitemap' : 'Pages from homepage'}</h4>
              <p className="text-muted">Select the pages you want to add.</p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={addSelected}
              disabled={selected.size === 0 || isAdding}
            >
              {isAdding ? 'Adding…' : `Add ${selected.size} page${selected.size === 1 ? '' : 's'}`}
            </button>
          </div>
          <label className="page-discovery-select-all">
            <input
              className="page-discovery-checkbox"
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
            />
            <span>Select all {candidates.length} pages</span>
          </label>
          <div className="page-discovery-list">
            {candidates.map((candidate) => (
              <label key={candidate.url} className="page-discovery-item">
                <input
                  className="page-discovery-checkbox"
                  type="checkbox"
                  checked={selected.has(candidate.url)}
                  onChange={() => toggleCandidate(candidate.url)}
                />
                <span className="page-discovery-item-copy">
                  <strong>{candidate.title}</strong>
                  <span>{candidate.url}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {!isDiscovering && candidates.length === 0 && source && (
        <p className="text-muted page-discovery-empty">No new pages were found.</p>
      )}
    </div>
  );
}
