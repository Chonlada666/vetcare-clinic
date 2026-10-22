'use client';

import React, { useState } from 'react';
import { useClinic } from '@/lib/store';
import { ServiceItem, MedicineItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  FileText,
  Pill,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle,
  Package,
} from 'lucide-react';

export default function AdminServicesAndMedsPage() {
  const { services, medicines, addService, updateService, deleteService, addMedicine, updateMedicine, deleteMedicine } = useClinic();
  const [activeTab, setActiveTab] = useState<'services' | 'medicines'>('services');

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [srvName, setSrvName] = useState('');
  const [srvCategory, setSrvCategory] = useState<ServiceItem['category']>('checkup');
  const [srvPrice, setSrvPrice] = useState<number>(300);
  const [srvTime, setSrvTime] = useState<number>(20);
  const [srvDesc, setSrvDesc] = useState('');
  const [srvPopular, setSrvPopular] = useState(false);

  // Medicine Modal State
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<MedicineItem | null>(null);
  const [medCode, setMedCode] = useState('');
  const [medName, setMedName] = useState('');
  const [medCategory, setMedCategory] = useState<MedicineItem['category']>('antibiotic');
  const [medUnit, setMedUnit] = useState('เม็ด');
  const [medUnitPrice, setMedUnitPrice] = useState<number>(25);
  const [medStock, setMedStock] = useState<number>(100);
  const [medInstructions, setMedInstructions] = useState('');

  // Service Handlers
  const openAddService = () => {
    setEditingService(null);
    setSrvName('');
    setSrvCategory('checkup');
    setSrvPrice(300);
    setSrvTime(20);
    setSrvDesc('');
    setSrvPopular(false);
    setIsServiceModalOpen(true);
  };

  const openEditService = (s: ServiceItem) => {
    setEditingService(s);
    setSrvName(s.name);
    setSrvCategory(s.category);
    setSrvPrice(s.price);
    setSrvTime(s.estimatedTimeMin);
    setSrvDesc(s.description);
    setSrvPopular(!!s.isPopular);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateService(editingService.id, {
        name: srvName,
        category: srvCategory,
        price: Number(srvPrice),
        estimatedTimeMin: Number(srvTime),
        description: srvDesc,
        isPopular: srvPopular,
      });
    } else {
      addService({
        name: srvName,
        category: srvCategory,
        price: Number(srvPrice),
        estimatedTimeMin: Number(srvTime),
        description: srvDesc,
        isPopular: srvPopular,
      });
    }
    setIsServiceModalOpen(false);
  };

  // Medicine Handlers
  const openAddMed = () => {
    setEditingMed(null);
    setMedCode(`MED-00${medicines.length + 1}`);
    setMedName('');
    setMedCategory('antibiotic');
    setMedUnit('เม็ด');
    setMedUnitPrice(30);
    setMedStock(100);
    setMedInstructions('');
    setIsMedModalOpen(true);
  };

  const openEditMed = (m: MedicineItem) => {
    setEditingMed(m);
    setMedCode(m.code);
    setMedName(m.name);
    setMedCategory(m.category);
    setMedUnit(m.unit);
    setMedUnitPrice(m.unitPrice);
    setMedStock(m.stock);
    setMedInstructions(m.instructions);
    setIsMedModalOpen(true);
  };

  const handleSaveMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMed) {
      updateMedicine(editingMed.id, {
        code: medCode,
        name: medName,
        category: medCategory,
        unit: medUnit,
        unitPrice: Number(medUnitPrice),
        stock: Number(medStock),
        instructions: medInstructions,
      });
    } else {
      addMedicine({
        code: medCode,
        name: medName,
        category: medCategory,
        unit: medUnit,
        unitPrice: Number(medUnitPrice),
        stock: Number(medStock),
        instructions: medInstructions,
      });
    }
    setIsMedModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-white pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-sky-400" />
            จัดการรายการบริการ & คลังยาเวชภัณฑ์
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            กำหนดอัตราค่าบริการ และจัดการสต็อกยา/วัคซีนของคลินิก
          </p>
        </div>

        {activeTab === 'services' ? (
          <button
            onClick={openAddService}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> เพิ่มรายการบริการใหม่
          </button>
        ) : (
          <button
            onClick={openAddMed}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> เพิ่มรายการยาใหม่
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'services'
              ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/20'
              : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>รายการบริการและราคา ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('medicines')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'medicines'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
              : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>คลังยาและวัคซีน ({medicines.length})</span>
        </button>
      </div>

      {/* Tab 1: Services List */}
      {activeTab === 'services' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold">
                <tr>
                  <th className="p-4">ชื่อบริการ</th>
                  <th className="p-4">หมวดหมู่</th>
                  <th className="p-4">ระยะเวลาโดยประมาณ</th>
                  <th className="p-4 text-right">อัตราค่าบริการ</th>
                  <th className="p-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        {srv.name}
                        {srv.isPopular && (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            ยอดนิยม
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{srv.description}</div>
                    </td>
                    <td className="p-4 capitalize text-slate-300">{srv.category}</td>
                    <td className="p-4 text-slate-300">{srv.estimatedTimeMin} นาที</td>
                    <td className="p-4 text-right font-mono font-black text-sky-400 text-sm">
                      {formatCurrency(srv.price)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditService(srv)}
                          className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="แก้ไขบริการ"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการลบบริการ "${srv.name}"?`)) deleteService(srv.id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                          title="ลบบริการ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Medicines List */}
      {activeTab === 'medicines' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold">
                <tr>
                  <th className="p-4">รหัส / ชื่อยาและเวชภัณฑ์</th>
                  <th className="p-4">หมวดหมู่</th>
                  <th className="p-4">วิธีใช้ / ขนาดยา</th>
                  <th className="p-4 text-center">คงเหลือในคลัง</th>
                  <th className="p-4 text-right">ราคาต่อหน่วย</th>
                  <th className="p-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {medicines.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4">
                      <span className="font-mono text-[10px] text-slate-500 block">{m.code}</span>
                      <strong className="text-white text-sm">{m.name}</strong>
                    </td>
                    <td className="p-4 capitalize text-slate-300">{m.category}</td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{m.instructions}</td>
                    <td className="p-4 text-center">
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
                    <td className="p-4 text-right font-mono font-black text-emerald-400 text-sm">
                      {formatCurrency(m.unitPrice)} / {m.unit}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditMed(m)}
                          className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="แก้ไขยา"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการลบยา "${m.name}"?`)) deleteMedicine(m.id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                          title="ลบยา"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl my-8 border border-slate-800 text-xs text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingService ? 'แก้ไขรายการบริการ' : 'เพิ่มรายการบริการใหม่'}
              </h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">ชื่อบริการ *</label>
                <input
                  type="text"
                  required
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">หมวดหมู่</label>
                  <select
                    value={srvCategory}
                    onChange={(e) => setSrvCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="checkup" className="bg-slate-800 text-white">ตรวจสุขภาพ</option>
                    <option value="vaccine" className="bg-slate-800 text-white">ฉีดวัคซีน</option>
                    <option value="surgery" className="bg-slate-800 text-white">ศัลยกรรม/ทำหมัน</option>
                    <option value="lab" className="bg-slate-800 text-white">แล็บ/เอ็กซเรย์</option>
                    <option value="dental" className="bg-slate-800 text-white">ทันตกรรม</option>
                    <option value="other" className="bg-slate-800 text-white">อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">ราคา (THB) *</label>
                  <input
                    type="number"
                    required
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">เวลาตรวจโดยประมาณ (นาที)</label>
                <input
                  type="number"
                  value={srvTime}
                  onChange={(e) => setSrvTime(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">รายละเอียดบริการ</label>
                <textarea
                  rows={3}
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="srvPopular"
                  checked={srvPopular}
                  onChange={(e) => setSrvPopular(e.target.checked)}
                  className="w-4 h-4 text-sky-500 rounded-md border-slate-700 bg-slate-800 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="srvPopular" className="font-semibold text-slate-300 cursor-pointer">แสดงป้ายบริการยอดนิยม</label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl shadow-lg shadow-sky-500/20 cursor-pointer">
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medicine Modal */}
      {isMedModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl my-8 border border-slate-800 text-xs text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingMed ? 'แก้ไขข้อมูลยา' : 'เพิ่มรายการยาใหม่'}
              </h3>
              <button onClick={() => setIsMedModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMed} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">รหัสยา</label>
                  <input
                    type="text"
                    required
                    value={medCode}
                    onChange={(e) => setMedCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">ชื่อยาและขนาด *</label>
                  <input
                    type="text"
                    required
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">หน่วยนับ</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น เม็ด, ขวด"
                    value={medUnit}
                    onChange={(e) => setMedUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ราคา/หน่วย</label>
                  <input
                    type="number"
                    required
                    value={medUnitPrice}
                    onChange={(e) => setMedUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">สต็อกคงเหลือ</label>
                  <input
                    type="number"
                    required
                    value={medStock}
                    onChange={(e) => setMedStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">วิธีใช้มาตรฐาน</label>
                <textarea
                  rows={2}
                  value={medInstructions}
                  onChange={(e) => setMedInstructions(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMedModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer">
                  บันทึกยา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
