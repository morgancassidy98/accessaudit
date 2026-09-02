'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewAuditPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!name.trim()) {
      setError('Audit name is required.');
      return;
    }

    if (!url.trim()) {
      setError('Website URL is required.');
      return;
    }

    // Ensure URL has a protocol
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    try {
      new URL(normalizedUrl);
    } catch {
      setError('Please enter a valid URL.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), url: normalizedUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to create audit');
      }

      const audit = await res.json();
      router.push(`/audit/${audit.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>New Audit</h1>
          <p className="page-subtitle">
            WCAG Accessibility Audit Tracker and Reporting Tool
          </p>
        </div>
        <Link href="/" className="btn btn-outline back-button">
          <span className="back-button-content gap-2">
            <span aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <span>Back</span>
          </span>
        </Link>
      </div>

      <div className="page-body">
        <div className="w-full mx-auto">
          <div className="card">
            <div className="card-header">
              <h2>Audit Details</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col gap-6">

                  <div className="form-group">
                    <label className="form-label" htmlFor="audit-name">
                      Audit Name <span className="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="audit-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. example.com Q3 2026 Audit"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      aria-required="true"
                      aria-describedby={error ? 'form-error' : 'name-hint'}
                      autoComplete="off"
                    />
                    <p className="form-helper" id="name-hint">
                      A descriptive name to identify this audit later.
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="audit-url">
                      Website URL <span className="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="audit-url"
                      type="url"
                      className="form-input"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      aria-required="true"
                      aria-describedby={error ? 'form-error' : 'url-hint'}
                      autoComplete="url"
                    />
                    <p className="form-helper" id="url-hint">
                      The base URL of the website you are auditing. You will add individual pages after creation.
                    </p>
                  </div>

                  {error && (
                    <div
                      id="form-error"
                      role="alert"
                      aria-live="assertive"
                      className="form-error-box"
                    >
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <Link href="/" className="btn btn-ghost">
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? 'Creating…' : 'Create Audit'}
                    </button>
                  </div>

                </div>
              </form>
            </div>
          </div>

          {/* Info card */}
          <div className="card mt-6">
            <div className="card-body">
              <h3 className="info-heading">
                What happens next?
              </h3>
              <ol className="info-list">
                <li>Add the individual pages you want to audit</li>
                <li>Run an automated scan to pre-populate Lighthouse results</li>
                <li>Work through the guided WCAG 2.1 checklist for each page</li>
                <li>Export a detailed accessibility report when complete</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}