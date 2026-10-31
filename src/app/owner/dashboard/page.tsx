'use client';

import React, { useState, useEffect } from 'react';
import { useClinic } from '@/lib/store';
import { formatCurrency, formatThaiDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  PawPrint,
  CreditCard,
  PlusCircle,
  Clock,
  ArrowRight,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Flame,
  ShieldCheck,
  Award,
  HeartPulse,
  MessageCircleQuestion,
  User,
} from 'lucide-react';

// Hero Billboard Banner Slides
const BANNER_SLIDES = [
  {
    id: 1,
    leftLogo: {
      sub: 'VETCARE PREMIER 2026',
      title: 'โปรแกรมตรวจสุขภาพ',
      titleHighlight: 'สัตว์เลี้ยง 2026',
    },
    highlightPrice: 'เพิ่มเพียง 50 บาท*',
    priceSub: 'จากราคาตรวจปกติ',
    systemText: 'เพื่อตรวจวิเคราะห์เลือดในระบบ',
    systemBadge: 'EMR LAB',
    ribbonText: 'สมาชิก VetCare Club รับส่วนลด 10% ทุกบริการ / นัดหมายล่วงหน้าไม่ต้องรอคิว',
    disclaimer1: '*เพิ่ม 50 บาท จากราคาตรวจสุขภาพปกติทุกสายพันธุ์ | ผลตรวจบันทึกออนไลน์ทันที',
    disclaimer2: 'เงื่อนไขเป็นไปตามที่คลินิกกำหนด',
    serviceId: 'srv_1',
    bgImage: '/banner-premier-puppy.jpg',
  },
  {
    id: 2,
    leftLogo: {
      sub: 'SURGICAL & STERILIZATION',
      title: 'ศูนย์ผ่าตัดทำหมัน',
      titleHighlight: 'ปลอดเชื้อ 100%',
    },
    highlightPrice: 'ดมยาสลบปลอดภัย*',
    priceSub: 'ด้วยเครื่องดมยาสลบระบบปิด Isoflurane',
    systemText: 'พร้อมจอมอนิเตอร์สัญญาณชีพ',
    systemBadge: 'REAL-TIME ECG',
    ribbonText: 'ดูแลโดยทีมศัลยสัตวแพทย์และผู้ช่วยวิสัญญีสัตวแพทย์เฉพาะทางตลอดการผ่าตัด',
    disclaimer1: '*รวมตรวจเลือดประเมินความพร้อมก่อนวางยาสลบเพื่อความปลอดภัยสูงสุด',
    disclaimer2: 'เงื่อนไขเป็นไปตามที่คลินิกกำหนด',
    serviceId: 'srv_3',
    bgImage: '/banner-dog-cat.jpg',
  },
  {
    id: 3,
    leftLogo: {
      sub: 'VACCINATION & PREVENTIVE',
      title: 'แพ็กเกจวัคซีนรวม',
      titleHighlight: 'สุนัข แมว & Exotic',
    },
    highlightPrice: 'เริ่มต้น 350 บาท*',
    priceSub: 'จากราคาปกติของแต่ละโปรแกรม',
    systemText: 'พร้อมบันทึกสมุดวัคซีนดิจิทัลในระบบ',
    systemBadge: 'DIGITAL EMR',
    ribbonText: 'ครอบคลุมพิษสุนัขบ้า ไข้หัด ลิวคีเมีย หวัดแมว และป้องกันพยาธิหนอนหัวใจ',
    disclaimer1: '*บริการฉีดและตรวจสุขภาพโดยสัตวแพทย์มีใบอนุญาตถูกต้องทุกเคส',
    disclaimer2: 'เงื่อนไขเป็นไปตามที่คลินิกกำหนด',
    serviceId: 'srv_2',
    bgImage: '/banner-vaccine-sugarglider.jpg',
  },
  {
    id: 4,
    leftLogo: {
      sub: 'VETCARE DENTAL CARE',
      title: 'ศูนย์ทันตกรรมขูดหินปูน',
      titleHighlight: 'อัลตราโซนิก Scaler',
    },
    highlightPrice: 'ลดกลิ่นปาก 100%*',
    priceSub: 'ขจัดคราบหินปูนลึกถึงร่องเหงือก ป้องกันเหงือกอักเสบ',
    systemText: 'พร้อมขัดฟันและเคลือบฟลูออไรด์ในระบบ',
    systemBadge: 'ULTRA DENTAL',
    ribbonText: 'ตรวจสุขภาพช่องปากและฟันฟรีทุกเคสก่อนเริ่มวางแผนการรักษา',
    disclaimer1: '*ขูดหินปูนด้วยเครื่องสั่นอัลตราโซนิกประสิทธิภาพสูง ลดการระคายเคือง',
    disclaimer2: 'เงื่อนไขเป็นไปตามที่คลินิกกำหนด',
    serviceId: 'srv_4',
    bgImage: '/banner-dental-cat.jpg',
  },
  {
    id: 5,
    leftLogo: {
      sub: 'DERMATOLOGY & ALLERGY',
      title: 'คลินิกโรคผิวหนัง',
      titleHighlight: 'ตรวจส่องกล้อง Cell Test',
    },
    highlightPrice: 'ตรวจเชื้อรา & ไร*',
    priceSub: 'วินิจฉัยสาเหตุอาการคัน ขนร่วง และผื่นแดงอย่างตรงจุด',
    systemText: 'พร้อมทดสอบภูมิแพ้อาหารและสิ่งแวดล้อม',
    systemBadge: 'DERMA CARE',
    ribbonText: 'ให้คำปรึกษาปรับโภชนาการและแชมพูเวชภัณฑ์เฉพาะรายบุคคล',
    disclaimer1: '*ใช้กล้องจุลทรรศน์และชุดตรวจแล็บมาตรฐานความแม่นยำสูง',
    disclaimer2: 'เงื่อนไขเป็นไปตามที่คลินิกกำหนด',
    serviceId: 'srv_5',
    bgImage: '/banner-derma-cat.jpg',
  },
  {
    id: 6,
    leftLogo: {
      sub: 'EXOTIC PETS CLINIC',
      title: 'ศูนย์รักษาสัตว์พิเศษ',
      titleHighlight: 'กระต่าย นก ชูการ์ & เลื้อยคลาน',
    },
    highlightPrice: 'ดูแลโดยแพทย์เฉพาะทาง*',
    priceSub: 'สัตวแพทย์ผู้เชี่ยวชาญด้าน Exotic Pets โดยเฉพาะ',
    systemText: 'พร้อมตู้พักฟื้นควบคุมอุณหภูมิในระบบ',
    systemBadge: 'EXOTIC ICU',
    ribbonText: 'เครื่องมือตรวจและก๊าซสลบขนาดเฉพาะสำหรับสัตว์ตัวเล็ก ปลอดภัยสูงสุด',
    disclaimer1: '*มีตารางสัตวแพทย์เวร Exotic Pets ออกตรวจประจำทุกสัปดาห์',
    disclaimer2: 'เงื่อนไขเป็นไปตามที่คลินิกกำหนด',
    serviceId: 'srv_6',
    bgImage: '/banner-exotic-rabbit.jpg',
  },
];

// Service visuals: High-performance vector icons & styling (Zero slow external images)
const SERVICE_VISUALS: Record<string, { icon: React.ElementType; gradient: string; ribbon: string; ribbonColor: string }> = {
  srv_1: {
    icon: Stethoscope,
    gradient: 'from-sky-500/20 via-blue-500/10 to-transparent text-sky-400',
    ribbon: 'ADVANCE BOOKING',
    ribbonColor: 'bg-sky-500 text-slate-950',
  },
  srv_2: {
    icon: HeartPulse,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-400',
    ribbon: 'ยอดนิยม',
    ribbonColor: 'bg-emerald-500 text-slate-950',
  },
  srv_3: {
    icon: ShieldCheck,
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent text-indigo-400',
    ribbon: 'HOT DEAL',
    ribbonColor: 'bg-indigo-500 text-white',
  },
  srv_4: {
    icon: ShieldCheck,
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent text-amber-400',
    ribbon: 'แนะนำ',
    ribbonColor: 'bg-amber-500 text-slate-950',
  },
  srv_5: {
    icon: Sparkles,
    gradient: 'from-teal-500/20 via-cyan-500/10 to-transparent text-teal-400',
    ribbon: 'PREVENTIVE',
    ribbonColor: 'bg-teal-500 text-slate-950',
  },
  srv_6: {
    icon: Award,
    gradient: 'from-cyan-500/20 via-sky-500/10 to-transparent text-cyan-400',
    ribbon: 'SURGERY',
    ribbonColor: 'bg-cyan-500 text-slate-950',
  },
  srv_7: {
    icon: Award,
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent text-blue-400',
    ribbon: 'ADVANCED SURGERY',
    ribbonColor: 'bg-blue-500 text-white',
  },
  srv_8: {
    icon: Sparkles,
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent text-amber-300',
    ribbon: 'DENTAL CARE',
    ribbonColor: 'bg-amber-400 text-slate-950',
  },
  srv_9: {
    icon: HeartPulse,
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent text-rose-400',
    ribbon: 'LAB & EMR',
    ribbonColor: 'bg-rose-500 text-white',
  },
};

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { currentUser, pets, appointments, vets, bills, services } = useClinic();

  // Banner carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Quick Booking bar selections
  const [quickServiceId, setQuickServiceId] = useState<string>(services[0]?.id || 'srv_1');
  const [quickDate, setQuickDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Slide Navigation Functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  };

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
  };

  // Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch & Swipe Handling
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 40) {
      nextSlide();
    } else if (distance < -40) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Auto advance billboard slides every 5 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleQuickBook = () => {
    router.push(`/owner/booking?serviceId=${quickServiceId}&date=${quickDate}`);
  };

  const myPets = pets.filter((p) => p.ownerId === currentUser?.id);
  const myAppointments = appointments
    .filter((a) => a.ownerId === currentUser?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const nextAppointment = myAppointments.find((a) => a.status === 'pending' || a.status === 'confirmed');
  const myBills = bills.filter((b) => b.ownerId === currentUser?.id);
  const pendingBills = myBills.filter((b) => b.status === 'pending_upload' || b.status === 'verifying');

  return (
    <div className="w-full space-y-0 pb-16 bg-slate-900 text-slate-100 min-h-screen">
      {/* ================= HERO BILLBOARD BANNER (Cinematic Sliding Carousel) ================= */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="hero-banner relative w-full overflow-hidden bg-slate-950 text-white h-[480px] sm:h-[500px] lg:h-[530px] select-none"
      >
        {/* Slides Container */}
        {BANNER_SLIDES.map((slideItem, index) => {
          const isCurrent = index === currentSlide;
          const isPrev = index === (currentSlide - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length;

          return (
            <div
              key={slideItem.id}
              className={`absolute inset-0 w-full h-full flex items-center transition-all duration-700 ease-in-out ${
                isCurrent
                  ? 'opacity-100 translate-x-0 z-10 pointer-events-auto'
                  : isPrev
                  ? 'opacity-0 -translate-x-full z-0 pointer-events-none'
                  : 'opacity-0 translate-x-full z-0 pointer-events-none'
              }`}
            >
              {/* Full-Width Background Gradient with Ambient Glow */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/70">
                {slideItem.bgImage && (
                  <img
                    src={slideItem.bgImage}
                    alt={slideItem.leftLogo.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity"
                  />
                )}
                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              </div>

              {/* Balanced 2-Column Content Layout: Left Content + Right Feature Card */}
              <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-8 flex items-center justify-between gap-8">
                {/* Left Side: Headline & Offers (Left Aligned) */}
                <div className="w-full lg:max-w-2xl text-left space-y-3 z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                    <span>{slideItem.leftLogo.sub}</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                    {slideItem.leftLogo.title}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
                      {slideItem.leftLogo.titleHighlight}
                    </span>
                  </h2>

                  <div className="flex flex-wrap items-baseline gap-2 pt-1">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-400">
                      {slideItem.highlightPrice}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-300 font-medium">
                      ({slideItem.priceSub})
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-200">
                    <p className="flex items-center gap-2">
                      <span className="text-slate-300">{slideItem.systemText}</span>
                      <strong className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono text-xs">
                        {slideItem.systemBadge}
                      </strong>
                    </p>
                    <p className="text-slate-300 font-light text-xs sm:text-sm">
                      {slideItem.ribbonText}
                    </p>
                  </div>

                  <div className="space-y-0.5 text-[11px] text-slate-400 font-light pt-1">
                    <p>{slideItem.disclaimer1}</p>
                    <p>{slideItem.disclaimer2}</p>
                  </div>

                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => router.push(`/owner/booking?serviceId=${slideItem.serviceId}`)}
                      className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-sky-500/20 transition cursor-pointer"
                    >
                      <span>จองคิวตรวจโปรแกรมนี้</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/owner/services')}
                      className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl border border-slate-700 transition cursor-pointer"
                    >
                      <span>ดูอัตราค่าบริการทั้งหมด</span>
                    </button>
                  </div>
                </div>

                {/* Right Side: Feature Highlight Card (Fills right space so it is never blank) */}
                <div className="hidden lg:flex flex-col items-center justify-center shrink-0 w-80 p-6 rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-xl shadow-2xl text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/30">
                    <HeartPulse className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-sky-400 uppercase">
                      VETCARE CLINICAL CARE
                    </span>
                    <h3 className="text-base font-extrabold text-white">มาตรฐานสถานพยาบาลสัตว์</h3>
                  </div>
                  <div className="w-full space-y-2 text-left text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>เวชระเบียน EMR ดิจิทัล 100%</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>ตรวจโดยสัตวแพทย์มีใบอนุญาต</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>นัดหมายล่วงหน้า ไม่ต้องรอคิว</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Minimalist Left (<) Floating Navigation Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900/80 hover:bg-sky-500 text-white hover:text-slate-950 flex items-center justify-center backdrop-blur-md transition-all duration-200 z-30 cursor-pointer shadow-2xl border border-white/20 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
        </button>

        {/* Minimalist Right (>) Floating Navigation Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900/80 hover:bg-sky-500 text-white hover:text-slate-950 flex items-center justify-center backdrop-blur-md transition-all duration-200 z-30 cursor-pointer shadow-2xl border border-white/20 hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
        </button>

        {/* Slide Pagination Dots (6 Clickable Dots for 6 Slides) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30">
          {BANNER_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-3 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx
                  ? 'w-8 bg-sky-400 shadow-md shadow-sky-400/60 ring-2 ring-sky-300/40'
                  : 'w-3 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </section>



      {/* ================= MAIN OWNER CONTENT WRAPPER ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-10">
        {/* Clean Corporate-Style Welcome & Stats Section */}
        <section className="py-6 sm:py-10 text-center space-y-8 border-b border-slate-800/80">
          <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl sm:text-3xl font-light tracking-[0.18em] text-slate-200 uppercase leading-relaxed">
              VETCARE ANIMAL CLINIC
              <span className="block text-xl sm:text-2xl font-semibold tracking-normal text-white mt-1">
                สวัสดีคุณ {currentUser?.name || 'เจ้าของสัตว์เลี้ยง'}
              </span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              คลินิกรักษาสัตว์และดูแลสุขภาพสัตว์เลี้ยงครบวงจรด้วยมาตรฐานการแพทย์สมัยใหม่
              <br />
              ขณะนี้คุณมีสัตว์เลี้ยงในระบบ {myPets.length} ตัว และมีนัดหมายที่กำลังจะมาถึง {nextAppointment ? 1 : 0} รายการ
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <a
                href="/owner/booking"
                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm rounded-md transition cursor-pointer"
              >
                จองคิวนัดหมายใหม่
              </a>
              <a
                href="/owner/pets"
                className="px-6 py-2.5 bg-transparent hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm rounded-md border border-slate-700 transition cursor-pointer"
              >
                จัดการสัตว์เลี้ยง
              </a>
            </div>
          </div>

          {/* 3-Column Minimal Stats with Vertical Dividers */}
          <div className="max-w-4xl mx-auto pt-4 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-700">
            <a
              href="/owner/pets"
              className="py-4 sm:py-2 px-6 flex flex-col items-center justify-center space-y-1.5 hover:opacity-80 transition"
            >
              <span className="text-xs sm:text-sm font-bold text-sky-400 tracking-wide">
                สัตว์เลี้ยงของฉัน
              </span>
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {myPets.length}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300">
                ตัว
              </span>
            </a>

            <a
              href="/owner/appointments"
              className="py-4 sm:py-2 px-6 flex flex-col items-center justify-center space-y-1.5 hover:opacity-80 transition"
            >
              <span className="text-xs sm:text-sm font-bold text-sky-400 tracking-wide">
                ประวัตินัดหมายทั้งหมด
              </span>
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {myAppointments.length}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300">
                ครั้ง
              </span>
            </a>

            <a
              href="/owner/billing"
              className="py-4 sm:py-2 px-6 flex flex-col items-center justify-center space-y-1.5 hover:opacity-80 transition"
            >
              <span className="text-xs sm:text-sm font-bold text-sky-400 tracking-wide">
                ยอดรอชำระ / รอตรวจ
              </span>
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {pendingBills.length}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300">
                รายการ
              </span>
            </a>
          </div>
        </section>

        {/* ================= CORPORATE 2-COLUMN SPLIT + 3-TILE BANNER (AWC Style) ================= */}
        <section className="border-t border-slate-800/80">
          {/* Top 2-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 border-b border-slate-800">
            {/* Left Column: Appointment & Billing Status */}
            <div className="py-8 sm:py-10 lg:pr-12 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    APPOINTMENT &amp; BILLING STATUS
                  </div>
                  <div className="text-xs text-slate-500">
                    สถานะนัดหมายที่กำลังจะมาถึงและรายการชำระเงินล่าสุด
                  </div>
                </div>

                {nextAppointment ? (
                  (() => {
                    const pet = pets.find((p) => p.id === nextAppointment.petId);
                    const vet = vets.find((v) => v.id === nextAppointment.vetId);
                    const srv = services.find((s) => s.id === nextAppointment.serviceId);
                    return (
                      <div className="space-y-3 pt-1">
                        <div className="flex flex-wrap items-baseline gap-3">
                          <span className="text-3xl sm:text-4xl font-light text-white tracking-tight">
                            {formatThaiDate(nextAppointment.date)}
                          </span>
                          <span className="text-base sm:text-lg font-normal text-sky-400">
                            เวลา {nextAppointment.timeSlot} น.
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 space-y-1">
                          <div>
                            สัตว์เลี้ยง: <strong className="text-white">{pet?.name}</strong> ({pet?.species}) &bull; บริการ: <strong className="text-white">{srv?.name || 'ตรวจสุขภาพทั่วไป'}</strong>
                          </div>
                          <div className="text-slate-400">
                            สัตวแพทย์ผู้ตรวจ: {vet?.name || 'สัตวแพทย์ประจำคลินิก'} &bull; สถานะ: {nextAppointment.status === 'pending' ? 'รอเข้ารับบริการ' : 'ยืนยันคิวแล้ว'}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-light text-white tracking-tight">
                        ไม่มีนัดหมายในขณะนี้
                      </span>
                      <span className="text-sm text-slate-400">
                        (ประวัติทั้งหมด {myAppointments.length} ครั้ง)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400">
                      คุณสามารถเลือกวันและเวลาที่สะดวกเพื่อจองคิวนัดหมายตรวจสุขภาพล่วงหน้าได้ทันที
                    </p>
                  </div>
                )}

                {pendingBills.length > 0 && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-2">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      รายการรอชำระเงิน ({pendingBills.length} รายการ)
                    </div>
                    {pendingBills.map((b) => {
                      const p = pets.find((pet) => pet.id === b.petId);
                      return (
                        <div
                          key={b.id}
                          className="flex items-center justify-between text-xs sm:text-sm py-1.5 text-slate-300"
                        >
                          <span>
                            {p?.name || 'สัตว์เลี้ยง'} &mdash; ยอดค่าบริการ{' '}
                            <strong className="text-white font-semibold">{formatCurrency(b.totalAmount)}</strong>
                          </span>
                          <a
                            href="/owner/billing"
                            className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:underline"
                          >
                            <span>{b.status === 'pending_upload' ? 'ชำระเงิน / แนบสลิป' : 'รอตรวจสอบสลิป'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <a
                  href="/owner/booking"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-400 hover:text-sky-300 transition"
                >
                  <span>จองคิวนัดหมายตรวจสุขภาพ</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="/owner/appointments"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition"
                >
                  <span>ดูประวัตินัดหมาย ({myAppointments.length})</span>
                  <ChevronRight className="w-4 h-4 text-sky-400" />
                </a>
              </div>
            </div>

            {/* Right Column: Clean Row List of My Pets */}
            <div className="py-8 sm:py-10 lg:pl-12 flex flex-col justify-between space-y-8">
              <div className="divide-y divide-slate-800/80">
                {myPets.length > 0 ? (
                  myPets.map((pet) => (
                    <a
                      key={pet.id}
                      href="/owner/pets"
                      className="py-4 first:pt-0 flex items-center justify-between gap-4 group hover:opacity-90 transition"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm sm:text-base font-bold text-white group-hover:text-sky-400 transition">
                          {pet.name}{' '}
                          <span className="text-xs font-normal text-slate-400">
                            ({pet.species} &bull; {pet.breed})
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          อายุ {pet.ageYears} ปี {pet.ageMonths} เดือน &bull; น้ำหนัก {pet.weightKg} กก.
                        </div>
                      </div>
                      <span className="px-3 py-1.5 rounded-md border border-slate-700 group-hover:border-sky-400 inline-flex items-center gap-1 text-slate-300 group-hover:text-sky-400 text-xs font-semibold transition shrink-0">
                        <span>ดูข้อมูล</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </a>
                  ))
                ) : (
                  <div className="py-4 text-xs sm:text-sm text-slate-400">
                    ยังไม่มีข้อมูลสัตว์เลี้ยงที่ลงทะเบียนในระบบ
                  </div>
                )}
              </div>

              <div className="pt-2">
                <a
                  href="/owner/pets"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-400 hover:text-sky-300 transition"
                >
                  <span>จัดการและลงทะเบียนสัตว์เลี้ยง</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= RECOMMENDED SERVICES ================= */}
        <section id="services" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-sky-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">
                MEDICAL SERVICES
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                บริการและแพ็กเกจตรวจรักษา
              </h2>
            </div>

            <a
              href="/owner/services"
              className="text-xs sm:text-sm font-bold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
            >
              <span>ดูรายการบริการทั้งหมด</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => {
              const visual = SERVICE_VISUALS[service.id] || {
                icon: Stethoscope,
                gradient: 'from-sky-500/20 via-blue-500/10 to-transparent text-sky-400',
                ribbon: 'แนะนำ',
                ribbonColor: 'bg-sky-500 text-slate-950',
              };
              const VisualIcon = visual.icon;

              return (
                <button
                  type="button"
                  key={service.id}
                  onClick={() => router.push(`/owner/booking?serviceId=${service.id}`)}
                  className="text-left w-full group rounded-2xl border border-slate-800 bg-slate-950 hover:border-sky-500/50 hover:bg-slate-900 transition flex flex-col justify-between overflow-hidden cursor-pointer shadow-md p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${visual.gradient} border border-slate-800 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition`}>
                      <VisualIcon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${visual.ribbonColor}`}>
                      {visual.ribbon}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">เริ่มต้น</span>
                      <strong className="text-sky-300 font-extrabold text-base">
                        {formatCurrency(service.price)}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1 font-bold text-sky-400 group-hover:translate-x-1 transition">
                      <span>จองคิวรับบริการนี้</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= VETERINARIANS SHOWCASE ================= */}
        <section id="vets" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-sky-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">
                OUR VETERINARIANS
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                ทีมสัตวแพทย์ประจำคลินิก
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              ออกตรวจตามตารางเวรประจำวัน
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 border-b border-slate-800 pb-8">
            {vets.map((vet) => (
              <div
                key={vet.id}
                className="py-6 sm:py-2 px-6 flex flex-col items-center text-center space-y-3"
              >
                <img
                  src={vet.avatar}
                  alt={vet.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = '/images/vets/vet_panwad.jpg';
                  }}
                  className="w-24 h-24 rounded-full object-cover border border-slate-700"
                />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base">{vet.name}</h4>
                  <p className="text-[11px] text-slate-400">ใบอนุญาตเลขที่ {vet.licenseNo}</p>
                </div>
                <div className="text-xs text-slate-300 pt-1 w-full space-y-1.5">
                  <span className="text-sky-400 font-bold text-[11px] block">ตารางเวรออกตรวจ:</span>
                  <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                    {vet.availableDays.map((d, idx) => (
                      <span key={idx} className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-slate-200">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

