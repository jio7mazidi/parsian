import { en } from "./utils";

export function normalizeIranMobile(input: string): string {
  let d = en(input).replace(/\D/g, "");
  if (d.startsWith("0098")) d = d.slice(4);
  else if (d.startsWith("98") && d.length > 10) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
}

export function isIranMobile(input: string): boolean {
  return /^9\d{9}$/.test(normalizeIranMobile(input));
}

export function formatIranMobile(input: string): string {
  const d = normalizeIranMobile(input);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(" ");
}
