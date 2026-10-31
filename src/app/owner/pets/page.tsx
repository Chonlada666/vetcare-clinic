'use client';

import React, { useState } from 'react';
import { useClinic } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Pet } from '@/types';
import {
  PawPrint,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Calendar,
  Weight,
  HeartPulse,
  Tag,
  CheckCircle2,
  Search,
  Upload,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

export default function OwnerPetsPage() {
  const router = useRouter();
  const { currentUser, users, pets, addPet, updatePet, deletePet } = useClinic();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('สุนัข');
  const [otherSpecies, setOtherSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [ageYears, setAgeYears] = useState<string | number>(1);
  const [ageMonths, setAgeMonths] = useState<string | number>(0);
  const [weightKg, setWeightKg] = useState<string | number>('3.5');
  const [allergies, setAllergies] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  const myPets = pets.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.exoticType && p.exoticType.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (currentUser?.role === 'admin') return true;
    if (!currentUser) return true;
    return p.ownerId === currentUser.id;
  });

  const openAddModal = () => {
    setEditingPet(null);
    setName('');
    setSpecies('สุนัข');
    setOtherSpecies('');
    setBreed('');
    setGender('male');
    setAgeYears(1);
    setAgeMonths(0);
    setWeightKg('3.5');
    setAllergies('');
    setPhotoUrl('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (pet: Pet) => {
    setEditingPet(pet);
    setName(pet.name);
    if (pet.species === 'สัตว์พิเศษ (Exotic)' || pet.species === 'อื่นๆ') {
      setSpecies('อื่นๆ');
      setOtherSpecies(pet.exoticType || '');
    } else {
      setSpecies(pet.species);
      setOtherSpecies('');
    }
    setBreed(pet.breed);
    setGender(pet.gender);
    setAgeYears(pet.ageYears);
    setAgeMonths(pet.ageMonths);
    setWeightKg(String(pet.weightKg));
    setAllergies(pet.allergies || '');
    setPhotoUrl(pet.photoUrl || '');
    setNotes(pet.notes || '');
    setIsModalOpen(true);
  };

  // Handle local image file upload from device with auto-compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('ขนาดไฟล์รูปภาพต้องไม่เกิน 15MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 500;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            if (w > MAX_SIZE) {
              h *= MAX_SIZE / w;
              w = MAX_SIZE;
            }
          } else {
            if (h > MAX_SIZE) {
              w *= MAX_SIZE / h;
              h = MAX_SIZE;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            setPhotoUrl(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            setPhotoUrl(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Fallback owner identification
    const effectiveOwnerId =
      editingPet?.ownerId ||
      currentUser?.id ||
      (users && users.find((u) => u.role === 'owner')?.id) ||
      'user_owner_1';

    if (species === 'อื่นๆ' && !otherSpecies.trim()) {
      alert('กรุณาระบุชนิดสัตว์เลี้ยงในช่องระบุ');
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedWeight = parseFloat(String(weightKg)) || 0;
      const parsedYears = parseInt(String(ageYears), 10) || 0;
      const parsedMonths = parseInt(String(ageMonths), 10) || 0;

      const petPhoto =
        photoUrl ||
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';

      const petPayload: any = {
        name: name.trim(),
        species,
        breed: breed.trim(),
        gender,
        ageYears: parsedYears,
        ageMonths: parsedMonths,
        weightKg: parsedWeight,
        allergies: allergies.trim(),
        photoUrl: petPhoto,
        notes: notes.trim(),
      };

      if (species === 'อื่นๆ' && otherSpecies.trim()) {
        petPayload.exoticType = otherSpecies.trim();
      }

      if (editingPet) {
        await updatePet(editingPet.id, {
          ownerId: effectiveOwnerId,
          ...petPayload,
        });
        setSuccessToast(`บันทึกการแก้ไขข้อมูล "${name}" เรียบร้อยแล้ว`);
      } else {
        await addPet({
          ownerId: effectiveOwnerId,
          ...petPayload,
        });
        setSuccessToast(`ลงทะเบียนสัตว์เลี้ยง "${name}" สำเร็จเรียบร้อยแล้ว`);
      }

      setIsModalOpen(false);
      setEditingPet(null);
      setName('');
      setBreed('');
      setAllergies('');
      setNotes('');

      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Failed to save pet:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, petName: string) => {
    if (confirm(`คุณต้องการลบข้อมูลสัตว์เลี้ยง "${petName}" ใช่หรือไม่?`)) {
      deletePet(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-sky-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">
            PET REGISTRY &amp; PROFILES
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide uppercase">
            สัตว์เลี้ยงของฉัน
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ลงทะเบียนและจัดการประวัติสุขภาพสัตว์เลี้ยงของคุณ (สุนัข, แมว, และสัตว์เลี้ยงพิเศษ)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2.5 rounded-md transition text-xs sm:text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสัตว์เลี้ยงใหม่</span>
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast('')}
            className="text-emerald-400 hover:text-emerald-200 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-md">
        <Search className="w-5 h-5 text-slate-400 pl-1" />
        <input
          type="text"
          placeholder="ค้นหาชื่อสัตว์เลี้ยง, สายพันธุ์, ชนิดสัตว์..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm bg-transparent focus:outline-hidden text-white placeholder:text-slate-500 font-medium"
        />
      </div>

      {/* Pet Cards Grid */}
      {myPets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPets.map((pet) => {
            const displaySpecies =
              pet.species === 'อื่นๆ' && pet.exoticType
                ? pet.exoticType
                : pet.species === 'สัตว์พิเศษ (Exotic)' && pet.exoticType
                ? pet.exoticType
                : pet.species;

            return (
              <div
                key={pet.id}
                className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-md hover:border-sky-500/50 hover:shadow-xl transition duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-48 w-full bg-slate-950">
                    <img
                      src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => openEditModal(pet)}
                        className="p-2 bg-slate-900/80 hover:bg-sky-500 text-slate-200 hover:text-slate-950 backdrop-blur-md rounded-xl shadow-md border border-slate-700/60 transition cursor-pointer"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pet.id, pet.name)}
                        className="p-2 bg-slate-900/80 hover:bg-rose-500 text-slate-200 hover:text-white backdrop-blur-md rounded-xl shadow-md border border-slate-700/60 transition cursor-pointer"
                        title="ลบข้อมูล"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-sky-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700/50">
                      {displaySpecies}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-lg text-white">{pet.name}</h3>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {pet.gender === 'male' ? 'เพศผู้ ♂' : 'เพศเมีย ♀'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      สายพันธุ์: <strong className="text-slate-200 font-semibold">{pet.breed || '-'}</strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">อายุ</span>
                        <strong className="text-white font-bold">
                          {pet.ageYears} ปี {pet.ageMonths > 0 ? `${pet.ageMonths} เดือน` : ''}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">น้ำหนัก</span>
                        <strong className="text-white font-bold">{pet.weightKg} กก.</strong>
                      </div>
                    </div>

                    {pet.allergies && (
                      <div className="text-xs p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300">
                        <strong className="block text-[11px] text-rose-400 font-bold">ประวัติแพ้ยา/อาหาร:</strong>
                        <span className="text-[11px]">{pet.allergies}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => router.push(`/owner/booking?petId=${pet.id}`)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 font-bold rounded-md text-xs flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer"
                  >
                    <span>จองคิวตรวจให้น้อง {pet.name}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-3">
          <h3 className="font-bold text-white text-base">ไม่พบข้อมูลสัตว์เลี้ยง</h3>
          <p className="text-xs text-slate-400">คุณยังไม่ได้ลงทะเบียนสัตว์เลี้ยง หรือไม่พบข้อมูลตามคำค้นหา</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-md mt-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> เพิ่มสัตว์เลี้ยงตัวแรก
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <button
            type="button"
            aria-label="ปิดหน้าต่างจัดการสัตว์เลี้ยง"
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm -z-10 cursor-default"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-800 my-8 text-white relative z-10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">
                {editingPet ? 'แก้ไขข้อมูลสัตว์เลี้ยง' : 'ลงทะเบียนสัตว์เลี้ยงใหม่'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ชื่อสัตว์เลี้ยง *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ทองเอก, มอมแมม"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ประเภทสัตว์เลี้ยง *</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="สุนัข">สุนัข (Dog)</option>
                    <option value="แมว">แมว (Cat)</option>
                    <option value="นก">นก (Bird)</option>
                    <option value="กระต่าย">กระต่าย (Rabbit)</option>
                    <option value="หนู / แฮมสเตอร์">หนู / แฮมสเตอร์ (Hamster)</option>
                    <option value="อื่นๆ">อื่นๆ (สัตว์พิเศษ / Exotic Pet)</option>
                  </select>
                </div>
              </div>

              {species === 'อื่นๆ' && (
                <div className="p-3.5 bg-sky-950/40 border border-sky-800/50 rounded-xl space-y-1.5 animate-fadeIn">
                  <label className="block text-xs font-bold text-sky-300">
                    ระบุชนิดสัตว์เลี้ยง (อื่นๆ) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ระบุชนิดสัตว์ เช่น ชูการ์ไกลเดอร์, เม่นแคระ, เฟอร์เรท, เต่าบก ฯลฯ"
                    value={otherSpecies}
                    onChange={(e) => setOtherSpecies(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-sky-700/60 bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 text-white placeholder:text-slate-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">สายพันธุ์</label>
                <input
                  type="text"
                  placeholder="เช่น โกลเด้น รีทรีฟเวอร์, สก็อตติช โฟลด์"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">เพศ</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="male">เพศผู้ (Male)</option>
                    <option value="female">เพศเมีย (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">อายุ (ปี)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="เช่น 1"
                    value={ageYears}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*$/.test(val)) setAgeYears(val);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">น้ำหนัก (กก.)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="เช่น 3.5 หรือ 0.71"
                    value={weightKg}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) setWeightKg(val);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ประวัติแพ้ยา / แพ้อาหาร</label>
                <input
                  type="text"
                  placeholder="เช่น แพ้โปรตีนไก่, แพ้ยาปฏิชีวนะกลุ่มเพนิซิลลิน (ถ้ามี)"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Local File Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  รูปภาพสัตว์เลี้ยง (อัปโหลดจากเครื่อง)
                </label>
                <div className="flex items-center gap-4 p-3.5 bg-slate-950 border border-dashed border-slate-700 rounded-2xl">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-700 transition shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-sky-400" /> เลือกไฟล์รูปจากคอมพิวเตอร์
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="block text-[10px] text-slate-400">
                      รองรับไฟล์ JPG, PNG, WEBP ขนาดไม่เกิน 10MB
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">บันทึกเพิ่มเติม / นิสัย</label>
                <textarea
                  rows={2}
                  placeholder="เช่น นิสัยร่าเริง กลัวเสียงดัง ชอบเล่นน้ำ..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-slate-950 text-xs font-black shadow-lg shadow-sky-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
