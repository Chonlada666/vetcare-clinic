'use client';

import React, { useState, Suspense } from 'react';
import { useClinic } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

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

  // Status state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (!auth) {
        throw new Error('ระบบยืนยันตัวตน Firebase ยังไม่พร้อมใช้งาน');
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const googleEmail = (fbUser.email || '').trim().toLowerCase();

      if (!googleEmail) {
        throw new Error('ไม่พบข้อมูลอีเมลจากบัญชี Google');
      }

      let existingUser = users.find(
        (u) => u.email && u.email.toLowerCase() === googleEmail
      );

      if (!existingUser) {
        existingUser = addUser({
          name: fbUser.displayName || 'ผู้ใช้งาน Google',
          email: googleEmail,
          phone: fbUser.phoneNumber || '',
          role: 'owner',
          avatar:
            fbUser.photoURL ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          address: '',
        });
      }

      login(existingUser);
      setSuccessMsg(`ลงทะเบียนและเข้าสู่ระบบด้วย Google สำเร็จ! ยินดีต้อนรับคุณ ${existingUser.name}`);
      setTimeout(() => {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push('/owner/dashboard');
        }
      }, 500);
    } catch (err: any) {
      console.warn('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setIsSubmitting(false);
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Authentication (OAuth Domain)');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('กรุณาเปิดใช้งาน Google Sign-in Provider ใน Firebase Console');
      } else {
        setErrorMsg(err.message || 'ไม่สามารถลงชื่อเข้าใช้ด้วย Google ได้ในขณะนี้');
      }
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-slate-950 font-black rounded-md shadow-lg shadow-sky-500/20 transition text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? 'กำลังลงทะเบียน...' : 'ยืนยันการสมัครสมาชิก'}</span>
          </button>

          {/* Divider */}
          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/80"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-3 text-slate-400 font-medium">หรือสมัครด้วย</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/90 active:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 font-bold rounded-xl transition flex items-center justify-center gap-3 text-xs sm:text-sm cursor-pointer shadow-xs disabled:opacity-50 select-none"
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>ลงชื่อเข้าใช้ด้วย Google</span>
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
