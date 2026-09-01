'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export function DeleteAccountButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [input, setInput] = useState('');

  const handleDelete = async () => {
    if (input !== 'delete my account') return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/user', { method: 'DELETE' });
      if (res.ok) {
        await signOut({ callbackUrl: '/login' });
      }
    } catch {
      setIsDeleting(false);
    }
  };

  if (!confirming) {
    return (
      <button
        className="btn btn-danger"
        onClick={() => setConfirming(true)}
      >
        Delete Account
      </button>
    );
  }

  return (
    <div style={{
      background: 'var(--color-danger-light)',
      border: '1px solid rgba(76,6,29,0.2)',
      borderRadius: 'var(--radius)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <p style={{ fontSize: '15px', color: '#3a0416', fontWeight: 500 }}>
        This will permanently delete your account and all {userId ? '' : ''}audits. Type <strong>delete my account</strong> to confirm.
      </p>
      <input
        type="text"
        className="form-input"
        placeholder="delete my account"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="Type delete my account to confirm"
      />
      <div className="flex gap-3">
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={input !== 'delete my account' || isDeleting}
          aria-busy={isDeleting}
        >
          {isDeleting ? 'Deleting…' : 'Permanently Delete Account'}
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => { setConfirming(false); setInput(''); }}
          disabled={isDeleting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}