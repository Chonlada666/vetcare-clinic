'use client';

import React, { useState, Suspense } from 'react';
import { useClinic } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  UserPlus,
  LogIn,
} from 'lucide-react';

function RegisterForm() {
  const { users, login, addUser } = useClinic();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  // Register form state
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [address, setAddress] = useState('');

  // Optional initial pet registration
  const [includePet, setIncludePet] = useState(false);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('สุนัข');
  const [petBreed, setPetBreed] = useState('');

  // Status state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addPet } = useClinic();

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('กรุณากรอกชื่อ - นามสกุล');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('กรุณากรอกอีเมล');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 10) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์ 9-10 หลัก (เช่น 0812345678)');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      setErrorMsg('อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบด้วยอีเมลนี้');
      return;
    }

    if (includePet && !petName.trim()) {
      setErrorMsg('กรุณาระบุชื่อสัตว์เลี้ยงที่ต้องการลงทะเบียนพร้อมบัญชี');
      return;
    }

    setIsSubmitting(true);

    try {
      const defaultAvatar =
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

      const newUser = addUser({
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password: regPassword,
        address: address.trim(),
        role: 'owner',
        avatar: defaultAvatar,
      });

      if (includePet && petName.trim()) {
        addPet({
          ownerId: newUser.id,
          name: petName.trim(),
          species: petSpecies,
          breed: petBreed.trim() || 'ไม่ระบุสายพันธุ์',
          gender: 'male',
          ageYears: 1,
          ageMonths: 0,
          weightKg: 3.5,
          photoUrl:
            petSpecies === 'แมว'
              ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80'
              : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
        });
      }

      setSuccessMsg('สมัครสมาชิกสำเร็จเรียบร้อย! กำลังนำคุณเข้าสู่หน้าหลัก...');
      login(newUser);

      setTimeout(() => {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push('/owner/dashboard');
        }
      }, 600);
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-6 sm:my-10 px-4 space-y-6 pb-12">
      {/* Brand Header */}
      <div className="text-center space-y-2.5">
        <div className="w-14 h-14 mx-auto flex items-center justify-center">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path
              d="M20 3L6 8.5V19.5C6 28.4 11.95 35.85 20 38C28.05 35.85 34 28.4 34 19.5V8.5L20 3Z"
              className="fill-slate-900 stroke-sky-500"
              strokeWidth="2.2"
            />
            <path
              d="M20 6.2L9 10.5V19.2C9 26.4 13.7 32.5 20 34.4C26.3 32.5 31 26.4 31 19.2V10.5L20 6.2Z"
              className="stroke-sky-400/30"
              strokeWidth="1"
            />
            <path
              d="M18 13H22V18H27V22H22V27H18V22H13V18H18V13Z"
              className="fill-sky-400"
            />
          </svg>
        </div>
        <div className="text-sky-400 font-bold text-[11px] uppercase tracking-[0.2em]">
          NEW MEMBER REGISTRATION
        </div>
        <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide uppercase">
          สมัครสมาชิกเจ้าของสัตว์เลี้ยง
        </h1>
        <p className="text-xs text-slate-400">
          ลงทะเบียนสร้างบัญชีเจ้าของสัตว์เลี้ยงเพื่อจองคิวนัดหมายและติดตามประวัติการรักษาออนไลน์
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-white">
        {/* Top Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800 mb-6">
          <a
            href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
            className="py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 text-slate-400 hover:text-white transition"
          >
            <LogIn className="w-4 h-4" />
            <span>เข้าสู่ระบบ</span>
          </a>

          <div className="py-2.5 rounded-lg bg-sky-500 text-slate-950 shadow-md font-black text-xs sm:text-sm flex items-center justify-center gap-1.5">
            <UserPlus className="w-4 h-4" />
            <span>สมัครสมาชิกใหม่</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">ชื่อ - นามสกุล *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="คุณใจดี มีสุข"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-medium text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-300">เบอร์โทรศัพท์ *</label>
                <span className={`text-[10px] font-bold ${phone.replace(/\D/g, '').length >= 9 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {phone.replace(/\D/g, '').length}/10 หลัก
                </span>
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  placeholder="0812345678"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(val);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-medium text-sm tracking-wider focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">อีเมลผู้ใช้งาน *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-medium text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">รหัสผ่าน (6 ตัวขึ้นไป) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-medium text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">ยืนยันรหัสผ่าน *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-medium text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">ที่อยู่ติดต่อ (ไม่บังคับ)</label>
            <textarea
              rows={2}
              placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-medium text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>

          {/* Optional Pet Registration Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includePet}
                onChange={(e) => setIncludePet(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-sky-400">
                ลงทะเบียนสัตว์เลี้ยงตัวแรกพร้อมการสมัครสมาชิก (ไม่บังคับ)
              </span>
            </label>

            {includePet && (
              <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">ชื่อสัตว์เลี้ยง *</label>
                    <input
                      type="text"
                      placeholder="เช่น ทองเอก, มอมแมม"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">ประเภทสัตว์เลี้ยง</label>
                    <select
                      value={petSpecies}
                      onChange={(e) => setPetSpecies(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="สุนัข">สุนัข (Dog)</option>
                      <option value="แมว">แมว (Cat)</option>
                      <option value="กระต่าย">กระต่าย (Rabbit)</option>
                      <option value="นก">นก (Bird)</option>
                      <option value="อื่นๆ">สัตว์พิเศษ (Exotic)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">สายพันธุ์ (ไม่บังคับ)</label>
                  <input
                    type="text"
                    placeholder="เช่น โกลเด้น รีทรีฟเวอร์, สก็อตติช โฟลด์"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-slate-950 font-black rounded-md shadow-lg shadow-sky-500/20 transition text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? 'กำลังลงทะเบียน...' : 'ยืนยันการสมัครสมาชิก'}</span>
          </button>

          <div className="text-center pt-1">
            <a
              href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
              className="text-xs text-slate-400 hover:text-sky-400 cursor-pointer underline"
            >
              มีบัญชีอยู่แล้ว? กลับไปหน้าเข้าสู่ระบบ
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-400 font-bold">กำลังโหลดหน้าสมัครสมาชิก...</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
