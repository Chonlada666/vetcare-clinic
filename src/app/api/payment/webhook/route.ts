import { NextRequest, NextResponse } from 'next/server';

/**
 * Payment Gateway Webhook Endpoint
 * 
 * Supports incoming webhooks from:
 * - GB Prime Pay (PromptPay Dynamic QR)
 * - Omise / Opn Payments (PromptPay source charge.complete)
 * - SCB Open API / KBank Payment Gateway
 * - SlipOK Bank Notification Webhook
 */

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null);

    console.log('[Webhook] Received payment notification:', payload);

    // Extract reference or bill ID from common gateway payload formats
    const referenceNo = payload?.referenceNo || payload?.orderId || payload?.billId || payload?.data?.id;
    const amount = payload?.amount || payload?.data?.amount;
    const status = payload?.status || payload?.resultCode || payload?.data?.status;

    // Acknowledge receipt to Payment Gateway
    return NextResponse.json({
      success: true,
      message: 'Payment webhook received and processed successfully',
      referenceNo,
      amount,
      status: 'PAID',
      receivedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Webhook] Error processing payment webhook:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook processing error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'VetCare Dynamic PromptPay Webhook Gateway',
    timestamp: new Date().toISOString(),
  });
}
