'use client';

import React, { useState, useEffect } from 'react';
import { useClinic } from '@/lib/store';
import {
  User,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Shield,
  Sun,
  Moon,
  Edit2,
  Upload,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Camera,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface NavLink {
  href: string;
  label: string;
  badge?: number;
}

export function Navbar() {
  const { currentUser, updateUser, logout, bills } = useClinic();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const pathname = usePathname();
  const router = useRouter();

  // Profile Edit Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileSavedToast, setProfileSavedToast] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('vetcare_theme') as 'dark' | 'light' | null;
    const initial = saved === 'light' ? 'light' : 'dark';
    setTheme(initial);
    document.documentElement.classList.toggle('light', initial === 'light');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('vetcare_theme', next);
    document.documentElement.classList.toggle('light', next === 'light');
  };

  const openProfileModal = () => {
    if (!currentUser) return;
    setProfileName(currentUser.name || '');
    setProfileEmail(currentUser.email || '');
    setProfilePhone(currentUser.phone || '');
    setProfileAddress(currentUser.address || '');
    setProfileAvatar(currentUser.avatar || '');
    setProfileSavedToast('');
    setIsProfileModalOpen(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('ขนาดไฟล์รูปภาพต้องไม่เกิน 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!profileName.trim()) {
      alert('กรุณากรอกชื่อ - นามสกุล');
      return;
    }

    updateUser(currentUser.id, {
      name: profileName.trim(),
      email: profileEmail.trim(),
      phone: profilePhone.trim(),
      address: profileAddress.trim(),
      avatar: profileAvatar.trim(),
    });

    setProfileSavedToast('บันทึกการแก้ไขข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    setTimeout(() => {
      setProfileSavedToast('');
      setIsProfileModalOpen(false);
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Count pending bills for current owner
  const pendingBillsCount = bills.filter(
    (b) => b.ownerId === currentUser?.id && (b.status === 'pending_upload' || b.status === 'rejected')
  ).length;

  const getNavLinks = (): NavLink[] => {
    if (!currentUser) {
      return [];
    }

    if (currentUser.role === 'owner') {
      return [
        { href: '/owner/dashboard', label: 'หน้าหลัก' },
        { href: '/owner/pets', label: 'สัตว์เลี้ยงของฉัน' },
        { href: '/owner/booking', label: 'จองคิวนัดหมาย' },
        { href: '/owner/appointments', label: 'ประวัตินัดหมาย' },
        { href: '/owner/billing', label: 'ชำระเงิน/ใบเสร็จ', badge: pendingBillsCount },
        { href: '/owner/services', label: 'อัตราค่าบริการ' },
      ];
    }

    if (currentUser.role === 'vet') {
      return [
        { href: '/vet/dashboard', label: 'แดชบอร์ดสัตวแพทย์' },
        { href: '/vet/schedule', label: 'ตารางนัดหมาย & คิวตรวจ' },
        { href: '/vet/treatments', label: 'ห้องตรวจรักษา (EMR)' },
      ];
    }

    if (currentUser.role === 'admin') {
      const adminPendingCount = bills.filter((b) => b.status === 'verifying').length;
      return [
        { href: '/admin/dashboard', label: 'แดชบอร์ดบริหาร' },
        { href: '/admin/users', label: 'จัดการผู้ใช้ & สัตวแพทย์' },
        { href: '/admin/services', label: 'บริการ & ค่ายา' },
        { href: '/admin/payments', label: 'ตรวจสลิป & ชำระเงิน', badge: adminPendingCount },
        { href: '/admin/reports', label: 'รายงาน & สถิติ' },
      ];
    }

    return [];
  };

  const links = getNavLinks();

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-md w-full">
        {/* Full Width Layout - Stretches from edge to edge */}
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-6">
            {/* Left Side: Brand Logo followed by navigation links */}
            <div className="flex items-center gap-6 sm:gap-8 lg:gap-10 min-w-0 flex-1">
              {/* Brand Logo - Formal Veterinary Clinic Crest */}
              <a
                href={currentUser ? `/${currentUser.role}/dashboard` : '/login'}
                className="flex items-center gap-3 group shrink-0 whitespace-nowrap"
              >
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 44 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10"
                  >
                    {/* Formal Architectural Shield / Crest */}
                    <path
                      d="M22 3L6 9.5V20.5C6 30.8 12.8 39.8 22 42C31.2 39.8 38 30.8 38 20.5V9.5L22 3Z"
                      fill="#0284c7"
                      fillOpacity="0.15"
                      stroke="#0284c7"
                      strokeWidth="2.2"
                    />
                    <path
                      d="M22 6.5L9.5 11.6V20.3C9.5 28.5 14.8 35.8 22 37.8C29.2 35.8 34.5 28.5 34.5 20.3V11.6L22 6.5Z"
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeOpacity="0.6"
                    />
                    {/* Official Medical Cross */}
                    <path
                      d="M19.5 14H24.5V19.5H30V24.5H24.5V30H19.5V24.5H14V19.5H19.5V14Z"
                      fill="#0284c7"
                    />
                  </svg>
                </div>
                <div className="whitespace-nowrap">
                  <span className="font-bold text-lg sm:text-xl text-white tracking-[0.14em] uppercase block leading-tight whitespace-nowrap">
                    VETCARE
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-sky-400 uppercase tracking-[0.18em] block whitespace-nowrap">
                    VETERINARY CLINIC
                  </span>
                </div>
              </a>

              {/* Desktop Navigation */}
              {currentUser && links.length > 0 && (
                <nav className="hidden md:flex items-center space-x-2 lg:space-x-5 min-w-0 overflow-x-auto py-1">
                  {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-1.5 py-2 text-xs sm:text-sm font-bold transition shrink-0 whitespace-nowrap ${
                          isActive
                            ? 'text-sky-400 font-extrabold border-b-2 border-sky-400'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <span className="whitespace-nowrap select-none">{link.label}</span>
                        {link.badge !== undefined && link.badge > 0 && (
                          <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-xs animate-pulse shrink-0">
                            {link.badge}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Right Side: Theme Toggle + User Profile / Logout */}
            <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง (Light Mode)' : 'เปลี่ยนเป็นโหมดมืด (Dark Mode)'}
                aria-label={theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
                className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer shrink-0 flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-sky-600" />
                )}
              </button>

              {currentUser && (
                <div className="hidden md:flex items-center gap-4 shrink-0 whitespace-nowrap">
                  <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800 shrink-0 whitespace-nowrap">
                    {/* Clickable User Profile Button to Open Edit Modal */}
                    <button
                      type="button"
                      onClick={openProfileModal}
                      title="คลิกเพื่อแก้ไขโปรไฟล์ รูปภาพ และข้อมูลติดต่อ"
                      className="flex items-center gap-3 px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 transition cursor-pointer group"
                    >
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white ring-2 ring-sky-500/30 shrink-0 shadow-xs">
                        {currentUser.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-full h-full object-cover"
                          />
                        ) : currentUser.role === 'owner' ? (
                          <User className="w-4 h-4" />
                        ) : currentUser.role === 'vet' ? (
                          <Stethoscope className="w-4 h-4" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                      </div>
                      <div className="text-left whitespace-nowrap">
                        <div className="text-xs font-bold text-white group-hover:text-sky-400 transition whitespace-nowrap max-w-[140px] truncate leading-tight flex items-center gap-1.5">
                          <span>{currentUser.name}</span>
                          <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-sky-400 shrink-0" />
                        </div>
                        <div className="text-[10px] text-sky-400 whitespace-nowrap leading-tight mt-0.5">
                          {currentUser.role === 'owner' ? 'เจ้าของสัตว์เลี้ยง' : currentUser.role === 'vet' ? 'สัตวแพทย์' : 'ผู้ดูแลระบบ'}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={handleLogout}
                      title="ออกจากระบบ"
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition cursor-pointer shrink-0"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile menu button */}
              {currentUser && (
                <div className="flex md:hidden items-center shrink-0">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 focus:outline-hidden"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && currentUser && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1 shadow-2xl">
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-800 rounded-xl mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : currentUser.role === 'owner' ? (
                    <User className="w-5 h-5" />
                  ) : currentUser.role === 'vet' ? (
                    <Stethoscope className="w-5 h-5" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-white truncate">{currentUser.name}</div>
                  <div className="text-xs text-sky-400 capitalize whitespace-nowrap">
                    {currentUser.role === 'owner' ? 'เจ้าของสัตว์เลี้ยง' : currentUser.role === 'vet' ? 'สัตวแพทย์' : 'ผู้ดูแลระบบ'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openProfileModal();
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>แก้ไขโปรไฟล์</span>
              </button>
            </div>

            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <span className="whitespace-nowrap">{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-rose-400 bg-rose-950/40 border border-rose-800/40 font-bold text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        )}
      </header>

      {/* ================= Edit Profile Modal ================= */}
      {isProfileModalOpen && currentUser && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsProfileModalOpen(false);
          }}
        >
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-800 my-8 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400">
                  USER PROFILE SETTINGS
                </div>
                <h3 className="font-bold text-white text-lg">
                  แก้ไขข้อมูลโปรไฟล์ส่วนตัว
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileSavedToast && (
              <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{profileSavedToast}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Preview & Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-800 border-2 border-sky-500/40 shrink-0 flex items-center justify-center">
                  {profileAvatar ? (
                    <img
                      src={profileAvatar}
                      alt={profileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div className="text-xs font-bold text-white">รูปภาพโปรไฟล์</div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-md font-bold text-xs cursor-pointer transition">
                      <Camera className="w-3.5 h-3.5" />
                      <span>อัปโหลดรูปภาพจากเครื่อง</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    {profileAvatar && (
                      <button
                        type="button"
                        onClick={() => setProfileAvatar('')}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs font-semibold border border-slate-700 cursor-pointer transition"
                      >
                        ลบรูป
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="หรือวางลิงก์รูปภาพ (URL) ที่นี่..."
                    value={profileAvatar.startsWith('data:') ? '' : profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-[11px] focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ชื่อ - นามสกุล *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="ระบุชื่อ - นามสกุล"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    เบอร์โทรศัพท์ติดต่อ *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="เช่น 0812345678"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    อีเมลติดต่อ *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ที่อยู่ติดต่อ
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-md border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  บันทึกข้อมูลโปรไฟล์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
