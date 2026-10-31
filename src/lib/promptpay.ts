/**
 * Bank of Thailand (BOT) & EMVCo Standard PromptPay QR Generator
 * Generates official Thai QR Payment strings and Base64 Data URLs with fixed transaction amounts.
 */

import QRCode from 'qrcode';

export const CLINIC_PROMPTPAY_NUMBER = '095-550-6741';
export const CLINIC_BANK_ACCOUNT = '090-8-46418-4';
export const CLINIC_ACCOUNT_NAME = 'น.ส. ชลลดา นักรบ (VetCare Clinic)';
export const CLINIC_BANK_NAME = 'ธนาคารกสิกรไทย (KBANK)';

/**
 * Calculates standard CRC-16 CCITT (0xFFFF) checksum for EMVCo QR code string
 */
export function crc16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= (data.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates official BOT EMVCo PromptPay QR payload string with embedded amount
 * @param target Phone number (10 digits) or Citizen ID/Tax ID (13 digits)
 * @param amount Optional transaction amount (e.g. 20 or 20.00)
 */
export function generatePromptPayPayload(target: string, amount?: number | null): string {
  const cleanTarget = target.replace(/[^0-9]/g, '');
  let formattedTarget = cleanTarget;
  let targetType = '01'; // 01 for mobile phone

  if (cleanTarget.length === 10 && cleanTarget.startsWith('0')) {
    formattedTarget = '0066' + cleanTarget.substring(1);
    targetType = '01';
  } else if (cleanTarget.length === 13) {
    formattedTarget = cleanTarget;
    targetType = '02'; // 02 for National ID / Tax ID
  }

  // Tag 29: PromptPay Merchant Account Information
  const subTag00 = '0016A000000677010111'; // PromptPay Application ID
  const subTagTarget = targetType + formattedTarget.length.toString().padStart(2, '0') + formattedTarget;
  const tag29Val = subTag00 + subTagTarget;
  const tag29 = '29' + tag29Val.length.toString().padStart(2, '0') + tag29Val;

  // Tag 01: Point of Initiation (11 = Static / multi-use, 12 = Dynamic / single-use with amount)
  const hasAmount = amount !== undefined && amount !== null && amount > 0;
  const initMethod = hasAmount ? '010212' : '010211';

  // Tag 00: Format Indicator (01)
  // Tag 53: Currency THB (764)
  let payload = '000201' + initMethod + tag29 + '5303764';

  // Tag 54: Transaction Amount (2 decimal digits)
  if (hasAmount) {
    const amtStr = Number(amount).toFixed(2);
    payload += '54' + amtStr.length.toString().padStart(2, '0') + amtStr;
  }

  // Tag 58: Country Code (TH)
  // Tag 63: CRC16 Checksum container
  payload += '5802TH6304';
  const checksum = crc16(payload);

  return payload + checksum;
}

/**
 * Generates a clean, scannable Base64 PNG Data URL for PromptPay QR code
 */
export async function generatePromptPayQrDataUrl(
  target: string = CLINIC_PROMPTPAY_NUMBER,
  amount?: number | null
): Promise<string> {
  const payload = generatePromptPayPayload(target, amount);
  return QRCode.toDataURL(payload, {
    margin: 2,
    scale: 8,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#0f172a', // slate-900 for high scannability
      light: '#ffffff',
    },
  });
}
