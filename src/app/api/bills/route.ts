import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { INITIAL_BILLS } from '@/lib/mockData';
import { PaymentBill } from '@/types';

declare global {
  var __vetcare_bills: PaymentBill[] | undefined;
}

function getDataFilePath(): string {
  const projectDataDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(projectDataDir)) {
      fs.mkdirSync(projectDataDir, { recursive: true });
    }
    const testFile = path.join(projectDataDir, '.test_write_bill');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return path.join(projectDataDir, 'bills.json');
  } catch {
    const tmpDir = path.join(os.tmpdir(), 'vetcare_data');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {}
    }
    return path.join(tmpDir, 'bills.json');
  }
}

const STATUS_PRIORITY: Record<string, number> = {
  paid: 3,
  verifying: 2,
  rejected: 2,
  pending_upload: 1,
};

function loadBills(): PaymentBill[] {
  if (globalThis.__vetcare_bills && globalThis.__vetcare_bills.length > 0) {
    return globalThis.__vetcare_bills;
  }

  const filePath = getDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const map = new Map<string, PaymentBill>();
        INITIAL_BILLS.forEach((b) => map.set(b.id, b));
        parsed.forEach((b: PaymentBill) => {
          if (b && b.id) map.set(b.id, b);
        });
        const combined = Array.from(map.values());
        globalThis.__vetcare_bills = combined;
        return combined;
      }
    }
  } catch (err) {
    console.error('Error reading bills file:', err);
  }

  globalThis.__vetcare_bills = [...INITIAL_BILLS];
  saveBills(globalThis.__vetcare_bills);
  return globalThis.__vetcare_bills;
}

function saveBills(bills: PaymentBill[]) {
  globalThis.__vetcare_bills = bills;
  const filePath = getDataFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(bills, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving bills file:', err);
  }
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const bills = loadBills();
  return NextResponse.json({ success: true, bills });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.id) {
      return NextResponse.json({ success: false, message: 'Invalid bill data' }, { status: 400 });
    }

    const currentBills = loadBills();
    const existingIndex = currentBills.findIndex((b) => b.id === body.id);

    if (existingIndex >= 0) {
      const existing = currentBills[existingIndex];
      const existingPri = STATUS_PRIORITY[existing.status] || 0;
      const incomingPri = STATUS_PRIORITY[body.status] || 0;

      // Never downgrade 'paid' status
      const finalStatus = incomingPri >= existingPri ? body.status : existing.status;

      currentBills[existingIndex] = {
        ...existing,
        ...body,
        status: finalStatus,
        receiptNumber: body.receiptNumber || existing.receiptNumber,
        paidAt: body.paidAt || existing.paidAt,
        verifiedAt: body.verifiedAt || existing.verifiedAt,
      };
    } else {
      currentBills.unshift(body as PaymentBill);
    }

    saveBills(currentBills);
    return NextResponse.json({ success: true, bill: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
