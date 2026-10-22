import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = (body.apiKey || '').trim();
    const branchId = (body.branchId || '').trim();

    if (!apiKey || !branchId) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกทั้ง SlipOK API Key และ Branch ID' },
        { status: 400 }
      );
    }

    // Update in runtime memory
    process.env.SLIPOK_API_KEY = apiKey;
    process.env.SLIPOK_BRANCH_ID = branchId;
    process.env.NEXT_PUBLIC_SLIPOK_BRANCH_ID = branchId;

    // Persist to .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Replace or Append SLIPOK_API_KEY
    if (/SLIPOK_API_KEY=.*/.test(envContent)) {
      envContent = envContent.replace(/SLIPOK_API_KEY=.*/, `SLIPOK_API_KEY="${apiKey}"`);
    } else {
      envContent += `\nSLIPOK_API_KEY="${apiKey}"`;
    }

    // Replace or Append SLIPOK_BRANCH_ID
    if (/SLIPOK_BRANCH_ID=.*/.test(envContent)) {
      envContent = envContent.replace(/SLIPOK_BRANCH_ID=.*/, `SLIPOK_BRANCH_ID="${branchId}"`);
    } else {
      envContent += `\nSLIPOK_BRANCH_ID="${branchId}"`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

    return NextResponse.json({
      success: true,
      message: 'บันทึกการตั้งค่า SlipOK API ของจริงเรียบร้อยแล้ว',
      branchId,
      maskedApiKey: `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`,
    });
  } catch (err: any) {
    console.error('Failed to save SlipOK config:', err);
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาดในการบันทึก: ${err.message}` },
      { status: 500 }
    );
  }
}
