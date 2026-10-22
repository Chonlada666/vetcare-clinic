import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
  User,
  Pet,
  Vet,
  Appointment,
  TreatmentRecord,
  PaymentBill,
  ServiceItem,
  MedicineItem,
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_VETS,
  INITIAL_PETS,
  INITIAL_SERVICES,
  INITIAL_MEDICINES,
  INITIAL_APPOINTMENTS,
  INITIAL_TREATMENTS,
  INITIAL_BILLS,
} from './mockData';

// Firestore Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  VETS: 'vets',
  PETS: 'pets',
  APPOINTMENTS: 'appointments',
  TREATMENTS: 'treatments',
  BILLS: 'bills',
  SERVICES: 'services',
  MEDICINES: 'medicines',
} as const;

/**
 * Generic Fetch all items from a collection
 */
export async function getCollectionData<T>(collectionName: string): Promise<T[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as T));
  } catch (error) {
    console.error(`Error fetching from ${collectionName}:`, error);
    return [];
  }
}

/**
 * Save or Update Document in Firestore
 */
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`Error saving document to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Delete Document from Firestore
 */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Seed Initial Mock Data into Firestore Database
 * Populates realistic clinic data with 1-click
 */
export async function seedFirestoreWithInitialData(): Promise<{ success: boolean; message: string }> {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      message: 'กรุณาระบุค่า Firebase Configuration ใน .env.local ก่อนทำการ Seed ข้อมูล',
    };
  }

  try {
    const batch = writeBatch(db);

    // 1. Users
    INITIAL_USERS.forEach((u) => {
      batch.set(doc(db, COLLECTIONS.USERS, u.id), u);
    });

    // 2. Vets
    INITIAL_VETS.forEach((v) => {
      batch.set(doc(db, COLLECTIONS.VETS, v.id), v);
    });

    // 3. Pets
    INITIAL_PETS.forEach((p) => {
      batch.set(doc(db, COLLECTIONS.PETS, p.id), p);
    });

    // 4. Services
    INITIAL_SERVICES.forEach((s) => {
      batch.set(doc(db, COLLECTIONS.SERVICES, s.id), s);
    });

    // 5. Medicines
    INITIAL_MEDICINES.forEach((m) => {
      batch.set(doc(db, COLLECTIONS.MEDICINES, m.id), m);
    });

    // 6. Appointments
    INITIAL_APPOINTMENTS.forEach((a) => {
      batch.set(doc(db, COLLECTIONS.APPOINTMENTS, a.id), a);
    });

    // 7. Treatments
    INITIAL_TREATMENTS.forEach((t) => {
      batch.set(doc(db, COLLECTIONS.TREATMENTS, t.id), t);
    });

    // 8. Bills
    INITIAL_BILLS.forEach((b) => {
      batch.set(doc(db, COLLECTIONS.BILLS, b.id), b);
    });

    await batch.commit();

    return {
      success: true,
      message: 'นำเข้าข้อมูลเริ่มต้น (Seed Data) สู่ Firestore เรียบร้อยแล้ว!',
    };
  } catch (error: any) {
    console.error('Error seeding Firestore:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลง Firestore',
    };
  }
}
