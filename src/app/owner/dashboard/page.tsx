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
    centerPetImage: '/banner-premier-puppy.jpg',
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
    bgImage: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1600&q=80',
    centerPetImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
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
    centerPetImage: '/banner-vaccine-sugarglider.jpg',
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
    centerPetImage: '/banner-dental-cat.jpg',
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
    centerPetImage: '/banner-derma-cat.jpg',
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
    centerPetImage: '/banner-exotic-rabbit.jpg',
  },
];

// Poster visual mappings for services (Matching exact veterinary medical procedure)
const SERVICE_POSTER_IMAGES: Record<string, { image: string; ribbon: string; ribbonColor: string }> = {
  srv_1: {
    // ตรวจรักษาอาการป่วย (ไม่แน่ใจอาการ) - Physical exam & illness diagnosis on exam table
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80',
    ribbon: 'ADVANCE BOOKING',
    ribbonColor: 'bg-sky-500 text-slate-950',
  },
  srv_2: {
    // ตรวจสุขภาพประจำปีทั่วไป - Annual wellness check with stethoscope
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80',
    ribbon: 'ยอดนิยม',
    ribbonColor: 'bg-blue-600 text-white',
  },
  srv_3: {
    // ฉีดวัคซีนรวมป้องกันโรค (สุนัข / แมว) - Core combination vaccination injection
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
    ribbon: 'HOT DEAL',
    ribbonColor: 'bg-indigo-500 text-white',
  },
  srv_4: {
    // ฉีดวัคซีนพิษสุนัขบ้า (Rabies Vaccine) - Veterinarian vaccinating a dog on exam table
    image: '/service-rabies-vaccine.jpg',
    ribbon: 'แนะนำ',
    ribbonColor: 'bg-emerald-500 text-slate-950',
  },
  srv_5: {
    // ป้อนยา / หยอดหลัง ถ่ายพยาธิ & เห็บหมัด - Topical spot-on drops & deworming
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
    ribbon: 'PREVENTIVE',
    ribbonColor: 'bg-teal-500 text-slate-950',
  },
  srv_6: {
    // ทำหมันสุนัข / แมว (เพศผู้) - Male castration / sterile surgical theater
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80',
    ribbon: 'SURGERY',
    ribbonColor: 'bg-sky-500 text-slate-950',
  },
  srv_7: {
    // ทำหมันสุนัข / แมว (เพศเมีย) - Female spaying abdominal surgical suite
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    ribbon: 'ADVANCED SURGERY',
    ribbonColor: 'bg-cyan-500 text-slate-950',
  },
  srv_8: {
    // ขูดหินปูนและขัดฟัน (Dental Scaling) - Ultrasonic scaler & dental oral hygiene
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
    ribbon: 'DENTAL CARE',
    ribbonColor: 'bg-amber-400 text-slate-950',
  },
  srv_9: {
    // ตรวจเลือดวิเคราะห์ผลแล็บ (CBC & Blood Chemistry) - Clinical laboratory blood test tubes
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
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
              {/* Full-Width Wide Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={slideItem.bgImage}
                  alt={slideItem.leftLogo.title}
                  className="w-full h-full object-cover object-center"
                />
                {/* Subtle right-side gradient so wide image is clear and right-side text is legible */}
                <div className="absolute inset-0 bg-gradient-to-l from-slate-950/85 via-slate-950/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              </div>

              {/* Right-Only Content Layout: Each sentence on its own single line */}
              <div className="relative z-10 w-full max-w-7xl mx-auto px-12 sm:px-20 lg:px-24 py-8 flex items-center justify-end">
                <div className="w-full max-w-4xl text-right space-y-2.5 z-10">
                  <div className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-sky-300 uppercase drop-shadow sm:whitespace-nowrap">
                    {slideItem.leftLogo.sub}
                  </div>

                  <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug drop-shadow-lg sm:whitespace-nowrap">
                    {slideItem.leftLogo.title}{' '}
                    <span className="text-sky-300">{slideItem.leftLogo.titleHighlight}</span>
                  </h2>

                  <div className="text-base sm:text-xl lg:text-2xl font-semibold text-white drop-shadow sm:whitespace-nowrap">
                    {slideItem.highlightPrice}{' '}
                    <span className="text-xs sm:text-base font-normal text-slate-200">
                      ({slideItem.priceSub})
                    </span>
                  </div>

                  <div className="space-y-1 text-xs sm:text-sm text-slate-100 drop-shadow">
                    <p className="sm:whitespace-nowrap">
                      {slideItem.systemText} <span className="font-semibold text-sky-300">{slideItem.systemBadge}</span>
                    </p>
                    <p className="sm:whitespace-nowrap">
                      {slideItem.ribbonText}
                    </p>
                  </div>

                  <div className="space-y-0.5 text-[11px] text-slate-300/90 font-light">
                    <p className="sm:whitespace-nowrap">{slideItem.disclaimer1}</p>
                    <p className="sm:whitespace-nowrap">{slideItem.disclaimer2}</p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => router.push(`/owner/booking?serviceId=${slideItem.serviceId}`)}
                      className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-slate-950 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-md shadow-lg transition cursor-pointer"
                    >
                      <span>จองคิวตรวจโปรแกรมนี้</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
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
              const posterData = SERVICE_POSTER_IMAGES[service.id] || {
                image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80',
                ribbon: 'แนะนำ',
                ribbonColor: 'bg-sky-500 text-slate-950',
              };

              return (
                <div
                  key={service.id}
                  onClick={() => router.push(`/owner/booking?serviceId=${service.id}`)}
                  className="group border border-slate-800 bg-slate-950 hover:border-slate-600 transition flex flex-col overflow-hidden cursor-pointer"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={posterData.image}
                      alt={service.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                    <div className="photo-overlay-bar absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <span className="text-xs text-slate-200">อัตราค่าบริการเริ่มต้น</span>
                      <span className="font-bold text-sky-300 text-sm">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-sky-400 transition">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-sky-400 transition">
                      <span>จองคิวรับบริการนี้</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
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
                  className="w-24 h-24 rounded-full object-cover border border-slate-700"
                />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base">{vet.name}</h4>
                  <p className="text-xs font-semibold text-sky-400">{vet.specialty}</p>
                  <p className="text-[11px] text-slate-400">ใบอนุญาตเลขที่ {vet.licenseNo}</p>
                </div>
                <div className="text-xs text-slate-300 pt-1">
                  วันออกตรวจ: <span className="text-white">{vet.availableDays.join(', ')}</span> ({vet.workingHours.start} - {vet.workingHours.end} น.)
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

