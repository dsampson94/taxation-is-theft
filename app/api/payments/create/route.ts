import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { getPlanById, PAYFAST_CONFIG } from '@/app/lib/pricing';
import { prisma } from '@/app/lib/db';
import crypto from 'crypto';

function generateSignature(data: Record<string, string>, passphrase?: string): string {
  const params = Object.entries(data)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, '+')}`)
    .join('&');

  const signatureString = passphrase ? `${params}&passphrase=${encodeURIComponent(passphrase.trim())}` : params;
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();
    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: plan.priceZAR,
        currency: 'ZAR',
        creditsPurchased: plan.credits,
        status: 'PENDING',
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Build PayFast form data
    const pfData: Record<string, string> = {
      merchant_id: PAYFAST_CONFIG.merchantId,
      merchant_key: PAYFAST_CONFIG.merchantKey,
      return_url: `${baseUrl}/payments/success?payment_id=${payment.id}`,
      cancel_url: `${baseUrl}/payments/cancel`,
      notify_url: `${baseUrl}/api/payments/notify`,
      name_first: user.name?.split(' ')[0] || '',
      name_last: user.name?.split(' ').slice(1).join(' ') || '',
      email_address: user.email,
      m_payment_id: payment.id,
      amount: plan.priceZAR.toFixed(2),
      item_name: `${plan.name} - ${plan.credits} Credits`,
      item_description: `Taxation is Theft: ${plan.credits} AI analysis credits`,
      custom_str1: user.id,
      custom_int1: String(plan.credits),
    };

    // Generate signature
    const signature = generateSignature(pfData, PAYFAST_CONFIG.passphrase || undefined);
    pfData.signature = signature;

    return NextResponse.json({
      formAction: PAYFAST_CONFIG.baseUrl,
      formData: pfData,
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
