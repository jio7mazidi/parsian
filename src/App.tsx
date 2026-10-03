import React, { useState } from "react";
import { 
  Stethoscope, Phone, Clock, MapPin, Calendar, Award, 
  ChevronLeft, Menu, X, CheckCircle2, HeartPulse, Activity, User, 
  Sparkles, Smile
} from "lucide-react";
import { cn } from "./lib/utils";
import { formatJalali } from "./lib/jalali";
import { isIranMobile } from "./lib/persian";
import { supabase } from "./lib/supabase";

// Data
const SERVICE_CATEGORIES = [
  {
    title: "اورژانس و خدمات پرستاری",
    icon: HeartPulse,
    items: [
      { id: "emergency", name: "اورژانس شبانه‌روزی ۲۴ ساعته", desc: "تریاژ، نوار قلب و احیا تخصصی" },
      { id: "nursing", name: "سرم‌تراپی و تزریقات", desc: "انجام کلیه خدمات تزریقات و پانسمان" },
      { id: "surgery", name: "جراحی‌های سرپایی", desc: "بخیه، ختنه، برداشتن خال و توده‌های سطحی" },
    ]
  },
  {
    title: "کلینیک تخصصی",
    icon: Stethoscope,
    items: [
      { id: "ortho", name: "متخصص ارتوپدی", desc: "درمان آسیب‌های مفاصل و استخوان" },
      { id: "gynecology", name: "متخصص زنان و زایمان", desc: "مراقبت‌های بارداری و چکاپ زنان" },
      { id: "internal", name: "متخصص داخلی", desc: "درمان بیماری‌های گوارشی، غدد و ریه" },
      { id: "cardio", name: "متخصص قلب و عروق", desc: "اکوکاردیوگرافی و تست ورزش" },
      { id: "neurology", name: "متخصص مغز و اعصاب", desc: "درمان سردرد، تشنج و اختلالات مغزی" },
      { id: "gastro", name: "فوق تخصص گوارش", desc: "آندوسکوپی و بیماری‌های کبد" },
      { id: "nutrition", name: "تغذیه و کاهش وزن", desc: "رژیم‌های تخصصی درمانی و لاغری" },
    ]
  },
  {
    title: "پوست، مو و زیبایی",
    icon: Sparkles,
    items: [
      { id: "filler", name: "فیلر و بوتاکس", desc: "تزریق بوتاکس و فیلر توسط پزشک متخصص" },
      { id: "body-filler", name: "فیلر بادی", desc: "حجم‌دهی و فرم‌دهی بدن" },
      { id: "meso", name: "مزوتراپی", desc: "تقویت مو و جوان‌سازی پوست" },
      { id: "hifu", name: "هایفو (HIFU)", desc: "لیفتینگ صورت و بدن بدون جراحی" },
      { id: "laser", name: "لیزر موهای زائد", desc: "استفاده از جدیدترین دستگاه‌های لیزر" },
    ]
  },
  {
    title: "دندانپزشکی",
    icon: Smile,
    items: [
      { id: "dental-general", name: "دندانپزشکی عمومی", desc: "ترمیم، عصب‌کشی و جرم‌گیری" },
      { id: "dental-beauty", name: "اصلاح طرح لبخند", desc: "کامپوزیت، لمینت و بلیچینگ" },
    ]
  }
];

// Flatten for booking select
const ALL_SERVICES = SERVICE_CATEGORIES.flatMap(cat => cat.items);

const EMERGENCY_DOCTORS = [
  { name: "دکتر محمد محبعلی", role: "پزشک عمومی اورژانس", desc: "مسئول شیفت اورژانس و احیا" },
  { name: "دکتر جواد مزیدی", role: "پزشک عمومی اورژانس", desc: "پزشک کشیک اورژانس شبانه‌روزی" },
  { name: "دکتر عباس رحیمی", role: "پزشک عمومی اورژانس", desc: "اورژانس و تریاژ پیشرفته" },
  { name: "دکتر کریم جهانشاهی", role: "پزشک عمومی اورژانس", desc: "پزشک اورژانس و مدیریت تروما" },
  { name: "دکتر مبین رضایی", role: "پزشک عمومی اورژانس", desc: "پزشک مقیم اورژانس" },
  { name: "دکتر فروردین", role: "پزشک عمومی اورژانس", desc: "پزشک مقیم اورژانس" },
  { name: "دکتر اسدی", role: "پزشک عمومی اورژانس", desc: "پزشک مقیم اورژانس" },
  { name: "دکتر لطفعلی ثانی", role: "پزشک عمومی اورژانس", desc: "پزشک مقیم اورژانس" },
  { name: "دکتر فتحعلی نژاد", role: "پزشک عمومی اورژانس", desc: "پزشک مقیم اورژانس" },
  { name: "دکتر رهنورد", role: "پزشک عمومی اورژانس", desc: "پزشک مقیم اورژانس" },
];

const SPECIALIST_DOCTORS = [
  { name: "دکتر زانوسی", role: "متخصص ارتوپدی", days: ["شنبه"] },
  { name: "دکتر علینژاد", role: "متخصص زنان و زایمان", days: ["یکشنبه"] },
  { name: "دکتر نیک‌سیرت", role: "متخصص گوارش", days: ["دوشنبه"] },
  { name: "دکتر شورمیج", role: "متخصص قلب و عروق", days: ["سه‌شنبه"] },
  { name: "دکتر صالحی", role: "متخصص مغز و اعصاب", days: ["سه‌شنبه"] },
  { name: "دکتر جورابراهیمیان", role: "متخصص داخلی", days: ["چهارشنبه"] },
  { name: "دکتر جواد مزیدی", role: "تغذیه و کاهش وزن", days: ["طبق برنامه هفتگی"] },
  { name: "دکتر محمد محبعلی", role: "زیبایی و جوان‌سازی", days: ["طبق برنامه هفتگی"] },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "services" | "doctors" | "booking" | "contact">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    } catch (err) {
      console.error("Connection error:", err);
    } finally {
      setIsSubmitting(false);
      setBookingSuccess(trackingCode);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans w-full max-w-none text-right">
      {/* Emergency Strip */}
      <div className="bg-red-950/60 text-red-200 border-b border-red-900/50 text-xs py-2.5 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold">
            <HeartPulse className="size-4 animate-pulse text-red-400" />
            اورژانس شبانه‌روزی درمانگاه پارسیان عباس‌آباد (آماده‌باش ۲۴ ساعته)
          </div>
          <a href="tel:01154627022" className="flex items-center gap-1.5 font-bold hover:underline" dir="ltr">
            <Phone className="size-3.5" />
            <span>۰۱۱ ۵۴۶۲ ۷۰۲۲</span>
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="size-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl">
              پ
            </div>
            <div>
              <h1 className="text-lg font-black leading-tight">درمانگاه شبانه‌روزی پارسیان</h1>
              <p className="text-xs text-[var(--muted-foreground)]">عباس‌آباد، مازندران</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {[
              { id: "home", label: "خانه" },
              { id: "services", label: "خدمات" },
              { id: "doctors", label: "پزشکان و متخصصان" },
              { id: "booking", label: "نوبت‌دهی آنلاین" },
              { id: "contact", label: "تماس با ما" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer",
                  activeTab === item.id 
                    ? "bg-[var(--secondary)] text-[var(--foreground)] font-bold shadow-sm" 
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/50"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab("booking")}
              className="hidden sm:inline-flex items-center gap-2 h-11 px-6 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all cursor-pointer shadow-md"
            >
              <Calendar className="size-4" />
              رزرو نوبت
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[var(--foreground)] hover:bg-[var(--secondary)]"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-80 bg-[var(--popover)] text-[var(--popover-foreground)] h-full shadow-2xl p-6 flex flex-col gap-4 z-10 border-e border-[var(--border)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <span className="font-bold text-lg">منوی پارسیان</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md hover:bg-[var(--accent)]">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { id: "home", label: "خانه" },
                { id: "services", label: "خدمات" },
                { id: "doctors", label: "پزشکان" },
                { id: "booking", label: "نوبت‌دهی" },
                { id: "contact", label: "تماس" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                  className={cn(
                    "text-right px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    activeTab === item.id ? "bg-amber-500 text-black font-bold" : "hover:bg-[var(--accent)]"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === "home" && (
          <div className="space-y-16">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--card)] to-[var(--secondary)] border border-[var(--border)] p-8 sm:p-14 shadow-xl text-right">
              <div className="absolute -top-24 -left-24 size-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                  <Activity className="size-3.5" />
                  خدمات پزشکی شبانه‌روزی در عباس‌آباد مازندران
                </div>
                <h2 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight">
                  سلامتی شما، دغدغه‌ی شبانه‌روزی ماست
                </h2>
                <p className="text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed">
                  درمانگاه شبانه‌روزی پارسیان با ۱۰ پزشک مقیم در اورژانس و متخصصان برجسته، آماده‌ی ارائه خدمات درمانی، زیبایی و دندانپزشکی به شما عزیزان است.
                </p>
                <div className="flex flex-wrap gap-4 pt-2 justify-start">
                  <button 
                    onClick={() => setActiveTab("booking")}
                    className="h-12 px-8 rounded-full bg-white text-black font-bold text-sm hover:opacity-90 shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Calendar className="size-4" />
                    رزرو نوبت آنلاین
                  </button>
                  <button 
                    onClick={() => setActiveTab("services")}
                    className="h-12 px-8 rounded-full border border-[var(--border)] hover:bg-[var(--secondary)] font-semibold text-sm transition-colors cursor-pointer"
                  >
                    مشاهده تمامی خدمات
                  </button>
                </div>
              </div>
            </div>

            {/* Emergency Doctors Preview */}
            <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-6 text-right">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black">پزشکان مقیم اورژانس</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">حضور ۲۴ ساعته ۱۰ پزشک مجرب جهت فوریت‌های پزشکی</p>
                </div>
                <button onClick={() => setActiveTab("doctors")} className="text-sm font-semibold text-amber-400 hover:underline flex items-center gap-1">
                   پزشکان اورژانس <ChevronLeft className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {EMERGENCY_DOCTORS.map((doc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[var(--secondary)]/40 border border-[var(--border)] text-center space-y-2">
                    <div className="size-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mx-auto">
                      <User className="size-5" />
                    </div>
                    <h5 className="font-bold text-[13px]">{doc.name}</h5>
                    <span className="text-[10px] text-amber-400 block">پزشک اورژانس</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: "پشتیبانی شبانه‌روزی", value: "۲۴ ساعته", icon: Clock },
                { title: "کادر اورژانس", value: "۱۰ پزشک مقیم", icon: Stethoscope },
                { title: "خدمات کلینیکی", value: "تخصصی و زیبایی", icon: Award },
                { title: "تلفن تماس", value: "۰۱۱-۵۴۶۲۷۰۲۲", icon: Phone },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col gap-2 shadow-sm text-right">
                    <div className="size-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-xl font-black mt-2 leading-none" dir="ltr">{stat.value}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{stat.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="space-y-12 text-right">
            <div>
              <h2 className="text-3xl font-black">خدمات درمانی و زیبایی پارسیان</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">جامع‌ترین مرکز درمانی عباس‌آباد مازندران</p>
            </div>

            <div className="space-y-16">
              {SERVICE_CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <div key={i} className="space-y-6">
                    <div className="flex items-center gap-3 text-amber-400">
                      <Icon className="size-6" />
                      <h3 className="text-xl font-black">{cat.title}</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cat.items.map((s) => (
                        <div key={s.id} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between hover:border-amber-500/50 transition-all">
                          <div className="space-y-3">
                            <h4 className="font-bold text-lg">{s.name}</h4>
                            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{s.desc}</p>
                          </div>
                          <div className="pt-6 mt-6 border-t border-[var(--border)]">
                            <button 
                              onClick={() => { setSelectedService(s.id); setActiveTab("booking"); }}
                              className="w-full h-10 rounded-full bg-white text-black font-bold text-xs hover:opacity-90 cursor-pointer"
                            >
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
          </div>
        )}

        {activeTab === "doctors" && (
          <div className="space-y-12 text-right">
            <div>
              <h2 className="text-3xl font-black">کادر پزشکی و متخصصین</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">پزشکان مقیم و متخصصین آماده خدمت‌رسانی</p>
            </div>

            <div className="space-y-8">
              <h3 className="text-xl font-black flex items-center gap-2 text-amber-400 border-b border-[var(--border)] pb-2">
                <HeartPulse className="size-6" /> کادر ۱۰ نفره پزشکان اورژانس
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {EMERGENCY_DOCTORS.map((doc, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center space-y-3">
                    <div className="size-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-lg font-bold">
                      {doc.name.replace("دکتر ", "")[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{doc.name}</h4>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-1">پزشک عمومی اورژانس</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-[var(--border)]">
              <h3 className="text-xl font-black flex items-center gap-2 text-amber-400 border-b border-[var(--border)] pb-2">
                <Award className="size-6" /> متخصصین کلینیک تخصصی
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {SPECIALIST_DOCTORS.map((doc, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full bg-[var(--secondary)] text-amber-400 flex items-center justify-center font-bold text-xl">
                        {doc.name.replace("دکتر ", "")[0]}
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-base leading-tight">{doc.name}</h4>
                        <p className="text-[11px] text-[var(--brand)] font-bold">{doc.role}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                      <span className="text-[var(--muted-foreground)]">روز حضور:</span>
                      <span className="font-bold text-[var(--foreground)] bg-[var(--secondary)] px-2 py-0.5 rounded-lg">{doc.days.join("، ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "booking" && (
          <div className="max-w-3xl mx-auto space-y-8 text-right">
            <div>
              <h2 className="text-3xl font-black">رزرو نوبت آنلاین</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">درمانگاه پارسیان عباس‌آباد (بدون نیاز به پرداخت آنلاین)</p>
            </div>

            {bookingSuccess ? (
              <div className="p-8 rounded-3xl bg-[var(--card)] border border-emerald-500/40 text-center space-y-6 shadow-xl">
                <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black">نوبت شما با موفقیت رزرو شد</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">کد پیگیری:</p>
                  <div className="text-xl font-mono font-bold tracking-wider text-amber-400 bg-[var(--secondary)] py-3 px-6 rounded-xl inline-block">
                    {bookingSuccess}
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  هماهنگی نهایی از طریق تماس یا پیامک انجام خواهد شد.
                </p>
                <button 
                  onClick={() => { setBookingSuccess(null); setActiveTab("home"); }}
                  className="h-11 px-8 rounded-full bg-white text-black font-bold text-sm cursor-pointer"
                >
                  بازگشت به خانه
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-6 shadow-xl text-right">
                <div className="space-y-3">
                  <label className="block text-sm font-bold">۱. انتخاب نوع خدمت</label>
                  <select 
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)] text-sm focus:outline-none focus:border-amber-500 text-right"
                  >
                    {ALL_SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold">۲. تاریخ مورد نظر</label>
                  <div className="p-4 rounded-xl bg-[var(--secondary)]/50 border border-[var(--border)] flex items-center justify-between">
                    <span className="font-bold text-sm">
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

                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold">نام بیمار</label>
                    <input 
                      type="text"
                      required
                      placeholder="مثلاً علی رضایی"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)] text-sm focus:outline-none focus:border-amber-500 text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold">شماره تماس</label>
                    <input 
                      type="tel"
                      required
                      dir="ltr"
                      placeholder="0911XXXXXXX"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)] text-sm text-right focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-full bg-white text-black font-black text-base hover:opacity-95 shadow-lg transition-all cursor-pointer mt-4 disabled:opacity-50"
                >
                  {isSubmitting ? "در حال ثبت..." : "ثبت رزرو نوبت"}
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-8 max-w-4xl mx-auto text-right">
            <div>
              <h2 className="text-3xl font-black">تماس با ما</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">مرکز درمانی پارسیان عباس‌آباد</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-6">
                <h3 className="text-xl font-bold">اطلاعات مرکز</h3>
                <div className="space-y-5 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold">آدرس:</span>
                      <span className="text-[var(--muted-foreground)]">مازندران، عباس‌آباد، خیابان اصلی، روبروی شهرداری، درمانگاه پارسیان</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="size-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold">تلفن مستقیم:</span>
                      <span className="text-[var(--muted-foreground)] font-bold text-lg" dir="ltr">۰۱۱ ۵۴۶۲ ۷۰۲۲</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="size-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold">ساعت پذیرش:</span>
                      <span className="text-[var(--muted-foreground)]">شبانه‌روزی (۲۴ ساعته) بدون تعطیلی</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-red-400">اورژانس و فوریت</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    تیم اورژانس درمانگاه پارسیان با حضور پزشکان مقیم و کادر پرستاری آماده خدمت‌رسانی در کلیه سوانح و فوریت‌های پزشکی می‌باشد.
                  </p>
                </div>
                <a 
                  href="tel:01154627022"
                  className="h-12 rounded-full bg-red-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-red-700 transition-colors"
                >
                  <Phone className="size-4" />
                  تماس با اورژانس پارسیان
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)]/50 mt-16 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <div className="size-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              پ
            </div>
            <span>درمانگاه شبانه‌روزی پارسیان عباس‌آباد · ۱۴۰۵</span>
          </div>
          <div className="flex gap-6">
            <button onClick={() => setActiveTab("home")} className="hover:text-amber-400 cursor-pointer">خانه</button>
            <button onClick={() => setActiveTab("services")} className="hover:text-amber-400 cursor-pointer">خدمات</button>
            <button onClick={() => setActiveTab("doctors")} className="hover:text-amber-400 cursor-pointer">پزشکان</button>
            <button onClick={() => setActiveTab("booking")} className="hover:text-amber-400 cursor-pointer">نوبت‌دهی</button>
            <button onClick={() => setActiveTab("contact")} className="hover:text-amber-400 cursor-pointer">تماس</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
