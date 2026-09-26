import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const EN_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** Convert Latin digits to Persian digits */
export function fa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** Convert Persian/Arabic digits to Latin digits */
export function en(input: string): string {
  let s = String(input);
  for (let i = 0; i < 10; i++) {
    s = s.replace(new RegExp(FA_DIGITS[i], "g"), EN_DIGITS[i]);
  }
  return s.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
}

/** Format number with thousands separator «٬» and unit «تومان» */
export function formatToman(amount: number): string {
  const parts = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return `${fa(parts)} تومان`;
}

export function faPercent(n: number): string {
  return `${fa(n)}٪`;
}
