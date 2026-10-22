'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminVetsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users');
  }, [router]);

  return (
    <div className="text-center py-20 text-slate-500 text-sm font-semibold">
      กำลังนำท่านไปยังหน้าจัดการผู้ใช้งาน & สัตวแพทย์...
    </div>
  );
}
