import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { INITIAL_USERS } from '@/lib/mockData';
import { User } from '@/types';

declare global {
  var __vetcare_users: User[] | undefined;
}

function getDataFilePath(): string {
  const projectDataDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(projectDataDir)) {
      fs.mkdirSync(projectDataDir, { recursive: true });
    }
    const testFile = path.join(projectDataDir, '.test_write_user');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return path.join(projectDataDir, 'users.json');
  } catch {
    const tmpDir = path.join(os.tmpdir(), 'vetcare_data');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {}
    }
    return path.join(tmpDir, 'users.json');
  }
}

function loadUsers(): User[] {
  if (globalThis.__vetcare_users && globalThis.__vetcare_users.length > 0) {
    return globalThis.__vetcare_users;
  }

  const filePath = getDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const map = new Map<string, User>();
        INITIAL_USERS.forEach((u) => {
          map.set(u.id, u);
          if (u.email) map.set(u.email.toLowerCase(), u);
        });
        parsed.forEach((u: User) => {
          if (u && u.id) {
            map.set(u.id, u);
            if (u.email) map.set(u.email.toLowerCase(), u);
          }
        });
        const deduplicated: User[] = [];
        const seenIds = new Set<string>();
        map.forEach((user) => {
          if (!seenIds.has(user.id)) {
            seenIds.add(user.id);
            deduplicated.push(user);
          }
        });
        globalThis.__vetcare_users = deduplicated;
        return deduplicated;
      }
    }
  } catch (err) {
    console.error('Error reading users file:', err);
  }

  globalThis.__vetcare_users = [...INITIAL_USERS];
  saveUsers(globalThis.__vetcare_users);
  return globalThis.__vetcare_users;
}

function saveUsers(usersList: User[]) {
  globalThis.__vetcare_users = usersList;
  try {
    const filePath = getDataFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(usersList, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

export async function GET() {
  const users = loadUsers();
  return NextResponse.json({
    success: true,
    count: users.length,
    users,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentList = loadUsers();

    if (Array.isArray(body)) {
      const map = new Map<string, User>();
      currentList.forEach((u) => map.set(u.id, u));
      body.forEach((u: User) => {
        if (u && u.id) {
          map.set(u.id, u);
        }
      });
      const updatedList = Array.from(map.values());
      saveUsers(updatedList);
      return NextResponse.json({ success: true, count: updatedList.length, users: updatedList });
    }

    if (body && (body.id || body.email)) {
      const cleanEmail = (body.email || '').trim().toLowerCase();
      const index = currentList.findIndex(
        (u) =>
          u.id === body.id ||
          (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
      );

      let updatedList: User[];
      if (index >= 0) {
        updatedList = currentList.map((u, i) => (i === index ? { ...u, ...body } : u));
      } else {
        updatedList = [...currentList, body];
      }
      saveUsers(updatedList);
      return NextResponse.json({ success: true, user: body, users: updatedList });
    }

    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    console.error('Failed to update users API:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
