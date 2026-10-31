import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * SlipOK API Verification Endpoint
 * Official Documentation: https://slipok.com
 *
 * Strict 4-Layer Verification:
 * 1. Strict Receiver Matching: Name must match Chonlada Nakrob AND account/promptpay must match clinic's account
 * 2. Exact Amount Matching: Difference between slip amount and expected amount <= 0.01 Baht
 * 3. Date & Time Freshness: Slip must be within 24 hours and not older than bill creation time (> 30 min before)
 * 4. Anti-Replay / Duplicate transRef: Reject if the same bank transaction reference has already been used
 */

const USED_SLIPS_FILE = path.join(process.cwd(), 'data', 'used_slips.json');

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

// ตรวจสอบและบันทึกประวัติรหัสอ้างอิงธุรกรรม (Anti-Replay / Duplicate transRef)
function getUsedSlips(): Record<string, any> {
  try {
    if (!fs.existsSync(USED_SLIPS_FILE)) return {};
    const content = fs.readFileSync(USED_SLIPS_FILE, 'utf-8');
    return JSON.parse(content || '{}');
  } catch {
    return {};
  }
}

function recordUsedSlip(transRef: string, record: any) {
  try {
    const dir = path.dirname(USED_SLIPS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const slips = getUsedSlips();
    slips[transRef] = {
      ...record,
      recordedAt: new Date().toISOString(),
    };
    fs.writeFileSync(USED_SLIPS_FILE, JSON.stringify(slips, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to record used slip:', err);
  }
}

// แปลงวันที่และเวลาจากสลิปของ SlipOK เป็น Date object (รองรับทั้ง ค.ศ. และ พ.ศ.)
function parseSlipDateTime(transDate?: string, transTime?: string): Date | null {
  if (!transDate) return null;
  try {
    let year = 0;
    let month = 0;
    let day = 0;

    const cleanDate = transDate.replace(/[^0-9]/g, '');
    if (cleanDate.length === 8) {
      year = parseInt(cleanDate.substring(0, 4), 10);
      month = parseInt(cleanDate.substring(4, 6), 10) - 1;
      day = parseInt(cleanDate.substring(6, 8), 10);
    } else {
      const parts = transDate.split(/[-/]/);
      if (parts.length === 3) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      }
    }

    if (year > 2400) {
      year -= 543; // แปลง พ.ศ. เป็น ค.ศ.
    }

    let hour = 0;
    let minute = 0;
    let second = 0;

    if (transTime) {
      const cleanTime = transTime.replace(/[^0-9]/g, '');
      if (cleanTime.length >= 4) {
        hour = parseInt(cleanTime.substring(0, 2), 10);
        minute = parseInt(cleanTime.substring(2, 4), 10);
        if (cleanTime.length >= 6) {
          second = parseInt(cleanTime.substring(4, 6), 10);
        }
      } else {
        const parts = transTime.split(':');
        if (parts.length >= 2) {
          hour = parseInt(parts[0], 10);
          minute = parseInt(parts[1], 10);
          if (parts.length >= 3) second = parseInt(parts[2], 10);
        }
      }
    }

    const d = new Date(year, month, day, hour, minute, second);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

// แปลงวันที่สร้างบิล (billCreatedAt) เป็น Date object
function parseBillCreatedDateTime(createdStr?: string | null): Date | null {
  if (!createdStr) return null;
  try {
    const s = createdStr.trim();
    const parts = s.split(/[ T]/);
    if (parts.length >= 1) {
      const dateParts = parts[0].split(/[-/]/);
      if (dateParts.length === 3) {
        let yr = parseInt(dateParts[0], 10);
        if (yr > 2400) yr -= 543;
        const mo = parseInt(dateParts[1], 10) - 1;
        const dy = parseInt(dateParts[2], 10);
        let hr = 0;
        let mn = 0;
        if (parts[1]) {
          const tm = parts[1].split(':');
          if (tm.length >= 2) {
            hr = parseInt(tm[0], 10);
            mn = parseInt(tm[1], 10);
          }
        }
        const d = new Date(yr, mo, dy, hr, mn);
        if (!isNaN(d.getTime())) return d;
      }
    }
    const d2 = new Date(createdStr);
    return isNaN(d2.getTime()) ? null : d2;
  } catch {
    return null;
  }
}

// ตรวจสอบบัญชีผู้รับเงินอย่างเข้มงวด: ต้องเป็นบัญชีของคลินิก / ชลลดา นักรบ เท่านั้น
function validateClinicReceiver(receiver: any): { valid: boolean; reason?: string } {
  if (!receiver) {
    return { valid: false, reason: 'ไม่พบข้อมูลบัญชีผู้รับเงินในสลิป' };
  }

  const nameStr = (
    (receiver.displayName || '') + ' ' +
    (receiver.name?.th || '') + ' ' +
    (receiver.name?.en || '') + ' ' +
    (receiver.name || '')
  ).toLowerCase();

  const accStr = (receiver.account?.value || '').replace(/[^0-9]/g, '');
  const proxyStr = (receiver.proxy?.value || '').replace(/[^0-9]/g, '');

  // 1. ตรวจสอบชื่อบัญชีปลายทาง: ต้องมีชื่อคุณชลลดา หรือนามสกุลนักรบ หรือชื่อคลินิก
  const hasClinicName =
    nameStr.includes('ชลลดา') ||
    nameStr.includes('chonlada') ||
    nameStr.includes('นักรบ') ||
    nameStr.includes('nakrob') ||
    nameStr.includes('vetcare') ||
    nameStr.includes('vet care');

  // 2. ตรวจสอบเลขบัญชีหรือพร้อมเพย์ปลายทาง:
  // กสิกรไทย 090-8-46418-4 (หรือลงท้าย 6418 / 4184 / 46418)
  // หรือ พร้อมเพย์ 095-550-6741 (ลงท้าย 6741)
  const hasClinicAccount =
    accStr.includes('0908464184') ||
    accStr.includes('46418') ||
    accStr.includes('6418') ||
    accStr.endsWith('4184') ||
    accStr.endsWith('418') ||
    proxyStr.includes('0955506741') ||
    proxyStr.endsWith('6741') ||
    proxyStr.includes('0908464184') ||
    proxyStr.endsWith('4184');

  if (hasClinicName && hasClinicAccount) {
    return { valid: true };
  }

  // หากชื่อไม่ตรง
  if (!hasClinicName) {
    const receiverName = receiver.displayName || receiver.name?.th || receiver.name || 'ไม่ระบุ';
    return {
      valid: false,
      reason: `ชื่อบัญชีผู้รับเงิน (${receiverName}) ไม่ใช่บัญชีของทางคลินิก (ต้องโอนเข้า น.ส. ชลลดา นักรบ เท่านั้น)`,
    };
  }

  // หากเลขบัญชี/พร้อมเพย์ไม่ตรง
  if (!hasClinicAccount) {
    return {
      valid: false,
      reason: 'เลขที่บัญชีหรือพร้อมเพย์ผู้รับในสลิปไม่ตรงกับบัญชีของคลินิก (กสิกรไทย 090-8-46418-4 หรือ พร้อมเพย์ 095-550-6741)',
    };
  }

  return { valid: false, reason: 'ข้อมูลบัญชีผู้รับเงินไม่ถูกต้อง' };
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const slipBase64 = formData.get('slipBase64') as string | null;
    const amount = formData.get('amount') as string | null;
    const billId = formData.get('billId') as string | null;
    const billCreatedAt = formData.get('billCreatedAt') as string | null;

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

    // ================= REAL SLIPOK API CALL ONLY =================
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
      const transRef = slipData.transRef || '';

      // -------------------------------------------------------------
      // จุดที่ 1: ตรวจสอบการนำสลิปเก่าที่เคยใช้ไปแล้วมาเวียนใช้ซ้ำ (Anti-Replay / Duplicate)
      // -------------------------------------------------------------
      if (transRef) {
        const usedSlips = getUsedSlips();
        if (usedSlips[transRef]) {
          const prev = usedSlips[transRef];
          return NextResponse.json({
            success: false,
            isRealApi: true,
            message: `สลิปนี้เคยถูกนำมาใช้ชำระเงินในระบบแล้ว (รหัสอ้างอิง ${transRef} ซ้ำกับบิล #${prev.billId || 'ก่อนหน้า'})`,
            rawSlipOk: slipData,
          });
        }
      }

      // -------------------------------------------------------------
      // จุดที่ 2: ตรวจสอบบัญชีผู้รับเงินอย่างเข้มงวด (Strict Receiver)
      // -------------------------------------------------------------
      const receiverValidation = validateClinicReceiver(receiverObj);
      if (!receiverValidation.valid) {
        return NextResponse.json({
          success: false,
          isRealApi: true,
          message: receiverValidation.reason || 'บัญชีผู้รับเงินในสลิปไม่ใช่บัญชีของทางคลินิก',
          rawSlipOk: slipData,
        });
      }

      // -------------------------------------------------------------
      // จุดที่ 3: ตรวจสอบยอดเงินให้ตรงเป๊ะ 100% (Exact Amount Match)
      // -------------------------------------------------------------
      const actualAmount = typeof slipData.amount === 'number' ? slipData.amount : parseFloat(slipData.amount || '0');
      if (expectedAmount !== null && !isNaN(expectedAmount)) {
        if (Math.abs(actualAmount - expectedAmount) > 0.01) {
          return NextResponse.json({
            success: false,
            isRealApi: true,
            message: `ยอดเงินในสลิป (${actualAmount} บาท) ไม่ตรงกับยอดที่ต้องชำระตามบิล (${expectedAmount} บาท)`,
            rawSlipOk: slipData,
          });
        }
      }

      // -------------------------------------------------------------
      // จุดที่ 4: ตรวจสอบความถูกต้องของวันที่และเวลา (Date & Time Freshness)
      // -------------------------------------------------------------
      const slipDateTime = parseSlipDateTime(slipData.transDate, slipData.transTime);
      if (slipDateTime) {
        const now = Date.now();
        const ageHours = (now - slipDateTime.getTime()) / (1000 * 60 * 60);

        // ไม่อนุญาตให้ใช้สลิปเก่าเกิน 24 ชั่วโมง
        if (ageHours > 24) {
          const dateDisplay = slipDateTime.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
          return NextResponse.json({
            success: false,
            isRealApi: true,
            message: `สลิปนี้ทำรายการเมื่อ ${dateDisplay} เกินกว่า 24 ชั่วโมงแล้ว (เป็นสลิปเก่า ไม่สามารถนำมาใช้ซ้ำได้)`,
            rawSlipOk: slipData,
          });
        }

        // ตรวจสอบเทียบกับเวลาสร้างบิล: สลิปต้องไม่เกิดขึ้นก่อนเวลาสร้างบิลเกิน 30 นาที
        const billCreatedDate = parseBillCreatedDateTime(billCreatedAt);
        if (billCreatedDate) {
          const diffMinutes = (billCreatedDate.getTime() - slipDateTime.getTime()) / (1000 * 60);
          if (diffMinutes > 30) {
            const slipDisplay = slipDateTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            const billDisplay = billCreatedDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            return NextResponse.json({
              success: false,
              isRealApi: true,
              message: `สลิปนี้โอนเวลา ${slipDisplay} น. ซึ่งเกิดขึ้นก่อนเวลาออกบิล (${billDisplay} น.) กรุณาใช้สลิปการโอนเงินที่เป็นปัจจุบันของบิลนี้`,
              rawSlipOk: slipData,
            });
          }
        }
      }

      // เมื่อผ่านทุกเงื่อนไขความปลอดภัย -> บันทึก transRef ลงฐานข้อมูลสลิปที่ใช้แล้ว
      if (transRef) {
        recordUsedSlip(transRef, {
          billId: billId || 'unknown',
          amount: actualAmount,
          sender: senderObj.displayName || senderObj.name?.th || senderObj.name || '',
          slipDate: slipData.transDate,
          slipTime: slipData.transTime,
        });
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
        message: 'ตรวจสอบสลิปสำเร็จผ่าน SlipOK API (ระบบจริง ตรวจสอบยอดเงิน บัญชี และเวลาถูกต้องสมบูรณ์)',
        data: {
          transRef: transRef || `REF_${Date.now()}`,
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
      friendlyMsg = 'บัญชีผู้รับเงินในสลิปไม่ตรงกับบัญชีของคลินิก (ต้องโอนเข้า น.ส. ชลลดา นักรบ)';
    } else if (json.code === 1001 || json.message?.includes('duplicate')) {
      friendlyMsg = 'สลิปนี้เคยถูกนำมาใช้งานในระบบแล้ว (สลิปซ้ำ)';
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
