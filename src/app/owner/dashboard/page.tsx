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
    bgImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1600&q=80',
    centerPetImage: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
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
    bgImage: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1600&q=80',
    centerPetImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
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
    bgImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1600&q=80',
    centerPetImage: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
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
    bgImage: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1600&q=80',
    centerPetImage: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=800&q=80',
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
    bgImage: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=1600&q=80',
    centerPetImage: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80',
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
    // ฉีดวัคซีนพิษสุนัขบ้า (Rabies Vaccine) - Rabies vaccine vial & injection syringe
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
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
        className="relative w-full overflow-hidden bg-slate-950 text-white h-[480px] sm:h-[500px] lg:h-[530px] select-none"
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

              {/* Right-Only Content Layout */}
              <div className="relative z-10 w-full max-w-7xl mx-auto px-12 sm:px-20 lg:px-24 py-8 flex items-center justify-end">
                <div className="w-full max-w-lg text-right space-y-3 z-10">
                  <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-sky-300 uppercase block drop-shadow">
                    {slideItem.leftLogo.sub}
                  </span>

                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">
                    {slideItem.leftLogo.title}{' '}
                    <span className="text-sky-300">{slideItem.leftLogo.titleHighlight}</span>
                  </h2>

                  <div className="text-lg sm:text-2xl font-semibold text-white drop-shadow">
                    {slideItem.highlightPrice}{' '}
                    <span className="text-sm sm:text-base font-normal text-slate-200">
                      ({slideItem.priceSub})
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed drop-shadow">
                    {slideItem.systemText} {slideItem.systemBadge} &bull; {slideItem.ribbonText}
                  </p>

                  <p className="text-[11px] text-slate-300/90 font-light">
                    {slideItem.disclaimer1}
                  </p>

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

        {/* Main Grid: Upcoming Appointment & My Pets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Next Appointment & Pending Bills */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Upcoming Appointment */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-400" />
                  <span>นัดหมายที่กำลังจะมาถึง</span>
                </h2>
                <a href="/owner/appointments" className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                  <span>ดูทั้งหมด ({myAppointments.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {nextAppointment ? (
                (() => {
                  const pet = pets.find((p) => p.id === nextAppointment.petId);
                  const vet = vets.find((v) => v.id === nextAppointment.vetId);
                  const srv = services.find((s) => s.id === nextAppointment.serviceId);
                  return (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={pet?.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80'}
                            alt={pet?.name}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-500/50 shadow-md"
                          />
                          <div>
                            <div className="font-extrabold text-white text-lg">{pet?.name} <span className="text-xs font-semibold text-slate-400">({pet?.species})</span></div>
                            <div className="text-xs font-bold text-sky-400">{srv?.name || 'ตรวจสุขภาพทั่วไป'}</div>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-sky-500 text-slate-950 shadow-xs self-start sm:self-auto">
                          {nextAppointment.status === 'pending' ? 'รอเข้ารับบริการ' : 'ยืนยันคิวแล้ว'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                          <span>วันที่นัด: <strong className="text-white">{formatThaiDate(nextAppointment.date)}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                          <span>เวลา: <strong className="text-white">{nextAppointment.timeSlot} น.</strong></span>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <Stethoscope className="w-4 h-4 text-sky-400 shrink-0" />
                          <span>แพทย์ผู้ตรวจ: <strong className="text-white">{vet?.name || 'สัตวแพทย์ประจำคลินิก'}</strong></span>
                        </div>
                        <div className="sm:col-span-2 text-slate-300 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                          <span className="font-bold text-sky-400">อาการเบื้องต้นที่ระบุ: </span>
                          {nextAppointment.initialSymptoms}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <a
                          href="/owner/appointments"
                          className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer border border-slate-700"
                        >
                          จัดการนัดหมาย / เลื่อนนัด
                        </a>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-10 bg-slate-950 rounded-2xl border border-dashed border-slate-800">
                  <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">ไม่มีนัดหมายที่รอรับบริการในขณะนี้</p>
                  <a
                    href="/owner/booking"
                    className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 bg-slate-900 px-4 py-2 rounded-full border border-sky-800 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> <span>จองคิวนัดหมายตรวจสุขภาพ</span>
                  </a>
                </div>
              )}
            </div>

            {/* Pending Bills Alert */}
            {pendingBills.length > 0 && (
              <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>มีรายการรอชำระเงินหรือตรวจสอบสลิป ({pendingBills.length} รายการ)</span>
                  </div>
                  <a href="/owner/billing" className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-1">
                    <span>ไปหน้าชำระเงิน</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="space-y-2">
                  {pendingBills.map((b) => {
                    const p = pets.find((pet) => pet.id === b.petId);
                    return (
                      <div key={b.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{p?.name || 'สัตว์เลี้ยง'}</span>
                          <span className="text-slate-400 ml-2">ยอดค่าบริการ: <strong className="text-amber-400">{formatCurrency(b.totalAmount)}</strong></span>
                        </div>
                        <span className={`px-3 py-1 rounded-full font-bold text-[11px] ${b.status === 'pending_upload' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'}`}>
                          {b.status === 'pending_upload' ? 'รอแนบสลิปโอนเงิน' : 'กำลังรอตรวจสอบสลิป'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (1 Col): My Pets List */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-sky-400" />
                  <span>สัตว์เลี้ยงของฉัน</span>
                </h2>
                <a href="/owner/pets" className="text-xs font-bold text-sky-400 hover:underline">
                  จัดการทั้งหมด
                </a>
              </div>

              <div className="space-y-3">
                {myPets.map((pet) => (
                  <div
                    key={pet.id}
                    className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950 hover:border-sky-500 transition flex items-center gap-3.5 group"
                  >
                    <img
                      src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80'}
                      alt={pet.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-800 group-hover:scale-105 transition shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-white text-sm truncate">{pet.name}</div>
                      <div className="text-xs text-slate-400 font-medium truncate">
                        {pet.species} &bull; {pet.breed}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        อายุ {pet.ageYears} ปี {pet.ageMonths} เดือน &bull; {pet.weightKg} กก.
                      </div>
                    </div>
                  </div>
                ))}

                <a
                  href="/owner/pets"
                  className="block w-full py-3 text-center bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 rounded-2xl text-xs font-bold transition border border-slate-700 cursor-pointer shadow-xs"
                >
                  + ลงทะเบียนสัตว์เลี้ยงใหม่
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RECOMMENDED SERVICES (Cinema Poster Carousel Style) ================= */}
        <section id="services" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-sky-400 font-extrabold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-sky-400" />
                <span>RECOMMENDED SERVICES</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                บริการและแพ็กเกจตรวจรักษาแนะนำ
              </h2>
            </div>

            <a
              href="/owner/services"
              className="text-xs sm:text-sm font-bold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
            >
              ดูรายการบริการทั้งหมด <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Poster Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {services.map((service) => {
              const posterData = SERVICE_POSTER_IMAGES[service.id] || {
                image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80',
                ribbon: 'แนะนำ',
                ribbonColor: 'bg-sky-500 text-slate-950',
              };

              return (
                <div
                  key={service.id}
                  className="group bg-slate-900 rounded-2xl border border-slate-800 shadow-lg hover:shadow-2xl hover:border-sky-500 transition-all flex flex-col overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Poster Frame with Ribbon Badge */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
                    <img
                      src={posterData.image}
                      alt={service.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition" />

                    {/* Corner Ribbon Tag */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider ${posterData.ribbonColor}`}>
                        {posterData.ribbon}
                      </span>
                    </div>

                    {/* Price Tag Overlay on Poster Bottom */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px]">
                      <span className="font-bold text-slate-300">เริ่มต้น</span>
                      <span className="font-black text-sky-400 text-xs">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  </div>

                  {/* Card Info & Quick Book */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-sky-400 transition">
                        {service.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push(`/owner/booking?serviceId=${service.id}`)}
                      className="block w-full text-center py-2 bg-slate-800 group-hover:bg-sky-500 text-slate-200 group-hover:text-slate-950 rounded-xl text-xs font-black transition shadow-xs cursor-pointer"
                    >
                      จองคิวตรวจ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= CLINIC STANDARDS & TECHNOLOGY PILLARS ================= */}
        <section className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-sky-400 text-xs font-bold tracking-wider uppercase">
              CLINIC STANDARDS & DIGITAL SYSTEM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              มาตรฐานการตรวจรักษาระดับโรงพยาบาลสัตว์
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              รวมเทคโนโลยีดิจิทัล EMR และระบบคลาวด์ เพื่อความโปร่งใสและปลอดภัยสูงสุดของสัตว์เลี้ยง
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3 hover:border-sky-500 transition">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">ระบบจองคิวออนไลน์ 24 ชม.</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                เลือกบริการ วัน และเวลาที่สะดวก จัดสรรคิวตรวจอย่างมีระบบ ไม่ต้องนั่งรอคิวนาน
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3 hover:border-sky-500 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">เวชระเบียน EMR คลาวด์</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                บันทึกประวัติ อาการ ผลวินิจฉัย และใบสั่งยา ตรวจสอบประวัติย้อนหลังได้ตลอดเวลา
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3 hover:border-sky-500 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">ทีมแพทย์เฉพาะทางมีใบอนุญาต</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                สัตวแพทย์ทุกท่านมีใบประกอบวิชาชีพการสัตวแพทย์ชั้นหนึ่ง มีความเชี่ยวชาญเฉพาะทาง
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3 hover:border-sky-500 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">SlipOK ตรวจสลิปอัตโนมัติ</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                สแกนจ่ายผ่าน QR PromptPay และตรวจสลิปทันทีด้วย AI ออกใบเสร็จรับเงินออนไลน์
              </p>
            </div>
          </div>
        </section>

        {/* ================= VETERINARIANS SHOWCASE ================= */}
        <section id="vets" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-sky-400 font-extrabold text-xs uppercase tracking-wider mb-1">
                OUR VETERINARIANS
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ทีมสัตวแพทย์ผู้เชี่ยวชาญ
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              ประจำการตามตารางเวรคลินิก
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vets.map((vet) => (
              <div
                key={vet.id}
                className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-lg text-center space-y-4 hover:border-sky-500 transition"
              >
                <img
                  src={vet.avatar}
                  alt={vet.name}
                  className="w-24 h-24 rounded-2xl mx-auto object-cover ring-4 ring-slate-800 shadow-md"
                />
                <div>
                  <h4 className="font-bold text-white text-base">{vet.name}</h4>
                  <p className="text-xs font-bold text-sky-400 mt-0.5">{vet.specialty}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">ใบอนุญาตเลขที่: {vet.licenseNo}</p>
                </div>

                <div className="bg-slate-950 rounded-2xl p-3 text-xs text-slate-300 space-y-1 border border-slate-800">
                  <div className="font-semibold text-slate-200">วันออกตรวจ:</div>
                  <div className="text-sky-300 font-medium">{vet.availableDays.join(', ')}</div>
                  <div className="text-[11px] text-slate-400">
                    เวลา: {vet.workingHours.start} - {vet.workingHours.end} น.
                  </div>
                </div>

                <div className="pt-1">
                  <span className="inline-block w-full py-2 bg-slate-800 text-sky-400 rounded-xl text-xs font-bold border border-slate-700">
                    ประจำการตามตารางเวร
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= FAQ SECTION ================= */}
        <section id="faq" className="space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-sky-400 font-extrabold text-xs uppercase tracking-wider mb-1">
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              คำถามที่พบบ่อย (FAQ)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <MessageCircleQuestion className="w-4 h-4 text-sky-400 shrink-0" />
                ต้องจองคิวนัดหมายล่วงหน้าก่อนนำสัตว์เลี้ยงมาหรือไม่?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">
                แนะนำให้จองคิวล่วงหน้าผ่านระบบออนไลน์ เพื่อความสะดวกรวดเร็วและลดเวลารอตรวจ โดยระบบจะจัดสรรแพทย์เวรประจำวันให้อัตโนมัติ กรณีฉุกเฉินสามารถพามาได้ทันทีตลอดเวลาทำการ
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <MessageCircleQuestion className="w-4 h-4 text-sky-400 shrink-0" />
                สามารถตรวจดูประวัติการรักษาและใบสั่งยาย้อนหลังได้ที่ไหน?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">
                เจ้าของสัตว์เลี้ยงสามารถเข้าสู่ระบบเพื่อดูประวัติเวชระเบียน EMR รายการยาที่ได้รับ และใบเสร็จรับเงินย้อนหลังได้ตลอด 24 ชั่วโมง
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <MessageCircleQuestion className="w-4 h-4 text-sky-400 shrink-0" />
                ระบบชำระเงินรองรับช่องทางใดบ้าง?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">
                รองรับการโอนชำระผ่าน QR Code PromptPay พร้อมระบบตรวจสอบสลิปอัตโนมัติ (SlipOK) และการชำระด้วยเงินสด/บัตรเครดิตที่หน้าเคาน์เตอร์
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <MessageCircleQuestion className="w-4 h-4 text-sky-400 shrink-0" />
                หากต้องการเลื่อนหรือยกเลิกคิวนัดหมาย ต้องทำอย่างไร?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">
                สามารถเข้าไปที่เมนู &ldquo;ประวัตินัดหมาย&rdquo; เพื่อกดเลื่อนวัน-เวลา หรือกดยกเลิกนัดหมายได้ด้วยตนเองอย่างสะดวก
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

