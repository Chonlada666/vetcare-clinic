'use client';

import React, { useState } from 'react';
import { useClinic } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency, formatThaiDate } from '@/lib/utils';
import { PrescribedMedicine } from '@/types';
import {
  Stethoscope,
  PawPrint,
  History,
  Pill,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Boxes,
  Package,
} from 'lucide-react';

export default function ClinicalEMRPage() {
  const params = useParams();
  const router = useRouter();
  const { appointments, pets, users, vets, medicines, treatments, addTreatmentRecord } = useClinic();

  const appointmentId = params.id as string;
  const appointment = appointments.find((a) => a.id === appointmentId);
  const pet = pets.find((p) => p.id === appointment?.petId);
  const owner = users.find((u) => u.id === appointment?.ownerId);
  const vet = vets.find((v) => v.id === appointment?.vetId) || vets[0];

  // Past medical records for this pet
  const pastTreatments = treatments.filter((t) => t.petId === pet?.id);

  // Form State
  const [symptoms, setSymptoms] = useState(appointment?.initialSymptoms || '');
  const [serviceFee, setServiceFee] = useState<string>('200');
  const [prescriptions, setPrescriptions] = useState<PrescribedMedicine[]>([]);

  // Medicine adder state
  const [selectedMedId, setSelectedMedId] = useState<string>(medicines[0]?.id || '');
  const [medQuantity, setMedQuantity] = useState<string>('1');
  const [medInstruction, setMedInstruction] = useState<string>(medicines[0]?.instructions || '');

  // Follow-up state
  const [hasFollowUp, setHasFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  const [isSaved, setIsSaved] = useState(false);
  const [savedDeductions, setSavedDeductions] = useState<{
    name: string;
    unit: string;
    deducted: number;
    beforeStock: number;
    afterStock: number;
  }[]>([]);

  // Base available stock in warehouse minus already added prescriptions
  const getBaseAvailableStock = (medId: string) => {
    const baseMed = medicines.find((item) => item.id === medId);
    if (!baseMed) return 0;
    const alreadyPrescribed = prescriptions.find((p) => p.medicineId === medId);
    const alreadyUsed = alreadyPrescribed ? alreadyPrescribed.quantity : 0;
    return Math.max(0, baseMed.stock - alreadyUsed);
  };

  // Selected med info & live real-time stock computation
  const selectedMed = medicines.find((m) => m.id === selectedMedId);
  const selectedBaseAvailable = selectedMed ? getBaseAvailableStock(selectedMed.id) : 0;
  const typedQty = Number(medQuantity || 0);
  const projectedRemaining = Math.max(0, selectedBaseAvailable - typedQty);
  const isOverStock = selectedMed && typedQty > selectedBaseAvailable;

  // Handle medicine selector change
  const handleMedSelect = (id: string) => {
    setSelectedMedId(id);
    const med = medicines.find((m) => m.id === id);
    if (med) {
      setMedInstruction(med.instructions);
    }
  };

  const handleAddMedicine = () => {
    const med = medicines.find((m) => m.id === selectedMedId);
    if (!med) return;

    const available = getBaseAvailableStock(med.id);
    if (available <= 0) {
      alert(`ไม่สามารถสั่งยานี้ได้ เนื่องจาก "${med.name}" หมดสต็อกในคลัง`);
      return;
    }

    if (Number(medQuantity) > available) {
      alert(`สต็อกยาไม่เพียงพอ! "${med.name}" มีคงเหลือในคลังเพียง ${available} ${med.unit}`);
      return;
    }

    const newItem: PrescribedMedicine = {
      medicineId: med.id,
      name: med.name,
      quantity: Number(medQuantity),
      unit: med.unit,
      unitPrice: med.unitPrice,
      totalPrice: med.unitPrice * Number(medQuantity),
      instruction: medInstruction || med.instructions,
    };

    setPrescriptions((prev) => {
      const idx = prev.findIndex((p) => p.medicineId === med.id);
      if (idx !== -1) {
        const copy = [...prev];
        const newQty = copy[idx].quantity + Number(medQuantity);
        copy[idx] = {
          ...copy[idx],
          quantity: newQty,
          totalPrice: copy[idx].unitPrice * newQty,
          instruction: medInstruction || copy[idx].instruction,
        };
        return copy;
      }
      return [...prev, newItem];
    });

    setMedQuantity('1');
  };

  const handleUpdateRxQuantity = (index: number, delta: number) => {
    setPrescriptions((prev) => {
      const copy = [...prev];
      const item = copy[index];
      if (!item) return prev;

      const med = medicines.find((m) => m.id === item.medicineId);
      const totalInWarehouse = med ? med.stock : 0;
      const otherPrescriptionsUsed = prev
        .filter((_, i) => i !== index && _.medicineId === item.medicineId)
        .reduce((sum, p) => sum + p.quantity, 0);
      const maxAllowed = totalInWarehouse - otherPrescriptionsUsed;

      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      if (newQty > maxAllowed) {
        alert(`สต็อกยาไม่เพียงพอ! "${item.name}" มีคงเหลือในคลังให้จ่ายได้สูงสุด ${maxAllowed} ${item.unit}`);
        return prev;
      }

      copy[index] = {
        ...item,
        quantity: newQty,
        totalPrice: item.unitPrice * newQty,
      };
      return copy;
    });
  };

  const handleRemoveMedicine = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotalMedicineFee = () => {
    return prescriptions.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !pet) return;

    if (!symptoms.trim()) {
      alert('กรุณากรอกข้อมูลบันทึกอาการ');
      return;
    }

    // Validate stock before submitting
    const deductions = prescriptions.map((rx) => {
      const liveMed = medicines.find((m) => m.id === rx.medicineId);
      const before = liveMed ? liveMed.stock : 0;
      return {
        name: rx.name,
        unit: rx.unit,
        deducted: rx.quantity,
        beforeStock: before,
        afterStock: Math.max(0, before - rx.quantity),
      };
    });

    for (const d of deductions) {
      if (d.deducted > d.beforeStock) {
        alert(`ไม่สามารถบันทึกได้: ยา "${d.name}" มีในสต็อกไม่พอ (เหลือ ${d.beforeStock} ${d.unit})`);
        return;
      }
    }

    addTreatmentRecord({
      appointmentId: appointment.id,
      petId: pet.id,
      vetId: vet.id,
      date: appointment.date,
      symptoms,
      prescriptions,
      serviceFee: Number(serviceFee),
      followUpDate: hasFollowUp ? followUpDate : undefined,
      followUpNotes: hasFollowUp ? followUpNotes : undefined,
    });

    setSavedDeductions(deductions);
    setIsSaved(true);
  };

  if (!appointment || !pet) {
    return (
      <div className="max-w-4xl mx-auto my-12 text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 shadow-md space-y-4 text-white">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">ไม่พบนัดหมายนี้ในระบบ</h2>
        <a href="/vet/treatments" className="inline-block text-xs font-bold text-sky-400 hover:underline">
          กลับไปหน้ารายการคิวตรวจ
        </a>
      </div>
    );
  }

  const petSpeciesDisplay = pet.species === 'อื่นๆ' && pet.exoticType
    ? pet.exoticType
    : pet.species === 'สัตว์พิเศษ (Exotic)' && pet.exoticType
    ? pet.exoticType
    : pet.species;

  if (isSaved) {
    return (
      <div className="max-w-xl mx-auto my-10 bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 text-white">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white">บันทึกการตรวจรักษาสำเร็จ</h2>
          <p className="text-xs text-slate-400">
            ระบบได้บันทึกประวัติการตรวจ (EMR) และตัดสต็อกยาในคลังเรียบร้อยแล้ว
          </p>
        </div>

        {/* Stock Deduction Summary Card */}
        {savedDeductions.length > 0 && (
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              <span>สรุปการตัดสต็อกยาและเวชภัณฑ์ในคลัง ({savedDeductions.length} รายการ):</span>
            </div>

            <div className="space-y-2.5">
              {savedDeductions.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-xs">
                  <div>
                    <strong className="text-white block">{item.name}</strong>
                    <span className="text-[11px] text-rose-400 font-semibold">
                      - ตัดจ่าย: {item.deducted} {item.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block line-through">เดิม: {item.beforeStock} {item.unit}</span>
                    <span className="font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      คงเหลือใหม่: {item.afterStock} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3.5 bg-sky-950/60 border border-sky-800/60 rounded-2xl text-sky-200 text-xs flex items-center gap-2 font-medium">
          <FileText className="w-4 h-4 text-sky-400 shrink-0" />
          <span>ระบบออกบิลยอดรวม {formatCurrency(Number(serviceFee) + calculateTotalMedicineFee())} ส่งไปยังเจ้าของสัตว์เลี้ยงแล้ว</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push('/vet/dashboard')}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-sky-500/20 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>กลับไปหน้าแดชบอร์ด</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-white pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/vet/treatments')}
            className="p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md border border-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-sky-400 font-bold text-xs uppercase tracking-[0.2em] mb-0.5">
              ELECTRONIC MEDICAL RECORD (EMR)
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide">
              ห้องตรวจเคส: {pet.name} ({petSpeciesDisplay})
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono px-3 py-1.5 bg-slate-800 text-slate-300 rounded-md font-bold border border-slate-700">
            รหัสคิว: {appointment.id}
          </span>
          <span className="px-3 py-1.5 bg-sky-500/20 text-sky-300 rounded-md font-bold border border-sky-500/30">
            เวลานัด: {appointment.timeSlot} น.
          </span>
        </div>
      </div>

      {/* TWO-COLUMN CLINICAL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT COLUMN: Patient Info & Timeline (4 Cols) ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pet Profile Card */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center gap-3.5 pb-3 border-b border-slate-800">
              <img
                src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80'}
                alt={pet.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-sky-500/30"
              />
              <div>
                <h3 className="font-bold text-white text-base">{pet.name}</h3>
                <div className="text-xs text-sky-400 font-semibold">{petSpeciesDisplay} &bull; {pet.breed || 'ไม่ระบุพันธุ์'}</div>
                <div className="text-[11px] text-slate-400">
                  {pet.gender === 'male' ? 'เพศผู้ ♂' : 'เพศเมีย ♀'} &bull; อายุ {pet.ageYears} ปี {pet.ageMonths} เดือน
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">น้ำหนักตัว:</span>
                <span className="font-bold text-white">{pet.weightKg} กก.</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">เจ้าของ:</span>
                <span className="font-bold text-white truncate block">{owner?.name}</span>
              </div>
            </div>

            {pet.allergies && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-200 text-xs">
                <strong className="block text-rose-400">ประวัติแพ้ยา/อาหาร:</strong>
                <span>{pet.allergies}</span>
              </div>
            )}

            <div className="text-xs text-slate-400 border-t border-slate-800 pt-3 space-y-1">
              <div>เบอร์โทรเจ้าของ: <strong className="text-white">{owner?.phone}</strong></div>
              <div>ที่อยู่: <span className="text-slate-300">{owner?.address || '-'}</span></div>
            </div>
          </div>

          {/* Past Medical History Timeline */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-md space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              Timeline ประวัติการรักษาเดิม ({pastTreatments.length})
            </h3>

            {pastTreatments.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                {pastTreatments.map((tr) => (
                  <div key={tr.id} className="relative pl-7 space-y-1 text-xs">
                    <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-sky-400 ring-4 ring-slate-900"></div>
                    <div className="font-bold text-white">{formatThaiDate(tr.date)}</div>
                    <div className="text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <div><strong className="text-white">อาการ:</strong> {tr.symptoms}</div>
                      {tr.prescriptions.length > 0 && (
                        <div className="text-[11px] text-sky-400 font-medium">
                          ยาที่ได้รับ: {tr.prescriptions.map((p) => p.name).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs bg-slate-950 rounded-2xl border border-dashed border-slate-800">
                ยังไม่มีประวัติการรักษาเดิม
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Clinical Form (8 Cols) ================= */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md">
            {/* Initial Symptoms Banner from Owner */}
            <div className="bg-sky-950/50 border border-sky-800/60 rounded-2xl p-4 text-xs space-y-1">
              <div className="font-bold text-sky-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-400" />
                อาการเบื้องต้นที่เจ้าของสัตว์เลี้ยงแจ้งไว้:
              </div>
              <p className="text-sky-200 font-medium">{appointment.initialSymptoms}</p>
            </div>

            {/* Form Section 1: Symptoms Observation */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                บันทึกอาการที่ตรวจพบ (Clinical Symptoms & Observations) *
              </label>
              <textarea
                required
                rows={4}
                placeholder="ระบุอาการสำคัญที่ตรวจพบ เช่น มีอาการคันหู ส่องตรวจพบรอยถลอก ให้การล้างทำความสะอาดและหยอดยา..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            {/* Form Section: Prescriptions & Vaccines */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-sky-400" />
                  การสั่งจ่ายยาและวัคซีน (Prescriptions & Vaccines)
                </label>
                <span className="text-xs font-semibold text-sky-400">
                  ค่ายารวม: {formatCurrency(calculateTotalMedicineFee())}
                </span>
              </div>

              {/* Medicine Add Box */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <label className="block text-[11px] font-bold text-slate-300">เลือกตัวยา/วัคซีน *</label>
                      {selectedMed && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                            selectedBaseAvailable <= 0
                              ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                              : isOverStock
                              ? 'bg-rose-950/80 text-rose-300 border-rose-700 animate-pulse'
                              : projectedRemaining < 30
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                              : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {selectedBaseAvailable <= 0 ? (
                            `❌ หมดสต็อก (เหลือ 0 ${selectedMed.unit})`
                          ) : isOverStock ? (
                            `⚠️ สต็อกไม่พอ! มี ${selectedBaseAvailable} ${selectedMed.unit} (ขาด ${typedQty - selectedBaseAvailable})`
                          ) : typedQty > 0 ? (
                            `คงเหลือในคลัง: ${selectedBaseAvailable} ${selectedMed.unit} (จ่าย ${typedQty} ➔ เหลือ ${projectedRemaining} ${selectedMed.unit})`
                          ) : (
                            `คงเหลือในคลัง: ${selectedBaseAvailable} ${selectedMed.unit}`
                          )}
                        </span>
                      )}
                    </div>
                    <select
                      value={selectedMedId}
                      onChange={(e) => handleMedSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 text-xs font-semibold bg-slate-800 text-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    >
                      {medicines.map((m) => {
                        const available = getBaseAvailableStock(m.id);
                        const inCurrentRx = prescriptions.find((p) => p.medicineId === m.id)?.quantity || 0;
                        return (
                          <option key={m.id} value={m.id} disabled={available <= 0} className="bg-slate-800 text-white">
                            {m.name} — [คงเหลือ: {available} {m.unit}{inCurrentRx > 0 ? ` (สั่งจ่ายแล้ว ${inCurrentRx})` : ''}] ({formatCurrency(m.unitPrice)}/{m.unit})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-300">จำนวนจ่าย *</label>
                      {selectedMed && selectedBaseAvailable > 0 && (
                        <span className="text-[10px] text-slate-400">สูงสุด {selectedBaseAvailable}</span>
                      )}
                    </div>
                    <input
                      type="number"
                      min="1"
                      max={selectedBaseAvailable || 999}
                      placeholder="1"
                      value={medQuantity}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/^0+/, '');
                        setMedQuantity(raw);
                      }}
                      onBlur={() => {
                        if (!medQuantity || Number(medQuantity) < 1) setMedQuantity('1');
                      }}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold bg-slate-800 text-white focus:ring-2 focus:outline-hidden transition ${
                        isOverStock
                          ? 'border-rose-500 focus:ring-rose-500 text-rose-300 bg-rose-950/30'
                          : 'border-slate-700 focus:ring-sky-500'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">วิธีใช้ / คำแนะนำการใช้ยา</label>
                    <input
                      type="text"
                      placeholder="วิธีใช้ยา..."
                      value={medInstruction}
                      onChange={(e) => setMedInstruction(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 text-xs bg-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    disabled={!selectedMed || selectedBaseAvailable <= 0 || isOverStock || typedQty <= 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl text-xs transition shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> เพิ่มรายการยานี้ (ตัดยอด Real-Time)
                  </button>
                </div>
              </div>

              {/* Prescribed Items Table */}
              {prescriptions.length > 0 ? (
                <div className="space-y-3">
                  <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-md bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                        <tr>
                          <th className="p-3">รายการยา/วัคซีน</th>
                          <th className="p-3">จำนวนจ่าย</th>
                          <th className="p-3">สต็อกคลังหลังจ่าย</th>
                          <th className="p-3">วิธีใช้</th>
                          <th className="p-3 text-right">ราคา</th>
                          <th className="p-3 text-center">ลบ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-900">
                        {prescriptions.map((rx, idx) => {
                          const medInDb = medicines.find((m) => m.id === rx.medicineId);
                          const totalWarehouseStock = medInDb ? medInDb.stock : 0;
                          const remainingStockAfterPrescribed = Math.max(0, totalWarehouseStock - rx.quantity);

                          return (
                            <tr key={idx} className="hover:bg-slate-800/50 transition">
                              <td className="p-3">
                                <div className="font-semibold text-white">{rx.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  สต็อกเดิม: {totalWarehouseStock} {rx.unit}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateRxQuantity(idx, -1)}
                                    className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition"
                                    title="ลดจำนวน"
                                  >
                                    -
                                  </button>
                                  <span className="font-bold text-white px-1">
                                    {rx.quantity} {rx.unit}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={remainingStockAfterPrescribed <= 0}
                                    onClick={() => handleUpdateRxQuantity(idx, 1)}
                                    className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition"
                                    title="เพิ่มจำนวน"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  remainingStockAfterPrescribed < 30
                                    ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                }`}>
                                  เหลือ {remainingStockAfterPrescribed} {rx.unit}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400 text-[11px] max-w-xs truncate">{rx.instruction}</td>
                              <td className="p-3 text-right font-mono font-bold text-sky-400">
                                {formatCurrency(rx.totalPrice)}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMedicine(idx)}
                                  className="p-1 text-rose-400 hover:bg-rose-950/60 rounded-lg cursor-pointer transition"
                                  title="ลบรายการและคืนสต็อก"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Real-Time Stock Deduction Impact Summary */}
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-2">
                    <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sky-400">
                        <Boxes className="w-3.5 h-3.5" />
                        <span>สรุปการตัดสต็อกยาในคลังแบบ Real-Time ({prescriptions.length} รายการ):</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                        ● หักยอดอัตโนมัติ Real-Time
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {prescriptions.map((rx, idx) => {
                        const m = medicines.find((item) => item.id === rx.medicineId);
                        const before = m ? m.stock : 0;
                        const after = Math.max(0, before - rx.quantity);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-xs"
                          >
                            <span className="text-white truncate font-medium max-w-[150px]">{rx.name}</span>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-rose-400 font-bold">-{rx.quantity}</span>
                              <span className="text-slate-600">➔</span>
                              <span className="text-emerald-300 font-bold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                                คงเหลือ {after} {rx.unit}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs bg-slate-950 rounded-xl border border-dashed border-slate-800">
                  ยังไม่ได้สั่งยาหรือวัคซีนในเคสนี้
                </div>
              )}
            </div>

            {/* Form Section: Follow-up Appointment */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasFollowUp"
                  checked={hasFollowUp}
                  onChange={(e) => setHasFollowUp(e.target.checked)}
                  className="w-4 h-4 text-sky-500 bg-slate-800 rounded-md border-slate-700 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="hasFollowUp" className="text-xs font-bold text-slate-200 cursor-pointer">
                  นัดหมายติดตามผลการรักษา (Follow-up Appointment)
                </label>
              </div>

              {hasFollowUp && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-sky-950/40 rounded-2xl border border-sky-800/60">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">วันที่นัดติดตามผล *</label>
                    <input
                      type="date"
                      required={hasFollowUp}
                      value={followUpDate}
                      min={new Date().toISOString().split('T')[0]}
                      onKeyDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker();
                        } catch {}
                      }}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 text-xs font-semibold bg-slate-800 text-white focus:ring-2 focus:ring-sky-500 [color-scheme:dark] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">บันทึกสิ่งที่ต้องตรวจซ้ำ</label>
                    <input
                      type="text"
                      placeholder="เช่น นัดดูการตอบสนองของแผล, ตรวจซ้ำขี้หู"
                      value={followUpNotes}
                      onChange={(e) => setFollowUpNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 text-xs bg-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Fee Summary & Submit */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-bold">ค่าบริการทางการแพทย์ / ค่าตรวจ (THB):</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">฿</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={serviceFee}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/^0+(?=\d)/, '');
                        setServiceFee(raw);
                      }}
                      className="w-32 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-0.5">
                  <div className="text-xs text-slate-400 font-medium">ยอดรวมค่ารักษาและค่ายาทั้งหมด:</div>
                  <div className="text-2xl font-black text-sky-400 font-mono">
                    {formatCurrency(Number(serviceFee) + calculateTotalMedicineFee())}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl shadow-lg shadow-sky-500/20 text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>บันทึกผลการตรวจและส่งบิลชำระเงิน</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
