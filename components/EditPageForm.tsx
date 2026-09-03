'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

export function EditPageForm({
  auditId,
  pageId,
  initialTitle,
  initialUrl,
}: {
  auditId: string;
  pageId: string;
  initialTitle: string;
  initialUrl: string;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        formRef.current &&
        !formRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsEditing(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isEditing]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();
    setError('');

    if (!trimmedTitle) {
      setError('Page title is required.');
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
      const response = await fetch(`/api/audits/${auditId}/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle, url: trimmedUrl }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? 'Failed to update page.');
      setIsEditing(false);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update page.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="edit-page-control">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        ref={triggerRef}
        onClick={() => setIsEditing((editing) => !editing)}
      >
        {isEditing ? 'Editing' : 'Edit'}
      </button>
      {isEditing &&
        createPortal(
          <div
            className="edit-page-form-portal"
            ref={formRef}
          >
            <form className="edit-page-form" onSubmit={handleSubmit} noValidate>
              <div className="edit-page-form-header">
                <div>
                  <div className="page-tool-kicker">Page details</div>
                  <h3>Edit page</h3>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
              <div className="edit-page-fields">
                <div className="form-group">
                  <label className="form-label" htmlFor={`edit-page-title-${pageId}`}>Page title</label>
                  <input
                    id={`edit-page-title-${pageId}`}
                    className="form-input"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor={`edit-page-url-${pageId}`}>Page URL</label>
                  <input
                    id={`edit-page-url-${pageId}`}
                    className="form-input"
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <div className="form-error-box" role="alert">{error}</div>}
              <div className="edit-page-actions">
                <button type="submit" className="btn btn-primary" disabled={isSaving} aria-busy={isSaving}>
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </div>
  );
}
