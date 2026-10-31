'use client';

import React, { useState } from 'react';
import { useClinic } from '@/lib/store';
import { formatThaiDate } from '@/lib/utils';
import {
  Stethoscope,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  PawPrint,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function VetDashboardPage() {
  const { currentUser, appointments, pets, vets, treatments, users } = useClinic();

  const todayStr = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const dayAfterNextStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Find which doctor matches currentUser, if any
  const loggedInVet = vets.find(
    (v) =>
      (currentUser?.email && v.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.name && (v.name.includes(currentUser.name) || currentUser.name.includes(v.name.split(' ')[1] || '')))
  );

  // Allow selecting specific doctor or 'all'
  const [selectedVetId, setSelectedVetId] = useState<string>('all');

  const activeVet = vets.find((v) => v.id === selectedVetId) || loggedInVet || vets[0];

  const filteredAppointments = appointments.filter((a) => {
    if (selectedVetId === 'all') return true;
    return a.vetId === selectedVetId || (activeVet && a.vetId === activeVet.name);
  });

  const selectedDateAppointments = filteredAppointments.filter((a) => a.date === selectedDate);
  const waitingPatients = selectedDateAppointments.filter(
    (a) => a.status === 'pending' || a.status === 'in_treatment' || a.status === 'confirmed'
  );
  const completedToday = selectedDateAppointments.filter((a) => a.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white pb-16">
      {/* Vet Corporate Welcome & Stats Section */}
      <section className="py-6 sm:py-8 text-center space-y-8 border-b border-slate-800/80">
        <div className="max-w-2xl mx-auto space-y-4">
          <img
            src={selectedVetId === 'all' ? (loggedInVet?.avatar || vets[0].avatar) : activeVet.avatar}
            alt={selectedVetId === 'all' ? 'รวมทีมสัตวแพทย์' : activeVet.name}
            className="w-20 h-20 rounded-full object-cover border border-slate-700 mx-auto"
          />
          <div className="space-y-1">
            <div className="text-xs font-bold tracking-[0.2em] text-sky-400 uppercase">
              VETERINARIAN CLINICAL PORTAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide">
              {selectedVetId === 'all' ? 'แดชบอร์ดคิวตรวจ (รวมทีมสัตวแพทย์ทุกท่าน)' : activeVet.name}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              {selectedVetId === 'all'
                ? 'ระบบจัดการคิวตรวจผู้ป่วยและเวชระเบียนสัตว์แพทย์ VetCare Clinic'
                : `${activeVet.specialty} • ใบอนุญาตประกอบวิชาชีพ ${activeVet.licenseNo}`}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <a
              href="/vet/schedule"
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm rounded-md transition cursor-pointer"
            >
              ดูตารางออกตรวจ
            </a>
            <a
              href="/vet/treatments"
              className="px-6 py-2.5 bg-transparent hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm rounded-md border border-slate-700 transition cursor-pointer"
            >
              ห้องตรวจรักษา (EMR)
            </a>
          </div>
        </div>

        {/* 3-Column Minimal Stats with Vertical Dividers */}
        <div className="max-w-4xl mx-auto pt-2 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          <div className="py-4 sm:py-2 px-6 flex flex-col items-center justify-center space-y-1.5">
            <span className="text-xs sm:text-sm font-bold text-amber-400 tracking-wide">
              คิวตรวจรอพบแพทย์
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {waitingPatients.length}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-300">
              เคส
            </span>
          </div>

          <div className="py-4 sm:py-2 px-6 flex flex-col items-center justify-center space-y-1.5">
            <span className="text-xs sm:text-sm font-bold text-emerald-400 tracking-wide">
              ตรวจเสร็จสิ้นแล้ว
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {completedToday.length}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-300">
              เคส
            </span>
          </div>

          <div className="py-4 sm:py-2 px-6 flex flex-col items-center justify-center space-y-1.5">
            <span className="text-xs sm:text-sm font-bold text-sky-400 tracking-wide">
              นัดหมายทั้งหมด
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {filteredAppointments.length}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-300">
              เคส
            </span>
          </div>
        </div>
      </section>

      {/* Doctor Filter Bar - Select Which Doctor's Queue to View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-sky-400" />
          <span className="text-xs sm:text-sm font-bold text-white">เลือกดูคิวตรวจของแพทย์:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedVetId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedVetId === 'all'
                ? 'bg-sky-500 text-slate-950 font-black shadow-md ring-1 ring-sky-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            คิวตรวจรวมทุกแพทย์ ({appointments.filter((a) => a.date === selectedDate).length})
          </button>
          {vets.map((v) => {
            const count = appointments.filter(
              (a) => (a.vetId === v.id || a.vetId === v.name) && a.date === selectedDate
            ).length;
            const isSelected = selectedVetId === v.id;
            return (
              <button
                type="button"
                key={v.id}
                onClick={() => setSelectedVetId(v.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 font-black shadow-md ring-1 ring-sky-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <img src={v.avatar} alt={v.name} className="w-4 h-4 rounded-full object-cover" />
                <span>{v.name.split(' ')[1] || v.name} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Filter Bar - Dynamic Date Picker with Quick Date Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-white">เลือกดูคิวตรวจประจำวันที่:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                selectedDate === todayStr
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              วันนี้
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(tomorrowStr)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                selectedDate === tomorrowStr
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              วันถัดไป (พรุ่งนี้)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(dayAfterNextStr)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                selectedDate === dayAfterNextStr
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              มะรืนนี้
            </button>
          </div>

          <input
            type="date"
            value={selectedDate}
            onClick={(e) => {
              try {
                e.currentTarget.showPicker();
              } catch {}
            }}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs sm:text-sm font-bold bg-slate-800 text-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer [color-scheme:dark]"
          />
          <span className="text-xs font-semibold text-sky-300 bg-sky-500/20 px-3 py-1.5 rounded-lg border border-sky-500/30">
            {formatThaiDate(selectedDate)}
          </span>
        </div>
      </div>

      {/* Main Treatment Queue Section */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-sky-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">
              DAILY PATIENT QUEUE
            </div>
            <h2 className="text-lg sm:text-xl font-light text-white tracking-wide">
              คิวตรวจรักษาประจำวัน ({formatThaiDate(selectedDate)})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">รายชื่อสัตว์เลี้ยงที่นัดหมายเข้ารับการตรวจกับแพทย์</p>
          </div>
          <a href="/vet/treatments" className="text-xs font-bold text-sky-400 hover:underline">
            ดูห้องตรวจทั้งหมด
          </a>
        </div>

        {selectedDateAppointments.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {selectedDateAppointments.map((apt) => {
              const pet = pets.find((p) => p.id === apt.petId);
              const owner = users.find((u) => u.id === apt.ownerId);
              const assignedVet = vets.find((v) => v.id === apt.vetId || v.name === apt.vetId);

              return (
                <div key={apt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={pet?.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}
                      alt={pet?.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-800"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-base">{pet?.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                          {pet?.species === 'อื่นๆ' && pet?.exoticType ? pet?.exoticType : pet?.species} ({pet?.breed || '-'})
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">Slot: {apt.timeSlot} น.</span>
                        {assignedVet && (
                          <span className="text-[11px] font-bold text-sky-300 bg-sky-950/70 px-2 py-0.5 rounded-md border border-sky-800/60 flex items-center gap-1">
                            <Stethoscope className="w-3 h-3 text-sky-400" />
                            <span>{assignedVet.name}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        เจ้าของ: <strong className="text-white">{owner?.name}</strong> (โทร: {owner?.phone})
                      </div>
                      <div className="text-xs text-slate-300 mt-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 inline-block">
                        <strong className="text-white">อาการเบื้องต้น:</strong> {apt.initialSymptoms}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {apt.status === 'completed' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        ✓ ตรวจเรียบร้อยแล้ว
                      </span>
                    ) : (
                      <a
                        href={`/vet/treatments/${apt.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-sky-500/20 transition"
                      >
                        <Stethoscope className="w-4 h-4 stroke-[2.5]" />
                        <span>เริ่มตรวจรักษา (EMR)</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-950 rounded-2xl border border-dashed border-slate-800">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">ไม่มีคิวนัดหมายในวันที่ {formatThaiDate(selectedDate)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
