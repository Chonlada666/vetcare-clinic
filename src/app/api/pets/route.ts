import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { INITIAL_PETS } from '@/lib/mockData';
import { Pet } from '@/types';

declare global {
  var __vetcare_pets: Pet[] | undefined;
}

function getDataFilePath(): string {
  const projectDataDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(projectDataDir)) {
      fs.mkdirSync(projectDataDir, { recursive: true });
    }
    const testFile = path.join(projectDataDir, '.test_write_pet');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return path.join(projectDataDir, 'pets.json');
  } catch {
    const tmpDir = path.join(os.tmpdir(), 'vetcare_data');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {}
    }
    return path.join(tmpDir, 'pets.json');
  }
}

function loadPets(): Pet[] {
  if (globalThis.__vetcare_pets && globalThis.__vetcare_pets.length > 0) {
    return globalThis.__vetcare_pets;
  }

  const filePath = getDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const map = new Map<string, Pet>();
        INITIAL_PETS.forEach((p) => map.set(p.id, p));
        parsed.forEach((p: Pet) => {
          if (p && p.id) map.set(p.id, p);
        });
        const combined = Array.from(map.values());
        globalThis.__vetcare_pets = combined;
        return combined;
      }
    }
  } catch (err) {
    console.error('Error reading pets file:', err);
  }

  globalThis.__vetcare_pets = [...INITIAL_PETS];
  savePets(globalThis.__vetcare_pets);
  return globalThis.__vetcare_pets;
}

function savePets(petsList: Pet[]) {
  globalThis.__vetcare_pets = petsList;
  try {
    const filePath = getDataFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(petsList, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing pets file:', err);
  }
}

export async function GET() {
  const pets = loadPets();
  return NextResponse.json({
    success: true,
    count: pets.length,
    pets,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentList = loadPets();

    if (Array.isArray(body)) {
      const map = new Map<string, Pet>();
      currentList.forEach((p) => map.set(p.id, p));
      body.forEach((p: Pet) => {
        if (p && p.id) {
          map.set(p.id, p);
        }
      });
      const updatedList = Array.from(map.values());
      savePets(updatedList);
      return NextResponse.json({ success: true, count: updatedList.length, pets: updatedList });
    }

    if (body && body.id) {
      const index = currentList.findIndex((p) => p.id === body.id);
      let updatedList: Pet[];
      if (index >= 0) {
        updatedList = currentList.map((p) => (p.id === body.id ? { ...p, ...body } : p));
      } else {
        updatedList = [body, ...currentList];
      }
      savePets(updatedList);
      return NextResponse.json({ success: true, pet: body, pets: updatedList });
    }

    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    console.error('Failed to update pets API:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
