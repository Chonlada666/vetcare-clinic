'use client';

import React, { useState } from 'react';
import { useClinic } from '@/lib/store';
import { Appointment } from '@/types';
import { formatCurrency, formatThaiDate } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Stethoscope,
  XCircle,
  CalendarCheck,
  PawPrint,
  Search,
  Filter,
  AlertCircle,
  X,
  CreditCard,
  FileText,
  ArrowRight,
} from 'lucide-react';

const TIME_SLOTS = [
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

export default function OwnerAppointmentsPage() {
  const { currentUser, appointments, pets, vets, services, bills, rescheduleAppointment, cancelAppointment } = useClinic();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');

  const myAppointments = appointments
    .filter((a) => a.ownerId === currentUser?.id)
    .filter((a) => (filterStatus === 'all' ? true : a.status === filterStatus))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenReschedule = (apt: Appointment) => {
    setRescheduleApt(apt);
    setNewDate(apt.date);
    setNewTimeSlot(apt.timeSlot);
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApt || !newDate || !newTimeSlot) return;
    rescheduleAppointment(rescheduleApt.id, newDate, newTimeSlot);
    setRescheduleApt(null);
  };

  const handleCancel = (id: string) => {
    if (confirm('คุณต้องการยกเลิกการนัดหมายนี้ใช่หรือไม่?')) {
      cancelAppointment(id);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">รอดำเนินการ</span>;
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full text-[11px] font-black bg-sky-500/15 text-sky-400 border border-sky-500/30">ยืนยันคิวแล้ว</span>;
      case 'in_treatment':
        return <span className="px-3 py-1 rounded-full text-[11px] font-black bg-purple-500/15 text-purple-300 border border-purple-500/30 animate-pulse">กำลังรับการตรวจ</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">✓ ตรวจเสร็จสิ้นแล้ว</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-[11px] font-black bg-slate-800 text-slate-500 border border-slate-700 line-through">ยกเลิกแล้ว</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-sky-400" />
            ประวัติและการจัดการนัดหมาย
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ตรวจสอบรายการนัดหมายทั้งหมด เลื่อนวันเวลา ยกเลิกนัดหมาย หรือชำระเงินเมื่อตรวจเสร็จสิ้น
          </p>
        </div>

        <a
          href="/owner/booking"
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 text-xs sm:text-sm transition transform hover:-translate-y-0.5"
        >
          <CalendarCheck className="w-4 h-4" /> จองคิวนัดหมายใหม่
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { key: 'all', label: 'ทั้งหมด' },
          { key: 'pending', label: 'รอดำเนินการ' },
          { key: 'confirmed', label: 'ยืนยันคิว' },
          { key: 'in_treatment', label: 'กำลังตรวจ' },
          { key: 'completed', label: 'เสร็จสิ้น' },
          { key: 'cancelled', label: 'ยกเลิก' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === f.key
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 ring-2 ring-sky-400/30'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {myAppointments.length > 0 ? (
        <div className="space-y-4">
          {myAppointments.map((apt) => {
            const pet = pets.find((p) => p.id === apt.petId);
            const vet = vets.find((v) => v.id === apt.vetId);
            const srv = services.find((s) => s.id === apt.serviceId);
            const canModify = apt.status === 'pending' || apt.status === 'confirmed';
            const relatedBill = bills.find((b) => b.appointmentId === apt.id);

            return (
              <div
                key={apt.id}
                className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl hover:border-slate-700 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={pet?.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}
                      alt={pet?.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800 shadow-md"
                    />
                    <div>
                      <div className="font-black text-white text-base">
                        {pet?.name} <span className="text-xs font-normal text-slate-400">({pet?.species} - {pet?.breed})</span>
                      </div>
                      <div className="text-xs text-sky-400 font-bold">{srv?.name || 'ตรวจสุขภาพทั่วไป'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 font-mono">รหัสคิว: {apt.id}</span>
                    {getStatusBadge(apt.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>วันที่: <strong className="text-white">{formatThaiDate(apt.date)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>ช่วงเวลา: <strong className="text-white">{apt.timeSlot} น.</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>สัตวแพทย์: <strong className="text-white">{vet?.name}</strong></span>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300">
                  <strong className="text-slate-200">อาการเบื้องต้นที่ระบุ: </strong>
                  {apt.initialSymptoms}
                </div>

                {/* Direct Action for Completed Treatment Payment */}
                {apt.status === 'completed' && relatedBill && (
                  <div className="p-4 bg-sky-950/60 border border-sky-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-sky-400" />
                        <span>ยอดชำระค่ารักษา: <strong className="text-sky-300 font-black text-sm">{formatCurrency(relatedBill.totalAmount)}</strong></span>
                      </div>
                      <div className="text-[11px] text-sky-300">
                        {relatedBill.status === 'paid'
                          ? '✓ ชำระเงินเรียบร้อยแล้ว (SlipOK Verified)'
                          : relatedBill.status === 'verifying'
                          ? '⏳ แนบสลิปแล้ว กำลังรอตรวจสอบ'
                          : '⚠️ หมอตรวจเสร็จสิ้นแล้ว กรุณากดชำระเงินและแนบสลิป'}
                      </div>
                    </div>

                    <div>
                      {relatedBill.status === 'paid' ? (
                        <a
                          href="/owner/billing"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs shadow-md transition"
                        >
                          <FileText className="w-3.5 h-3.5" /> ดูใบเสร็จรับเงิน
                        </a>
                      ) : (
                        <a
                          href="/owner/billing"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-black text-xs shadow-md transition transform hover:-translate-y-0.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> ชำระเงินบิลนี้ทันที <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {canModify && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenReschedule(apt)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-bold transition cursor-pointer"
                    >
                      เลื่อนวัน-เวลานัด
                    </button>
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-400 hover:bg-rose-900/60 text-xs font-bold transition cursor-pointer"
                    >
                      ยกเลิกนัดหมาย
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-base">ไม่พบรายการนัดหมาย</h3>
          <p className="text-xs text-slate-400">ไม่มีนัดหมายในสถานะที่เลือก</p>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" />
                เลื่อนวันและเวลานัดหมาย
              </h3>
              <button
                onClick={() => setRescheduleApt(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">เลือกวันที่ใหม่ *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch {}
                  }}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">เลือกช่วงเวลาใหม่ *</label>
                <select
                  required
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  <option value="" className="bg-slate-900 text-white">-- กรุณาเลือกช่วงเวลา --</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot} className="bg-slate-900 text-white">{slot} น.</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRescheduleApt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black shadow-md cursor-pointer"
                >
                  ยืนยันการเลื่อนนัด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
