import type { Locale, Marketplace } from "./types";

export const EPOCH_UTC = Date.UTC(2024, 4, 12);

export const MARKETS: Record<
  Marketplace,
  { currency: string; rate: number; flag: string; zh: string; en: string; demand: number }
> = {
  US: { currency: "USD", rate: 1, flag: "🇺🇸", zh: "亚马逊美国", en: "Amazon US", demand: 1 },
  UK: { currency: "GBP", rate: 0.78, flag: "🇬🇧", zh: "亚马逊英国", en: "Amazon UK", demand: 0.78 },
  DE: { currency: "EUR", rate: 0.92, flag: "🇩🇪", zh: "亚马逊德国", en: "Amazon DE", demand: 0.84 },
  JP: { currency: "JPY", rate: 151, flag: "🇯🇵", zh: "亚马逊日本", en: "Amazon JP", demand: 0.88 },
};

export function simDate(day: number) {
  return new Date(EPOCH_UTC + day * 86400000);
}

export function formatSimDate(day: number, locale: Locale) {
  const d = simDate(day);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const dayNum = d.getUTCDate();
  if (locale === "zh") return `${y}年${m}月${dayNum}日`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${dayNum}, ${y}`;
}

export function formatSimStamp(day: number, minutes: number, locale: Locale) {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const d = formatSimDate(day, locale);
  if (locale === "zh") return `${d} ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  const suffix = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${d} ${h12}:${String(mm).padStart(2, "0")} ${suffix}`;
}

export function formatRange(from: number, to: number, locale: Locale) {
  return `${formatSimDate(from, locale)} – ${formatSimDate(to, locale)}`;
}

export function formatMoney(usd: number, market: Marketplace, locale: Locale, digits?: number) {
  const { currency, rate } = MARKETS[market];
  const value = usd * rate;
  const fraction = digits ?? (currency === "JPY" ? 0 : Math.abs(value) >= 1000 ? 0 : 2);
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(value);
}

export function formatMoneyExact(usd: number, market: Marketplace, locale: Locale) {
  const { currency, rate } = MARKETS[market];
  const fraction = currency === "JPY" ? 0 : 2;
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(usd * rate);
}

export function formatInt(n: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US").format(Math.round(n));
}

export function formatPct(n: number, digits = 1) {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(digits)}%`;
}

export function formatShanghai(iso: string, locale: Locale) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function downloadCsv(filename: string, rows: string[][]) {
  const escape = (cell: string) => {
    if (/[",\n]/.test(cell)) return `"${cell.replaceAll('"', '""')}"`;
    return cell;
  };
  const csv = rows.map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}
