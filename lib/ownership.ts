import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getAuthenticatedUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function getOwnedAudit(id: string, userId: string) {
  return prisma.audit.findFirst({
    where: { id, userId },
  });
}