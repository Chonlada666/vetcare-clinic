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

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const activeVet = vets.find((v) => v.email === currentUser?.email) || vets[0];
  const myAppointments = appointments.filter((a) => a.vetId === activeVet?.id);
  const selectedDateAppointments = myAppointments.filter((a) => a.date === selectedDate);
  const waitingPatients = selectedDateAppointments.filter(
    (a) => a.status === 'pending' || a.status === 'in_treatment' || a.status === 'confirmed'
  );
  const completedToday = selectedDateAppointments.filter((a) => a.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white pb-16">
      {/* Vet Welcome Header - Unified Midnight Navy Dark Theme */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={activeVet.avatar}
            alt={activeVet.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-sky-500/20 shadow-md"
          />
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-sky-500/30">
              <Stethoscope className="w-3.5 h-3.5" /> พอร์ทัลสัตวแพทย์ (Veterinarian Portal)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1 text-white">{activeVet.name}</h1>
            <p className="text-slate-300 text-xs sm:text-sm">{activeVet.specialty} &bull; ใบอนุญาต {activeVet.licenseNo}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/vet/schedule"
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition text-xs sm:text-sm cursor-pointer"
          >
            <Calendar className="w-4 h-4 stroke-[2.5]" />
            ดูตารางออกตรวจ
          </a>
          <a
            href="/vet/treatments"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition text-xs sm:text-sm cursor-pointer"
          >
            <PawPrint className="w-4 h-4 text-sky-400" />
            ห้องตรวจรักษา
          </a>
        </div>
      </div>

      {/* Date Filter Bar - Dynamic Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-400" />
          <span className="text-xs sm:text-sm font-bold text-white">เลือกดูคิวตรวจประจำวันที่:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-700 text-xs sm:text-sm font-bold bg-slate-800 text-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer [color-scheme:dark]"
          />
          <span className="text-xs font-semibold text-sky-300 bg-sky-500/20 px-3 py-2 rounded-xl border border-sky-500/30">
            {formatThaiDate(selectedDate)}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">คิวตรวจรอพบแพทย์</div>
            <div className="text-2xl font-black text-amber-400">{waitingPatients.length} <span className="text-xs font-normal text-slate-500">เคส</span></div>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">ตรวจเสร็จสิ้นแล้ว</div>
            <div className="text-2xl font-black text-emerald-400">{completedToday.length} <span className="text-xs font-normal text-slate-500">เคส</span></div>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">นัดหมายทั้งหมด</div>
            <div className="text-2xl font-black text-white">{myAppointments.length} <span className="text-xs font-normal text-slate-500">เคส</span></div>
          </div>
        </div>
      </div>

      {/* Main Treatment Queue Section */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" />
              คิวตรวจรักษาประจำวัน ({formatThaiDate(selectedDate)})
            </h2>
            <p className="text-xs text-slate-400">รายชื่อสัตว์เลี้ยงที่นัดหมายเข้ารับการตรวจกับแพทย์</p>
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

              return (
                <div key={apt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={pet?.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}
                      alt={pet?.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{pet?.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                          {pet?.species === 'อื่นๆ' && pet?.exoticType ? pet?.exoticType : pet?.species} ({pet?.breed || '-'})
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">Slot: {apt.timeSlot} น.</span>
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
