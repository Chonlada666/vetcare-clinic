'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Pet,
  Vet,
  ServiceItem,
  MedicineItem,
  Appointment,
  TreatmentRecord,
  PaymentBill,
  UserRole,
  AppointmentStatus,
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
import { generateId } from './utils';
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';

const STORAGE_KEY = 'vet_clinic_system_state_v1';
const SESSION_USER_KEY = 'vetcare_active_session_uid_v1';

/**
 * Remove `undefined` values recursively because Firestore throws an error if any field is `undefined`
 */
function sanitizeForFirestore<T>(obj: T): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const clean: Record<string, any> = {};
  Object.keys(obj as any).forEach((key) => {
    const val = (obj as any)[key];
    if (val !== undefined) {
      clean[key] = sanitizeForFirestore(val);
    }
  });
  return clean;
}

interface ClinicContextType {
  currentUser: User | null;
  users: User[];
  vets: Vet[];
  pets: Pet[];
  services: ServiceItem[];
  medicines: MedicineItem[];
  appointments: Appointment[];
  treatments: TreatmentRecord[];
  bills: PaymentBill[];
  isLoaded: boolean;
  isFirestoreConnected: boolean;

  // Auth & Session
  login: (userOrId: string | User) => void;
  logout: () => void;
  quickSwitchUser: (role: UserRole) => void;
  addUser: (user: Omit<User, 'id'>) => User;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Pets
  addPet: (pet: Omit<Pet, 'id'>) => Pet;
  updatePet: (id: string, data: Partial<Pet>) => void;
  deletePet: (id: string) => void;

  // Vets
  addVet: (vet: Omit<Vet, 'id'>) => Vet;
  updateVet: (id: string, data: Partial<Vet>) => void;
  deleteVet: (id: string) => void;

  // Appointments
  createAppointment: (data: {
    petId: string;
    ownerId: string;
    vetId: string;
    serviceId?: string;
    date: string;
    timeSlot: string;
    initialSymptoms: string;
  }) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, notes?: string) => void;
  rescheduleAppointment: (id: string, date: string, timeSlot: string) => void;
  cancelAppointment: (id: string) => void;

  // Treatments & EMR
  addTreatmentRecord: (data: {
    appointmentId: string;
    petId: string;
    vetId: string;
    date: string;
    symptoms: string;
    examinationResults?: string;
    treatmentDetails?: string;
    prescriptions: TreatmentRecord['prescriptions'];
    serviceFee: number;
    followUpDate?: string;
    followUpNotes?: string;
  }) => TreatmentRecord;

  // Payments & Invoicing
  uploadPaymentSlip: (billId: string, slipUrl: string) => void;
  verifyPayment: (billId: string, approved: boolean, reason?: string) => void;
  payWithCash: (billId: string) => void;

  // Services & Medicines
  addService: (service: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, data: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  addMedicine: (med: Omit<MedicineItem, 'id'>) => void;
  updateMedicine: (id: string, data: Partial<MedicineItem>) => void;
  deleteMedicine: (id: string) => void;

  // Reset
  resetToMockData: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [vets, setVets] = useState<Vet[]>(INITIAL_VETS);
  const [pets, setPets] = useState<Pet[]>(INITIAL_PETS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [medicines, setMedicines] = useState<MedicineItem[]>(INITIAL_MEDICINES);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [treatments, setTreatments] = useState<TreatmentRecord[]>(INITIAL_TREATMENTS);
  const [bills, setBills] = useState<PaymentBill[]>(INITIAL_BILLS);

  // 1. Initial Load & Real-Time Cloud Firestore Listeners
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const initializeState = async () => {
      // Step A: Load from localStorage first as fast fallback
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.users) {
            const mergedU = [...parsed.users];
            INITIAL_USERS.forEach((initU) => {
              if (!mergedU.some((u: User) => u.id === initU.id)) {
                mergedU.push(initU);
              }
            });
            setUsers(mergedU);
          } else {
            setUsers(INITIAL_USERS);
          }

          if (parsed.vets) {
            const mergedV = [...parsed.vets];
            INITIAL_VETS.forEach((initV) => {
              if (!mergedV.some((v: Vet) => v.id === initV.id)) {
                mergedV.push(initV);
              }
            });
            setVets(mergedV);
          } else {
            setVets(INITIAL_VETS);
          }

          if (parsed.pets) {
            const mergedP = [...parsed.pets];
            INITIAL_PETS.forEach((initP) => {
              if (!mergedP.some((p: Pet) => p.id === initP.id)) {
                mergedP.push(initP);
              }
            });
            setPets(mergedP);
          } else {
            setPets(INITIAL_PETS);
          }

          if (parsed.services) {
            const mergedS = [...parsed.services];
            INITIAL_SERVICES.forEach((initS) => {
              if (!mergedS.some((s: ServiceItem) => s.id === initS.id)) {
                mergedS.push(initS);
              }
            });
            setServices(mergedS);
          } else {
            setServices(INITIAL_SERVICES);
          }

          if (parsed.medicines) {
            const mergedM = [...parsed.medicines];
            INITIAL_MEDICINES.forEach((initM) => {
              if (!mergedM.some((m: MedicineItem) => m.id === initM.id)) {
                mergedM.push(initM);
              }
            });
            setMedicines(mergedM);
          } else {
            setMedicines(INITIAL_MEDICINES);
          }

          if (parsed.appointments) {
            const mergedA = [...parsed.appointments];
            INITIAL_APPOINTMENTS.forEach((initA) => {
              if (!mergedA.some((a: Appointment) => a.id === initA.id)) {
                mergedA.push(initA);
              }
            });
            setAppointments(mergedA);
          } else {
            setAppointments(INITIAL_APPOINTMENTS);
          }

          if (parsed.treatments) {
            const mergedT = [...parsed.treatments];
            INITIAL_TREATMENTS.forEach((initT) => {
              if (!mergedT.some((t: TreatmentRecord) => t.id === initT.id)) {
                mergedT.push(initT);
              }
            });
            setTreatments(mergedT);
          } else {
            setTreatments(INITIAL_TREATMENTS);
          }

          if (parsed.bills) {
            const mergedB = [...parsed.bills];
            INITIAL_BILLS.forEach((initB) => {
              if (!mergedB.some((b: PaymentBill) => b.id === initB.id)) {
                mergedB.push(initB);
              }
            });
            setBills(mergedB);
          } else {
            setBills(INITIAL_BILLS);
          }

          try {
            const activeSessionId =
              typeof window !== 'undefined'
                ? sessionStorage.getItem(SESSION_USER_KEY) || localStorage.getItem(SESSION_USER_KEY)
                : null;
            if (activeSessionId) {
              const activeU = (parsed.users || INITIAL_USERS).find((user: User) => user.id === activeSessionId);
              setCurrentUser(activeU || null);
            } else {
              setCurrentUser(null);
            }
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        console.error('Failed to parse local state', e);
        setCurrentUser(null);
      }

      // Step B: Connect Real-Time Cloud Firestore
      if (isFirebaseConfigured() && db) {
        try {
          setIsFirestoreConnected(true);

          // Subscribe to appointments in Real-Time (with merge)
          const unsubApts = onSnapshot(
            collection(db, 'appointments'),
            (snap) => {
              if (!snap.empty) {
                const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Appointment));
                setAppointments((prev) => {
                  const combined = [...list];
                  prev.forEach((localA) => {
                    if (!combined.some((a) => a.id === localA.id)) {
                      combined.push(localA);
                    }
                  });
                  return combined;
                });
              }
            },
            (err) => console.warn('Firestore appointments listener note:', err)
          );
          unsubs.push(unsubApts);

          // Subscribe to treatments in Real-Time (with merge)
          const unsubTreatments = onSnapshot(
            collection(db, 'treatments'),
            (snap) => {
              if (!snap.empty) {
                const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as TreatmentRecord));
                setTreatments((prev) => {
                  const combined = [...list];
                  prev.forEach((localT) => {
                    if (!combined.some((t) => t.id === localT.id)) {
                      combined.push(localT);
                    }
                  });
                  return combined;
                });
              }
            },
            (err) => console.warn('Firestore treatments listener note:', err)
          );
          unsubs.push(unsubTreatments);

          // Subscribe to bills in Real-Time (with merge)
          const unsubBills = onSnapshot(
            collection(db, 'bills'),
            (snap) => {
              if (!snap.empty) {
                const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as PaymentBill));
                setBills((prev) => {
                  const combined = [...list];
                  prev.forEach((localB) => {
                    if (!combined.some((b) => b.id === localB.id)) {
                      combined.push(localB);
                    }
                  });
                  return combined;
                });
              }
            },
            (err) => console.warn('Firestore bills listener note:', err)
          );
          unsubs.push(unsubBills);

          // Subscribe to pets in Real-Time (with merge)
          const unsubPets = onSnapshot(
            collection(db, 'pets'),
            (snap) => {
              if (!snap.empty) {
                const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Pet));
                setPets((prev) => {
                  const combined = [...list];
                  prev.forEach((localP) => {
                    if (!combined.some((p) => p.id === localP.id)) {
                      combined.push(localP);
                    }
                  });
                  return combined;
                });
              }
            },
            (err) => console.warn('Firestore pets listener note:', err)
          );
          unsubs.push(unsubPets);

          // Subscribe to medicines in Real-Time (with merge)
          const unsubMeds = onSnapshot(
            collection(db, 'medicines'),
            (snap) => {
              if (!snap.empty) {
                const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as MedicineItem));
                setMedicines((prev) => {
                  const combined = [...list];
                  prev.forEach((localM) => {
                    if (!combined.some((m) => m.id === localM.id)) {
                      combined.push(localM);
                    }
                  });
                  return combined;
                });
              }
            },
            (err) => console.warn('Firestore medicines listener note:', err)
          );
          unsubs.push(unsubMeds);

          // Subscribe to services in Real-Time (with merge)
          const unsubServices = onSnapshot(
            collection(db, 'services'),
            (snap) => {
              if (!snap.empty) {
                const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as ServiceItem));
                setServices((prev) => {
                  const combined = [...list];
                  prev.forEach((localS) => {
                    if (!combined.some((s) => s.id === localS.id)) {
                      combined.push(localS);
                    }
                  });
                  return combined;
                });
              }
            },
            (err) => console.warn('Firestore services listener note:', err)
          );
          unsubs.push(unsubServices);

          // Subscribe to users in Real-Time (with merge and sync back)
          const unsubUsers = onSnapshot(
            collection(db, 'users'),
            (snap) => {
              if (!snap.empty) {
                const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as User));
                setUsers((prev) => {
                  const combined = [...list];
                  prev.forEach((localU) => {
                    if (
                      !combined.some(
                        (u) =>
                          u.id === localU.id ||
                          (u.email && localU.email && u.email.toLowerCase() === localU.email.toLowerCase())
                      )
                    ) {
                      combined.push(localU);
                      // Proactively sync local registered user to Firestore
                      try {
                        setDoc(doc(db, 'users', localU.id), sanitizeForFirestore(localU)).catch(() => {});
                      } catch {}
                    }
                  });
                  return combined;
                });
              }
            },
            (err) => console.warn('Firestore users listener note:', err)
          );
          unsubs.push(unsubUsers);

          // Subscribe to vets in Real-Time (with merge)
          const unsubVets = onSnapshot(
            collection(db, 'vets'),
            (snap) => {
              if (!snap.empty) {
                const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Vet));
                setVets((prev) => {
                  const combined = [...list];
                  prev.forEach((localV) => {
                    if (!combined.some((v) => v.id === localV.id)) {
                      combined.push(localV);
                    }
                  });
                  return combined;
                });
              }
            },
            (err) => console.warn('Firestore vets listener note:', err)
          );
          unsubs.push(unsubVets);
        } catch (error) {
          console.warn('Firestore connection setup note:', error);
        }
      }

      setIsLoaded(true);
    };

    initializeState();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Save to LocalStorage whenever state changes for reliable cache
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave = {
        users,
        vets,
        pets,
        services,
        medicines,
        appointments,
        treatments,
        bills,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [users, vets, pets, services, medicines, appointments, treatments, bills, isLoaded]);

  // Auth Operations
  const login = (userOrId: string | User) => {
    let targetUser: User | undefined;
    if (typeof userOrId === 'object' && userOrId !== null) {
      targetUser = userOrId;
    } else {
      targetUser = users.find(
        (u) => u.id === userOrId || (u.email && u.email.toLowerCase() === userOrId.toLowerCase())
      );
    }

    if (targetUser) {
      setCurrentUser(targetUser);
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(SESSION_USER_KEY, targetUser.id);
          localStorage.setItem(SESSION_USER_KEY, targetUser.id);
        }
      } catch (e) {}
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESSION_USER_KEY);
        localStorage.removeItem(SESSION_USER_KEY);
      }
    } catch (e) {}
  };

  const quickSwitchUser = (role: UserRole) => {
    let user = users.find((u) => u.role === role);
    if (role === 'vet') {
      user = users.find((u) => u.role === 'vet' && u.name.includes('ปานวาด')) || user;
    }
    if (user) {
      setCurrentUser(user);
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(SESSION_USER_KEY, user.id);
          localStorage.setItem(SESSION_USER_KEY, user.id);
        }
      } catch (e) {}
    }
  };

  const addUser = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: generateId('user'),
      avatar:
        userData.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };

    setUsers((prev) => {
      const exists = prev.some(
        (u) =>
          u.id === newUser.id ||
          (u.email && newUser.email && u.email.toLowerCase() === newUser.email.toLowerCase())
      );
      const updated = exists
        ? prev.map((u) =>
            u.id === newUser.id ||
            (u.email && newUser.email && u.email.toLowerCase() === newUser.email.toLowerCase())
              ? newUser
              : u
          )
        : [...prev, newUser];

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.users = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {
        console.error('LocalStorage sync error in addUser:', e);
      }
      return updated;
    });

    setCurrentUser(newUser); // Immediately activate new user session
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_USER_KEY, newUser.id);
      }
    } catch (e) {}

    if (isFirebaseConfigured() && db) {
      try {
        setDoc(doc(db, 'users', newUser.id), sanitizeForFirestore(newUser)).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore user save error:', err);
      }
    }
    return newUser;
  };

  const updateUser = (id: string, data: Partial<User>) => {
    const prevUser = users.find((u) => u.id === id);

    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === id ? { ...u, ...data } : u));
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.users = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {}
      return updated;
    });

    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    }

    // If user is a vet, also keep the matching vet profile in sync
    if (prevUser && prevUser.role === 'vet') {
      const matchingVet = vets.find(
        (v) =>
          (v.email && prevUser.email && v.email.toLowerCase() === prevUser.email.toLowerCase()) ||
          v.name === prevUser.name
      );
      if (matchingVet) {
        const vetUpdates: Partial<Vet> = {};
        if (data.name !== undefined) vetUpdates.name = data.name;
        if (data.email !== undefined) vetUpdates.email = data.email;
        if (data.phone !== undefined) vetUpdates.phone = data.phone;
        if (data.avatar !== undefined) vetUpdates.avatar = data.avatar;
        if (Object.keys(vetUpdates).length > 0) {
          setVets((prev) => prev.map((v) => (v.id === matchingVet.id ? { ...v, ...vetUpdates } : v)));
          if (isFirebaseConfigured() && db) {
            try {
              updateDoc(doc(db, 'vets', matchingVet.id), sanitizeForFirestore(vetUpdates)).catch(() => {});
            } catch {}
          }
        }
      }
    }

    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(doc(db, 'users', id), sanitizeForFirestore(data)).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore user update error:', err);
      }
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== id);
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.users = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {}
      return updated;
    });

    if (isFirebaseConfigured() && db) {
      try {
        deleteDoc(doc(db, 'users', id)).catch((err) => console.warn('Firestore sync error:', err));
      } catch (err) {
        console.warn('Firestore user delete error:', err);
      }
    }
  };

  // Pets Operations
  const addPet = (petData: Omit<Pet, 'id'>): Pet => {
    const newPet: Pet = { ...petData, id: generateId('pet') };
    setPets((prev) => {
      const updated = [...prev, newPet];
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.pets = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {
        console.error('LocalStorage sync error in addPet:', e);
      }
      return updated;
    });
    if (isFirebaseConfigured() && db) {
      try {
        setDoc(doc(db, 'pets', newPet.id), sanitizeForFirestore(newPet)).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore pet save error:', err);
      }
    }
    return newPet;
  };

  const updatePet = (id: string, data: Partial<Pet>) => {
    setPets((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.pets = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {
        console.error('LocalStorage sync error in updatePet:', e);
      }
      return updated;
    });
    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(doc(db, 'pets', id), sanitizeForFirestore(data)).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore pet update error:', err);
      }
    }
  };

  const deletePet = (id: string) => {
    setPets((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.pets = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {
        console.error('LocalStorage sync error in deletePet:', e);
      }
      return updated;
    });
    if (isFirebaseConfigured() && db) {
      try {
        deleteDoc(doc(db, 'pets', id)).catch((err) => console.warn('Firestore sync error:', err));
      } catch (err) {
        console.warn('Firestore pet delete error:', err);
      }
    }
  };

  // Vets Operations
  const addVet = (vetData: Omit<Vet, 'id'>): Vet => {
    const newVet: Vet = { ...vetData, id: generateId('vet') };
    setVets((prev) => [...prev, newVet]);
    if (isFirebaseConfigured() && db) {
      try {
        setDoc(doc(db, 'vets', newVet.id), sanitizeForFirestore(newVet)).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore vet save error:', err);
      }
    }
    return newVet;
  };

  const updateVet = (id: string, data: Partial<Vet>) => {
    setVets((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v)));
    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(doc(db, 'vets', id), sanitizeForFirestore(data)).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore vet update error:', err);
      }
    }
  };

  const deleteVet = (id: string) => {
    setVets((prev) => prev.filter((v) => v.id !== id));
    if (isFirebaseConfigured() && db) {
      try {
        deleteDoc(doc(db, 'vets', id)).catch((err) => console.warn('Firestore sync error:', err));
      } catch (err) {
        console.warn('Firestore vet delete error:', err);
      }
    }
  };

  // Appointments Operations
  const createAppointment = (data: {
    petId: string;
    ownerId: string;
    vetId: string;
    serviceId?: string;
    date: string;
    timeSlot: string;
    initialSymptoms: string;
  }): Appointment => {
    const newAppointment: Appointment = {
      id: generateId('apt'),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setAppointments((prev) => {
      const updated = [newAppointment, ...prev];
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.appointments = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {
        console.error('LocalStorage sync error in createAppointment:', e);
      }
      return updated;
    });

    // Real-Time Cloud Firestore Sync
    if (isFirebaseConfigured() && db) {
      try {
        setDoc(doc(db, 'appointments', newAppointment.id), sanitizeForFirestore(newAppointment)).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore appointment save error:', err);
      }
    }
    return newAppointment;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus, notes?: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status, notes: notes || apt.notes } : apt))
    );
    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(doc(db, 'appointments', id), sanitizeForFirestore({ status, notes })).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore appointment status error:', err);
      }
    }
  };

  const rescheduleAppointment = (id: string, date: string, timeSlot: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, date, timeSlot, status: 'pending' } : apt))
    );
    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(doc(db, 'appointments', id), sanitizeForFirestore({ date, timeSlot, status: 'pending' })).catch(
          (err) => console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore reschedule error:', err);
      }
    }
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
    );
    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(doc(db, 'appointments', id), { status: 'cancelled' }).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore cancel appointment error:', err);
      }
    }
  };

  // Treatments & Clinical EMR with atomic stock deduction
  const addTreatmentRecord = (data: {
    appointmentId: string;
    petId: string;
    vetId: string;
    date: string;
    symptoms: string;
    examinationResults?: string;
    treatmentDetails?: string;
    prescriptions: TreatmentRecord['prescriptions'];
    serviceFee: number;
    followUpDate?: string;
    followUpNotes?: string;
  }): TreatmentRecord => {
    const medicineFee = data.prescriptions.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = data.serviceFee + medicineFee;
    const trId = generateId('tr');

    const newRecord: TreatmentRecord = {
      id: trId,
      appointmentId: data.appointmentId,
      petId: data.petId,
      vetId: data.vetId,
      date: data.date,
      symptoms: data.symptoms,
      examinationResults: data.examinationResults,
      treatmentDetails: data.treatmentDetails,
      prescriptions: data.prescriptions,
      serviceFee: data.serviceFee,
      medicineFee,
      totalAmount,
      followUpDate: data.followUpDate,
      followUpNotes: data.followUpNotes,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setTreatments((prev) => [newRecord, ...prev]);

    // Update appointment status to completed
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === data.appointmentId ? { ...apt, status: 'completed' } : apt))
    );

    // Deduct medicine stock atomically
    if (data.prescriptions.length > 0) {
      const qtyMap = new Map<string, number>();
      data.prescriptions.forEach((p) => {
        qtyMap.set(p.medicineId, (qtyMap.get(p.medicineId) || 0) + p.quantity);
      });

      setMedicines((prev) => {
        return prev.map((med) => {
          const deduct = qtyMap.get(med.id);
          if (deduct) {
            const updatedStock = Math.max(0, med.stock - deduct);
            if (isFirebaseConfigured() && db) {
              try {
                setDoc(doc(db, 'medicines', med.id), { ...sanitizeForFirestore(med), stock: updatedStock }, { merge: true }).catch((err) =>
                  console.warn('Firestore stock sync error:', err)
                );
              } catch (err) {
                console.warn('Firestore medicine stock update error:', err);
              }
            }
            return {
              ...med,
              stock: updatedStock,
            };
          }
          return med;
        });
      });
    }

    // Auto-create bill for owner
    const apt = appointments.find((a) => a.id === data.appointmentId);
    const newBill: PaymentBill = {
      id: generateId('bill'),
      appointmentId: data.appointmentId,
      treatmentRecordId: trId,
      petId: data.petId,
      ownerId: apt ? apt.ownerId : currentUser?.id || 'unknown',
      totalAmount,
      status: 'pending_upload',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setBills((prev) => [newBill, ...prev]);

    // Real-Time Cloud Firestore Sync Batch
    if (isFirebaseConfigured() && db) {
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'treatments', newRecord.id), sanitizeForFirestore(newRecord));
        batch.update(doc(db, 'appointments', data.appointmentId), { status: 'completed' });
        batch.set(doc(db, 'bills', newBill.id), sanitizeForFirestore(newBill));
        batch.commit().catch((err) => console.warn('Firestore batch error:', err));
      } catch (err) {
        console.warn('Firestore batch error:', err);
      }
    }

    return newRecord;
  };

  // Payments & Invoicing
  const uploadPaymentSlip = (billId: string, slipUrl: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              status: 'verifying',
              slipUrl,
              slipUploadedAt: timestamp,
            }
          : bill
      )
    );
    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(
          doc(db, 'bills', billId),
          sanitizeForFirestore({
            status: 'verifying',
            slipUrl,
            slipUploadedAt: timestamp,
          })
        ).catch((err) => console.warn('Firestore sync error:', err));
      } catch (err) {
        console.warn('Firestore slip upload error:', err);
      }
    }
  };

  const verifyPayment = (billId: string, approved: boolean, reason?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const receiptNum = `RCP-${new Date().getFullYear()}${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== billId) return bill;
        if (approved) {
          return {
            ...bill,
            status: 'paid',
            paymentMethod: bill.paymentMethod || 'promptpay',
            verifiedAt: timestamp,
            receiptNumber: receiptNum,
            paidAt: timestamp,
            rejectionReason: undefined,
          };
        } else {
          return {
            ...bill,
            status: 'rejected',
            rejectionReason: reason || 'สลิปไม่ถูกต้อง หรือยอดเงินไม่ตรง',
          };
        }
      })
    );

    if (isFirebaseConfigured() && db) {
      try {
        if (approved) {
          updateDoc(
            doc(db, 'bills', billId),
            sanitizeForFirestore({
              status: 'paid',
              paymentMethod: 'promptpay',
              verifiedAt: timestamp,
              receiptNumber: receiptNum,
              paidAt: timestamp,
              rejectionReason: null,
            })
          ).catch((err) => console.warn('Firestore sync error:', err));
        } else {
          updateDoc(
            doc(db, 'bills', billId),
            sanitizeForFirestore({
              status: 'rejected',
              rejectionReason: reason || 'สลิปไม่ถูกต้อง หรือยอดเงินไม่ตรง',
            })
          ).catch((err) => console.warn('Firestore sync error:', err));
        }
      } catch (err) {
        console.warn('Firestore verify payment error:', err);
      }
    }
  };

  const payWithCash = (billId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const receiptNum = `RCP-${new Date().getFullYear()}${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    setBills((prev) =>
      prev.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              status: 'paid',
              paymentMethod: 'cash',
              verifiedAt: timestamp,
              receiptNumber: receiptNum,
              paidAt: timestamp,
              rejectionReason: undefined,
            }
          : bill
      )
    );

    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(
          doc(db, 'bills', billId),
          sanitizeForFirestore({
            status: 'paid',
            paymentMethod: 'cash',
            verifiedAt: timestamp,
            receiptNumber: receiptNum,
            paidAt: timestamp,
            rejectionReason: null,
          })
        ).catch((err) => console.warn('Firestore sync error:', err));
      } catch (err) {
        console.warn('Firestore pay with cash error:', err);
      }
    }
  };

  // Services CRUD
  const addService = (item: Omit<ServiceItem, 'id'>) => {
    const newItem: ServiceItem = { ...item, id: generateId('srv') };
    setServices((prev) => [...prev, newItem]);
    if (isFirebaseConfigured() && db) {
      try {
        setDoc(doc(db, 'services', newItem.id), sanitizeForFirestore(newItem)).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore service save error:', err);
      }
    }
  };

  const updateService = (id: string, data: Partial<ServiceItem>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(doc(db, 'services', id), sanitizeForFirestore(data)).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore service update error:', err);
      }
    }
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    if (isFirebaseConfigured() && db) {
      try {
        deleteDoc(doc(db, 'services', id)).catch((err) => console.warn('Firestore sync error:', err));
      } catch (err) {
        console.warn('Firestore service delete error:', err);
      }
    }
  };

  // Medicines CRUD
  const addMedicine = (med: Omit<MedicineItem, 'id'>) => {
    const newMed: MedicineItem = { ...med, id: generateId('med') };
    setMedicines((prev) => [...prev, newMed]);
    if (isFirebaseConfigured() && db) {
      try {
        setDoc(doc(db, 'medicines', newMed.id), sanitizeForFirestore(newMed)).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore medicine save error:', err);
      }
    }
  };

  const updateMedicine = (id: string, data: Partial<MedicineItem>) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    if (isFirebaseConfigured() && db) {
      try {
        setDoc(doc(db, 'medicines', id), sanitizeForFirestore(data), { merge: true }).catch((err) =>
          console.warn('Firestore sync error:', err)
        );
      } catch (err) {
        console.warn('Firestore medicine update error:', err);
      }
    }
  };

  const deleteMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    if (isFirebaseConfigured() && db) {
      try {
        deleteDoc(doc(db, 'medicines', id)).catch((err) => console.warn('Firestore sync error:', err));
      } catch (err) {
        console.warn('Firestore medicine delete error:', err);
      }
    }
  };

  // Reset Mock Data (Clears and re-seeds both Local & Firestore)
  const resetToMockData = async () => {
    setUsers(INITIAL_USERS);
    setVets(INITIAL_VETS);
    setPets(INITIAL_PETS);
    setServices(INITIAL_SERVICES);
    setMedicines(INITIAL_MEDICINES);
    setAppointments(INITIAL_APPOINTMENTS);
    setTreatments(INITIAL_TREATMENTS);
    setBills(INITIAL_BILLS);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.removeItem(STORAGE_KEY);

    if (isFirebaseConfigured() && db) {
      try {
        const batch = writeBatch(db);
        INITIAL_USERS.forEach((u) => batch.set(doc(db, 'users', u.id), sanitizeForFirestore(u)));
        INITIAL_VETS.forEach((v) => batch.set(doc(db, 'vets', v.id), sanitizeForFirestore(v)));
        INITIAL_PETS.forEach((p) => batch.set(doc(db, 'pets', p.id), sanitizeForFirestore(p)));
        INITIAL_SERVICES.forEach((s) => batch.set(doc(db, 'services', s.id), sanitizeForFirestore(s)));
        INITIAL_MEDICINES.forEach((m) => batch.set(doc(db, 'medicines', m.id), sanitizeForFirestore(m)));
        INITIAL_APPOINTMENTS.forEach((a) => batch.set(doc(db, 'appointments', a.id), sanitizeForFirestore(a)));
        INITIAL_TREATMENTS.forEach((t) => batch.set(doc(db, 'treatments', t.id), sanitizeForFirestore(t)));
        INITIAL_BILLS.forEach((b) => batch.set(doc(db, 'bills', b.id), sanitizeForFirestore(b)));
        await batch.commit();
      } catch (err) {
        console.warn('Firestore batch reset error:', err);
      }
    }
  };

  return (
    <ClinicContext.Provider
      value={{
        currentUser,
        users,
        vets,
        pets,
        services,
        medicines,
        appointments,
        treatments,
        bills,
        isLoaded,
        isFirestoreConnected,
        login,
        logout,
        quickSwitchUser,
        addUser,
        updateUser,
        deleteUser,
        addPet,
        updatePet,
        deletePet,
        addVet,
        updateVet,
        deleteVet,
        createAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        cancelAppointment,
        addTreatmentRecord,
        uploadPaymentSlip,
        verifyPayment,
        payWithCash,
        addService,
        updateService,
        deleteService,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        resetToMockData,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}
