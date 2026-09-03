'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DuplicateButton({ auditId }: { auditId: string }) {
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const response = await fetch(`/api/audits/${auditId}/duplicate`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to duplicate');
      const data = await response.json();
      router.push(`/audit/${data.id}`);
    } catch {
      setIsDuplicating(false);
    }
  };

  return (
    <button
      className="btn btn-outline"
      onClick={handleDuplicate}
      disabled={isDuplicating}
      aria-busy={isDuplicating}
    >
      {isDuplicating ? 'Duplicating…' : 'Duplicate'}
    </button>
  );
}
