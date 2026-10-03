import React, { useState, useEffect } from "react";
import { 
  Stethoscope, Phone, Clock, MapPin, Calendar, Award, 
  ChevronLeft, Menu, X, CheckCircle2, HeartPulse, Activity, 
  Sparkles, Smile, ShieldCheck, Car, Zap
} from "lucide-react";
import { cn } from "./lib/utils";
import { formatJalali } from "./lib/jalali";
import { isIranMobile } from "./lib/persian";
import { supabase } from "./lib/supabase";
import ReceptionPanel from "./components/ReceptionPanel";
import RegionalCoverage from "./components/RegionalCoverage";
import FAQSection from "./components/FAQSection";

// Data
const SERVICE_CATEGORIES = [
  {
    title: "اورژانس و خدمات پرستاری",
    icon: HeartPulse,
    items: [
      { id: "emergency", name: "اورژانس شبانه‌روزی ۲۴ ساعته", desc: "تریاژ، نوار قلب و احیا تخصصی بدون تعطیلی" },
      { id: "nursing", name: "سرم‌تراپی و تزریقات", desc: "انجام کلیه خدمات تزریقات، پانسمان و مراقبت پرستاری" },
      { id: "surgery", name: "جراحی‌های سرپایی", desc: "بخیه، ختنه، برداشتن خال و توده‌های سطحی توسط پزشک" },
    ]
  },
  {
    title: "کلینیک تخصصی",
    icon: Stethoscope,
    items: [
      { id: "ortho", name: "متخصص ارتوپدی", desc: "درمان آسیب‌های مفاصل، استخوان، شکستگی و دیسک" },
      { id: "gynecology", name: "متخصص زنان و زایمان", desc: "مراقبت‌های بارداری، سونوگرافی و چکاپ تخصصی زنان" },
      { id: "internal", name: "متخصص داخلی", desc: "درمان بیماری‌های گوارشی، دیابت، تیروئید، غدد و ریه" },
      { id: "cardio", name: "متخصص قلب و عروق", desc: "اکوکاردیوگرافی، نوار قلب پیشرفته و تست ورزش" },
      { id: "neurology", name: "متخصص مغز و اعصاب", desc: "درمان سردرد، میگرن، تشنج و اختلالات عصبی" },
      { id: "gastro", name: "فوق تخصص گوارش و کبد", desc: "آندوسکوپی، کولونوسکوپی و بیماری‌های کبد چرب" },
      { id: "nutrition", name: "تغذیه و کاهش وزن", desc: "رژیم‌های تخصصی درمانی، لاغری و تناسب اندام" },
    ]
  },
  {
    title: "پوست، مو و زیبایی",
    icon: Sparkles,
    items: [
      { id: "filler", name: "فیلر و بوتاکس", desc: "تزریق بوتاکس و ژل با برندهای معتبر توسط پزشک" },
      { id: "body-filler", name: "فیلر بادی", desc: "حجم‌دهی و فرم‌دهی بدن با ماندگاری بالا" },
      { id: "meso", name: "مزوتراپی مو و پوست", desc: "تقویت مو، جلوگیری از ریزش و جوان‌سازی پوست" },
      { id: "hifu", name: "هایفو (HIFU)", desc: "لیفتینگ صورت و گردن بدون جراحی و بدون درد" },
      { id: "laser", name: "لیزر موهای زائد", desc: "جدیدترین دستگاه‌های لیزر بدون درد با کولینگ قوی" },
    ]
  },
  {
    title: "دندانپزشکی",
    icon: Smile,
    items: [
      { id: "dental-general", name: "دندانپزشکی عمومی", desc: "ترمیم، عصب‌کشی، جرم‌گیری و درمان ریشه" },
      { id: "dental-beauty", name: "اصلاح طرح لبخند", desc: "کامپوزیت ونیر، لمینت سرامیکی و بلیچینگ" },
    ]
  }
];

// Flatten for booking select
const ALL_SERVICES = SERVICE_CATEGORIES.flatMap(cat => cat.items);

const EMERGENCY_DOCTORS = [
  { name: "دکتر محمد محبعلی", role: "پزشک مقیم اورژانس", desc: "مسئول شیفت اورژانس و احیا" },
  { name: "دکتر جواد مزیدی", role: "پزشک مقیم اورژانس", desc: "پزشک کشیک اورژانس شبانه‌روزی" },
  { name: "دکتر عباس رحیمی", role: "پزشک مقیم اورژانس", desc: "اورژانس و تریاژ پیشرفته" },
  { name: "دکتر کریم جهانشاهی", role: "پزشک مقیم اورژانس", desc: "پزشک اورژانس و مدیریت تروما" },
  { name: "دکتر مبین رضایی", role: "پزشک مقیم اورژانس", desc: "پزشک مقیم اورژانس" },
  { name: "دکتر فروردین", role: "پزشک مقیم اورژانس", desc: "پزشک مقیم اورژانس" },
  { name: "دکتر اسدی", role: "پزشک مقیم اورژانس", desc: "پزشک مقیم اورژانس" },
  { name: "دکتر لطفعلی ثانی", role: "پزشک مقیم اورژانس", desc: "پزشک مقیم اورژانس" },
  { name: "دکتر فتحعلی نژاد", role: "پزشک مقیم اورژانس", desc: "پزشک مقیم اورژانس" },
  { name: "دکتر رهنورد", role: "پزشک مقیم اورژانس", desc: "پزشک مقیم اورژانس" },
];

const SPECIALIST_DOCTORS = [
  { name: "دکتر زانوسی", role: "متخصص ارتوپدی", days: ["شنبه‌ها"], serviceId: "ortho" },
  { name: "دکتر علینژاد", role: "متخصص زنان و زایمان", days: ["یکشنبه‌ها"], serviceId: "gynecology" },
  { name: "دکتر نیک‌سیرت", role: "فوق تخصص گوارش و کبد", days: ["دوشنبه‌ها"], serviceId: "gastro" },
  { name: "دکتر شورمیج", role: "متخصص قلب و عروق", days: ["سه‌شنبه‌ها"], serviceId: "cardio" },
  { name: "دکتر صالحی", role: "متخصص مغز و اعصاب", days: ["سه‌شنبه‌ها"], serviceId: "neurology" },
  { name: "دکتر جورابراهیمیان", role: "متخصص داخلی", days: ["چهارشنبه‌ها"], serviceId: "internal" },
  { name: "دکتر جواد مزیدی", role: "تغذیه و کاهش وزن", days: ["برنامه هفتگی"], serviceId: "nutrition" },
  { name: "دکتر محمد محبعلی", role: "زیبایی و جوان‌سازی", days: ["برنامه هفتگی"], serviceId: "filler" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "services" | "doctors" | "booking" | "contact" | "reception">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#reception") {
        setActiveTab("reception");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Booking state
  const [selectedService, setSelectedService] = useState(ALL_SERVICES[0].id);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !isIranMobile(patientPhone)) {
      alert("لطفاً نام و شماره موبایل معتبر (مثلاً ۰۹۱۱XXXXXXX) وارد کنید.");
      return;
    }
    
    setIsSubmitting(true);
    const trackingCode = "PRS-" + Math.floor(100000 + Math.random() * 900000);
    const selectedServiceObj = ALL_SERVICES.find(s => s.id === selectedService);

    try {
      // 1. Save to Supabase
      const { error } = await supabase.from('bookings').insert([
        {
          tracking_code: trackingCode,
          patient_name: patientName,
          patient_phone: patientPhone,
          service_id: selectedService,
          service_name: selectedServiceObj ? selectedServiceObj.name : selectedService,
          booking_date: selectedDate.toISOString().split("T")[0],
          status: 'pending'
        }
      ]);

      if (error) {
        console.warn("Supabase save warning:", error.message);
      }

      // 2. Trigger SMS via Vercel Serverless Function
      try {
        const smsEndpoint = window.location.hostname.includes("vercel.app")
          ? "/api/send-sms"
          : "https://parsian.vercel.app/api/send-sms";

        await fetch(smsEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobile: patientPhone,
            templateId: 511359,
            parameters: [
              { name: 'NAME', value: patientName },
              { name: 'SERVICE', value: selectedServiceObj ? selectedServiceObj.name : 'درمانگاه پارسیان' },
              { name: 'CODE', value: trackingCode }
            ]
          })
        });
      } catch (smsErr) {
        console.warn("SMS send trigger warning:", smsErr);
      }

    } catch (err) {
      console.error("Connection error:", err);
    } finally {
      setIsSubmitting(false);
      setBookingSuccess(trackingCode);
    }
  };

  const selectDoctorAndBook = (serviceId: string) => {
    setSelectedService(serviceId);
    setActiveTab("booking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans w-full max-w-none text-right clinical-ambient-emerald">
      {/* Emergency Strip */}
      <div className="bg-red-950/70 text-red-200 border-b border-red-900/50 text-xs py-2 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
            </span>
            <HeartPulse className="size-4 animate-pulse text-red-400" />
            <span>اورژانس شبانه‌روزی پارسیان عباس‌آباد · آماده‌باش ۲۴ ساعته بدون تعطیلی</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-red-900/40 text-red-300 border border-red-800/40">
              معین متل قو و نشتارود
            </span>
          </div>
          <a 
            href="tel:01154627022" 
            className="flex items-center gap-1.5 font-bold hover:text-white bg-red-900/50 hover:bg-red-900 px-3 py-1 rounded-full transition-all" 
            dir="ltr"
          >
            <Phone className="size-3.5" />
            <span>۰۱۱ ۵۴۶۲ ۷۰۲۲</span>
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab("home"); window.location.hash = ""; }}>
            <div className="size-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl border border-amber-500/30 shadow-inner">
              پ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black leading-tight">درمانگاه شبانه‌روزی پارسیان</h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ۲۴ ساعته
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">عباس‌آباد · اورژانس متل قو و نشتارود</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {[
              { id: "home", label: "خانه" },
              { id: "services", label: "خدمات کلینیک" },
              { id: "doctors", label: "پزشکان و متخصصان" },
              { id: "booking", label: "نوبت‌دهی آنلاین" },
              { id: "contact", label: "تماس و مسیریابی" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); window.location.hash = ""; }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer",
                  activeTab === item.id 
                    ? "bg-[var(--secondary)] text-[var(--foreground)] font-bold shadow-sm border border-[var(--border)]" 
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/50"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setActiveTab("booking"); window.location.hash = ""; }}
              className="hidden sm:inline-flex items-center gap-2 h-11 px-6 rounded-full bg-white text-black font-black text-sm hover:bg-white/90 transition-all cursor-pointer shadow-lg shadow-white/10"
            >
              <Calendar className="size-4" />
              رزرو نوبت
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--secondary)] border border-[var(--border)]"
              aria-label="منو"
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sheet Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-80 bg-[var(--popover)] text-[var(--popover-foreground)] h-full shadow-2xl p-6 flex flex-col gap-4 z-10 border-e border-[var(--border)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <span className="font-bold text-lg">منوی درمانگاه پارسیان</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md hover:bg-[var(--accent)]">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { id: "home", label: "خانه" },
                { id: "services", label: "خدمات کلینیک" },
                { id: "doctors", label: "پزشکان و متخصصان" },
                { id: "booking", label: "نوبت‌دهی آنلاین" },
                { id: "contact", label: "تماس و مسیریابی" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); window.location.hash = ""; }}
                  className={cn(
                    "text-right px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    activeTab === item.id ? "bg-amber-500 text-black font-bold" : "hover:bg-[var(--accent)]"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-4 mt-2 border-t border-[var(--border)]">
              <button
                onClick={() => { setActiveTab("reception"); setMobileMenuOpen(false); window.location.hash = "reception"; }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer",
                  activeTab === "reception" ? "bg-amber-500 text-black" : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                )}
              >
                <span>ورود به پنل پذیرش منشی</span>
                <ShieldCheck className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === "home" && (
          <div className="space-y-16">
            {/* Elevated Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--secondary)]/60 border border-[var(--border)] p-8 sm:p-14 shadow-2xl text-right">
              <div className="absolute -top-24 -left-24 size-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-1/3 size-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                  </span>
                  <Activity className="size-3.5" />
                  اورژانس شبانه‌روزی و کلینیک معین متل قو (سلمان‌شهر) و نشتارود
                </div>

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
                  سلامتی شما، <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent">
                    دغدغه‌ی شبانه‌روزی ماست
                  </span>
                </h2>

                <p className="text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed">
                  درمانگاه شبانه‌روزی پارسیان عباس‌آباد با ۱۰ پزشک مقیم در اورژانس و برترین متخصصین پزشکی، نزدیک‌ترین مرکز درمانی و اورژانس ۲۴ ساعته به متل قو و نشتارود جهت کلیه خدمات درمانی، سرم‌تراپی، جراحی سرپایی، زیبایی و دندانپزشکی.
                </p>

                {/* Badges / Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>۱۰ پزشک مقیم اورژانس</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                    <Car className="size-4 text-amber-400 shrink-0" />
                    <span>۵ تا ۱۰ دقیقه از متل قو و نشتارود</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                    <Zap className="size-4 text-blue-400 shrink-0" />
                    <span>تزریقات و سرم‌تراپی ۲۴ ساعته</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 pt-4 justify-start items-center">
                  <button 
                    onClick={() => setActiveTab("booking")}
                    className="h-12 px-8 rounded-full bg-white text-black font-black text-sm hover:bg-white/90 shadow-xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Calendar className="size-4" />
                    رزرو نوبت آنلاین
                  </button>
                  <a 
                    href="tel:01154627022"
                    className="h-12 px-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2"
                  >
                    <Phone className="size-4" />
                    تماس اضطراری اورژانس
                  </a>
                  <button 
                    onClick={() => setActiveTab("services")}
                    className="h-12 px-6 rounded-full border border-[var(--border)] hover:bg-[var(--secondary)] font-semibold text-sm transition-colors cursor-pointer text-white/80 hover:text-white"
                  >
                    مشاهده تمامی خدمات
                  </button>
                </div>
              </div>
            </div>

            {/* Regional Coverage Hub (SEO & Maps) */}
            <RegionalCoverage />

            {/* Specialist Doctors Highlights */}
            <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-6 text-right shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <Award className="size-6 text-amber-400" />
                    متخصصین کلینیک تخصصی پارسیان
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">برنامه حضور هفتگی متخصصان و امکان رزرو مستقیم نوبت</p>
                </div>
                <button 
                  onClick={() => setActiveTab("doctors")} 
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  مشاهده همه پزشکان <ChevronLeft className="size-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SPECIALIST_DOCTORS.slice(0, 4).map((doc, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)] flex flex-col justify-between hover:border-amber-500/40 transition-all space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {doc.days.join("، ")}
                        </span>
                      </div>
                      <h4 className="font-black text-base text-white">{doc.name}</h4>
                      <p className="text-xs text-[var(--muted-foreground)]">{doc.role}</p>
                    </div>
                    <button
                      onClick={() => selectDoctorAndBook(doc.serviceId)}
                      className="w-full h-9 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Calendar className="size-3.5" />
                      رزرو نوبت
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Doctors Preview */}
            <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-6 text-right shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <HeartPulse className="size-6 text-red-400" />
                    کادر ۱۰ نفره پزشکان مقیم اورژانس
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">حضور ۲۴ ساعته ۱۰ پزشک مجرب جهت فوریت‌های پزشکی و تریاژ</p>
                </div>
                <button onClick={() => setActiveTab("doctors")} className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer">
                  مشاهده کادر کامل <ChevronLeft className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {EMERGENCY_DOCTORS.map((doc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[var(--secondary)]/40 border border-[var(--border)] text-center space-y-2 hover:border-amber-500/30 transition-all">
                    <div className="size-11 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-black mx-auto text-sm border border-amber-500/20">
                      {doc.name.replace("دکتر ", "")[0]}
                    </div>
                    <h5 className="font-bold text-xs text-white leading-tight">{doc.name}</h5>
                    <span className="text-[10px] text-amber-400/90 block">پزشک مقیم اورژانس</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: "پشتیبانی و تریاژ", value: "۲۴ ساعته شبانه‌روزی", icon: Clock },
                { title: "کادر اورژانس", value: "۱۰ پزشک مقیم", icon: Stethoscope },
                { title: "پوشش منطقه‌ای", value: "متل قو، نشتارود، عباس‌آباد", icon: Award },
                { title: "تلفن پذیرش", value: "۰۱۱-۵۴۶۲۷۰۲۲", icon: Phone },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col gap-2 shadow-sm text-right">
                    <div className="size-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-lg font-black mt-2 leading-none text-white">{stat.value}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{stat.title}</span>
                  </div>
                );
              })}
            </div>

            {/* FAQ Accordion */}
            <FAQSection />
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div className="space-y-12 text-right">
            <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl">
              <h2 className="text-3xl font-black text-white">خدمات جامع درمانی، زیبایی و دندانپزشکی پارسیان</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                مجهزترین کلینیک تخصصی و اورژانس شبانه‌روزی غرب مازندران با دسترسی سریع برای مراجعین عباس‌آباد، متل قو (سلمان‌شهر) و نشتارود
              </p>
            </div>

            <div className="space-y-16">
              {SERVICE_CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <div key={i} className="space-y-6">
                    <div className="flex items-center gap-3 text-amber-400 border-b border-[var(--border)] pb-3">
                      <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">{cat.title}</h3>
                        <span className="text-xs text-[var(--muted-foreground)]">{cat.items.length} خدمت فعال</span>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cat.items.map((s) => (
                        <div key={s.id} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-md group">
                          <div className="space-y-3">
                            <h4 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{s.name}</h4>
                            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{s.desc}</p>
                          </div>
                          <div className="pt-6 mt-6 border-t border-[var(--border)]">
                            <button 
                              onClick={() => { setSelectedService(s.id); setActiveTab("booking"); }}
                              className="w-full h-10 rounded-xl bg-white text-black font-black text-xs hover:bg-white/90 transition-colors cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Calendar className="size-3.5" />
                              رزرو نوبت آنلاین
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Regional Coverage inside Services */}
            <RegionalCoverage />

            {/* FAQ inside Services */}
            <FAQSection />
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === "doctors" && (
          <div className="space-y-12 text-right">
            <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl">
              <h2 className="text-3xl font-black text-white">کادر پزشکی و متخصصین درمانگاه پارسیان</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                تیم ۱۰ نفره پزشکان مقیم اورژانس به همراه پزشکان فوق تخصص و متخصص کلینیک
              </p>
            </div>

            {/* Emergency Doctors */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-amber-400 border-b border-[var(--border)] pb-3">
                <HeartPulse className="size-6 text-red-400" />
                <h3 className="text-xl font-black text-white">کادر ۱۰ نفره پزشکان مقیم اورژانس شبانه‌روزی</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {EMERGENCY_DOCTORS.map((doc, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center space-y-3 shadow-md hover:border-amber-500/40 transition-all">
                    <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-xl font-black border border-amber-500/20">
                      {doc.name.replace("دکتر ", "")[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{doc.name}</h4>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                        پزشک مقیم اورژانس
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialists */}
            <div className="space-y-6 pt-8 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-amber-400 border-b border-[var(--border)] pb-3">
                <Award className="size-6 text-amber-400" />
                <h3 className="text-xl font-black text-white">متخصصین کلینیک تخصصی پارسیان</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {SPECIALIST_DOCTORS.map((doc, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between gap-5 shadow-md hover:border-amber-500/40 transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
                          {doc.name.replace("دکتر ", "")[0]}
                        </div>
                        <div className="text-right">
                          <h4 className="font-bold text-base leading-tight text-white">{doc.name}</h4>
                          <p className="text-xs text-amber-400 font-bold mt-0.5">{doc.role}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--secondary)]/60 text-xs flex items-center justify-between border border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)]">روزهای حضور:</span>
                        <span className="font-bold text-white">{doc.days.join("، ")}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => selectDoctorAndBook(doc.serviceId)}
                      className="w-full h-10 rounded-xl bg-white text-black font-black text-xs hover:bg-white/90 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="size-3.5" />
                      رزرو نوبت با {doc.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Coverage */}
            <RegionalCoverage />
          </div>
        )}

        {/* Booking Tab */}
        {activeTab === "booking" && (
          <div className="max-w-3xl mx-auto space-y-8 text-right">
            <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl">
              <h2 className="text-3xl font-black text-white">سامانه نوبت‌دهی آنلاین درمانگاه پارسیان</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                نوبت‌دهی آسان، ذخیره قطعی در پایگاه داده ابری و ارسال آنی پیامک تایید نوبت به شماره موبایل شما
              </p>
            </div>

            {bookingSuccess ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-[var(--card)] border border-emerald-500/40 text-center space-y-6 shadow-2xl">
                <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="size-8" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-white">نوبت شما با موفقیت ثبت شد</h3>
                  <p className="text-xs text-emerald-400 font-bold">اطلاعات شما در سیستم پذیرش ذخیره گردید و پیامک تأیید صادر شد.</p>
                  <p className="text-xs text-[var(--muted-foreground)]">کد پیگیری اختصاصی پرونده شما:</p>
                  <div className="text-2xl font-mono font-black tracking-widest text-amber-400 bg-[var(--secondary)] py-3 px-8 rounded-2xl inline-block border border-amber-500/30">
                    {bookingSuccess}
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
                  لطفاً کد پیگیری را به خاطر بسپارید. همکاران پذیرش درمانگاه جهت هماهنگی ساعت حضور با شما تماس خواهند گرفت.
                </p>
                <button 
                  onClick={() => { setBookingSuccess(null); setActiveTab("home"); }}
                  className="h-11 px-8 rounded-full bg-white text-black font-black text-sm cursor-pointer hover:bg-white/90 transition-colors"
                >
                  بازگشت به صفحه اصلی
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-6 shadow-2xl text-right">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white">۱. انتخاب پزشک یا خدمت مورد نظر:</label>
                  <select 
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)] text-xs font-bold focus:outline-none focus:border-amber-500 text-right cursor-pointer"
                  >
                    {ALL_SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white">۲. تاریخ مراجعه مد نظر:</label>
                  <div className="p-4 rounded-xl bg-[var(--secondary)]/60 border border-[var(--border)] flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-400">
                      {formatJalali(selectedDate, { weekday: true, year: true })}
                    </span>
                    <input 
                      type="date"
                      value={selectedDate.toISOString().split("T")[0]}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      className="bg-[var(--background)] px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-mono cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white">نام و نام خانوادگی بیمار:</label>
                    <input 
                      type="text"
                      required
                      placeholder="مثلاً: علی رضایی"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)] text-xs focus:outline-none focus:border-amber-500 text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white">شماره موبایل جهت دریافت پیامک:</label>
                    <input 
                      type="tel"
                      required
                      dir="ltr"
                      placeholder="0911XXXXXXX"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)] text-xs text-right focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
                  💡 پس از ثبت نوبت، پیامک تایید با کد رهگیری برای شما صادر شده و کارشناسان پذیرش درمانگاه پارسیان جهت هماهنگی ساعت دقیق حضور با شما تماس خواهند گرفت.
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-amber-500 text-black font-black text-sm hover:bg-amber-400 shadow-xl shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "در حال ثبت نوبت و ارسال پیامک..." : "ثبت نهایی و دریافت کد رهگیری"}
                </button>
              </form>
            )}

            <RegionalCoverage />
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-8 max-w-4xl mx-auto text-right">
            <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl">
              <h2 className="text-3xl font-black text-white">تماس و اطلاعات دسترسی به درمانگاه پارسیان</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                مرکز اورژانس شبانه‌روزی و کلینیک تخصصی در عباس‌آباد (روبروی شهرداری)
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-6 shadow-xl">
                <h3 className="text-xl font-bold text-white">اطلاعات مرکز</h3>
                <div className="space-y-5 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold text-white">آدرس درمانگاه:</span>
                      <span className="text-[var(--muted-foreground)]">مازندران، عباس‌آباد، خیابان اصلی ساحلی، روبروی شهرداری، درمانگاه شبانه‌روزی پارسیان</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="size-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold text-white">تلفن مستقیم و شبانه‌روزی:</span>
                      <a href="tel:01154627022" className="text-amber-400 hover:underline font-bold text-base block mt-0.5" dir="ltr">
                        ۰۱۱ ۵۴۶۲ ۷۰۲۲
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="size-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold text-white">ساعت پذیرش اورژانس:</span>
                      <span className="text-emerald-400 font-bold">۲۴ ساعته شبانه‌روزی، بدون تعطیلی</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-gradient-to-br from-red-950/40 to-[var(--card)] border border-red-900/50 flex flex-col justify-between space-y-6 shadow-xl">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">
                    <HeartPulse className="size-3.5 animate-pulse text-red-400" />
                    اورژانس و فوریت‌های پزشکی
                  </div>
                  <h3 className="text-xl font-bold text-red-400">تماس مستقیم با اورژانس پارسیان</h3>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    تیم اورژانس پارسیان با حضور ۱۰ پزشک مقیم، تریاژ و کادر مجرب پرستاری آماده خدمت‌رسانی فوری در کلیه سوانح، تروما، بخیه و فوریت‌ها برای شهروندان عباس‌آباد، متل قو و نشتارود می‌باشد.
                  </p>
                </div>
                <a 
                  href="tel:01154627022"
                  className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                >
                  <Phone className="size-4" />
                  برقراری تماس فوری (۰۱۱۵۴۶۲۷۰۲۲)
                </a>
              </div>
            </div>

            {/* Regional Coverage Component */}
            <RegionalCoverage />

            {/* FAQ Accordion */}
            <FAQSection />
          </div>
        )}

        {/* Reception / Admin View */}
        {activeTab === "reception" && (
          <ReceptionPanel 
            onBackToSite={() => {
              setActiveTab("home");
              window.location.hash = "";
            }} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)]/80 mt-16 py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30">
                پ
              </div>
              <div>
                <span className="font-black text-base text-white block">درمانگاه شبانه‌روزی پارسیان عباس‌آباد</span>
                <span className="text-xs text-[var(--muted-foreground)]">مرکز درمانی و اورژانس شبانه‌روزی معین متل قو و نشتارود</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6 items-center text-xs">
              <button onClick={() => { setActiveTab("home"); window.location.hash = ""; }} className="hover:text-amber-400 cursor-pointer">خانه</button>
              <button onClick={() => { setActiveTab("services"); window.location.hash = ""; }} className="hover:text-amber-400 cursor-pointer">خدمات</button>
              <button onClick={() => { setActiveTab("doctors"); window.location.hash = ""; }} className="hover:text-amber-400 cursor-pointer">پزشکان</button>
              <button onClick={() => { setActiveTab("booking"); window.location.hash = ""; }} className="hover:text-amber-400 cursor-pointer">نوبت‌دهی</button>
              <button onClick={() => { setActiveTab("contact"); window.location.hash = ""; }} className="hover:text-amber-400 cursor-pointer">تماس و مسیریابی</button>
              <button 
                onClick={() => {
                  setActiveTab("reception");
                  window.location.hash = "reception";
                }} 
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold cursor-pointer px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <ShieldCheck className="size-3.5" />
                پنل پذیرش منشی
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--muted-foreground)]">
            <p>© ۱۴۰۵ کلیه حقوق برای درمانگاه شبانه‌روزی پارسیان عباس‌آباد محفوظ است.</p>
            <p>تلفن مستقیم: ۰۱۱۵۴۶۲۷۰۲۲ | مازندران، عباس‌آباد، روبروی شهرداری</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
