'use client';

import React, { useState, useEffect } from 'react';
import { useClinic } from '@/lib/store';
import {
  User,
  LogOut,
  Menu,
  X,
  PawPrint,
  Stethoscope,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface NavLink {
  href: string;
  label: string;
  badge?: number;
}

export function Navbar() {
  const { currentUser, logout, bills } = useClinic();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const pathname = usePathname();
  const router = useRouter();

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
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-md w-full">
      {/* Full Width Layout - Stretches from edge to edge */}
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-6">
          {/* Left Side: Brand Logo followed by navigation links */}
          <div className="flex items-center gap-6 sm:gap-8 lg:gap-10 min-w-0 flex-1">
            {/* Brand Logo - Formal Veterinary Hospital Crest */}
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
                  VETERINARY HOSPITAL
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer shrink-0"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {currentUser ? (
              <div className="hidden md:flex items-center gap-4 shrink-0 whitespace-nowrap">
                <div className="flex items-center gap-3 pl-3 border-l border-slate-800 shrink-0 whitespace-nowrap">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white ring-2 ring-sky-500/30 shrink-0 shadow-xs">
                    {currentUser.role === 'owner' ? (
                      <User className="w-4 h-4" />
                    ) : currentUser.role === 'vet' ? (
                      <Stethoscope className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-left whitespace-nowrap">
                    <div className="text-xs font-bold text-white whitespace-nowrap max-w-[140px] truncate leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-sky-400 whitespace-nowrap leading-tight mt-0.5">
                      {currentUser.role === 'owner' ? 'เจ้าของสัตว์เลี้ยง' : currentUser.role === 'vet' ? 'สัตวแพทย์' : 'ผู้ดูแลระบบ'}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="ออกจากระบบ"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition cursor-pointer shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5 pl-2 border-l border-slate-800 shrink-0 whitespace-nowrap">
                <a
                  href="/login"
                  className="px-3.5 py-1.5 rounded-md border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200 text-xs font-bold transition whitespace-nowrap"
                >
                  เข้าสู่ระบบ
                </a>
                <a
                  href="/register"
                  className="px-3.5 py-1.5 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition whitespace-nowrap shadow-xs"
                >
                  สมัครสมาชิก
                </a>
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
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              {currentUser.role === 'owner' ? (
                <User className="w-5 h-5" />
              ) : currentUser.role === 'vet' ? (
                <Stethoscope className="w-5 h-5" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="font-semibold text-sm text-white whitespace-nowrap">{currentUser.name}</div>
              <div className="text-xs text-sky-400 capitalize whitespace-nowrap">
                {currentUser.role === 'owner' ? 'เจ้าของสัตว์เลี้ยง' : currentUser.role === 'vet' ? 'สัตวแพทย์' : 'ผู้ดูแลระบบ'}
              </div>
            </div>
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
  );
}
