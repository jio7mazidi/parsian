import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Lock, LogOut, RefreshCw, Search, Phone, 
  CheckCircle2, Clock, XCircle, FileSpreadsheet, 
  Copy, Check, User, AlertCircle, ArrowRight
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatJalali } from "../lib/jalali";
import { cn } from "../lib/utils";

export interface BookingRecord {
  id: string;
  created_at: string;
  tracking_code: string;
  patient_name: string;
  patient_phone: string;
  service_id: string;
  service_name: string;
  booking_date: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface ReceptionPanelProps {
  onBackToSite: () => void;
}

export default function ReceptionPanel({ onBackToSite }: ReceptionPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("parsian_reception_auth") === "true";
  });
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Authentication check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: parsian1405
    if (password === "parsian1405" || password === "1405") {
      setIsAuthenticated(true);
      sessionStorage.setItem("parsian_reception_auth", "true");
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("parsian_reception_auth");
    setPassword("");
  };

  // Fetch bookings from Supabase
  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        setNotice("خطا در بارگذاری اطلاعات از دیتابیس.");
      } else if (data) {
        setBookings(data as BookingRecord[]);
      }
    } catch (err) {
      console.error("Fetch exception:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated]);

  // Update status in Supabase & local state
  const handleStatusChange = async (id: string, newStatus: BookingRecord["status"]) => {
    setUpdatingId(id);
    // Optimistic local update
    const previous = [...bookings];
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));

    try {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Update error:", error);
        setNotice("تغییر وضعیت فقط در صفحه ذخیره شد. برای ذخیره دائمی، دسترسی Update در دیتابیس فعال گردد.");
      } else if (!data || data.length === 0) {
        // RLS might block silent update
        setNotice("وضعیت تغییر کرد (در صورت عدم اعمال در دیتابیس، سیاست RLS برای UPDATE در Supabase فعال شود).");
      }
    } catch (e) {
      console.error("Update failure:", e);
      setBookings(previous);
      alert("خطا در برقراری ارتباط با دیتابیس.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Copy tracking or phone
  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export to Excel / CSV with UTF-8 BOM
  const exportToCSV = () => {
    if (bookings.length === 0) {
      alert("هیچ نوبتی برای خروجی وجود ندارد.");
      return;
    }

    const headers = ["کد پیگیری", "نام بیمار", "شماره تماس", "خدمت/پزشک", "تاریخ نوبت", "وضعیت", "تاریخ ثبت"];
    const statusMap: Record<string, string> = {
      pending: "در انتظار تماس",
      confirmed: "تأیید شده",
      completed: "ویزیت انجام شد",
      cancelled: "لغو شده"
    };

    const rows = bookings.map(b => [
      b.tracking_code,
      `"${b.patient_name}"`,
      b.patient_phone,
      `"${b.service_name}"`,
      b.booking_date,
      statusMap[b.status] || b.status,
      new Date(b.created_at).toLocaleDateString("fa-IR")
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `nobat-parsian-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter bookings
  const filteredBookings = bookings.filter(item => {
    const matchesSearch = 
      item.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patient_phone?.includes(searchQuery) ||
      item.tracking_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.service_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  // Format date helper
  const formatReadableDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return formatJalali(d, { weekday: true, year: true });
    } catch {
      return dateStr;
    }
  };

  // Format registration time helper
  const formatRegistrationTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return `${formatJalali(d)} - ${d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return isoStr;
    }
  };

  // Status Badge Component
  const StatusBadge = ({ status }: { status: BookingRecord["status"] }) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="size-3" />
            در انتظار تماس
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="size-3" />
            تأیید شده
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Check className="size-3" />
            ویزیت شد
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            <XCircle className="size-3" />
            لغو شده
          </span>
        );
      default:
        return null;
    }
  };

  // 1. Login View
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl text-right">
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <div className="size-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
              <ShieldCheck className="size-8" />
            </div>
            <div>
              <h2 className="text-xl font-black">پنل پذیرش و مدیریت نوبت‌ها</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">درمانگاه شبانه‌روزی پارسیان عباس‌آباد</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-2">
                رمز عبور پذیرش:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="رمز ورود را وارد کنید..."
                  className="w-full h-12 px-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)] focus:border-amber-500 focus:outline-none text-left"
                  dir="ltr"
                  autoFocus
                />
                <Lock className="absolute right-3.5 top-3.5 size-5 text-[var(--muted-foreground)]" />
              </div>
              {passwordError && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="size-3.5" />
                  رمز عبور اشتباه است (رمز پیش‌فرض: parsian1405)
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-amber-500 text-black font-black text-sm hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              ورود به سیستم پذیرش
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
            <button
              onClick={onBackToSite}
              className="text-xs text-[var(--muted-foreground)] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowRight className="size-3.5" />
              بازگشت به وب‌سایت اصلی
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-right">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">داشبورد پذیرش درمانگاه پارسیان</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                آنلاین و متصل
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">مدیریت لحظه‌ای نوبت‌های دریافتی از بیماران</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <button
            onClick={loadBookings}
            disabled={loading}
            className="h-10 px-4 rounded-xl bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[var(--border)]"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin text-amber-400")} />
            به‌روزرسانی
          </button>
          <button
            onClick={exportToCSV}
            className="h-10 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/30"
          >
            <FileSpreadsheet className="size-3.5" />
            خروجی اکسل
          </button>
          <button
            onClick={onBackToSite}
            className="h-10 px-4 rounded-xl bg-[var(--card)] hover:bg-[var(--secondary)] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-[var(--border)]"
          >
            مشاهده سایت
          </button>
          <button
            onClick={handleLogout}
            className="h-10 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-red-900/40"
            title="خروج از پنل"
          >
            <LogOut className="size-3.5" />
            خروج
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-amber-400 hover:text-white text-xs font-bold px-2 py-1">
            بستن
          </button>
        </div>
      )}

      {/* Quick Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
          <div className="text-xs text-[var(--muted-foreground)] font-medium mb-1">کل نوبت‌های ثبت‌شده</div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
        </div>
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-900/40 shadow-sm">
          <div className="text-xs text-amber-400 font-medium mb-1 flex items-center gap-1">
            <Clock className="size-3" />
            در انتظار بررسی و تماس
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.pending}</div>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 shadow-sm">
          <div className="text-xs text-emerald-400 font-medium mb-1 flex items-center gap-1">
            <CheckCircle2 className="size-3" />
            تأییدشده توسط پذیرش
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.confirmed}</div>
        </div>
        <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-900/40 shadow-sm">
          <div className="text-xs text-blue-400 font-medium mb-1 flex items-center gap-1">
            <Check className="size-3" />
            ویزیت شده یا پایان یافته
          </div>
          <div className="text-2xl font-black text-blue-400">{stats.completed}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-3.5 size-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام بیمار، شماره موبایل یا کد پیگیری..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-10 pl-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)] text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { id: "all", label: `همه (${stats.total})` },
            { id: "pending", label: `در انتظار (${stats.pending})` },
            { id: "confirmed", label: `تأیید شده (${stats.confirmed})` },
            { id: "completed", label: `ویزیت شد (${stats.completed})` },
            { id: "cancelled", label: `لغو شده (${stats.cancelled})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={cn(
                "px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer",
                statusFilter === f.id
                  ? "bg-amber-500 text-black"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List / Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-16 text-center text-xs text-[var(--muted-foreground)] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="size-6 animate-spin text-amber-400" />
            در حال دریافت آخرین نوبت‌ها از دیتابیس...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center text-xs text-[var(--muted-foreground)] space-y-2">
            <p className="text-base font-bold text-white">هیچ نوبتی یافت نشد</p>
            <p>موردی مطابق با فیلتر یا عبارت جستجوی شما وجود ندارد.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/40 text-[var(--muted-foreground)] font-bold">
                    <th className="py-4 px-5">کد پیگیری</th>
                    <th className="py-4 px-5">نام بیمار</th>
                    <th className="py-4 px-5">شماره تماس</th>
                    <th className="py-4 px-5">خدمت / پزشک</th>
                    <th className="py-4 px-5">تاریخ نوبت</th>
                    <th className="py-4 px-5">زمان ثبت</th>
                    <th className="py-4 px-5">وضعیت</th>
                    <th className="py-4 px-5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[var(--secondary)]/20 transition-colors">
                      {/* Tracking code */}
                      <td className="py-4 px-5 font-mono font-bold text-amber-400">
                        <div className="flex items-center gap-2">
                          <span>{b.tracking_code}</span>
                          <button
                            onClick={() => copyText(b.tracking_code, b.id)}
                            className="text-[var(--muted-foreground)] hover:text-white cursor-pointer"
                            title="کپی کد پیگیری"
                          >
                            {copiedId === b.id ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-4 px-5 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <User className="size-3.5 text-[var(--muted-foreground)]" />
                          <span>{b.patient_name}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-5 font-mono" dir="ltr">
                        <a
                          href={`tel:${b.patient_phone}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--secondary)] hover:bg-amber-500 hover:text-black font-bold text-xs transition-colors"
                        >
                          <Phone className="size-3" />
                          <span>{b.patient_phone}</span>
                        </a>
                      </td>

                      {/* Service */}
                      <td className="py-4 px-5 font-medium text-white/90">
                        {b.service_name}
                      </td>

                      {/* Booking Date */}
                      <td className="py-4 px-5 text-[var(--foreground)]">
                        <div className="font-bold">{formatReadableDate(b.booking_date)}</div>
                        <div className="text-[10px] text-[var(--muted-foreground)] font-mono">{b.booking_date}</div>
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-5 text-[var(--muted-foreground)]">
                        {formatRegistrationTime(b.created_at)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <StatusBadge status={b.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          {b.status !== "confirmed" && (
                            <button
                              onClick={() => handleStatusChange(b.id, "confirmed")}
                              disabled={updatingId === b.id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                              title="تأیید نوبت"
                            >
                              تأیید
                            </button>
                          )}
                          {b.status !== "completed" && (
                            <button
                              onClick={() => handleStatusChange(b.id, "completed")}
                              disabled={updatingId === b.id}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                              title="ویزیت انجام شد"
                            >
                              انجام شد
                            </button>
                          )}
                          {b.status !== "cancelled" && (
                            <button
                              onClick={() => handleStatusChange(b.id, "cancelled")}
                              disabled={updatingId === b.id}
                              className="px-2.5 py-1 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                              title="لغو نوبت"
                            >
                              لغو
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="lg:hidden divide-y divide-[var(--border)]">
              {filteredBookings.map((b) => (
                <div key={b.id} className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-400">{b.tracking_code}</span>
                      <button
                        onClick={() => copyText(b.tracking_code, b.id)}
                        className="text-[var(--muted-foreground)] hover:text-white"
                      >
                        {copiedId === b.id ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                      </button>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[var(--muted-foreground)] block mb-0.5">نام بیمار:</span>
                      <span className="font-bold text-white">{b.patient_name}</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted-foreground)] block mb-0.5">خدمت انتخابی:</span>
                      <span className="font-medium text-white">{b.service_name}</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted-foreground)] block mb-0.5">تاریخ نوبت:</span>
                      <span className="font-bold text-amber-400">{formatReadableDate(b.booking_date)}</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted-foreground)] block mb-0.5">ثبت در سامانه:</span>
                      <span className="text-[var(--muted-foreground)]">{formatRegistrationTime(b.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] gap-2">
                    <a
                      href={`tel:${b.patient_phone}`}
                      className="flex-1 h-9 rounded-xl bg-amber-500 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <Phone className="size-3.5" />
                      تماس ({b.patient_phone})
                    </a>

                    <div className="flex items-center gap-1">
                      {b.status !== "confirmed" && (
                        <button
                          onClick={() => handleStatusChange(b.id, "confirmed")}
                          className="h-9 px-3 rounded-xl bg-emerald-600/20 text-emerald-400 text-xs font-bold"
                        >
                          تأیید
                        </button>
                      )}
                      {b.status !== "completed" && (
                        <button
                          onClick={() => handleStatusChange(b.id, "completed")}
                          className="h-9 px-3 rounded-xl bg-blue-600/20 text-blue-400 text-xs font-bold"
                        >
                          ویزیت
                        </button>
                      )}
                      {b.status !== "cancelled" && (
                        <button
                          onClick={() => handleStatusChange(b.id, "cancelled")}
                          className="h-9 px-3 rounded-xl bg-red-600/20 text-red-400 text-xs font-bold"
                        >
                          لغو
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
