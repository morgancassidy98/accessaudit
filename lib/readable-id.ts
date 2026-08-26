export function createReadableAuditId(
  name: string,
  existingIds: string[] = [],
  createdAt = new Date()
) {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  const slug = base || 'audit';
  const dateSuffix = createdAt.toISOString().slice(0, 10);

  let candidate = `${slug}-${dateSuffix}`;
  let counter = 2;

  while (existingIds.includes(candidate)) {
    candidate = `${slug}-${dateSuffix}-${counter}`;
    counter += 1;
  }

  return candidate;
}
