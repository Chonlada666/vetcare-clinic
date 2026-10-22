'use client';

import React, { useEffect } from 'react';
import { useClinic } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { HeartPulse, Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, isLoaded } = useClinic();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-sky-500/20 animate-pulse">
          <HeartPulse className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-white tracking-tight">VetCare Animal Clinic</h2>
          <div className="flex items-center justify-center gap-2 text-xs text-sky-400 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>กำลังนำทางเข้าสู่ระบบ...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
