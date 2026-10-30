'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useClinic } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency, formatThaiDate } from '@/lib/utils';
import { Vet } from '@/types';
import {
  Calendar,
  Clock,
  User,
  PawPrint,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Info,
  Sparkles,
  AlertCircle,
  HeartPulse,
  Plus,
  X,
  Upload,
  Tag,
} from 'lucide-react';

// Helper to get current today date string YYYY-MM-DD
function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to automatically assign on-duty vet according to day of week
const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

function getAssignedVet(dateStr: string, vetsList: Vet[]): Vet | undefined {
  if (!vetsList || vetsList.length === 0) return undefined;
  if (!dateStr) return vetsList[0];
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = THAI_DAYS[d.getDay()];
    const dutyVet = vetsList.find(
      (v) =>
        v.availableDays &&
        v.availableDays.some(
          (day) => day.includes(dayName) || dayName.includes(day) || day.toLowerCase().includes('ทุกวัน')
        )
    );
    return dutyVet || vetsList[0];
  } catch {
    return vetsList[0];
  }
}

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedPetId = searchParams.get('petId');
  const preSelectedServiceId = searchParams.get('serviceId');
  const preSelectedDate = searchParams.get('date');

  const { currentUser, isLoaded, pets, vets, services, appointments, createAppointment, addPet } = useClinic();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Quick Add Pet modal state
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState('สุนัข');
  const [newPetOtherSpecies, setNewPetOtherSpecies] = useState('');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetGender, setNewPetGender] = useState<'male' | 'female'>('male');
  const [newPetAgeYears, setNewPetAgeYears] = useState<string | number>(1);
  const [newPetAgeMonths, setNewPetAgeMonths] = useState<string | number>(0);
  const [newPetWeightKg, setNewPetWeightKg] = useState<string | number>('3.5');
  const [newPetAllergies, setNewPetAllergies] = useState('');
  const [newPetPhotoUrl, setNewPetPhotoUrl] = useState('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80');
  const [newPetNotes, setNewPetNotes] = useState('');
  const [isSavingPet, setIsSavingPet] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('ขนาดไฟล์รูปภาพต้องไม่เกิน 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPetPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newPetName.trim()) {
      alert('กรุณากรอกชื่อสัตว์เลี้ยง');
      return;
    }
    if (newPetSpecies === 'อื่นๆ' && !newPetOtherSpecies.trim()) {
      alert('กรุณาระบุชนิดสัตว์เลี้ยง');
      return;
    }

    setIsSavingPet(true);
    try {
      const parsedWeight = parseFloat(String(newPetWeightKg)) || 0;
      const parsedYears = parseInt(String(newPetAgeYears), 10) || 0;
      const parsedMonths = parseInt(String(newPetAgeMonths), 10) || 0;

      const payload: any = {
        ownerId: currentUser.id,
        name: newPetName.trim(),
        species: newPetSpecies,
        breed: newPetBreed.trim(),
        gender: newPetGender,
        ageYears: parsedYears,
        ageMonths: parsedMonths,
        weightKg: parsedWeight,
        allergies: newPetAllergies.trim(),
        photoUrl: newPetPhotoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
        notes: newPetNotes.trim(),
      };
      if (newPetSpecies === 'อื่นๆ' && newPetOtherSpecies.trim()) {
        payload.exoticType = newPetOtherSpecies.trim();
      }

      const created = addPet(payload);
      setSelectedPetId(created.id);
      setIsAddPetModalOpen(false);

      // Reset form
      setNewPetName('');
      setNewPetBreed('');
      setNewPetAllergies('');
      setNewPetNotes('');
    } catch (err) {
      console.error('Failed to quick add pet:', err);
    } finally {
      setIsSavingPet(false);
    }
  };

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (isLoaded && !currentUser) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/owner/booking';
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isLoaded, currentUser, router]);

  // Form selections
  const todayStr = getTodayDateString();
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [initialSymptoms, setInitialSymptoms] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preSelectedServiceId || services[0]?.id || 'srv_1');
  const [selectedDate, setSelectedDate] = useState<string>(preSelectedDate || todayStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:00 - 10:30');

  const myPets = pets.filter((p) => p.ownerId === currentUser?.id);

  // Set pre-selected pet if available
  useEffect(() => {
    if (preSelectedPetId && pets.some((p) => p.id === preSelectedPetId)) {
      setSelectedPetId(preSelectedPetId);
    } else if (myPets.length > 0 && !selectedPetId) {
      setSelectedPetId(myPets[0].id);
    }
  }, [preSelectedPetId, myPets, pets, selectedPetId]);

  // Set pre-selected service if available
  useEffect(() => {
    if (preSelectedServiceId && services.some((s) => s.id === preSelectedServiceId)) {
      setSelectedServiceId(preSelectedServiceId);
    }
  }, [preSelectedServiceId, services]);

  // Set pre-selected date if available
  useEffect(() => {
    if (preSelectedDate) {
      setSelectedDate(preSelectedDate);
    }
  }, [preSelectedDate]);

  // All time slots in a day
  const ALL_TIME_SLOTS = [
    '09:00 - 09:30',
    '09:30 - 10:00',
    '10:00 - 10:30',
    '10:30 - 11:00',
    '11:00 - 11:30',
    '11:30 - 12:00',
    '13:00 - 13:30',
    '13:30 - 14:00',
    '14:00 - 14:30',
    '14:30 - 15:00',
    '15:00 - 15:30',
    '15:30 - 16:00',
    '16:00 - 16:30',
    '16:30 - 17:00',
  ];

  // Dynamic assigned vet
  const assignedVet = getAssignedVet(selectedDate, vets);

  // Dynamic slot availability calculation
  const getSlotStatus = (time: string) => {
    const booked = appointments.some(
      (a) =>
        a.vetId === assignedVet?.id &&
        a.date === selectedDate &&
        a.timeSlot === time &&
        a.status !== 'cancelled'
    );
    return booked ? 'booked' : 'available';
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selectedPetId) {
        alert('กรุณาเลือกสัตว์เลี้ยง');
        return;
      }
      if (!initialSymptoms.trim()) {
        alert('กรุณากรอกอาการเบื้องต้น หรือเหตุผลที่เข้ารับการตรวจ');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedServiceId) {
        alert('กรุณาเลือกบริการที่ต้องการ');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedDate || !selectedTimeSlot) {
        alert('กรุณาเลือกวันและเวลาที่ต้องการนัดหมาย');
        return;
      }
      setStep(4);
    }
  };

  const handleConfirm = () => {
    if (!currentUser) return;
    const dutyVet = getAssignedVet(selectedDate, vets);
    createAppointment({
      petId: selectedPetId,
      ownerId: currentUser.id,
      vetId: dutyVet?.id || (vets[0]?.id || 'vet_1'),
      serviceId: selectedServiceId,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      initialSymptoms,
    });
    router.push('/owner/appointments');
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl text-white">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 mx-auto flex items-center justify-center animate-pulse">
          <HeartPulse className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white">กำลังนำท่านไปยังหน้าเข้าสู่ระบบ...</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          กรุณาเข้าสู่ระบบเพื่อดำเนินการจองคิวนัดหมายและเลือกบริการสัตว์เลี้ยงของคุณ
        </p>
      </div>
    );
  }

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-12">
      {/* Page Header */}
      <div className="text-center space-y-2 border-b border-slate-800 pb-6">
        <div className="text-sky-400 font-bold text-xs uppercase tracking-[0.2em]">
          ONLINE APPOINTMENT RESERVATION
        </div>
        <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide uppercase">
          ระบบจองคิวนัดหมายตรวจรักษา
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          จองคิวตรวจรักษาสัตว์เลี้ยงล่วงหน้า เลือกบริการ วัน และเวลาที่สะดวก ระบบจะจัดสรรแพทย์เวรดูแลให้อัตโนมัติ
        </p>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
        {[
          { num: 1, title: 'สัตว์เลี้ยง & อาการ' },
          { num: 2, title: 'บริการตรวจรักษา' },
          { num: 3, title: 'วัน & เวลาตรวจ' },
          { num: 4, title: 'สรุปและยืนยัน' },
        ].map((s) => {
          const isActive = step === s.num;
          const isPassed = step > s.num;
          return (
            <button
              type="button"
              key={s.num}
              disabled={!isPassed}
              onClick={() => isPassed && setStep(s.num as any)}
              className={`text-left p-3 sm:p-3.5 rounded-2xl border-2 transition ${
                isActive
                  ? 'border-sky-500 bg-sky-950/70 text-sky-200'
                  : isPassed
                  ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 cursor-pointer'
                  : 'border-slate-800 bg-slate-900 text-slate-400'
              }`}
            >
              <div className="text-xs font-black">
                {isPassed ? '✓ ' : ''}ขั้นที่ {s.num}
              </div>
              <div className="text-[11px] font-semibold truncate mt-0.5">{s.title}</div>
            </button>
          );
        })}
      </div>

      {/* Step Contents */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl text-white">
        {/* ================= STEP 1: Select Pet & Enter Symptoms ================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                ขั้นตอนที่ 1: เลือกสัตว์เลี้ยงและระบุอาการเบื้องต้น
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                เลือกสัตว์เลี้ยงของคุณที่ต้องการนำมารับการตรวจ พร้อมระบุอาการผิดปกติที่สังเกตพบ
              </p>
            </div>

            {/* Select Pet */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">เลือกสัตว์เลี้ยง *</label>
                {myPets.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddPetModalOpen(true)}
                    className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มสัตว์เลี้ยงใหม่</span>
                  </button>
                )}
              </div>
              {myPets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {myPets.map((pet) => {
                    const isSelected = selectedPetId === pet.id;
                    return (
                      <button
                        type="button"
                        key={pet.id}
                        onClick={() => setSelectedPetId(pet.id)}
                        className={`text-left p-3.5 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition ${
                          isSelected
                            ? 'border-sky-500 bg-sky-950/70 text-white'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                        }`}
                      >
                        <img
                          src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80'}
                          alt={pet.name}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-800"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold text-sm text-white truncate">{pet.name}</div>
                          <div className="text-xs text-slate-400">
                            {pet.species === 'อื่นๆ' && pet.exoticType ? pet.exoticType : pet.species} &bull; {pet.breed || '-'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setIsAddPetModalOpen(true)}
                    className="p-3.5 rounded-2xl border-2 border-dashed border-slate-800 hover:border-sky-500/60 bg-slate-950/60 hover:bg-slate-900 cursor-pointer flex items-center justify-center gap-2 transition text-slate-400 hover:text-sky-300 min-h-[72px]"
                  >
                    <Plus className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold">+ เพิ่มสัตว์เลี้ยงตัวใหม่</span>
                  </button>
                </div>
              ) : (
                <div className="p-8 bg-slate-950 rounded-2xl border-2 border-dashed border-slate-800 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 mx-auto flex items-center justify-center">
                    <PawPrint className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">คุณยังไม่มีสัตว์เลี้ยงที่ลงทะเบียน</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      ลงทะเบียนสัตว์เลี้ยงตอนนี้เพื่อเริ่มจองคิวตรวจรักษาได้ทันที สะดวก ไม่ต้องสลับหน้า
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddPetModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-sky-500/20"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ ลงทะเบียนสัตว์เลี้ยงทันที</span>
                  </button>
                </div>
              )}
            </div>

            {/* Symptoms description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                อาการเบื้องต้น / สาเหตุที่พามารับการตรวจ *
              </label>
              <textarea
                rows={3}
                required
                placeholder="ระบุอาการผิดปกติที่สังเกตพบ เช่น น้องซึม ไม่ทานอาหารมา 1 วัน, มีอาการคันหู ส่ายหัวบ่อย, ขาหลังกะเผลก, ถึงกำหนดฉีดวัคซีน ฯลฯ"
                value={initialSymptoms}
                onChange={(e) => setInitialSymptoms(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-slate-700 hover:border-slate-600 focus:border-sky-500 bg-slate-950 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-hidden transition duration-200"
              />
              <p className="text-[11px] text-slate-400">
                * สัตวแพทย์จะอ่านข้อมูลอาการเบื้องต้นนี้ก่อนเริ่มการตรวจรักษา
              </p>
            </div>
          </div>
        )}

        {/* ================= STEP 2: Select Service ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white">
                ขั้นตอนที่ 2: เลือกบริการตรวจรักษา
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                เลือกประเภทบริการตรวจรักษาที่ต้องการสำหรับสัตว์เลี้ยงของคุณ
              </p>
            </div>

            {/* Service Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">เลือกบริการที่ต้องการ *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((srv, idx) => {
                  const isSelected = selectedServiceId === srv.id;
                  const isPrimaryCheckup = idx === 0 || srv.id === 'srv_1';

                  return (
                    <button
                      type="button"
                      key={srv.id}
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`text-left p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-500 bg-sky-950/70 text-white'
                          : isPrimaryCheckup
                          ? 'border-slate-700 hover:border-slate-600 bg-slate-950'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-sm text-white">{srv.name}</span>
                          {isPrimaryCheckup && (
                            <span className="bg-sky-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                              แนะนำ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{srv.description}</p>
                      </div>

                      <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-800 text-xs font-semibold">
                        <span className="text-slate-400">
                          {isPrimaryCheckup ? 'ราคาเริ่มต้น' : 'ราคาประมาณ'}
                        </span>
                        <span className="text-sky-400 font-bold">{formatCurrency(srv.price)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: Select Date & Time Slot ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white">
                ขั้นตอนที่ 3: เลือกวันและช่วงเวลาตรวจ
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                เลือกวันและเวลาที่สะดวก โดยระบบจะจัดสรรสัตวแพทย์เวรประจำวันให้อัตโนมัติ
              </p>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">เลือกวันที่ต้องการนัดหมาย *</label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="date"
                  required
                  value={selectedDate}
                  min={todayStr}
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch {}
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val || val < todayStr) {
                      alert('ไม่สามารถเลือกวันที่ผ่านมาแล้วได้ กรุณาเลือกตั้งแต่วันนี้เป็นต้นไป');
                      setSelectedDate(todayStr);
                    } else {
                      setSelectedDate(val);
                    }
                  }}
                  className="w-full sm:w-64 px-4 py-2.5 rounded-xl border-2 border-slate-700 focus:border-sky-500 bg-slate-950 text-white text-xs sm:text-sm font-semibold focus:outline-hidden cursor-pointer [color-scheme:dark]"
                />
                <span className="text-xs font-bold text-sky-300 bg-sky-950/80 px-3.5 py-2.5 rounded-xl border border-slate-700">
                  {formatThaiDate(selectedDate)}
                </span>
              </div>
            </div>

            {/* Duty Vet Info Notice */}
            {assignedVet && (
              <div className="p-3.5 bg-slate-950 border border-sky-800/50 rounded-2xl flex items-center gap-3 text-xs">
                <img
                  src={assignedVet.avatar || '/images/vets/vet_panwad.jpg'}
                  alt={assignedVet.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-500/40"
                />
                <div className="flex-1">
                  <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">แพทย์เวรประจำวันที่เลือก</div>
                  <div className="font-extrabold text-white text-sm">
                    {assignedVet.name} <span className="text-xs font-normal text-slate-400">({assignedVet.specialty})</span>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/50 shrink-0">
                  พร้อมออกตรวจ
                </div>
              </div>
            )}

            {/* Time Slot Picker */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">เลือกช่วงเวลา (Slot ละ 30 นาที) *</label>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                    <span className="text-slate-300">ว่าง (จองได้)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></span>
                    <span className="text-slate-500">เต็มแล้ว</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {ALL_TIME_SLOTS.map((slot) => {
                  const status = getSlotStatus(slot);
                  const isBooked = status === 'booked';
                  const isSelected = selectedTimeSlot === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        isBooked
                          ? 'bg-slate-950/60 text-slate-600 border-slate-800/60 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-sky-500 text-slate-950 border-sky-500 font-black shadow-md'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-sky-500/50'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: Review and Confirm ================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white">
                ขั้นตอนที่ 4: ตรวจสอบและยืนยันการจองคิว
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                กรุณาตรวจสอบข้อมูลการนัดหมายให้ถูกต้องก่อนกดยืนยัน
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">สัตว์เลี้ยง:</span>
                  <div className="font-extrabold text-white text-sm">{selectedPet?.name}</div>
                  <div className="text-slate-400">
                    {selectedPet?.species === 'อื่นๆ' && selectedPet?.exoticType ? selectedPet?.exoticType : selectedPet?.species} &bull; {selectedPet?.breed || '-'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">สัตวแพทย์เวรประจำวัน (ระบบจัดสรร):</span>
                  <div className="font-extrabold text-white text-sm">{assignedVet?.name || '-'}</div>
                  <div className="text-sky-400 font-semibold">{assignedVet?.specialty}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">บริการที่เลือก:</span>
                  <div className="font-extrabold text-white">{selectedService?.name}</div>
                  <div className="text-slate-400 font-mono">
                    {selectedService?.id === 'srv_1' ? 'ราคาเริ่มต้น' : 'ราคาประมาณ'}{' '}
                    {formatCurrency(selectedService?.price || 0)}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">วันและเวลานัดหมาย:</span>
                  <div className="font-bold text-sky-300 text-sm">{formatThaiDate(selectedDate)}</div>
                  <div className="text-slate-200 font-bold">เวลา: {selectedTimeSlot} น.</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-sky-400 block text-[11px] font-bold">อาการเบื้องต้นที่แจ้งไว้:</span>
                <p className="text-slate-200 mt-0.5">{initialSymptoms}</p>
              </div>
            </div>

            {/* Mandatory Clinic Business Rule */}
            <div className="p-4 bg-amber-950/40 border border-amber-800/50 rounded-2xl text-amber-300 text-xs flex items-start gap-2.5">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>เงื่อนไขการเข้ารับบริการ:</strong> ค่าบริการที่แสดงเป็นราคาประเมินเบื้องต้น ค่ารักษาและค่ายาจริงอาจเปลี่ยนแปลงตามผลการตรวจและการวินิจฉัยของสัตวแพทย์
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> ย้อนกลับ
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/20 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              ถัดไป <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-1.5 px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> ยืนยันการจองคิวนัดหมาย
            </button>
          )}
        </div>
      </div>

      {/* Quick Add Pet Modal */}
      {isAddPetModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 text-white shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <PawPrint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">ลงทะเบียนสัตว์เลี้ยงใหม่</h3>
                  <p className="text-[11px] text-slate-400">กรอกข้อมูลสัตว์เลี้ยงเพื่อจองคิวนัดหมายทันที</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPetModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddPet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ชื่อสัตว์เลี้ยง *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น น้องโบโก้, มอมแมม"
                  value={newPetName}
                  onChange={(e) => setNewPetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ชนิดสัตว์เลี้ยง *</label>
                  <select
                    value={newPetSpecies}
                    onChange={(e) => setNewPetSpecies(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="สุนัข">สุนัข (Dog)</option>
                    <option value="แมว">แมว (Cat)</option>
                    <option value="กระต่าย">กระต่าย (Rabbit)</option>
                    <option value="นก">นก (Bird)</option>
                    <option value="อื่นๆ">อื่นๆ (Exotic Pet)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">เพศ *</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPetGender('male')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        newPetGender === 'male'
                          ? 'border-sky-500 bg-sky-950/60 text-sky-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      เพศผู้ ♂
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPetGender('female')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        newPetGender === 'female'
                          ? 'border-pink-500 bg-pink-950/60 text-pink-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      เพศเมีย ♀
                    </button>
                  </div>
                </div>
              </div>

              {newPetSpecies === 'อื่นๆ' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ระบุชนิดสัตว์เลี้ยงพิเศษ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ชูการ์ไกลเดอร์, ชินชิลล่า, เต่าซูคาต้า"
                    value={newPetOtherSpecies}
                    onChange={(e) => setNewPetOtherSpecies(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">สายพันธุ์</label>
                <input
                  type="text"
                  placeholder="เช่น โกลเด้น รีทรีฟเวอร์, บริติช ช็อตแฮร์"
                  value={newPetBreed}
                  onChange={(e) => setNewPetBreed(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">อายุ (ปี)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={newPetAgeYears}
                    onChange={(e) => setNewPetAgeYears(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">อายุ (เดือน)</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={newPetAgeMonths}
                    onChange={(e) => setNewPetAgeMonths(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">น้ำหนัก (กก.)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newPetWeightKg}
                    onChange={(e) => setNewPetWeightKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ประวัติแพ้ยา / แพ้อาหาร (ถ้ามี)</label>
                <input
                  type="text"
                  placeholder="เช่น แพ้ยาแก้แพ้บางกลุ่ม หรือระบุ - ไม่มี -"
                  value={newPetAllergies}
                  onChange={(e) => setNewPetAllergies(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">รูปถ่ายสัตว์เลี้ยง</label>
                <div className="flex items-center gap-3">
                  <img
                    src={newPetPhotoUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-950 shrink-0"
                  />
                  <label className="flex-1 px-3 py-2 border border-dashed border-slate-700 hover:border-sky-500 rounded-xl text-center text-xs text-slate-400 hover:text-sky-300 cursor-pointer transition flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>อัปโหลดรูปภาพจากเครื่อง</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPetModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingPet}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black shadow-lg shadow-sky-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isSavingPet ? 'กำลังบันทึก...' : 'บันทึกและเลือกทันที'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OwnerBookingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">กำลังโหลด...</div>}>
      <BookingContent />
    </Suspense>
  );
}
