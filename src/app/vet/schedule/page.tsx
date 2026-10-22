'use client';

import React, { useState } from 'react';
import { useClinic } from '@/lib/store';
import { formatThaiDate } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  PawPrint,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

const ALL_SLOTS = [
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
  '17:00 - 17:30',
];

export default function VetSchedulePage() {
  const { vets, appointments, pets, users, currentUser } = useClinic();

  // Automatically find the logged-in doctor profile
  const myVet = vets.find(
    (v) => v.email === currentUser?.email || v.name.includes(currentUser?.name || '')
  ) || vets[0];

  const todayStr = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Filter appointments specifically for this doctor and the selected date
  const dateAppointments = appointments.filter(
    (a) => a.vetId === myVet?.id && a.date === selectedDate && a.status !== 'cancelled'
  );

  // Quick dates dynamically generated around today
  const QUICK_DATES = [
    { label: `${formatThaiDate(todayStr)} (วันนี้)`, val: todayStr },
    {
      label: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const nextDayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return `${formatThaiDate(nextDayStr)} (พรุ่งนี้)`;
      })(),
      val: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })(),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-white pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-sky-400" />
            ตารางเวลาออกตรวจของฉัน
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ตรวจสอบตารางเวลา คิวนัดหมาย และช่วงเวลาว่างของท่านในแต่ละวัน
          </p>
        </div>
      </div>

      {/* Vet Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={myVet.avatar}
            alt={myVet.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-sky-500/20 shadow-md shrink-0"
          />
          <div>
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" /> สัตวแพทย์ประจำเคส
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-0.5 text-white">{myVet.name}</h2>
            <div className="text-xs text-slate-300 mt-0.5">
              {myVet.specialty} &bull; วันออกตรวจ: {myVet.availableDays.join(', ')} ({myVet.workingHours.start} - {myVet.workingHours.end} น.)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="px-4 py-2 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
            <div className="text-[10px] text-sky-400 font-semibold">คิววันที่เลือก</div>
            <div className="text-lg font-black text-white">{dateAppointments.length} คิว</div>
          </div>
          <div className="px-4 py-2 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
            <div className="text-[10px] text-emerald-400 font-semibold">สล็อตว่าง</div>
            <div className="text-lg font-black text-emerald-400">{ALL_SLOTS.length - dateAppointments.length}</div>
          </div>
        </div>
      </div>

      {/* Date Control Bar & Quick Chips */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              เลือกวันที่ต้องการดูตารางตรวจ:
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_DATES.map((d) => {
                const isSelected = selectedDate === d.val;
                const aptCount = appointments.filter(
                  (a) => a.vetId === myVet.id && a.date === d.val && a.status !== 'cancelled'
                ).length;

                return (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => setSelectedDate(d.val)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <span>{d.label}</span>
                    {aptCount > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          isSelected ? 'bg-slate-950 text-white' : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {aptCount} คิว
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full md:w-60">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">ระบุวันที่อื่นๆ:</label>
            <input
              type="date"
              value={selectedDate}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker();
                } catch {}
              }}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold bg-slate-800 text-white focus:ring-2 focus:ring-sky-500 [color-scheme:dark] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Grid of Time Slots */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            ตารางคิววันที่ {formatThaiDate(selectedDate)}
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            มีนัดหมายทั้งหมด <strong className="text-white">{dateAppointments.length}</strong> เคส
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_SLOTS.map((slot) => {
            const apt = dateAppointments.find((a) => a.timeSlot === slot);
            const isBooked = !!apt;
            const isCompleted = apt?.status === 'completed';
            const pet = isBooked ? pets.find((p) => p.id === apt.petId) : null;
            const owner = isBooked ? users.find((u) => u.id === apt.ownerId) : null;

            return (
              <div
                key={slot}
                className={`p-4 rounded-2xl border transition ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-800/60 shadow-md ring-1 ring-emerald-500/20'
                    : isBooked
                    ? 'bg-sky-950/40 border-sky-800/60 shadow-md ring-1 ring-sky-500/20'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white text-xs font-mono">{slot} น.</span>
                  {isBooked ? (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      }`}
                    >
                      {isCompleted ? 'ตรวจเสร็จแล้ว' : 'จองแล้ว'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      ว่าง
                    </span>
                  )}
                </div>

                {isBooked && pet ? (
                  <div className="pt-2.5 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <PawPrint className={`w-4 h-4 shrink-0 ${isCompleted ? 'text-emerald-400' : 'text-sky-400'}`} />
                      <strong className="text-white text-sm">{pet.name}</strong>
                      <span className="text-[11px] text-slate-400">
                        ({pet.species === 'อื่นๆ' && pet.exoticType ? pet.exoticType : pet.species} &bull; {pet.breed || '-'})
                      </span>
                    </div>

                    <div className="text-slate-400 text-[11px]">
                      เจ้าของ: <strong className="text-white">{owner?.name}</strong> (โทร: {owner?.phone})
                    </div>

                    <div className={`text-[11px] p-2.5 rounded-xl shadow-xs border ${
                      isCompleted
                        ? 'bg-slate-900 text-slate-300 border-emerald-800/40'
                        : 'bg-slate-900 text-slate-300 border-sky-800/40'
                    }`}>
                      <strong className="text-white">อาการที่แจ้ง:</strong> {apt.initialSymptoms}
                    </div>

                    {!isCompleted && (
                      <div className="pt-1 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${
                            apt.status === 'in_treatment'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {apt.status === 'in_treatment' ? 'กำลังตรวจ' : 'รอตรวจ'}
                        </span>

                        <a
                          href={`/vet/treatments/${apt.id}`}
                          className="text-[11px] font-bold text-sky-400 hover:text-sky-300 hover:underline inline-flex items-center gap-1"
                        >
                          <Stethoscope className="w-3.5 h-3.5" /> เริ่มตรวจรักษา &rarr;
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-5 pb-2 text-center text-slate-500 text-xs">
                    พร้อมให้บริการ
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
