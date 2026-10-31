import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_USERS } from '@/lib/mockData';
import { User } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'users.json');

function ensureUsersFile(): User[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_USERS, null, 2), 'utf8');
      return INITIAL_USERS;
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const map = new Map<string, User>();
      // Seed with initial users
      INITIAL_USERS.forEach((u) => {
        map.set(u.id, u);
        if (u.email) map.set(u.email.toLowerCase(), u);
      });
      // Merge with persisted users (persisted overrides seed if updated)
      parsed.forEach((u: User) => {
        if (u && u.id) {
          map.set(u.id, u);
          if (u.email) map.set(u.email.toLowerCase(), u);
        }
      });
      // Deduplicate by ID
      const deduplicated: User[] = [];
      const seenIds = new Set<string>();
      map.forEach((user) => {
        if (!seenIds.has(user.id)) {
          seenIds.add(user.id);
          deduplicated.push(user);
        }
      });
      return deduplicated;
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_USERS, null, 2), 'utf8');
    return INITIAL_USERS;
  } catch (err) {
    console.error('Error reading users data file:', err);
    return INITIAL_USERS;
  }
}

function saveUsers(usersList: User[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(usersList, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing users data file:', err);
  }
}

export async function GET() {
  const users = ensureUsersFile();
  return NextResponse.json({
    success: true,
    count: users.length,
    users,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentList = ensureUsersFile();

    if (Array.isArray(body)) {
      // Batch sync
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
      // Single user insert or update
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
