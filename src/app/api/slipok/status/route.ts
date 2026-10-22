import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = (process.env.SLIPOK_API_KEY || 'SLIPOKFA1GXI2').trim();
  const branchId = (process.env.SLIPOK_BRANCH_ID || process.env.NEXT_PUBLIC_SLIPOK_BRANCH_ID || '77947').trim();

  const isConfigured =
    apiKey &&
    branchId &&
    apiKey !== 'demo_key' &&
    apiKey !== 'your_api_key_here' &&
    branchId !== 'demo_branch';

  let quotaInfo: any = null;
  let connectionStatus: 'connected' | 'not_configured' | 'error' = isConfigured ? 'connected' : 'not_configured';
  let statusMessage = isConfigured
    ? 'เชื่อมต่อกับ SlipOK API ของจริงเรียบร้อยแล้ว'
    : 'ยังไม่ได้ใส่ SlipOK API Key และ Branch ID ของจริง (กำลังทำงานในโหมด Simulation)';

  // If configured, test endpoint / check quota with SlipOK
  if (isConfigured) {
    try {
      const quotaRes = await fetch(`https://api.slipok.com/api/line/apikey/${branchId}/quota`, {
        method: 'GET',
        headers: {
          'x-authorization': apiKey,
        },
      });

      if (quotaRes.ok) {
        quotaInfo = await quotaRes.json();
      }
    } catch (err: any) {
      console.warn('SlipOK quota check warning:', err.message);
    }
  }

  return NextResponse.json({
    isConfigured,
    branchId: branchId ? (isConfigured ? branchId : 'demo_branch') : null,
    hasApiKey: !!apiKey && apiKey !== 'demo_key',
    maskedApiKey: apiKey && apiKey.length > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : null,
    connectionStatus,
    statusMessage,
    quotaInfo,
  });
}
