import { getAuthUser } from './auth';
import { prisma } from './db';

const ADMIN_EMAILS = ['davesampson15@gmail.com'];

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
