import { NextResponse } from 'next/server';
import { seedFirestoreWithInitialData } from '@/lib/firebaseService';

export async function POST() {
  const result = await seedFirestoreWithInitialData();
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    message: 'Firebase Seeder Endpoint. Send a POST request to seed Firestore database with initial clinic data.',
  });
}
