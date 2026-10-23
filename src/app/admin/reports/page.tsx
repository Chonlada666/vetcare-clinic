'use client';

import React, { useState } from 'react';
import { useClinic } from '@/lib/store';
import { formatCurrency, formatThaiDate } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Pill,
  PawPrint,
  Download,
  BarChart3,
  PieChart,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function AdminReportsPage() {
  const { bills, appointments, treatments, medicines, pets, vets } = useClinic();
  const [selectedReport, setSelectedReport] = useState<'revenue' | 'queue' | 'medicines' | 'pets'>('revenue');

  // 1. Revenue Calculations
  const paidBills = bills.filter((b) => b.status === 'paid');
  const totalRevenue = paidBills.reduce((sum, b) => sum + b.totalAmount, 0);

  const totalServiceFees = treatments.reduce((sum, t) => sum + t.serviceFee, 0);
  const totalMedicineFees = treatments.reduce((sum, t) => sum + t.medicineFee, 0);

  // 2. Queue Stats
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const pendingAppointments = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed').length;
  const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled').length;

  // 3. Medicine Usage Stats
  const medicineUsageMap: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  treatments.forEach((t) => {
    t.prescriptions.forEach((p) => {
      if (!medicineUsageMap[p.medicineId]) {
        medicineUsageMap[p.medicineId] = { name: p.name, quantity: 0, revenue: 0 };
      }
      medicineUsageMap[p.medicineId].quantity += p.quantity;
      medicineUsageMap[p.medicineId].revenue += p.totalPrice;
    });
  });
  const medicineUsageList = Object.values(medicineUsageMap).sort((a, b) => b.quantity - a.quantity);

  // 4. Pet Demographics Stats
  const speciesMap: { [key: string]: number } = {};
  pets.forEach((p) => {
    speciesMap[p.species] = (speciesMap[p.species] || 0) + 1;
  });

  const handleExportCSV = () => {
    alert('ส่งออกรายงานสรุปเป็นไฟล์ CSV เรียบร้อยแล้ว (จำลอง)');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-white pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-sky-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">
            ANALYTICS &amp; REPORTING
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide uppercase">
            รายงานสถิติและผลการดำเนินงานคลินิก
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            รายงานรายได้, การจองคิว, การใช้ยา และสถิติสัตว์เลี้ยงที่เข้ารับบริการ
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2.5 rounded-md text-xs sm:text-sm transition cursor-pointer"
        >
          <Download className="w-4 h-4" /> ส่งออกรายงาน (CSV)
        </button>
      </div>

      {/* Report Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'revenue', label: '1. รายงานรายได้' },
          { key: 'queue', label: '2. รายงานการจองคิว' },
          { key: 'medicines', label: '3. รายงานการใช้ยา' },
          { key: 'pets', label: '4. รายงานสัตว์เลี้ยง' },
        ].map((tab) => {
          const isActive = selectedReport === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedReport(tab.key as any)}
              className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                isActive
                  ? 'bg-slate-900 border-sky-500 ring-1 ring-sky-500/30 text-white'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white">{tab.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">คลิกเพื่อดูสถิติ</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* REPORT 1: Revenue Report */}
      {selectedReport === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 font-bold">ยอดรายได้รวมทั้งหมด</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {formatCurrency(totalRevenue || 830)}
              </div>
              <span className="text-[11px] text-slate-500">จากบิลที่ชำระและอนุมัติแล้ว</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 font-bold">สัดส่วนค่าบริการทางการแพทย์</span>
              <div className="text-2xl font-black text-sky-400 font-mono">
                {formatCurrency(totalServiceFees || 300)}
              </div>
              <span className="text-[11px] text-slate-500">ค่าตรวจ, หัตถการ, วัคซีน</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 font-bold">สัดส่วนค่ายาและเวชภัณฑ์</span>
              <div className="text-2xl font-black text-purple-400 font-mono">
                {formatCurrency(totalMedicineFees || 530)}
              </div>
              <span className="text-[11px] text-slate-500">จากการสั่งยาในห้องตรวจ EMR</span>
            </div>
          </div>

          {/* Visual Revenue Bar Chart */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              กราฟแนวโน้มรายได้รายสัปดาห์ (Weekly Revenue Trend)
            </h3>

            <div className="space-y-4">
              {[
                { day: 'จันทร์', amount: 4800, percentage: 80 },
                { day: 'อังคาร', amount: 3200, percentage: 55 },
                { day: 'พุธ', amount: 5600, percentage: 95 },
                { day: 'พฤหัสบดี', amount: 2900, percentage: 48 },
                { day: 'ศุกร์', amount: 6200, percentage: 100 },
                { day: 'เสาร์', amount: 5100, percentage: 85 },
                { day: 'อาทิตย์', amount: 4400, percentage: 72 },
              ].map((bar) => (
                <div key={bar.day} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-slate-300">
                    <span>{bar.day}</span>
                    <span className="font-mono text-white font-bold">{formatCurrency(bar.amount)}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${bar.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: Queue Booking Report */}
      {selectedReport === 'queue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 font-bold">คิวตรวจที่เสร็จสิ้นแล้ว</span>
              <div className="text-2xl font-black text-emerald-400">
                {completedAppointments} <span className="text-xs font-normal text-slate-500">เคส</span>
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 font-bold">คิวที่รอดำเนินการ / ยืนยัน</span>
              <div className="text-2xl font-black text-sky-400">
                {pendingAppointments} <span className="text-xs font-normal text-slate-500">เคส</span>
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 font-bold">คิวที่ยกเลิก</span>
              <div className="text-2xl font-black text-slate-400">
                {cancelledAppointments} <span className="text-xs font-normal text-slate-500">เคส</span>
              </div>
            </div>
          </div>

          {/* Vet Case Workload */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" />
              สัดส่วนภาระงานตรวจของสัตวแพทย์แต่ละท่าน (Vet Workload)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vets.map((v) => {
                const count = appointments.filter((a) => a.vetId === v.id).length;
                return (
                  <div key={v.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={v.avatar} alt={v.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-800" />
                      <div>
                        <div className="font-bold text-white">{v.name}</div>
                        <div className="text-slate-400">{v.specialty}</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">จำนวนเคสทั้งหมด:</span>
                      <strong className="text-sky-400 font-bold text-base">{count} เคส</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: Medicines & Pharmacy Report */}
      {selectedReport === 'medicines' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-400" />
              รายงานการใช้ยาและวัคซีนในคลินิก (Medicine Consumption & Inventory)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold">
                  <tr>
                    <th className="p-3">ชื่อยา / เวชภัณฑ์</th>
                    <th className="p-3">หมวดหมู่</th>
                    <th className="p-3 text-right">จำนวนที่จ่ายไปแล้ว</th>
                    <th className="p-3 text-right">ยอดเงินรวม</th>
                    <th className="p-3 text-center">คงเหลือในสต็อก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {medicines.map((m) => {
                    const usage = medicineUsageMap[m.id];
                    const qtyUsed = usage ? usage.quantity : 0;
                    const rev = usage ? usage.revenue : 0;

                    return (
                      <tr key={m.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3">
                          <strong className="text-white">{m.name}</strong>
                          <span className="font-mono text-[10px] text-slate-500 block">{m.code}</span>
                        </td>
                        <td className="p-3 capitalize text-slate-300">{m.category}</td>
                        <td className="p-3 text-right font-bold text-purple-400">
                          {qtyUsed} {m.unit}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-white">
                          {formatCurrency(rev)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold border text-[11px] ${
                              m.stock < 50
                                ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            }`}
                          >
                            {m.stock} {m.unit}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 4: Pet Demographics Report */}
      {selectedReport === 'pets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <PieChart className="w-5 h-5 text-amber-400" />
                สัดส่วนชนิดสัตว์เลี้ยงที่ลงทะเบียน (Species Distribution)
              </h3>

              <div className="space-y-3 text-xs">
                {Object.entries(speciesMap).map(([species, count]) => {
                  const percentage = Math.round((count / pets.length) * 100);
                  return (
                    <div key={species} className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>{species}</span>
                        <span>{count} ตัว ({percentage}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base">
                รายชื่อสัตว์เลี้ยงล่าสุด
              </h3>

              <div className="divide-y divide-slate-800 text-xs">
                {pets.slice(0, 5).map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
                      />
                      <div>
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-slate-400">{p.species} &bull; {p.breed}</div>
                      </div>
                    </div>
                    <span className="text-slate-400">{p.weightKg} กก.</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
