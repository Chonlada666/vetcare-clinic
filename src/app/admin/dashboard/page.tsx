'use client';

import React from 'react';
import { useClinic } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import {
  Shield,
  Users,
  DollarSign,
  Calendar,
  PawPrint,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Stethoscope,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { users, pets, vets, appointments, bills, treatments } = useClinic();

  const totalRevenue = bills
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingSlipCount = bills.filter((b) => b.status === 'verifying').length;
  const todayAppointmentsCount = appointments.filter((a) => a.date === '2026-08-24').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white pb-16">
      {/* Admin Hero - Unified Midnight Navy Dark Theme */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-sky-500/30">
            <Shield className="w-3.5 h-3.5" /> แดชบอร์ดบริหารจัดการคลินิก (Administrator)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">ภาพรวมการดำเนินงานคลินิก</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl font-light">
            ตรวจสอบยอดรายได้ การชำระเงิน นัดหมายประจำวัน และการจัดการทรัพยากรในคลินิก
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/payments"
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition text-xs sm:text-sm cursor-pointer"
          >
            <CreditCard className="w-4 h-4 stroke-[2.5]" />
            ตรวจสลิปโอนเงิน ({pendingSlipCount})
          </a>
          <a
            href="/admin/reports"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition text-xs sm:text-sm cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-sky-400" />
            รายงานสถิติ
          </a>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">รายได้รวมที่ยืนยันแล้ว</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500">จากบิลที่ตรวจสอบสำเร็จ</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">สลิปรอการตรวจสอบ</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {pendingSlipCount} <span className="text-xs font-normal text-slate-500">รายการ</span>
          </div>
          <div className="text-[11px] text-slate-500">ต้องการการอนุมัติจากแอดมิน</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">นัดหมายทั้งหมด</span>
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {appointments.length} <span className="text-xs font-normal text-slate-500">เคส</span>
          </div>
          <div className="text-[11px] text-slate-500">คิววันนี้ {todayAppointmentsCount} เคส</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">สัตว์เลี้ยงในระบบ</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <PawPrint className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400">
            {pets.length} <span className="text-xs font-normal text-slate-500">ตัว</span>
          </div>
          <div className="text-[11px] text-slate-500">ผู้ใช้งาน {users.length} บัญชี</div>
        </div>
      </div>

      {/* Quick Action Hubs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/payments"
          className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-md hover:border-sky-500/50 hover:shadow-xl transition group space-y-3 block"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition">
            ระบบตรวจสอบการชำระเงิน
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            ดูภาพสลิปที่ลูกค้าแนบมา ยืนยันยอดเงิน อนุมัติ/ปฏิเสธ และออกใบเสร็จรับเงิน
          </p>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition">
            เข้าสู่ระบบชำระเงิน <ArrowRight className="w-4 h-4" />
          </div>
        </a>

        <a
          href="/admin/users"
          className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-md hover:border-sky-500/50 hover:shadow-xl transition group space-y-3 block"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition">
            จัดการผู้ใช้ & สัตวแพทย์
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            เพิ่ม แก้ไข ลบ ค้นหาข้อมูลเจ้าของสัตว์เลี้ยง สัตวแพทย์ และกำหนดสิทธิ์ Role
          </p>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition">
            จัดการผู้ใช้ <ArrowRight className="w-4 h-4" />
          </div>
        </a>

        <a
          href="/admin/reports"
          className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-md hover:border-sky-500/50 hover:shadow-xl transition group space-y-3 block"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition">
            รายงานและสถิติคลินิก
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            รายงานรายได้คลินิก สถิติการจองคิว รายงานการใช้ยา และประเภทสัตว์เลี้ยง
          </p>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition">
            ดูรายงานทั้งหมด <ArrowRight className="w-4 h-4" />
          </div>
        </a>
      </div>
    </div>
  );
}
