import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { INITIAL_APPOINTMENTS } from '@/lib/mockData';
import { Appointment } from '@/types';

declare global {
  var __vetcare_appointments: Appointment[] | undefined;
}

function getDataFilePath(): string {
  const projectDataDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(projectDataDir)) {
      fs.mkdirSync(projectDataDir, { recursive: true });
    }
    const testFile = path.join(projectDataDir, '.test_write');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return path.join(projectDataDir, 'appointments.json');
  } catch {
    const tmpDir = path.join(os.tmpdir(), 'vetcare_data');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {}
    }
    return path.join(tmpDir, 'appointments.json');
  }
}

function loadAppointments(): Appointment[] {
  if (globalThis.__vetcare_appointments && globalThis.__vetcare_appointments.length > 0) {
    return globalThis.__vetcare_appointments;
  }

  const filePath = getDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const map = new Map<string, Appointment>();
        INITIAL_APPOINTMENTS.forEach((a) => map.set(a.id, a));
        parsed.forEach((a: Appointment) => {
          if (a && a.id) map.set(a.id, a);
        });
        const combined = Array.from(map.values());
        globalThis.__vetcare_appointments = combined;
        return combined;
      }
    }
  } catch (err) {
    console.error('Error reading appointments file:', err);
  }

  globalThis.__vetcare_appointments = [...INITIAL_APPOINTMENTS];
  saveAppointments(globalThis.__vetcare_appointments);
  return globalThis.__vetcare_appointments;
}

function saveAppointments(appointments: Appointment[]) {
  globalThis.__vetcare_appointments = appointments;
  try {
    const filePath = getDataFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(appointments, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing appointments file:', err);
  }
}

export async function GET() {
  const appointments = loadAppointments();
  return NextResponse.json({
    success: true,
    count: appointments.length,
    appointments,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentList = loadAppointments();

    if (Array.isArray(body)) {
      const map = new Map<string, Appointment>();
      currentList.forEach((a) => map.set(a.id, a));
      body.forEach((a: Appointment) => {
        if (a && a.id) {
          map.set(a.id, a);
        }
      });
      const updatedList = Array.from(map.values());
      saveAppointments(updatedList);
      return NextResponse.json({ success: true, count: updatedList.length, appointments: updatedList });
    }

    if (body && body.id) {
      const index = currentList.findIndex((a) => a.id === body.id);
      let updatedList: Appointment[];
      if (index >= 0) {
        updatedList = currentList.map((a) => (a.id === body.id ? { ...a, ...body } : a));
      } else {
        updatedList = [body, ...currentList];
      }
      saveAppointments(updatedList);
      return NextResponse.json({ success: true, appointment: body, appointments: updatedList });
    }

    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    console.error('Failed to update appointments API:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
