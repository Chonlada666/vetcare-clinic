import type { Metadata } from 'next';
import './globals.css';
import { ClinicProvider } from '@/lib/store';
import { Navbar } from '@/components/common/Navbar';
import { Phone, Clock, MapPin, ShieldCheck, HeartPulse } from 'lucide-react';

export const metadata: Metadata = {
  title: 'VetCare Clinic - ระบบจัดการคลินิกรักษาสัตว์ครบวงจร',
  description: 'ระบบบริหารจัดการคลินิกรักษาสัตว์ครบวงจร จองคิวนัดหมาย ตรวจรักษา เวชระเบียน EMR ดิจิทัล และชำระเงินออนไลน์',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link
          rel="preload"
          href="/fonts/sukhumvit-set/SukhumvitSet-Text.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/sukhumvit-set/SukhumvitSet-SemiBold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-900 text-slate-100 selection:bg-sky-500 selection:text-white">
        <ClinicProvider>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          
          {/* Corporate Footer */}
          <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-10 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Col 1: Brand Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white font-black text-lg">
                    <HeartPulse className="w-5 h-5 text-sky-400" />
                    <span>VetCare Animal Clinic</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    คลินิกและศูนย์ตรวจรักษาสัตว์เลี้ยงครบวงจร พร้อมระบบเวชระเบียน EMR ดิจิทัลและการจองคิวออนไลน์ 24 ชม.
                  </p>
                </div>

                {/* Col 2: Emergency & Contact */}
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">ติดต่อและฉุกเฉิน</h4>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>สายด่วนฉุกเฉิน: 02-999-8888</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>เวลาทำการ: 08:30 - 20:30 น. (ทุกวัน)</span>
                  </div>
                </div>

                {/* Col 3: Quick Links */}
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">บริการและระบบ</h4>
                  <ul className="space-y-1.5 text-slate-400">
                    <li><a href="/owner/booking" className="hover:text-white transition">จองคิวนัดหมายออนไลน์</a></li>
                    <li><a href="/owner/services" className="hover:text-white transition">รายการและอัตราค่ารักษา</a></li>
                    <li><a href="/login" className="hover:text-white transition">เข้าสู่ระบบเวชระเบียน EMR</a></li>
                  </ul>
                </div>

                {/* Col 4: Quality & Trust */}
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">มาตรฐานการรับรอง</h4>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>ใบอนุญาตสถานพยาบาลสัตว์ถูกต้องตามกฎหมาย</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    ตรวจรักษาโดยทีมสัตวแพทย์ปริญญาผู้มีใบประกอบวิชาชีพการสัตวแพทย์ชั้นหนึ่ง
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
                <p>VetCare Animal Clinic Management Portal &copy; 2026. All rights reserved.</p>
                <p>
                  ระบบบริหารจัดการคลินิกรักษาสัตว์ &bull; เวอร์ชัน{' '}
                  <code className="font-mono text-slate-400">{process.env.NEXT_PUBLIC_APP_VERSION || 'dev'}</code>
                </p>
              </div>
            </div>
          </footer>
        </ClinicProvider>
      </body>
    </html>
  );
}
