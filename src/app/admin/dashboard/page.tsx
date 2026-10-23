'use client';

import React from 'react';
import { useClinic } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const { users, pets, appointments, bills } = useClinic();

  const totalRevenue = bills
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingSlipCount = bills.filter((b) => b.status === 'verifying').length;
  const todayAppointmentsCount = appointments.filter((a) => a.date === '2026-08-24').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-white pb-16">
      {/* Admin Corporate Welcome & Stats Section */}
      <section className="py-6 sm:py-8 text-center space-y-8 border-b border-slate-800/80">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-bold tracking-[0.2em] text-sky-400 uppercase">
              ADMINISTRATOR MANAGEMENT PORTAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide uppercase">
              ภาพรวมการดำเนินงานคลินิก
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
              ตรวจสอบยอดรายได้ การชำระเงิน นัดหมายประจำวัน และการจัดการทรัพยากรในคลินิก
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <a
              href="/admin/payments"
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm rounded-md transition cursor-pointer"
            >
              ตรวจสลิปโอนเงิน ({pendingSlipCount})
            </a>
            <a
              href="/admin/reports"
              className="px-6 py-2.5 bg-transparent hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm rounded-md border border-slate-700 transition cursor-pointer"
            >
              รายงานสถิติคลินิก
            </a>
          </div>
        </div>

        {/* 4-Column Minimal Stats with Vertical Dividers */}
        <div className="max-w-5xl mx-auto pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          <div className="py-4 sm:py-2 px-6 flex flex-col items-center justify-center space-y-1.5">
            <span className="text-xs sm:text-sm font-bold text-emerald-400 tracking-wide">
              รายได้รวมที่ยืนยันแล้ว
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
              {formatCurrency(totalRevenue)}
            </span>
            <span className="text-xs text-slate-400">
              จากบิลที่ตรวจสอบสำเร็จ
            </span>
          </div>

          <div className="py-4 sm:py-2 px-6 flex flex-col items-center justify-center space-y-1.5">
            <span className="text-xs sm:text-sm font-bold text-amber-400 tracking-wide">
              สลิปรอการตรวจสอบ
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {pendingSlipCount}
            </span>
            <span className="text-xs text-slate-400">
              รายการรอการอนุมัติ
            </span>
          </div>

          <div className="py-4 sm:py-2 px-6 flex flex-col items-center justify-center space-y-1.5">
            <span className="text-xs sm:text-sm font-bold text-sky-400 tracking-wide">
              นัดหมายทั้งหมด
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {appointments.length}
            </span>
            <span className="text-xs text-slate-400">
              เคส (วันนี้ {todayAppointmentsCount} เคส)
            </span>
          </div>

          <div className="py-4 sm:py-2 px-6 flex flex-col items-center justify-center space-y-1.5">
            <span className="text-xs sm:text-sm font-bold text-sky-400 tracking-wide">
              สัตว์เลี้ยงในระบบ
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {pets.length}
            </span>
            <span className="text-xs text-slate-400">
              ตัว (ผู้ใช้งาน {users.length} บัญชี)
            </span>
          </div>
        </div>
      </section>

      {/* Quick Action Hubs */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 border-b border-slate-800 pb-8">
        <a
          href="/admin/payments"
          className="py-6 md:py-2 md:pr-8 group space-y-3 block"
        >
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
            BILLING &amp; VERIFICATION
          </div>
          <h3 className="font-bold text-white text-lg group-hover:text-sky-400 transition">
            ระบบตรวจสอบการชำระเงิน
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            ดูภาพสลิปที่ลูกค้าแนบมา ยืนยันยอดเงิน อนุมัติ/ปฏิเสธ และออกใบเสร็จรับเงิน
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition pt-1">
            <span>เข้าสู่ระบบชำระเงิน</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </a>

        <a
          href="/admin/users"
          className="py-6 md:py-2 md:px-8 group space-y-3 block"
        >
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
            USERS &amp; MEDICAL STAFF
          </div>
          <h3 className="font-bold text-white text-lg group-hover:text-sky-400 transition">
            จัดการผู้ใช้ &amp; สัตวแพทย์
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            เพิ่ม แก้ไข ลบ ค้นหาข้อมูลเจ้าของสัตว์เลี้ยง สัตวแพทย์ และกำหนดสิทธิ์ Role
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition pt-1">
            <span>จัดการผู้ใช้</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </a>

        <a
          href="/admin/reports"
          className="py-6 md:py-2 md:pl-8 group space-y-3 block"
        >
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
            CLINIC ANALYTICS
          </div>
          <h3 className="font-bold text-white text-lg group-hover:text-sky-400 transition">
            รายงานและสถิติคลินิก
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            รายงานรายได้คลินิก สถิติการจองคิว รายงานการใช้ยา และประเภทสัตว์เลี้ยง
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition pt-1">
            <span>ดูรายงานทั้งหมด</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </a>
      </div>
    </div>
  );
}
