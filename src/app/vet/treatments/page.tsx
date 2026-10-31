'use client';

import React, { useState } from 'react';
import { useClinic } from '@/lib/store';
import { formatThaiDate } from '@/lib/utils';
import {
  Stethoscope,
  Search,
  Clock,
  Calendar,
  PawPrint,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function VetTreatmentsQueuePage() {
  const { appointments, pets, users, vets, currentUser } = useClinic();
  
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

  const [filterDate, setFilterDate] = useState<string>(todayStr);
  const [search, setSearch] = useState('');
  const [selectedVetId, setSelectedVetId] = useState<string>('all');

  const activeVet =
    vets.find(
      (v) =>
        (currentUser?.email && v.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser?.name && (v.name.includes(currentUser.name) || currentUser.name.includes(v.name.split(' ')[1] || '')))
    ) || vets[0];

  const queueList = appointments
    .filter((a) => {
      if (selectedVetId === 'all') return a.date === filterDate && a.status !== 'cancelled';
      const vObj = vets.find((v) => v.id === selectedVetId);
      return (a.vetId === selectedVetId || (vObj && a.vetId === vObj.name)) && a.date === filterDate && a.status !== 'cancelled';
    })
    .filter((a) => {
      const pet = pets.find((p) => p.id === a.petId);
      const owner = users.find((u) => u.id === a.ownerId);
      return (
        (pet && pet.name.toLowerCase().includes(search.toLowerCase())) ||
        (owner && owner.name.toLowerCase().includes(search.toLowerCase())) ||
        a.id.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-white pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-sky-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">
            CLINICAL EMR QUEUE
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide uppercase">
            ห้องตรวจรักษา &amp; รายชื่อคิวตรวจ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            เลือกเคสสัตว์เลี้ยงเพื่อเข้าสู่หน้าจอบันทึกการตรวจรักษาและการสั่งจ่ายยา
          </p>
        </div>
      </div>

      {/* Doctor Selection Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-sky-400" />
          <span className="text-xs sm:text-sm font-bold text-white">เลือกดูห้องตรวจของแพทย์:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedVetId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedVetId === 'all'
                ? 'bg-sky-500 text-slate-950 font-black shadow-md ring-1 ring-sky-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            คิวตรวจรวมทุกแพทย์ ({appointments.filter((a) => a.date === filterDate && a.status !== 'cancelled').length})
          </button>
          {vets.map((v) => {
            const count = appointments.filter(
              (a) => (a.vetId === v.id || a.vetId === v.name) && a.date === filterDate && a.status !== 'cancelled'
            ).length;
            const isSelected = selectedVetId === v.id;
            return (
              <button
                type="button"
                key={v.id}
                onClick={() => setSelectedVetId(v.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
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

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสัตว์เลี้ยง, เจ้าของ, รหัสคิว..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setFilterDate(todayStr)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterDate === todayStr
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              วันนี้
            </button>
            <button
              type="button"
              onClick={() => setFilterDate(tomorrowStr)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterDate === tomorrowStr
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              วันถัดไป (พรุ่งนี้)
            </button>
          </div>

          <div className="w-44">
            <input
              type="date"
              value={filterDate}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker();
                } catch {}
              }}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-700 text-xs sm:text-sm font-semibold bg-slate-800 text-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Patient Cards List */}
      {queueList.length > 0 ? (
        <div className="space-y-4">
          {queueList.map((apt) => {
            const pet = pets.find((p) => p.id === apt.petId);
            const owner = users.find((u) => u.id === apt.ownerId);

            return (
              <div
                key={apt.id}
                className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md hover:border-sky-500/50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={pet?.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80'}
                    alt={pet?.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-800"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{pet?.name}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                        {pet?.species} &bull; {pet?.breed}
                      </span>
                      <span className="text-xs font-mono text-slate-500">#{apt.id}</span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      เจ้าของ: <strong className="text-white">{owner?.name}</strong> (โทร: {owner?.phone}) &bull; เพศ: {pet?.gender === 'male' ? 'ผู้ ♂' : 'เมีย ♀'} &bull; น้ำหนัก: {pet?.weightKg} กก.
                    </div>

                    <div className="text-xs text-slate-300 mt-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <strong className="text-white">อาการที่เจ้าของระบุ:</strong> {apt.initialSymptoms}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span>เวลาคิว: {apt.timeSlot} น.</span>
                  </div>

                  {apt.status === 'completed' ? (
                    <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30">
                      ✓ ตรวจเสร็จสิ้นแล้ว
                    </span>
                  ) : (
                    <a
                      href={`/vet/treatments/${apt.id}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-sky-500/20 transition"
                    >
                      <Stethoscope className="w-4 h-4 stroke-[2.5]" />
                      <span>เปิดห้องตรวจเคสนี้</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-base">ไม่พบคิวตรวจในวันนี้</h3>
          <p className="text-xs text-slate-400">ไม่มีสัตว์เลี้ยงที่ลงทะเบียนคิวในวันที่เลือก</p>
        </div>
      )}
    </div>
  );
}
