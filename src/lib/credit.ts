export const OPENING_CREDIT = 500_000;

export function money2(value: number) {
  return Math.round(value * 100) / 100;
}

export function formatCredit(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export type CustomField = { id: string; key: string; value: string };
