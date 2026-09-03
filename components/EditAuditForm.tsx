'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function EditAuditForm({
  auditId,
  initialName,
  initialUrl,
}: {
  auditId: string;
  initialName: string;
  initialUrl: string;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    setError('');

    if (!trimmedName) {
      setError('Audit name is required.');
      return;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      setError('Please enter a valid HTTP or HTTPS URL.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/audits/${auditId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, url: trimmedUrl }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? 'Failed to update audit.');
      router.refresh();
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update audit.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="edit-audit-control">
      <button type="button" className="btn btn-outline edit-audit-trigger" onClick={() => setIsEditing((editing) => !editing)}>
        {isEditing ? 'Editing details' : 'Edit details'}
      </button>
      {isEditing && (
        <form className="edit-audit-form" onSubmit={handleSubmit} noValidate>
          <div className="edit-audit-form-header">
            <div>
              <div className="page-tool-kicker">Audit details</div>
              <h2>Edit audit</h2>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>

          <div className="edit-audit-fields">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-audit-name">Audit name</label>
              <input
                id="edit-audit-name"
                className="form-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-audit-url">Website URL</label>
              <input
                id="edit-audit-url"
                className="form-input"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="form-error-box" role="alert">{error}</div>}

          <div className="edit-audit-actions">
            <button type="submit" className="btn btn-primary" disabled={isSaving} aria-busy={isSaving}>
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
