import { getAuthUser } from './auth';
import { prisma } from './db';

export const ADMIN_EMAILS = ['davesampson15@gmail.com'];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

export async function getAdminUser() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { email: true, id: true },
  });

  if (!user || !ADMIN_EMAILS.includes(user.email)) return null;
  return user;
}
