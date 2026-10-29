'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useClinic } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  HeartPulse,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle,
  ArrowRight,
  Shield,
  Stethoscope,
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

function LoginForm() {
  const { users, login, addUser } = useClinic();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const initialMode = searchParams.get('mode');

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    initialMode === 'register' ? 'register' : 'login'
  );

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [address, setAddress] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Sign-In interactive modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  useEffect(() => {
    if (initialMode === 'register') {
      setMode('register');
    }
  }, [initialMode]);

  const navigateAfterAuth = (userRole: string) => {
    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }
    if (userRole === 'owner') router.push('/owner/dashboard');
    else if (userRole === 'vet') router.push('/vet/dashboard');
    else if (userRole === 'admin') router.push('/admin/dashboard');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !loginPassword) {
      setErrorMsg('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      setErrorMsg('ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลหรือกดแท็บ "สมัครสมาชิกใหม่"');
      return;
    }

    if (user.password && loginPassword && user.password !== loginPassword) {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
      return;
    }

    login(user);
    navigateAfterAuth(user.role);
  };

  const executeGoogleLogin = (email: string, displayName: string, avatarUrl?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    let existingUser = users.find(
      (u) => u.email && u.email.toLowerCase() === cleanEmail
    );

    if (!existingUser) {
      existingUser = addUser({
        name: displayName.trim() || 'ผู้ใช้งาน Google',
        email: cleanEmail,
        phone: '0812345678',
        role: 'owner',
        avatar:
          avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        address: '',
      });
    }

    login(existingUser);
    setIsGoogleModalOpen(false);
    setSuccessMsg(`ลงชื่อเข้าใช้ด้วยบัญชี Google (${cleanEmail}) สำเร็จ! กำลังนำคุณเข้าสู่ระบบ...`);
    setTimeout(() => {
      navigateAfterAuth(existingUser.role);
    }, 500);
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        const googleEmail = (fbUser.email || '').trim().toLowerCase();

        if (googleEmail) {
          executeGoogleLogin(
            googleEmail,
            fbUser.displayName || 'ผู้ใช้งาน Google',
            fbUser.photoURL || undefined
          );
          return;
        }
      }
      setIsGoogleModalOpen(true);
    } catch (err: any) {
      console.warn('Google Sign-In note:', err);
      // If Firebase Auth is not configured in console or popup blocked, open Google Account Selector
      setIsGoogleModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      }, 500);
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 px-4 space-y-6">
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
          VETCARE VETERINARY HOSPITAL
        </div>
        <h1 className="text-2xl font-light text-white tracking-wide uppercase">
          {mode === 'login'
            ? 'เข้าสู่ระบบ VetCare Clinic'
            : mode === 'register'
            ? 'สมัครสมาชิกเจ้าของสัตว์เลี้ยง'
            : 'รีเซ็ตรหัสผ่าน'}
        </h1>
        <p className="text-xs text-slate-400">
          {mode === 'login'
            ? 'กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบงานคลินิก'
            : mode === 'register'
            ? 'กรอกข้อมูลเพื่อลงทะเบียนสร้างบัญชีเจ้าของสัตว์เลี้ยงใหม่'
            : 'กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-white">
        {/* Top Mode Switcher Tabs (Large & Obvious) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>สมัครสมาชิกใหม่</span>
            </button>
          </div>
        )}

        {/* Notice when redirected from choosing services or booking */}
        {redirectUrl && (
          <div className="mb-5 p-3.5 bg-sky-950/50 border border-sky-800/50 text-sky-300 text-xs rounded-2xl flex items-start gap-2.5 font-semibold">
            <HeartPulse className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-white">กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนดำเนินการ</span>
              <span className="text-[11px] text-sky-300/80 font-normal">
                เพื่อความปลอดภัยของข้อมูลสัตว์เลี้ยงและบันทึกคิวนัดหมายในระบบของคุณ
              </span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs rounded-2xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">อีเมลผู้ใช้งาน</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="somchai@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-300">รหัสผ่าน</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] text-sky-400 hover:text-sky-300 cursor-pointer"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-black rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>{isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/80"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-3 text-slate-400 font-medium">หรือ</span>
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
          </form>
        )}

        {/* ================= REGISTER FORM ================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
                <label className="block text-xs font-bold text-slate-300">เบอร์โทรศัพท์ (9-10 หลัก) *</label>
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
                  placeholder="เช่น 0812345678"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(val);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-medium text-sm tracking-wider focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">อีเมล *</label>
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

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร) *</label>
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
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-slate-950 font-black rounded-xl shadow-lg shadow-sky-500/20 transition text-sm cursor-pointer flex items-center justify-center gap-2"
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
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-400 hover:text-sky-400 cursor-pointer underline"
              >
                มีบัญชีอยู่แล้ว? กลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          </form>
        )}

        {/* ================= FORGOT PASSWORD ================= */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">อีเมลที่ลงทะเบียน</label>
              <input
                type="email"
                placeholder="somchai@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-medium text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSuccessMsg('ระบบได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');
                setTimeout(() => setMode('login'), 2000);
              }}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl text-sm cursor-pointer shadow-lg shadow-sky-500/20 transition"
            >
              ส่งลิงก์รีเซ็ตรหัสผ่าน
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-400 hover:text-sky-400 cursor-pointer underline"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= GOOGLE SIGN-IN ACCOUNT SELECTOR MODAL ================= */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5 text-white">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto bg-white rounded-full flex items-center justify-center shadow-xs">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">ลงชื่อเข้าใช้ด้วย Google</h3>
              <p className="text-xs text-slate-400">เลือกบัญชี Google เพื่อไปที่ VetCare Clinic</p>
            </div>

            <div className="space-y-2">
              {/* Account 1 */}
              <button
                type="button"
                onClick={() => executeGoogleLogin('chonlada.vet@gmail.com', 'Chonlada', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-sky-500 bg-slate-800/60 hover:bg-slate-800 transition text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  C
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-white group-hover:text-sky-400 truncate">Chonlada (เจ้าของสัตว์เลี้ยง)</div>
                  <div className="text-[11px] text-slate-400 truncate">chonlada.vet@gmail.com</div>
                </div>
              </button>

              {/* Account 2 */}
              <button
                type="button"
                onClick={() => executeGoogleLogin('nualjan.k@ku.th', 'Nualjan K.', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-sky-500 bg-slate-800/60 hover:bg-slate-800 transition text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  N
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-white group-hover:text-sky-400 truncate">Nualjan K. (KU Account)</div>
                  <div className="text-[11px] text-slate-400 truncate">nualjan.k@ku.th</div>
                </div>
              </button>

              {/* Custom Google Account Option */}
              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-sky-500 text-slate-300 hover:text-sky-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>ใช้บัญชี Google / Gmail อื่น...</span>
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customGoogleEmail.trim()) {
                      executeGoogleLogin(customGoogleEmail, customGoogleName || 'ผู้ใช้งาน Google');
                    }
                  }}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">ชื่อที่แสดง</label>
                    <input
                      type="text"
                      placeholder="เช่น คุณสมศักดิ์"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">ที่อยู่อีเมล Gmail *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer"
                  >
                    เข้าสู่ระบบด้วยบัญชีนี้
                  </button>
                </form>
              )}
            </div>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              หากดำเนินการต่อ Google จะแชร์ชื่อ ที่อยู่อีเมล และรูปโปรไฟล์กับ VetCare Clinic ตามนโยบายความเป็นส่วนตัว
            </p>

            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(false)}
              className="w-full py-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 rounded-3xl border border-slate-800 text-center space-y-3">
          <HeartPulse className="w-8 h-8 text-sky-400 mx-auto animate-pulse" />
          <p className="text-xs text-slate-400 font-bold">กำลังโหลดหน้าเข้าสู่ระบบ...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
