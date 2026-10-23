'use client';

import React, { useState } from 'react';
import { useClinic } from '@/lib/store';
import { User, UserRole, Vet } from '@/types';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Stethoscope,
  UserCheck,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Award,
  Upload,
  Image as ImageIcon,
  UserPlus,
} from 'lucide-react';

const ALL_DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
const DEFAULT_FEMALE_AVATAR = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80';
const DEFAULT_MALE_AVATAR = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80';

export default function AdminUsersAndVetsPage() {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    currentUser,
    vets,
    addVet,
    updateVet,
    deleteVet,
  } = useClinic();

  // Active Tab: 'users' | 'vets'
  const [activeTab, setActiveTab] = useState<'users' | 'vets'>('users');

  // ================= USERS STATE =================
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('owner');
  const [userAddress, setUserAddress] = useState('');

  const filteredUsers = users
    .filter((u) => (roleFilter === 'all' ? true : u.role === roleFilter))
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search)
    );

  const openAddUserModal = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setUserRole('owner');
    setUserAddress('');
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (u: User) => {
    setEditingUser(u);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserPhone(u.phone);
    setUserRole(u.role);
    setUserAddress(u.address || '');
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !userPhone) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        name: userName,
        email: userEmail,
        phone: userPhone,
        role: userRole,
        address: userAddress,
      });
    } else {
      addUser({
        name: userName,
        email: userEmail,
        phone: userPhone,
        role: userRole,
        address: userAddress,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      });
    }
    setIsUserModalOpen(false);
  };

  const handleUserDelete = (id: string, name: string) => {
    if (id === currentUser?.id) {
      alert('ไม่สามารถลบบัญชีผู้ใช้ที่กำลังเข้าสู่ระบบอยู่ได้');
      return;
    }
    if (confirm(`คุณต้องการลบผู้ใช้งาน "${name}" ใช่หรือไม่?`)) {
      deleteUser(id);
    }
  };

  const getUserRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Shield className="w-3 h-3" /> ผู้ดูแลระบบ (Admin)
          </span>
        );
      case 'vet':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Stethoscope className="w-3 h-3" /> สัตวแพทย์ (Vet)
          </span>
        );
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <UserCheck className="w-3 h-3" /> เจ้าของสัตว์เลี้ยง (Owner)
          </span>
        );
    }
  };

  // ================= VETS STATE =================
  const [isVetModalOpen, setIsVetModalOpen] = useState(false);
  const [editingVet, setEditingVet] = useState<Vet | null>(null);

  const [vetName, setVetName] = useState('');
  const [vetSpecialty, setVetSpecialty] = useState('');
  const [vetLicenseNo, setVetLicenseNo] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [vetEmail, setVetEmail] = useState('');
  const [vetAvatar, setVetAvatar] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>(['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  const openAddVetModal = () => {
    setEditingVet(null);
    setVetName('');
    setVetSpecialty('');
    setVetLicenseNo('');
    setVetPhone('');
    setVetEmail('');
    setVetAvatar(DEFAULT_FEMALE_AVATAR);
    setAvailableDays(['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์']);
    setStartTime('09:00');
    setEndTime('18:00');
    setIsVetModalOpen(true);
  };

  const openEditVetModal = (v: Vet) => {
    setEditingVet(v);
    setVetName(v.name);
    setVetSpecialty(v.specialty);
    setVetLicenseNo(v.licenseNo);
    setVetPhone(v.phone);
    setVetEmail(v.email);
    setVetAvatar(v.avatar || DEFAULT_FEMALE_AVATAR);
    setAvailableDays(v.availableDays);
    setStartTime(v.workingHours.start);
    setEndTime(v.workingHours.end);
    setIsVetModalOpen(true);
  };

  const handleVetFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('ขนาดไฟล์รูปภาพต้องไม่เกิน 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVetAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleVetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vetName || !vetSpecialty || !vetLicenseNo) return;

    const defaultImg = vetName.includes('น.สพ') ? DEFAULT_MALE_AVATAR : DEFAULT_FEMALE_AVATAR;
    const finalAvatar = vetAvatar && (vetAvatar.startsWith('http') || vetAvatar.startsWith('data:image')) ? vetAvatar : defaultImg;

    if (editingVet) {
      updateVet(editingVet.id, {
        name: vetName,
        specialty: vetSpecialty,
        licenseNo: vetLicenseNo,
        phone: vetPhone,
        email: vetEmail,
        avatar: finalAvatar,
        availableDays,
        workingHours: { start: startTime, end: endTime },
      });
    } else {
      addVet({
        name: vetName,
        specialty: vetSpecialty,
        licenseNo: vetLicenseNo,
        phone: vetPhone,
        email: vetEmail,
        avatar: finalAvatar,
        availableDays,
        workingHours: { start: startTime, end: endTime },
      });
    }
    setIsVetModalOpen(false);
  };

  const handleVetDelete = (id: string, name: string) => {
    if (confirm(`คุณต้องการลบข้อมูลสัตวแพทย์ "${name}" ใช่หรือไม่?`)) {
      deleteVet(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-white pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-sky-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">
            USERS &amp; VETERINARY STAFF
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide uppercase">
            จัดการผู้ใช้งาน &amp; สัตวแพทย์
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            บริหารจัดการบัญชีผู้ใช้งาน เจ้าของสัตว์เลี้ยง แอดมิน และข้อมูลตารางออกตรวจของสัตวแพทย์
          </p>
        </div>

        {/* Action button based on active tab */}
        {activeTab === 'users' ? (
          <button
            onClick={openAddUserModal}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2.5 rounded-md transition text-xs sm:text-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มผู้ใช้งานใหม่</span>
          </button>
        ) : (
          <button
            onClick={openAddVetModal}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2.5 rounded-md transition text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสัตวแพทย์ใหม่</span>
          </button>
        )}
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-md">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'users'
              ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>บัญชีผู้ใช้งานทั่วไป ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vets')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'vets'
              ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>ข้อมูลสัตวแพทย์ & ตารางตรวจ ({vets.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: USERS MANAGEMENT ================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทรศัพท์..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 text-xs sm:text-sm bg-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                ทั้งหมด ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('owner')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  roleFilter === 'owner'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                เจ้าของสัตว์เลี้ยง ({users.filter((u) => u.role === 'owner').length})
              </button>
              <button
                onClick={() => setRoleFilter('vet')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  roleFilter === 'vet'
                    ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                สัตวแพทย์ ({users.filter((u) => u.role === 'vet').length})
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  roleFilter === 'admin'
                    ? 'bg-purple-500 text-white font-black shadow-md'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                แอดมิน ({users.filter((u) => u.role === 'admin').length})
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">ข้อมูลผู้ใช้งาน</th>
                    <th className="p-4">บทบาทในระบบ</th>
                    <th className="p-4">เบอร์โทรศัพท์</th>
                    <th className="p-4 hidden md:table-cell">ที่อยู่</th>
                    <th className="p-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700 ring-2 ring-slate-800"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              {u.name}
                              {u.id === currentUser?.id && (
                                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded-md font-semibold">
                                  คุณ
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{getUserRoleBadge(u.role)}</td>
                      <td className="p-4 text-slate-300 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.phone}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 text-xs hidden md:table-cell max-w-xs truncate">
                        {u.address || '-'}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditUserModal(u)}
                            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserDelete(u.id, u.name)}
                            disabled={u.id === currentUser?.id}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="ลบผู้ใช้"
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
        </div>
      )}

      {/* ================= TAB 2: VETS MANAGEMENT ================= */}
      {activeTab === 'vets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vets.map((v) => (
              <div
                key={v.id}
                className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-md hover:border-sky-500/40 hover:shadow-xl transition duration-200 space-y-4 flex flex-col justify-between text-white"
              >
                <div className="space-y-4">
                  {/* Avatar & Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={v.avatar || (v.name.includes('น.สพ') ? DEFAULT_MALE_AVATAR : DEFAULT_FEMALE_AVATAR)}
                        alt={v.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-500/30 shadow-xs"
                      />
                      <div>
                        <h3 className="font-extrabold text-white text-sm sm:text-base leading-tight">
                          {v.name}
                        </h3>
                        <div className="text-xs text-sky-400 font-semibold mt-0.5">{v.specialty}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>ใบอนุญาต: {v.licenseNo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditVetModal(v)}
                        className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleVetDelete(v.id, v.name)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 rounded-xl transition cursor-pointer"
                        title="ลบสัตวแพทย์"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-2xl space-y-1.5 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{v.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{v.email}</span>
                    </div>
                  </div>

                  {/* Available Days */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>วันที่เข้าเวรตรวจ:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ALL_DAYS.map((day) => {
                        const isAvailable = v.availableDays.includes(day);
                        return (
                          <span
                            key={day}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isAvailable
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : 'bg-slate-950 text-slate-600 border border-slate-800/80 opacity-60'
                            }`}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Working Hours Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>เวลาตรวจ:</span>
                  </div>
                  <span className="font-bold text-white font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md">
                    {v.workingHours.start} - {v.workingHours.end} น.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT USER ================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-800 my-8 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณสมศรี มีสุข"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">อีเมล *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">เบอร์โทรศัพท์ *</label>
                  <input
                    type="tel"
                    required
                    placeholder="08X-XXX-XXXX"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">บทบาทในระบบ *</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 text-xs sm:text-sm bg-slate-800 text-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  <option value="owner" className="bg-slate-800 text-white">เจ้าของสัตว์เลี้ยง (Pet Owner)</option>
                  <option value="vet" className="bg-slate-800 text-white">สัตวแพทย์ (Veterinarian)</option>
                  <option value="admin" className="bg-slate-800 text-white">ผู้ดูแลระบบ (System Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ที่อยู่ติดต่อ</label>
                <textarea
                  rows={2}
                  placeholder="ระบุที่อยู่ของเจ้าของสัตว์เลี้ยง..."
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT VET ================= */}
      {isVetModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-800 my-8 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-sky-400" />
                {editingVet ? 'แก้ไขข้อมูลสัตวแพทย์' : 'เพิ่มสัตวแพทย์ใหม่'}
              </h3>
              <button
                onClick={() => setIsVetModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVetSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ชื่อ-นามสกุล สัตวแพทย์ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สพ.ญ. ปานวาด เมตตาธรรม (หมอป่าน)"
                  value={vetName}
                  onChange={(e) => setVetName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ความเชี่ยวชาญ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ศัลยกรรมกระดูก, โรคผิวหนัง"
                    value={vetSpecialty}
                    onChange={(e) => setVetSpecialty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">เลขที่ใบอนุญาต (วส.) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น วส.65432"
                    value={vetLicenseNo}
                    onChange={(e) => setVetLicenseNo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    placeholder="08X-XXX-XXXX"
                    value={vetPhone}
                    onChange={(e) => setVetPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">อีเมล</label>
                  <input
                    type="email"
                    placeholder="vet@vetcare.com"
                    value={vetEmail}
                    onChange={(e) => setVetEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Photo Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  รูปถ่ายสัตวแพทย์ (อัปโหลดจากเครื่อง)
                </label>
                <div className="flex items-center gap-4 p-3.5 bg-slate-950 border border-dashed border-slate-700 rounded-2xl">
                  {vetAvatar ? (
                    <img
                      src={vetAvatar}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-700 transition shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-sky-400" /> เลือกไฟล์รูปจากเครื่อง
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleVetFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="block text-[10px] text-slate-400">
                      รองรับไฟล์ JPG, PNG, WEBP ขนาดไม่เกิน 10MB
                    </span>
                  </div>
                </div>
              </div>

              {/* Days Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  วันที่เปิดรับนัดตรวจ (เลือกวันที่เข้าเวร)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ALL_DAYS.map((day) => {
                    const isChecked = availableDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          isChecked
                            ? 'bg-sky-500 text-slate-950 font-black border-sky-400 shadow-xs'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">เวลาเริ่มตรวจ</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 text-xs sm:text-sm bg-slate-800 text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">เวลาเลิกตรวจ</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 text-xs sm:text-sm bg-slate-800 text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  บันทึกข้อมูลสัตวแพทย์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
