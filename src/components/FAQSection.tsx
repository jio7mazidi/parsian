import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    q: "نزدیک‌ترین درمانگاه شبانه‌روزی و اورژانس به متل قو (سلمان‌شهر) کجاست؟",
    a: "درمانگاه شبانه‌روزی پارسیان در عباس‌آباد (روبروی شهرداری) با فاصله زمانی ۵ الی ۱۰ دقیقه رانندگی مستقیم از برج‌های دوقلوی متل قو، نزدیک‌ترین و مجهزترین مرکز درمانی ۲۴ ساعته منطقه است که با ۱۰ پزشک مقیم، تریاژ و پرستاری آماده پذیرش بدون معطلی مراجعین و مسافران می‌باشد."
  },
  {
    q: "نزدیک‌ترین کلینیک تخصصی و اورژانس شبانه‌روزی به نشتارود کدام است؟",
    a: "درمانگاه پارسیان با فاصله کمتر از ۸ الی ۱۲ دقیقه از میدان نشتارود، کلیه خدمات اورژانسی، سرم‌تراپی، تزریقات، جراحی‌های سرپایی، نوار قلب و کلینیک‌های تخصصی را برای ساکنان محترم نشتارود فراهم آورده است و نیازی به مراجعه به بیمارستان‌های دوردست نیست."
  },
  {
    q: "چه پزشکان متخصصی در کلینیک پارسیان ویزیت دارند؟",
    a: "کلینیک تخصصی پارسیان دارای روزهای حضور هفتگی برای متخصص ارتوپدی (دکتر زانوسی - شنبه‌ها)، متخصص زنان و زایمان (دکتر علینژاد - یکشنبه‌ها)، فوق تخصص گوارش و کبد (دکتر نیک‌سیرت - دوشنبه‌ها)، متخصص قلب و عروق (دکتر شورمیج - سه‌شنبه‌ها)، متخصص مغز و اعصاب (دکتر صالحی - سه‌شنبه‌ها)، متخصص داخلی (دکتر جورابراهیمیان - چهارشنبه‌ها)، تغذیه و کاهش وزن (دکتر مزیدی) و زیبایی (دکتر محبعلی) است."
  },
  {
    q: "آیا برای خدمات اورژانس، تزریقات و سرم‌تراپی نیاز به دریافت نوبت قبلی است؟",
    a: "خیر، بخش اورژانس، تریاژ، سرم‌تراپی، تزریقات و جراحی‌های سرپایی به صورت شبانه‌روزی (۲۴ ساعته و بدون تعطیلی) به صورت حضوری و بدون نیاز به نوبت قبلی در خدمت کلیه بیماران عزیز است."
  },
  {
    q: "سیستم نوبت‌دهی آنلاین چگونه کار می‌کند و آیا پیامک تأیید ارسال می‌شود؟",
    a: "شما می‌توانید از طریق فرم نوبت‌دهی آنلاین در سایت، خدمت و تاریخ مورد نظرتان را انتخاب کرده و ثبت کنید. بلافاصله یک کد پیگیری منحصربه‌فرد (مانند PRS-...) برای شما صادر شده و پیامک تأیید رسمی از سامانه پیامکی درمانگاه به شماره همراه شما ارسال می‌شود."
  },
  {
    q: "شماره تماس مستقیم اورژانس و آدرس دقیق درمانگاه پارسیان چیست؟",
    a: "تلفن مستقیم و شبانه‌روزی درمانگاه ۰۱۱۵۴۶۲۷۰۲۲ است. آدرس: مازندران، شهرستان عباس‌آباد، خیابان اصلی ساحلی، روبروی شهرداری، درمانگاه شبانه‌روزی پارسیان."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-10 shadow-xl space-y-6 text-right">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
          <HelpCircle className="size-5" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white">سوالات متداول مراجعین و بیماران</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">پاسخ به سوالات پرتکرار درباره خدمات شبانه‌روزی متل قو، نشتارود و عباس‌آباد</p>
        </div>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {FAQ_LIST.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-4">
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between text-right gap-4 cursor-pointer group"
                aria-expanded={isOpen}
              >
                <span className={cn(
                  "text-sm sm:text-base font-bold transition-colors",
                  isOpen ? "text-amber-400" : "text-white group-hover:text-amber-300"
                )}>
                  {faq.q}
                </span>
                <ChevronDown className={cn(
                  "size-5 text-[var(--muted-foreground)] shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180 text-amber-400"
                )} />
              </button>

              {isOpen && (
                <div className="mt-3 text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed bg-[var(--secondary)]/30 p-4 rounded-xl border border-[var(--border)]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
