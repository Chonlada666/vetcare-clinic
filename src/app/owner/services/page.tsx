'use client';

import React, { useState } from 'react';
import { useClinic } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  HeartPulse,
  Search,
  Filter,
  Info,
  Clock,
  CheckCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function ServicesCataloguePage() {
  const router = useRouter();
  const { services, currentUser } = useClinic();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServices = services
    .filter((s) => (selectedCategory === 'all' ? true : s.category === selectedCategory))
    .filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
    );

  const categories = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'checkup', label: 'ตรวจสุขภาพ' },
    { key: 'vaccine', label: 'ฉีดวัคซีน' },
    { key: 'surgery', label: 'ศัลยกรรม/ทำหมัน' },
    { key: 'lab', label: 'ตรวจแล็บ/เอ็กซเรย์' },
    { key: 'dental', label: 'ทันตกรรม' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="text-sky-400 font-black text-xs uppercase tracking-widest mb-1">
          SERVICES & PRICE CATALOGUE
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <HeartPulse className="w-8 h-8 text-sky-400" />
          รายการบริการและอัตราค่าบริการคลินิก
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          อัตราค่าบริการมาตรฐานสำหรับสัตว์เลี้ยงทุกประเภท สามารถตรวจสอบและจองคิวออนไลน์ได้ทันที
        </p>
      </div>

      {/* Mandatory Business Rule Disclaimer */}
      <div className="bg-slate-900 border border-sky-900/60 rounded-2xl p-5 flex items-start gap-3.5 text-sky-200 text-xs sm:text-sm shadow-md">
        <Info className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white text-sm">หมายเหตุแจ้งผู้ใช้บริการ:</span>
          <p className="leading-relaxed text-slate-300">
            &ldquo;อัตราค่าบริการข้างต้นเป็นราคาประเมินเบื้องต้น ราคาจริงอาจเปลี่ยนแปลงตามอาการ ขนาด และชนิดของสัตว์ รวมถึงค่ายาและหัตถการเพิ่มเติมตามผลการตรวจวินิจฉัยของสัตวแพทย์&rdquo;
          </p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อบริการ, รายละเอียด..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 rounded-xl border border-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === c.key
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-md hover:border-sky-500/50 hover:shadow-xl transition flex flex-col justify-between text-white"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-white text-base">{srv.name}</h3>
                  {srv.isPopular && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                      ยอดนิยม
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{srv.description}</p>

                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>ระยะเวลาประมาณ: {srv.estimatedTimeMin} นาที</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500">อัตราค่าบริการโดยประมาณ</div>
                  <div className="text-xl font-black text-sky-400 font-mono">
                    {formatCurrency(srv.price)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const targetUrl = `/owner/booking?serviceId=${srv.id}`;
                    if (!currentUser) {
                      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
                    } else {
                      router.push(targetUrl);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-sky-500/20 transition transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" /> จองบริการนี้
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-3">
          <HeartPulse className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-base">ไม่พบรายการบริการ</h3>
          <p className="text-xs text-slate-400">กรุณาลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่</p>
        </div>
      )}
    </div>
  );
}
