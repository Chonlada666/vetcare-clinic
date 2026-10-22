import { NextRequest, NextResponse } from 'next/server';

/**
 * SlipOK API Verification Endpoint
 * Official Documentation: https://slipok.com
 * 
 * To connect your real SlipOK account:
 * Set in .env.local:
 * SLIPOK_API_KEY="SLIPOK_XXXX"
 * SLIPOK_BRANCH_ID="12345"
 */

// Helper to convert base64 data url to Blob for SlipOK API
function base64ToBlob(base64DataUrl: string): Blob | null {
  try {
    if (!base64DataUrl.includes(',')) return null;
    const parts = base64DataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const buffer = Buffer.from(parts[1], 'base64');
    return new Blob([buffer], { type: mime });
  } catch (err) {
    console.error('Failed to convert base64 to blob:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const slipBase64 = formData.get('slipBase64') as string | null;
    const amount = formData.get('amount') as string | null;
    const billId = formData.get('billId') as string | null;

    if (!file && !slipBase64) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบไฟล์รูปภาพสลิปที่ต้องการตรวจสอบ' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SLIPOK_API_KEY?.trim();
    const branchId = (process.env.SLIPOK_BRANCH_ID || process.env.NEXT_PUBLIC_SLIPOK_BRANCH_ID)?.trim();
    const isRealSlipOkConfigured =
      apiKey &&
      branchId &&
      apiKey !== 'demo_key' &&
      apiKey !== 'your_api_key_here' &&
      branchId !== 'demo_branch';

    // ================= REAL SLIPOK API CALL =================
    if (isRealSlipOkConfigured) {
      const slipOkFormData = new FormData();

      if (file) {
        slipOkFormData.append('files', file, file.name || 'slip.jpg');
      } else if (slipBase64) {
        const blob = base64ToBlob(slipBase64);
        if (blob) {
          slipOkFormData.append('files', blob, 'slip.jpg');
        } else {
          return NextResponse.json(
            { success: false, message: 'รูปแบบภาพสลิป Base64 ไม่ถูกต้อง' },
            { status: 400 }
          );
        }
      }

      if (amount) {
        slipOkFormData.append('amount', String(parseFloat(amount)));
      }
      slipOkFormData.append('log', 'true');

      const response = await fetch(`https://api.slipok.com/api/line/apikey/${branchId}`, {
        method: 'POST',
        headers: {
          'x-authorization': apiKey,
        },
        body: slipOkFormData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        // Parse friendly error messages from SlipOK
        let friendlyMsg = json.message || 'การตรวจสอบสลิปไม่ผ่าน';
        if (json.code === 1001 || json.message?.includes('duplicate')) {
          friendlyMsg = 'สลิปนี้เคยถูกใช้งานในระบบแล้ว (สลิปซ้ำ)';
        } else if (json.code === 1002 || json.message?.includes('amount')) {
          friendlyMsg = 'ยอดเงินในสลิปไม่ตรงกับยอดที่ต้องชำระ';
        } else if (json.code === 1003 || json.message?.includes('qrcode') || json.message?.includes('not found')) {
          friendlyMsg = 'ไม่พบ QR Code ในภาพสลิป หรือภาพไม่ชัดเจน กรุณาอัปโหลดภาพสลิปใหม่';
        } else if (json.code === 1004 || json.message?.includes('expired') || json.message?.includes('old')) {
          friendlyMsg = 'สลิปการโอนเงินนี้เก่าเกินกำหนดเวลา';
        }

        return NextResponse.json({
          success: false,
          isRealApi: true,
          message: friendlyMsg,
          rawSlipOk: json,
        });
      }

      const slipData = json.data || {};
      const senderObj = slipData.sender || {};
      const receiverObj = slipData.receiver || {};

      const senderName =
        senderObj.name?.th ||
        senderObj.name?.en ||
        senderObj.displayName ||
        senderObj.name ||
        'ผู้โอนเงิน';

      const receiverName =
        receiverObj.name?.th ||
        receiverObj.name?.en ||
        receiverObj.displayName ||
        receiverObj.name ||
        'VetCare Animal Clinic';

      return NextResponse.json({
        success: true,
        isRealApi: true,
        message: 'ตรวจสอบสลิปสำเร็จผ่าน SlipOK API (ระบบจริง)',
        data: {
          transRef: slipData.transRef || `REF_${Date.now()}`,
          transDate: slipData.transDate,
          transTime: slipData.transTime,
          senderName,
          receiverName,
          amount: typeof slipData.amount === 'number' ? slipData.amount : parseFloat(amount || '0'),
          rawSlipOk: slipData,
        },
      });
    }

    // ================= SIMULATION / DEMO MODE (Fallback) =================
    // If SLIPOK_API_KEY or SLIPOK_BRANCH_ID is not configured in .env.local
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const numericAmount = amount ? parseFloat(amount) : 300;
    const mockRef = `SLIPOK_${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      isRealApi: false,
      message: 'ตรวจสอบสลิปสำเร็จ (SlipOK Simulation Mode - กรุณาตั้งค่า API Key เพื่อเชื่อมต่อระบบจริง)',
      data: {
        transRef: mockRef,
        transDate: new Date().toISOString().split('T')[0],
        transTime: new Date().toTimeString().split(' ')[0],
        senderName: 'ผู้โอนเงิน (ระบบจำลอง)',
        receiverName: 'คลินิกรักษาสัตว์ VetCare จำกัด (090-8-46418-4)',
        amount: numericAmount,
      },
    });
  } catch (error: any) {
    console.error('SlipOK verification error:', error);
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาดในการเชื่อมต่อ SlipOK API: ${error.message || 'Network error'}` },
      { status: 500 }
    );
  }
}
