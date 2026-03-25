import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/admin';
import { prisma } from '@/app/lib/db';

export async function PATCH(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId, credits } = await req.json();

  if (!userId || typeof credits !== 'number' || credits < 0 || credits > 9999) {
    return NextResponse.json({ error: 'Invalid userId or credits (0-9999)' }, { status: 400 });
  }

  // Verify user exists
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, credits: true } });
  if (!existing) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { credits },
    select: { id: true, email: true, name: true, credits: true },
  });

  console.log(`[ADMIN] ${admin.email} set credits for ${user.email}: ${existing.credits} → ${credits}`);

  return NextResponse.json({ success: true, user });
}
