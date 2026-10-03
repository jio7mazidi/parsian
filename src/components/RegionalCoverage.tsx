import { 
  MapPin, Navigation, Clock, Phone, ShieldCheck, 
  ExternalLink, Car, Zap, CheckCircle2
} from "lucide-react";

export default function RegionalCoverage() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[var(--card)] to-[var(--secondary)]/40 border border-[var(--border)] p-6 sm:p-10 shadow-2xl text-right">
      {/* Decorative ambient lights */}
      <div className="absolute top-0 right-1/4 size-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 size-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <Navigation className="size-3.5 animate-pulse" />
            مرکز درمانی و اورژانس معین متل قو (سلمان‌شهر) و نشتارود
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
            نزدیک‌ترین درمانگاه و کلینیک شبانه‌روزی به <span className="text-amber-400">متل قو</span> و <span className="text-emerald-400">نشتارود</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            درمانگاه پارسیان واقع در عباس‌آباد (خیابان امام، نبش کوچه شهید کلاهدوز)، به عنوان قطب درمانی غرب مازندران، نزدیک‌ترین مرکز مجهز پزشکی با دسترسی سریع ساحلی برای اهالی محترم و مسافران متل قو و نشتارود است.
          </p>
        </div>

        {/* Proximity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Motel Qoo */}
          <div className="p-6 rounded-2xl bg-[var(--background)]/60 border border-amber-500/20 hover:border-amber-500/40 transition-all shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">خدمات درمانگاه و کلینیک متل قو</h3>
                  <span className="text-[11px] text-amber-400/90 font-medium">سلمان‌شهر (برج‌های دوقلو تا درمانگاه)</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Car className="size-3" />
                ۵ تا ۱۰ دقیقه
              </span>
            </div>

            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              اگر در متل قو نیاز به پزشک اورژانس، تزریقات شبانه‌روزی، متخصصین داخلی، گوارش، قلب، یا دندانپزشکی دارید، درمانگاه پارسیان در فاصله کمتر از ۸ کیلومتری، با کادر ۱۰ نفره پزشکان مقیم در ۲۴ ساعت شبانه‌روز آماده پذیرش شماست.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-1 rounded-md bg-[var(--secondary)] text-white/80 flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-400" /> دسترسی مستقیم از جاده ساحلی
              </span>
              <span className="px-2 py-1 rounded-md bg-[var(--secondary)] text-white/80 flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-400" /> بدون ترافیک شهری
              </span>
            </div>
          </div>

          {/* Card 2: Nashtarood */}
          <div className="p-6 rounded-2xl bg-[var(--background)]/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-all shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">خدمات درمانگاه و کلینیک نشتارود</h3>
                  <span className="text-[11px] text-emerald-400/90 font-medium">میدان نشتارود تا درمانگاه پارسیان</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Car className="size-3" />
                ۸ تا ۱۲ دقیقه
              </span>
            </div>

            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              مراجعین محترم از نشتارود بدون نیاز به مراجعه به بیمارستان‌ها یا مراکز دورتر، می‌توانند با چند دقیقه رانندگی به کلیه خدمات اورژانس شبانه‌روزی، جراحی‌های سرپایی، بخیه، سرم‌تراپی و متخصصان کلینیک پارسیان دسترسی داشته باشند.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-1 rounded-md bg-[var(--secondary)] text-white/80 flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-400" /> پارکینگ آسان مراجعین
              </span>
              <span className="px-2 py-1 rounded-md bg-[var(--secondary)] text-white/80 flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-400" /> تریاژ و پذیرش فوری
              </span>
            </div>
          </div>
        </div>

        {/* Direct Navigation Links to Google Maps, Neshan, Balad, Waze */}
        <div className="p-6 rounded-2xl bg-[var(--secondary)]/50 border border-[var(--border)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Navigation className="size-4 text-emerald-400" />
                مسیریابی مستقیم با یک کلیک به درمانگاه پارسیان:
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                مازندران، عباس‌آباد، خیابان امام، نبش کوچه شهید کلاهدوز
              </p>
            </div>
            <a 
              href="tel:01154627022" 
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs transition-colors shadow-md"
            >
              <Phone className="size-3.5" />
              تماس فوری با اورژانس (۰۱۱۵۴۶۲۷۰۲۲)
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {/* Google Maps */}
            <a
              href="https://maps.google.com/?q=36.7265,51.1092"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-3 rounded-xl bg-[var(--background)] hover:bg-white hover:text-black border border-[var(--border)] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span className="size-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
              گوگل مپس (Google Maps)
              <ExternalLink className="size-3 opacity-60" />
            </a>

            {/* Neshan */}
            <a
              href="https://neshan.org/maps/search/درمانگاه-پارسیان-عباس-آباد"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-3 rounded-xl bg-[var(--background)] hover:bg-blue-600 hover:text-white border border-[var(--border)] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span className="size-2 rounded-full bg-blue-400 group-hover:scale-125 transition-transform" />
              مسیریاب نشان
              <ExternalLink className="size-3 opacity-60" />
            </a>

            {/* Balad */}
            <a
              href="https://balad.ir/search?q=درمانگاه+پارسیان+عباس+آباد"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-3 rounded-xl bg-[var(--background)] hover:bg-emerald-600 hover:text-white border border-[var(--border)] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span className="size-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
              مسیریاب بلد
              <ExternalLink className="size-3 opacity-60" />
            </a>

            {/* Waze */}
            <a
              href="https://waze.com/ul?ll=36.7265,51.1092&navigate=yes"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-3 rounded-xl bg-[var(--background)] hover:bg-cyan-600 hover:text-white border border-[var(--border)] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span className="size-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
              مسیریاب ویز (Waze)
              <ExternalLink className="size-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Key Features Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-[var(--background)]/40 border border-[var(--border)]">
            <Clock className="size-4 text-amber-400 mx-auto mb-1.5" />
            <span className="text-xs font-black block text-white">۲۴ ساعته شبانه‌روزی</span>
            <span className="text-[10px] text-[var(--muted-foreground)]">بدون تعطیلی</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--background)]/40 border border-[var(--border)]">
            <ShieldCheck className="size-4 text-emerald-400 mx-auto mb-1.5" />
            <span className="text-xs font-black block text-white">۱۰ پزشک مقیم</span>
            <span className="text-[10px] text-[var(--muted-foreground)]">آماده‌باش اورژانس</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--background)]/40 border border-[var(--border)]">
            <Zap className="size-4 text-blue-400 mx-auto mb-1.5" />
            <span className="text-xs font-black block text-white">سرم‌تراپی و تزریقات</span>
            <span className="text-[10px] text-[var(--muted-foreground)]">پذیرش فوری</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--background)]/40 border border-[var(--border)]">
            <Car className="size-4 text-purple-400 mx-auto mb-1.5" />
            <span className="text-xs font-black block text-white">دسترسی آسان ساحلی</span>
            <span className="text-[10px] text-[var(--muted-foreground)]">نبش کوچه کلاهدوز</span>
          </div>
        </div>
      </div>
    </section>
  );
}
