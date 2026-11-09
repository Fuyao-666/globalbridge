import { round2 } from "./format";
import type { Product, Supplier } from "./types";

function hash(input: string) {
  let h = 2166136261;
  for (const char of input) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return h >>> 0;
}

function jitter(seed: number, spread: number) {
  const n = (seed % 1000) / 1000;
  return (n - 0.5) * spread;
}

export function suppliersFor(product: Product): Supplier[] {
  const seed = hash(product.id);
  const base = product.unitCost;
  const steady: Supplier = {
    id: `${product.id}-steady`,
    productId: product.id,
    archetype: "steady",
    name: { zh: "义乌稳健供应链", en: "Yiwu Steady Supply" },
    region: { zh: "浙江义乌 · 一般贸易", en: "Yiwu, Zhejiang · general trade" },
    unitCost: round2(base * (1.06 + jitter(seed, 0.04))),
    moq: 200,
    leadDays: 7,
    paymentTerms: { zh: "30% 定金，见提单付尾款", en: "30% deposit, balance against bill of lading" },
    risks: {
      quality: 18 + (seed % 7),
      delivery: 22,
      compliance: 16,
      capital: 28,
      logistics: 24,
    },
    certifications: ["ISO 9001", "BSCI"],
    note: { zh: "单价更高，质检和验厂记录完整，适合作为主供应商。", en: "Higher price, complete QC and audit records. Fit for a primary supplier." },
  };
  const rapid: Supplier = {
    id: `${product.id}-rapid`,
    productId: product.id,
    archetype: "rapid",
    name: { zh: "深圳迅达智造", en: "Shenzhen Rapid Works" },
    region: { zh: "广东深圳 · 9810 出口", en: "Shenzhen, Guangdong · 9810 export" },
    unitCost: round2(base * (0.98 + jitter(seed >> 3, 0.04))),
    moq: 100,
    leadDays: 2,
    paymentTerms: { zh: "50% 定金，发货前付清", en: "50% deposit, balance before shipment" },
    risks: {
      quality: 36 + (seed % 9),
      delivery: 18,
      compliance: 42,
      capital: 40,
      logistics: 26,
    },
    certifications: ["ISO 9001"],
    note: { zh: "交期短，能配合小单试销。合规文件要逐单核对。", en: "Short lead time for a test order. Check compliance documents on every PO." },
  };
  const bargain: Supplier = {
    id: `${product.id}-bargain`,
    productId: product.id,
    archetype: "bargain",
    name: { zh: "广州低价工贸", en: "Guangzhou Bargain Trading" },
    region: { zh: "广东广州 · 市场采购", en: "Guangzhou, Guangdong · market sourcing" },
    unitCost: round2(base * (0.8 + jitter(seed >> 6, 0.03))),
    moq: 500,
    leadDays: 12,
    paymentTerms: { zh: "70% 定金，不接受第三方验货", en: "70% deposit, no third-party inspection" },
    risks: {
      quality: 68,
      delivery: 58,
      compliance: 82,
      capital: 74,
      logistics: 63,
    },
    certifications: [],
    note: {
      zh: "单价看起来能把毛利率做高，但知识产权和批次一致性风险高，上架后可能被抑制。",
      en: "The unit cost inflates gross margin, but IP and batch consistency are weak. Listings may be suppressed.",
    },
  };
  return [steady, rapid, bargain];
}

export function supplierById(product: Product, id: string) {
  return suppliersFor(product).find((supplier) => supplier.id === id);
}
