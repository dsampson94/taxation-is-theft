import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { PAYFAST_CONFIG } from '@/app/lib/pricing';
import crypto from 'crypto';

// PayFast server IPs for validation
const PAYFAST_IPS = [
  '197.97.145.144',
  '197.97.145.145',
  '197.97.145.146',
  '197.97.145.147',
  '197.97.145.148',
  '41.74.179.194',
  '41.74.179.195',
  '41.74.179.196',
  '41.74.179.197',
  '41.74.179.198',
];

function verifySignature(data: Record<string, string>, passphrase?: string): boolean {
  const receivedSignature = data.signature;
  const params = Object.entries(data)
    .filter(([k, v]) => k !== 'signature' && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, '+')}`)
    .join('&');

  const signatureString = passphrase ? `${params}&passphrase=${encodeURIComponent(passphrase.trim())}` : params;
  const expectedSignature = crypto.createHash('md5').update(signatureString).digest('hex');

  return receivedSignature === expectedSignature;
}

// PayFast ITN (Instant Transaction Notification) handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });

    // 1. Verify source IP in production
    if (!PAYFAST_CONFIG.sandbox) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
      if (!PAYFAST_IPS.includes(ip)) {
        console.error('ITN from invalid IP:', ip);
        return new NextResponse('Invalid source', { status: 403 });
      }
    }

    // 2. Verify signature
    if (!verifySignature(data, PAYFAST_CONFIG.passphrase || undefined)) {
      console.error('ITN signature verification failed');
      return new NextResponse('Invalid signature', { status: 400 });
    }

    // 3. Verify payment amount matches
    const paymentId = data.m_payment_id;
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      console.error('Payment not found:', paymentId);
      return new NextResponse('Payment not found', { status: 404 });
    }

    const expectedAmount = Number(payment.amount).toFixed(2);
    if (data.amount_gross !== expectedAmount) {
      console.error('Amount mismatch:', data.amount_gross, 'vs', expectedAmount);
      return new NextResponse('Amount mismatch', { status: 400 });
    }

    // 4. Process based on payment status
    const pfStatus = data.payment_status;

    if (pfStatus === 'COMPLETE' && payment.status === 'PENDING') {
      // Idempotency: check if this PayFast payment ID was already processed
      const existing = await prisma.payment.findFirst({
        where: { externalId: data.pf_payment_id, status: 'COMPLETED' },
      });
      if (existing) {
        console.log(`ITN duplicate ignored: pf_payment_id=${data.pf_payment_id}`);
        return new NextResponse('OK', { status: 200 });
      }

      // Credit the user's account atomically
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'COMPLETED',
            method: data.payment_method || 'unknown',
            externalId: data.pf_payment_id,
          },
        }),
        prisma.user.update({
          where: { id: payment.userId },
          data: {
            credits: { increment: payment.creditsPurchased || 0 },
          },
        }),
      ]);

      console.log(`Payment ${paymentId}: credited ${payment.creditsPurchased} credits to user ${payment.userId}`);
    } else if (pfStatus === 'CANCELLED') {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED', externalId: data.pf_payment_id },
      });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('ITN processing error:', error);
    return new NextResponse('Server error', { status: 500 });
  }
}
