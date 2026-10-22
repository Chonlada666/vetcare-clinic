'use client';

import React from 'react';
import { useClinic } from '@/lib/store';
import { RefreshCw, UserCheck, Stethoscope, ShieldAlert, Sparkles } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function DemoRoleBar() {
  const { currentUser, quickSwitchUser, resetToMockData, isFirestoreConnected } = useClinic();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (role: 'owner' | 'vet' | 'admin', defaultRoute: string) => {
    quickSwitchUser(role);
    if (!pathname.startsWith(`/${role}`)) {
      router.push(defaultRoute);
    }
  };

  const handleReset = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลจำลองทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      resetToMockData();
      router.push('/');
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 sticky top-0 z-50 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {/* Demo Mode Badge */}
        <span className="bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded border border-amber-500/30 text-[11px] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>DEMO MODE</span>
        </span>

        {/* Real-Time Database Badge */}
        <span
          className={`font-semibold px-2 py-0.5 rounded border text-[11px] flex items-center gap-1.5 ${
            isFirestoreConnected
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isFirestoreConnected ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'
            }`}
          ></span>
          <span>{isFirestoreConnected ? 'Cloud Real-Time' : 'Local Mode'}</span>
        </span>

        {/* Current User Display */}
        <span className="text-slate-300 hidden sm:inline">
          ผู้ใช้งานปัจจุบัน: <strong className="text-white">{currentUser?.name || 'ไม่ได้เข้าสู่ระบบ'}</strong> (
          <span className="text-sky-400 font-medium capitalize">
            {currentUser?.role === 'owner'
              ? 'เจ้าของสัตว์เลี้ยง'
              : currentUser?.role === 'vet'
              ? 'สัตวแพทย์'
              : 'ผู้ดูแลระบบ'}
          </span>
          )
        </span>
      </div>

      {/* Quick Role Switchers */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 hidden md:inline font-medium">สลับบทบาท Demo:</span>
        <button
          onClick={() => handleSwitch('owner', '/owner/dashboard')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
            currentUser?.role === 'owner'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>เจ้าของสัตว์เลี้ยง</span>
        </button>

        <button
          onClick={() => handleSwitch('vet', '/vet/dashboard')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
            currentUser?.role === 'vet'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>สัตวแพทย์</span>
        </button>

        <button
          onClick={() => handleSwitch('admin', '/admin/dashboard')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
            currentUser?.role === 'admin'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>ผู้ดูแลระบบ</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-700 mx-1 hidden sm:block"></div>

        <button
          onClick={handleReset}
          title="รีเซ็ตข้อมูล Mock ทั้งหมด"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800/40 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">รีเซ็ตข้อมูล</span>
        </button>
      </div>
    </div>
  );
}
