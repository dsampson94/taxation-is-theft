import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/admin';
import { prisma } from '@/app/lib/db';

export async function PATCH(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId, credits } = await req.json();

  if (!userId || typeof credits !== 'number' || credits < 0) {
    return NextResponse.json({ error: 'Invalid userId or credits' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { credits },
    select: { id: true, email: true, name: true, credits: true },
  });

  return NextResponse.json({ success: true, user });
}
