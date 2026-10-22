export type UserRole = 'owner' | 'vet' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  address?: string;
  avatar?: string;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string; // สุนัข, แมว, กระต่าย, นก, สัตว์พิเศษ (Exotic), อื่นๆ
  exoticType?: string; // ระบุชนิดสัตว์พิเศษ เช่น ชูการ์ไกลเดอร์, เม่นแคระ, เฟอร์เรท, เต่าบก, กิ้งก่า, งู
  breed: string;
  gender: 'male' | 'female';
  ageYears: number;
  ageMonths: number;
  weightKg: number;
  allergies?: string;
  photoUrl?: string;
  notes?: string;
}

export interface Vet {
  id: string;
  name: string;
  specialty: string;
  licenseNo: string;
  phone: string;
  email: string;
  avatar: string;
  availableDays: string[];
  workingHours: { start: string; end: string };
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'checkup' | 'vaccine' | 'surgery' | 'lab' | 'dental' | 'other';
  price: number;
  estimatedTimeMin: number;
  description: string;
  isPopular?: boolean;
}

export interface MedicineItem {
  id: string;
  code: string;
  name: string;
  category: 'antibiotic' | 'painkiller' | 'vaccine' | 'parasite' | 'vitamin' | 'topical' | 'other';
  unit: string;
  unitPrice: number;
  stock: number;
  instructions: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_treatment' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  petId: string;
  ownerId: string;
  vetId: string;
  serviceId?: string;
  date: string;
  timeSlot: string;
  initialSymptoms: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface PrescribedMedicine {
  medicineId: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  instruction: string;
}

export interface TreatmentRecord {
  id: string;
  appointmentId: string;
  petId: string;
  vetId: string;
  date: string;
  symptoms: string; // บันทึกอาการ
  examinationResults?: string;
  treatmentDetails?: string;
  prescriptions: PrescribedMedicine[];
  serviceFee: number;
  medicineFee: number;
  totalAmount: number;
  followUpDate?: string;
  followUpNotes?: string;
  createdAt: string;
}

export type PaymentStatus = 'pending_upload' | 'verifying' | 'paid' | 'rejected';

export interface PaymentBill {
  id: string;
  appointmentId: string;
  treatmentRecordId: string;
  petId: string;
  ownerId: string;
  totalAmount: number;
  status: PaymentStatus;
  paymentMethod?: 'promptpay' | 'cash' | 'transfer';
  slipUrl?: string;
  slipUploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  receiptNumber?: string;
  paidAt?: string;
  createdAt: string;
}
