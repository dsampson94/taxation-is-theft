import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

// GET /api/profile
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        occupation: true,
        taxNumber: true,
        idNumber: true,
        dateOfBirth: true,
        entityType: true,
        planType: true,
        credits: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PATCH /api/profile
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, occupation, taxNumber, entityType } = await request.json();

    const updated = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        name: name || undefined,
        occupation: occupation || undefined,
        taxNumber: taxNumber || undefined,
        entityType: entityType || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        occupation: true,
        taxNumber: true,
        entityType: true,
        planType: true,
        credits: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
