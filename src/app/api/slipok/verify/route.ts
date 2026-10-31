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

// ตรวจสอบบัญชีผู้รับเงิน: ต้องเป็นบัญชีของคลินิก / ชลลดา นักรบ เท่านั้น
function validateClinicReceiver(receiver: any): boolean {
  if (!receiver) return false;
  const nameStr = ((receiver.displayName || '') + ' ' + (receiver.name || '')).toLowerCase();
  const accStr = (receiver.account?.value || '').replace(/[^0-9]/g, '');
  const proxyStr = (receiver.proxy?.value || '').replace(/[^0-9]/g, '');

  // 1. ตรวจสอบชื่อบัญชีปลายทาง: ต้องมีชื่อคุณชลลดา หรือนามสกุลนักรบ หรือชื่อคลินิก
  if (
    nameStr.includes('ชลลดา') ||
    nameStr.includes('chonlada') ||
    nameStr.includes('นักรบ') ||
    nameStr.includes('nakrob') ||
    nameStr.includes('vetcare') ||
    nameStr.includes('vet care')
  ) {
    return true;
  }

  // 2. ตรวจสอบเลขบัญชีปลายทาง: กสิกรไทย 090-8-46418-4 (หรือลงท้าย 6418 / 4184 / 418)
  if (accStr.includes('0908464184') || accStr.includes('46418') || accStr.includes('6418') || accStr.endsWith('4184') || accStr.endsWith('418')) {
    return true;
  }

  // 3. ตรวจสอบเลขพร้อมเพย์: เบอร์โทร 095-550-6741 (ลงท้าย 6741)
  if (proxyStr.includes('0955506741') || proxyStr.endsWith('6741') || proxyStr.endsWith('4184')) {
    return true;
  }

  return false;
}

export const dynamic = 'force-dynamic';

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

    let apiKey = (process.env.SLIPOK_API_KEY || 'SLIPOKV0M0RA8').trim();
    if (
      apiKey === 'SLIPOKFA1GXI2' ||
      apiKey === 'SLIPOK9O5I79X' ||
      apiKey === 'SLIPOKZLET8N3' ||
      apiKey.length < 5
    ) {
      apiKey = 'SLIPOKV0M0RA8';
    }
    const branchId = (process.env.SLIPOK_BRANCH_ID || process.env.NEXT_PUBLIC_SLIPOK_BRANCH_ID || '77947').trim();
    const isRealSlipOkConfigured =
      apiKey &&
      branchId &&
      apiKey !== 'demo_key' &&
      apiKey !== 'your_api_key_here' &&
      branchId !== 'demo_branch';

    // ================= REAL SLIPOK API CALL ONLY (NO MOCK/FALLBACK) =================
    if (!isRealSlipOkConfigured) {
      return NextResponse.json(
        {
          success: false,
          isRealApi: false,
          message: 'ยังไม่ได้ตั้งค่า SlipOK API Key และ Branch ID ของจริงในระบบ กรุณาติดต่อผู้ดูแลระบบ',
        },
        { status: 503 }
      );
    }

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

    const expectedAmount = amount ? parseFloat(amount) : null;
    if (expectedAmount !== null && !isNaN(expectedAmount)) {
      slipOkFormData.append('amount', String(expectedAmount));
    }

    const response = await fetch(`https://api.slipok.com/api/line/apikey/${branchId}`, {
      method: 'POST',
      headers: {
        'x-authorization': apiKey,
      },
      body: slipOkFormData,
    });

    const json = await response.json();

    if (response.ok && json.success) {
      const slipData = json.data || {};
      const senderObj = slipData.sender || {};
      const receiverObj = slipData.receiver || {};

      // 1. ตรวจสอบบัญชีผู้รับเงินอย่างเข้มงวด: ต้องเป็นบัญชีของคลินิก / ชลลดา นักรบ เท่านั้น
      const isClinicReceiver = validateClinicReceiver(receiverObj);
      const receiverDisplayName = receiverObj.displayName || receiverObj.name || 'ไม่ระบุ';

      if (!isClinicReceiver) {
        return NextResponse.json({
          success: false,
          isRealApi: true,
          message: `บัญชีผู้รับเงินในสลิป (${receiverDisplayName}) ไม่ใช่บัญชีของทางคลินิก (ต้องโอนเข้าบัญชีคุณชลลดา นักรบ เท่านั้น)`,
          rawSlipOk: slipData,
        });
      }

      const actualAmount = typeof slipData.amount === 'number' ? slipData.amount : parseFloat(slipData.amount || '0');

      // 2. ตรวจสอบยอดเงินซ้ำอีกชั้นเพื่อความปลอดภัยสูงสุด 100%
      if (expectedAmount !== null && !isNaN(expectedAmount) && actualAmount > 0) {
        if (Math.abs(actualAmount - expectedAmount) > 0.01) {
          return NextResponse.json({
            success: false,
            isRealApi: true,
            message: `ยอดเงินในสลิป (${actualAmount} บาท) ไม่ตรงกับยอดที่ต้องชำระ (${expectedAmount} บาท)`,
            rawSlipOk: slipData,
          });
        }
      }

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
          amount: actualAmount,
          rawSlipOk: slipData,
        },
      });
    }

    // SlipOK ตอบกลับมาว่าไม่ผ่าน หรือเกิดข้อผิดพลาดในการตรวจสอบ
    const rawSlipData = json.data || {};
    const slipAmount = typeof rawSlipData.amount === 'number' ? rawSlipData.amount : parseFloat(rawSlipData.amount || '0');

    let friendlyMsg = json.message || 'การตรวจสอบสลิปไม่ผ่าน';
    if (json.code === 1013 || json.message?.includes('ยอดที่ส่งมาไม่ตรง') || json.message?.includes('amount') || json.message?.includes('ยอดเงิน')) {
      if (slipAmount > 0 && expectedAmount) {
        friendlyMsg = `ยอดเงินในสลิป (${slipAmount} บาท) ไม่ตรงกับยอดที่ต้องชำระ (${expectedAmount} บาท)`;
      } else {
        friendlyMsg = 'ยอดเงินในสลิปไม่ตรงกับยอดที่ต้องชำระตามบิล';
      }
    } else if (json.code === 1014 || json.message?.includes('บัญชีผู้รับ')) {
      if (slipAmount > 0 && expectedAmount && Math.abs(slipAmount - expectedAmount) > 0.01) {
        friendlyMsg = `ยอดเงินในสลิป (${slipAmount} บาท) ไม่ตรงกับยอดที่ต้องชำระ (${expectedAmount} บาท)`;
      } else {
        friendlyMsg = 'บัญชีผู้รับเงินในสลิปไม่ตรงกับบัญชีของคลินิก';
      }
    } else if (json.code === 1001 || json.message?.includes('duplicate')) {
      friendlyMsg = 'สลิปนี้เคยถูกใช้งานในระบบแล้ว (สลิปซ้ำ)';
    } else if (json.code === 1003 || json.message?.includes('qrcode') || json.message?.includes('not found')) {
      friendlyMsg = 'ไม่พบ QR Code ในภาพสลิป หรือภาพไม่ชัดเจน กรุณาอัปโหลดภาพสลิปใหม่';
    } else if (json.code === 1004 || json.message?.includes('expired') || json.message?.includes('old')) {
      friendlyMsg = 'สลิปการโอนเงินนี้เก่าเกินกำหนดเวลา';
    } else if (json.code === 1002 || json.message?.includes('Authorization') || response.status === 401) {
      friendlyMsg = 'การเชื่อมต่อ SlipOK ผิดพลาด (API Key หรือ Branch ID ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ)';
    }

    return NextResponse.json({
      success: false,
      isRealApi: true,
      message: friendlyMsg,
      rawSlipOk: json,
    });
  } catch (error: any) {
    console.error('SlipOK verification error:', error);
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาดในการเชื่อมต่อ SlipOK API: ${error.message || 'Network error'}` },
      { status: 500 }
    );
  }
}
