import { useState } from "react";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Check } from "lucide-react";
import { 
  toJalali, 
  toGregorian, 
  formatJalali, 
  jalaliWeekday, 
  JALALI_MONTHS, 
  JALALI_WEEKDAYS_SHORT 
} from "../lib/jalali";
import { cn } from "../lib/utils";

interface JalaliDatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const faDigits = (n: number | string) => String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

export default function JalaliDatePicker({ selectedDate, onChange }: JalaliDatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialJalali = toJalali(selectedDate);
  const [viewYear, setViewYear] = useState<number>(initialJalali.jy);
  const [viewMonth, setViewMonth] = useState<number>(initialJalali.jm); // 1-12

  // Quick Days
  const quickDays = [
    { label: "امروز", daysOffset: 0 },
    { label: "فردا", daysOffset: 1 },
    { label: "پس‌فردا", daysOffset: 2 },
    { label: "۳ روز بعد", daysOffset: 3 },
  ];

  const handleQuickSelect = (offset: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    onChange(d);
    const j = toJalali(d);
    setViewYear(j.jy);
    setViewMonth(j.jm);
  };

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calculate days in view month
  const getDaysInMonth = (jy: number, jm: number): number => {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    // Check if day 30 of Esfand belongs to Esfand
    try {
      const gDate30 = toGregorian(jy, 12, 30);
      const jDate30 = toJalali(gDate30);
      return jDate30.jm === 12 ? 30 : 29;
    } catch {
      return 29;
    }
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);

  // First day of month weekday
  const firstDayGregorian = toGregorian(viewYear, viewMonth, 1);
  const startWeekday = jalaliWeekday(firstDayGregorian); // 0 (Shanbe) to 6 (Jomeh)

  // Current selected Jalali date
  const selJalali = toJalali(selectedDate);
  const todayJalali = toJalali(today);

  // Generate calendar days
  const calendarCells = [];

  // Empty cells before first day
  for (let i = 0; i < startWeekday; i++) {
    calendarCells.push(null);
  }

  // Days 1 to daysInMonth
  for (let day = 1; day <= daysInMonth; day++) {
    const dayGregorian = toGregorian(viewYear, viewMonth, day);
    dayGregorian.setHours(0, 0, 0, 0);

    const isPast = dayGregorian.getTime() < today.getTime();
    const isSelected = 
      selJalali.jy === viewYear && 
      selJalali.jm === viewMonth && 
      selJalali.jd === day;
    const isToday = 
      todayJalali.jy === viewYear && 
      todayJalali.jm === viewMonth && 
      todayJalali.jd === day;

    calendarCells.push({
      day,
      date: dayGregorian,
      isPast,
      isSelected,
      isToday
    });
  }

  return (
    <div className="rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)] p-4 sm:p-5 space-y-4 text-right">
      {/* Top Banner: Selected Date Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <span className="text-[11px] text-[var(--muted-foreground)] block">تاریخ شمسی انتخاب‌شده:</span>
          <span className="text-base font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
            <CalendarIcon className="size-4 text-amber-400" />
            {formatJalali(selectedDate, { weekday: true, year: true })}
          </span>
        </div>

        {/* Quick select pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {quickDays.map((q) => {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + q.daysOffset);
            const isMatch = targetDate.toDateString() === selectedDate.toDateString();

            return (
              <button
                key={q.label}
                type="button"
                onClick={() => handleQuickSelect(q.daysOffset)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                  isMatch 
                    ? "bg-amber-500 text-black border-amber-500 shadow-sm" 
                    : "bg-[var(--card)] hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-white border-[var(--border)]"
                )}
              >
                {q.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Jalali Calendar Header: Month + Navigation */}
      <div className="flex items-center justify-between px-2 pt-1">
        <button
          type="button"
          onClick={nextMonth}
          className="size-8 rounded-lg bg-[var(--card)] hover:bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-white cursor-pointer transition-colors"
          title="ماه بعد"
        >
          <ChevronRight className="size-4" />
        </button>

        <div className="text-sm font-black text-white">
          <span>{JALALI_MONTHS[viewMonth - 1]}</span>{" "}
          <span className="text-amber-400 font-mono">{faDigits(viewYear)}</span>
        </div>

        <button
          type="button"
          onClick={prevMonth}
          className="size-8 rounded-lg bg-[var(--card)] hover:bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-white cursor-pointer transition-colors"
          title="ماه قبل"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[var(--muted-foreground)] pb-1">
        {JALALI_WEEKDAYS_SHORT.map((w, idx) => (
          <div key={idx} className={cn("py-1", idx === 6 && "text-red-400")}>
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarCells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="h-9" />;
          }

          const { day, date, isPast, isSelected, isToday } = cell;

          return (
            <button
              key={`day-${day}`}
              type="button"
              disabled={isPast}
              onClick={() => onChange(date)}
              className={cn(
                "h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative",
                isPast 
                  ? "opacity-25 cursor-not-allowed text-[var(--muted-foreground)]" 
                  : isSelected
                    ? "bg-amber-500 text-black font-black shadow-md shadow-amber-500/20 scale-105 z-10 cursor-pointer"
                    : isToday
                      ? "border border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                      : "hover:bg-[var(--card)] text-white/90 hover:text-white cursor-pointer"
              )}
            >
              <span>{faDigits(day)}</span>
              {isToday && !isSelected && (
                <span className="absolute bottom-1 size-1 rounded-full bg-emerald-400" />
              )}
              {isSelected && (
                <Check className="absolute top-1 left-1 size-2.5 text-black" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
