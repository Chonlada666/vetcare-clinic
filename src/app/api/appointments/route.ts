import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_APPOINTMENTS } from '@/lib/mockData';
import { Appointment } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'appointments.json');

function ensureDataFile(): Appointment[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_APPOINTMENTS, null, 2), 'utf8');
      return INITIAL_APPOINTMENTS;
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge in any initial appointments that might be missing
      const existingIds = new Set(parsed.map((a: Appointment) => a.id));
      let modified = false;
      INITIAL_APPOINTMENTS.forEach((initA) => {
        if (!existingIds.has(initA.id)) {
          parsed.push(initA);
          modified = true;
        }
      });
      if (modified) {
        fs.writeFileSync(FILE_PATH, JSON.stringify(parsed, null, 2), 'utf8');
      }
      return parsed;
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_APPOINTMENTS, null, 2), 'utf8');
    return INITIAL_APPOINTMENTS;
  } catch (err) {
    console.error('Error reading appointments data file:', err);
    return INITIAL_APPOINTMENTS;
  }
}

function saveAppointments(appointments: Appointment[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(appointments, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing appointments data file:', err);
  }
}

export async function GET() {
  const appointments = ensureDataFile();
  return NextResponse.json({
    success: true,
    count: appointments.length,
    appointments,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentList = ensureDataFile();

    if (Array.isArray(body)) {
      // Batch sync
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
      // Single appointment insert or update
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
