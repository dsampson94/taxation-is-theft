import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { hashPassword, signToken } from '@/app/lib/auth';
import { getRecentTaxYearLabels, ZA_TAX_YEAR } from '@/app/lib/tax-rates-za';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name || null,
      },
    });

    // Auto-create recent tax years (current + 2 previous)
    const labels = getRecentTaxYearLabels(3);
    await prisma.taxYear.createMany({
      data: labels.map(label => {
        const [startYearStr, endYearStr] = label.split('/');
        return {
          userId: user.id,
          yearLabel: label,
          startDate: new Date(parseInt(startYearStr), ZA_TAX_YEAR.START_MONTH - 1, ZA_TAX_YEAR.START_DAY),
          endDate: new Date(parseInt(endYearStr), ZA_TAX_YEAR.END_MONTH - 1, ZA_TAX_YEAR.END_DAY),
        };
      }),
      skipDuplicates: true,
    });

    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
