'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AddPageForm({
  auditId,
  baseUrl,
}: {
  auditId: string;
  baseUrl: string;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(baseUrl);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Page URL is required.');
      return;
    }

    if (!title.trim()) {
      setError('Page title is required.');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/audits/${auditId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), title: title.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to add page');
      }

      setUrl(baseUrl);
      setTitle('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex-col gap-4" style={{ display: 'flex' }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}>
          <div className="form-group">
            <label className="form-label" htmlFor="page-title">
              Page Title <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="page-title"
              type="text"
              className="form-input"
              placeholder="e.g. Homepage"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="page-url">
              Page URL <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="page-url"
              type="url"
              className="form-input"
              placeholder="https://example.com/page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              aria-required="true"
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              background: 'var(--color-danger-light)',
              border: '1px solid rgba(76,6,29,0.2)',
              borderRadius: 'var(--radius)',
              padding: '12px 16px',
              color: '#6e0d2a',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Adding…' : '+ Add Page'}
          </button>
        </div>

      </div>
    </form>
  );
}