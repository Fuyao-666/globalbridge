import { CATEGORIES } from "./catalog";
import { unitEconomics } from "./economics";
import { MARKETS, clamp } from "./format";
import type {
  Campaign,
  FilterState,
  LedgerEntry,
  Listing,
  Locale,
  Marketplace,
  Product,
  SimParams,
} from "./types";

export type ProductView = Product & {
  grossMargin: number;
  monthlyProfitUsd: number;
  trueProfitUsd: number;
  trueMargin: number;
  overall: number;
  demandAdj: number;
  eco: ReturnType<typeof unitEconomics>;
};

export function presentProduct(product: Product, params: SimParams, market: Marketplace): ProductView {
  const eco = unitEconomics(product, params);
  const demandAdj = clamp(Math.round(product.demand * MARKETS[market].demand), 1, 99);
  const sales = product.monthlySales * MARKETS[market].demand;
  const overall =
    product.overallScore ??
    clamp(Math.round(demandAdj * 0.46 + (100 - product.competition) * 0.28 + eco.grossMargin * 100 * 0.36), 36, 97);
  return {
    ...product,
    eco,
    demandAdj,
    grossMargin: eco.grossMargin,
    monthlyProfitUsd: eco.grossUnit * sales,
    trueProfitUsd: eco.trueProfit * sales,
    trueMargin: eco.trueMargin,
    overall,
  };
}

export function matchesRating(product: ProductView, filter: FilterState) {
  if (product.rating === 0) return filter.unrated;
  if (product.rating >= 4) return filter.stars4;
  if (product.rating >= 3) return filter.stars3;
  if (product.rating >= 2) return filter.stars2;
  return false;
}

export function filterProducts(products: ProductView[], filter: FilterState) {
  return products.filter((product) => {
    if (filter.category !== "all" && product.category !== filter.category) return false;
    if (product.price < filter.price[0] || product.price > filter.price[1]) return false;
    if (product.demandAdj < filter.demand[0] || product.demandAdj > filter.demand[1]) return false;
    if (product.competition < filter.competition[0] || product.competition > filter.competition[1]) return false;
    const margin = product.grossMargin * 100;
    if (margin < filter.margin[0] || margin > filter.margin[1]) return false;
    return matchesRating(product, filter);
  });
}

export function sortProducts(products: ProductView[], sort: FilterState["sort"]) {
  const list = products.slice();
  list.sort((a, b) => {
    if (sort === "demand") return b.demandAdj - a.demandAdj;
    if (sort === "competition") return a.competition - b.competition;
    if (sort === "margin") return b.grossMargin - a.grossMargin;
    if (sort === "profit") return b.monthlyProfitUsd - a.monthlyProfitUsd;
    if (sort === "price") return a.price - b.price;
    return b.overall - a.overall;
  });
  return list;
}

export function ratingCounts(products: ProductView[]) {
  return {
    stars4: products.filter((product) => product.rating >= 4).length,
    stars3: products.filter((product) => product.rating >= 3 && product.rating < 4).length,
    stars2: products.filter((product) => product.rating >= 2 && product.rating < 3).length,
    unrated: products.filter((product) => product.rating === 0).length,
  };
}

export function categoryLabel(id: string, locale: Locale) {
  const found = CATEGORIES.find((category) => category.id === id);
  if (!found) return id;
  return locale === "zh" ? found.zh : found.en;
}

export type RangeSummary = {
  gross: number;
  refunds: number;
  orders: number;
  refundCount: number;
  aov: number;
  visitors: number;
  conversion: number;
  cogs: number;
  payment: number;
  shipping: number;
  other: number;
  ads: number;
  totalCost: number;
  profit: number;
  costRatio: number;
  byDay: { day: number; revenue: number; orders: number }[];
};

export function summarizeRange(
  ledger: LedgerEntry[],
  visitors: Record<number, number>,
  adSpendByDay: Record<number, number>,
  from: number,
  to: number,
): RangeSummary {
  const rows = ledger.filter((row) => row.day >= from && row.day <= to);
  const sales = rows.filter((row) => row.type === "sale");
  const refunds = rows.filter((row) => row.type === "refund");
  const gross = sales.reduce((sum, row) => sum + row.amount, 0);
  const refundValue = refunds.reduce((sum, row) => sum + row.amount, 0);
  const orders = sales.length;
  let visitorSum = 0;
  const byDay: RangeSummary["byDay"] = [];
  let ads = 0;
  for (let day = from; day <= to; day++) {
    const daySales = sales.filter((row) => row.day === day);
    byDay.push({
      day,
      revenue: daySales.reduce((sum, row) => sum + row.amount, 0),
      orders: daySales.length,
    });
    visitorSum += visitors[day] ?? 0;
    ads += adSpendByDay[day] ?? 0;
  }
  const cogs = rows.reduce((sum, row) => sum + row.cogs, 0);
  const payment = rows.reduce((sum, row) => sum + row.payment, 0);
  const shipping = rows.reduce((sum, row) => sum + row.shipping, 0);
  const other = rows.reduce((sum, row) => sum + row.other, 0);
  const totalCost = cogs + payment + shipping + other + ads;
  const netRevenue = gross + refundValue;
  return {
    gross,
    refunds: refundValue,
    orders,
    refundCount: refunds.length,
    aov: orders ? gross / orders : 0,
    visitors: visitorSum,
    conversion: visitorSum ? orders / visitorSum : 0,
    cogs,
    payment,
    shipping,
    other,
    ads,
    totalCost,
    profit: netRevenue - totalCost,
    costRatio: gross ? totalCost / gross : 0,
    byDay,
  };
}

export function recentSlice(ledger: LedgerEntry[], day: number) {
  return ledger.filter((row) => row.day === day && row.minutes >= 16 * 60);
}

export function acosOf(campaign: Campaign) {
  if (campaign.sales <= 0) return null;
  return (campaign.spend / campaign.sales) * 100;
}

export function roasOf(campaign: Campaign) {
  if (campaign.spend <= 0) return null;
  return campaign.sales / campaign.spend;
}

export function inventoryHealth(
  listings: Listing[],
  inventory: Record<string, number>,
  ledger: LedgerEntry[],
  simDay: number,
) {
  const live = listings.filter((listing) => listing.status === "live");
  if (live.length === 0) return { score: 0, low: 0, labelKey: "empty" as const };
  let cover = 0;
  let low = 0;
  for (const listing of live) {
    const stock = inventory[listing.productId] ?? 0;
    if (stock <= 5) low += 1;
    const sold = ledger
      .filter((row) => row.type === "sale" && row.productId === listing.productId && row.day > simDay - 7 && row.day <= simDay)
      .reduce((sum, row) => sum + row.qty, 0);
    const daily = sold / 7;
    cover += daily > 0 ? stock / daily : 50;
  }
  const avg = cover / live.length;
  const score = clamp(Math.round(48 + avg * 0.9 - low * 6), 18, 96);
  const labelKey = score >= 75 ? "good" : score >= 55 ? "watch" : "poor";
  return { score, low, labelKey };
}
