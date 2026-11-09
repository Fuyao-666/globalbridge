import { PRODUCTS, productById } from "./catalog";
import { DEFAULT_PARAMS, unitEconomics } from "./economics";
import { MARKETS, round2 } from "./format";
import type {
  Campaign,
  LedgerEntry,
  Listing,
  Marketplace,
  Product,
  Purchase,
  SimAlert,
  SimParams,
} from "./types";

export type SimData = {
  simDay: number;
  purchases: Purchase[];
  listings: Listing[];
  campaigns: Campaign[];
  ledger: LedgerEntry[];
  inventory: Record<string, number>;
  visitors: Record<number, number>;
  adSpendByDay: Record<number, number>;
  alerts: SimAlert[];
  orderSeq: number;
};

const DAY_WEIGHT = [0.86, 0.94, 1.08, 1.0, 0.9, 1.12, 1.22];
const METHODS = ["Visa ···· 4242", "Mastercard ···· 8888", "PayPal", "Visa ···· 1991", "Apple Pay"];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(input: string) {
  let h = 2166136261;
  for (const char of input) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return h >>> 0;
}

function skuFor(productId: string) {
  return `US-${productId.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase()}`;
}

type Mutable = {
  inventory: Record<string, number>;
  ledger: LedgerEntry[];
  visitors: Record<number, number>;
  adSpendByDay: Record<number, number>;
  orderSeq: number;
};

function pushOrders(
  bag: Mutable,
  day: number,
  product: Product,
  units: number,
  params: SimParams,
  rng: () => number,
) {
  let left = units;
  let sales = 0;
  while (left > 0) {
    const qty = Math.min(left, 1 + Math.floor(rng() * 2));
    left -= qty;
    const eco = unitEconomics(product, params);
    const amount = round2(product.price * qty);
    const cogs = round2(eco.procurement * qty);
    const payment = round2(amount * 0.035 + 0.3);
    const shipping = round2((eco.fba + eco.inbound) * qty);
    const other = round2((eco.referral + eco.labor + eco.returns + eco.capital + eco.opportunity) * qty);
    const minutes = Math.floor(rng() * 24 * 60);
    bag.orderSeq += 1;
    const orderId = `ORD-${10000 + bag.orderSeq}`;
    const entry: LedgerEntry = {
      id: `led-${orderId}`,
      day,
      minutes,
      orderId: `#${orderId}`,
      customerId: `CUST-${2000 + (hash(orderId) % 8000)}`,
      type: "sale",
      productId: product.id,
      title: product.name,
      qty,
      amount,
      cogs,
      payment,
      shipping,
      other,
      method: METHODS[bag.orderSeq % METHODS.length],
    };
    bag.ledger.push(entry);
    sales += 1;
    if (rng() < 0.045) {
      bag.orderSeq += 1;
      const refundId = `ORD-${10000 + bag.orderSeq}`;
      bag.ledger.push({
        id: `led-${refundId}`,
        day,
        minutes: Math.min(24 * 60 - 1, minutes + 30 + Math.floor(rng() * 90)),
        orderId: `#${refundId}`,
        customerId: entry.customerId,
        type: "refund",
        productId: product.id,
        title: product.name,
        qty,
        amount: round2(-amount * 0.92),
        cogs: round2(-cogs * 0.35),
        payment: round2(payment * 0.25),
        shipping: 0,
        other: round2(other * 0.1),
        method: entry.method,
      });
    }
  }
  return sales;
}

function enabledBudget(campaigns: Campaign[], productId: string) {
  return campaigns
    .filter((campaign) => campaign.status === "enabled")
    .filter((campaign) => campaign.productIds.length === 0 || campaign.productIds.includes(productId))
    .reduce((sum, campaign) => sum + campaign.dailyBudget, 0);
}

function sellListings(
  bag: Mutable,
  day: number,
  listings: Listing[],
  campaigns: Campaign[],
  params: SimParams,
  weight: number,
) {
  const rng = mulberry32(hash(`day-${day}`) ^ 0x9e3779b9);
  let orders = 0;
  for (const listing of listings) {
    if (listing.status !== "live") continue;
    const product = productById(listing.productId);
    if (!product) continue;
    const stock = bag.inventory[product.id] ?? 0;
    if (stock <= 0) continue;
    const budget = enabledBudget(campaigns, product.id);
    const lift = 1 + Math.min(1.1, budget / 28);
    const units = Math.max(0, Math.round((product.monthlySales / 30) * weight * lift * (0.88 + rng() * 0.24)));
    const sold = Math.min(stock, units);
    if (sold <= 0) continue;
    bag.inventory[product.id] = stock - sold;
    orders += pushOrders(bag, day, product, sold, params, rng);
  }
  bag.visitors[day] = Math.max(orders, Math.round(orders / 0.0368));
  return orders;
}

function accrueCampaigns(campaigns: Campaign[], day: number, listings: Listing[]) {
  const liveIds = new Set(listings.filter((listing) => listing.status === "live").map((listing) => listing.productId));
  let spendToday = 0;
  const next = campaigns.map((campaign) => {
    if (campaign.status !== "enabled") return campaign;
    const targeted = campaign.productIds.length === 0 ? [...liveIds] : campaign.productIds.filter((id) => liveIds.has(id));
    if (targeted.length === 0) return campaign;
    const rng = mulberry32(hash(`${campaign.id}-${day}`));
    const ctr = campaign.type === "SP" ? 0.0048 : campaign.type === "SB" ? 0.0034 : 0.0026;
    const cpc = campaign.type === "SP" ? 0.86 : campaign.type === "SB" ? 1.12 : 0.74;
    const impressions = Math.round(campaign.dailyBudget * (70 + rng() * 50));
    const clicks = Math.max(0, Math.round(impressions * ctr));
    const spend = round2(Math.min(campaign.dailyBudget, clicks * cpc * (0.85 + rng() * 0.3)));
    const adOrders = Math.max(0, Math.round(clicks * (0.07 + rng() * 0.04)));
    const prices = targeted.map((id) => productById(id)?.price ?? 24);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const sales = round2(adOrders * avg);
    spendToday += spend;
    return {
      ...campaign,
      impressions: campaign.impressions + impressions,
      clicks: campaign.clicks + clicks,
      spend: round2(campaign.spend + spend),
      sales: round2(campaign.sales + sales),
    };
  });
  return { campaigns: next, spendToday: round2(spendToday) };
}

export function buildAlerts(listings: Listing[], inventory: Record<string, number>, day: number): SimAlert[] {
  const alerts: SimAlert[] = [];
  for (const listing of listings) {
    if (listing.status === "suppressed") {
      alerts.push({
        id: `alert-sup-${listing.id}`,
        kind: "listing",
        day,
        title: { zh: "链接被抑制", en: "Listing suppressed" },
        detail: listing.reason ?? {
          zh: `${listing.title} 无法售卖。`,
          en: `${listing.title} cannot be sold.`,
        },
      });
    }
    if (listing.status === "live" && (inventory[listing.productId] ?? 0) <= 5) {
      const product = productById(listing.productId);
      alerts.push({
        id: `alert-stock-${listing.id}`,
        kind: "inventory",
        day,
        title: { zh: "库存偏低", en: "Low stock" },
        detail: {
          zh: `${product?.name.zh ?? listing.title} 剩余 ${inventory[listing.productId] ?? 0} 件。`,
          en: `${product?.name.en ?? listing.title} has ${inventory[listing.productId] ?? 0} units left.`,
        },
      });
    }
  }
  return alerts;
}

const PROTOTYPE_CAMPAIGNS: Omit<Campaign, "id" | "productIds">[] = [
  { name: "ACME | SP | Best Sellers", type: "SP", status: "enabled", dailyBudget: 80, impressions: 156782, clicks: 2843, spend: 4562.31, sales: 28731.52 },
  { name: "ACME | SB | Brand Campaign", type: "SB", status: "enabled", dailyBudget: 60, impressions: 98421, clicks: 1256, spend: 2987.64, sales: 17892.4 },
  { name: "ACME | SP | New Launches", type: "SP", status: "paused", dailyBudget: 40, impressions: 45231, clicks: 672, spend: 1345.22, sales: 6782.19 },
  { name: "ACME | SD | Remarketing", type: "SD", status: "enabled", dailyBudget: 35, impressions: 203654, clicks: 1987, spend: 1876.55, sales: 8945.31 },
  { name: "ACME | SB | Competitor Targeting", type: "SB", status: "paused", dailyBudget: 25, impressions: 32118, clicks: 389, spend: 982.11, sales: 3214.67 },
];

function openingCampaigns(revenue: number, featuredIds: string[]): Campaign[] {
  const extras: Omit<Campaign, "id" | "productIds">[] = [
    { name: "ACME | SP | Exact Winners", type: "SP", status: "enabled", dailyBudget: 22, impressions: 18440, clicks: 310, spend: 248, sales: 1620 },
    { name: "ACME | SP | Category Auto", type: "SP", status: "paused", dailyBudget: 18, impressions: 40210, clicks: 240, spend: 310, sales: 980 },
    { name: "ACME | SD | Views Retargeting", type: "SD", status: "enabled", dailyBudget: 16, impressions: 55200, clicks: 410, spend: 286, sales: 1344 },
    { name: "ACME | SB | Video Intro", type: "SB", status: "paused", dailyBudget: 20, impressions: 22110, clicks: 180, spend: 210, sales: 760 },
    { name: "ACME | SP | Long Tail", type: "SP", status: "enabled", dailyBudget: 12, impressions: 9800, clicks: 150, spend: 96, sales: 640 },
    { name: "Kitchen | SP | Tools", type: "SP", status: "enabled", dailyBudget: 15, impressions: 12440, clicks: 205, spend: 164, sales: 990 },
    { name: "Kitchen | SP | Storage", type: "SP", status: "paused", dailyBudget: 10, impressions: 6400, clicks: 70, spend: 88, sales: 240 },
    { name: "Brand | SD | Cross Sell", type: "SD", status: "enabled", dailyBudget: 14, impressions: 30012, clicks: 260, spend: 175, sales: 802 },
    { name: "Launch | SP | Thermometer", type: "SP", status: "enabled", dailyBudget: 18, impressions: 8900, clicks: 166, spend: 142, sales: 870 },
    { name: "Launch | SP | Plant Stand", type: "SP", status: "paused", dailyBudget: 12, impressions: 4200, clicks: 48, spend: 61, sales: 188 },
    { name: "Defense | SP | Brand Terms", type: "SP", status: "enabled", dailyBudget: 8, impressions: 3600, clicks: 120, spend: 54, sales: 510 },
    { name: "Test | SB | Collection", type: "SB", status: "paused", dailyBudget: 15, impressions: 5100, clicks: 44, spend: 70, sales: 190 },
    { name: "Test | SD | Competitor Views", type: "SD", status: "paused", dailyBudget: 11, impressions: 7700, clicks: 39, spend: 48, sales: 120 },
  ];
  const drafts = [...PROTOTYPE_CAMPAIGNS, ...extras];
  const spendSum = drafts.reduce((sum, campaign) => sum + campaign.spend, 0);
  const target = Math.max(120, revenue * 0.1);
  const factor = target / spendSum;
  return drafts.map((campaign, index) => {
    const productIds =
      campaign.type === "SB" || campaign.name.includes("Brand") || campaign.name.includes("Remarketing")
        ? []
        : featuredIds.slice(index % 3, (index % 3) + 2);
    return {
      id: `cmp-${index + 1}`,
      ...campaign,
      productIds,
      impressions: Math.round(campaign.impressions * factor),
      clicks: Math.max(1, Math.round(campaign.clicks * factor)),
      spend: round2(campaign.spend * factor),
      sales: round2(campaign.sales * factor),
      dailyBudget: Math.max(8, round2(campaign.dailyBudget * Math.min(1, factor * 4))),
      seed: true,
    };
  });
}

export function buildOpeningStore(params: SimParams = DEFAULT_PARAMS): SimData {
  const featured = PRODUCTS.filter((product) => product.featured);
  const low = PRODUCTS.filter((product) => product.lowStock).slice(0, 3);
  const suppressedProducts = ["g-beauty-0", "g-pet-0"].map((id) => productById(id)!);
  const inventory: Record<string, number> = {};
  const listings: Listing[] = [];

  featured.forEach((product) => {
    inventory[product.id] = Math.round(product.monthlySales * 2.4);
    listings.push({
      id: `lst-${product.id}`,
      productId: product.id,
      sku: skuFor(product.id),
      title: product.name.en,
      price: product.price,
      status: "live",
      createdDay: 0,
      seed: true,
    });
  });
  low.forEach((product) => {
    inventory[product.id] = 3;
    listings.push({
      id: `lst-${product.id}`,
      productId: product.id,
      sku: skuFor(product.id),
      title: product.name.en,
      price: product.price,
      status: "live",
      createdDay: 0,
      seed: true,
    });
  });
  suppressedProducts.forEach((product) => {
    inventory[product.id] = 80;
    listings.push({
      id: `lst-${product.id}`,
      productId: product.id,
      sku: skuFor(product.id),
      title: product.name.en,
      price: product.price,
      status: "suppressed",
      reason: {
        zh: "供应商合规风险过高，链接被抑制。广告无法带来可售订单。",
        en: "Supplier compliance risk is too high, so the listing is suppressed. Ads cannot buy a sellable order.",
      },
      createdDay: 0,
      seed: true,
    });
  });

  const bag: Mutable = { inventory, ledger: [], visitors: {}, adSpendByDay: {}, orderSeq: 40 };
  for (let day = -7; day < 0; day++) {
    const weight = DAY_WEIGHT[(day + 14) % 7] * 0.72;
    sellListings(bag, day, listings, [], params, weight);
    const priorSales = bag.ledger
      .filter((row) => row.day === day && row.type === "sale")
      .reduce((sum, row) => sum + row.amount, 0);
    bag.adSpendByDay[day] = round2(priorSales * 0.128);
  }
  for (let day = 0; day < 7; day++) {
    sellListings(bag, day, listings, [], params, DAY_WEIGHT[day]);
  }
  const revenue = bag.ledger.filter((row) => row.day >= 0 && row.type === "sale").reduce((sum, row) => sum + row.amount, 0);
  const campaigns = openingCampaigns(revenue, featured.map((product) => product.id));
  const totalSpend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
  const dayRevenue = DAY_WEIGHT.map((_, day) =>
    bag.ledger.filter((row) => row.day === day && row.type === "sale").reduce((sum, row) => sum + row.amount, 0),
  );
  const revenueSum = dayRevenue.reduce((sum, value) => sum + value, 0) || 1;
  dayRevenue.forEach((value, day) => {
    bag.adSpendByDay[day] = round2(totalSpend * (value / revenueSum));
  });

  return {
    simDay: 6,
    purchases: [],
    listings,
    campaigns,
    ledger: bag.ledger.sort(compareLedger),
    inventory: bag.inventory,
    visitors: bag.visitors,
    adSpendByDay: bag.adSpendByDay,
    alerts: buildAlerts(listings, bag.inventory, 6),
    orderSeq: bag.orderSeq,
  };
}

function compareLedger(a: LedgerEntry, b: LedgerEntry) {
  if (a.day !== b.day) return b.day - a.day;
  return b.minutes - a.minutes;
}

export function advanceDays(data: SimData, days: number, params: SimParams): SimData {
  const next: SimData = {
    ...data,
    purchases: data.purchases.map((purchase) => ({ ...purchase })),
    listings: data.listings.map((listing) => ({ ...listing })),
    campaigns: data.campaigns.map((campaign) => ({ ...campaign })),
    ledger: data.ledger.slice(),
    inventory: { ...data.inventory },
    visitors: { ...data.visitors },
    adSpendByDay: { ...data.adSpendByDay },
    alerts: data.alerts.slice(),
  };
  for (let step = 0; step < days; step++) {
    const day = next.simDay + 1;
    next.purchases = next.purchases.map((purchase) => {
      if (purchase.status === "received") return purchase;
      if (day >= purchase.etaDay) {
        next.inventory[purchase.productId] = (next.inventory[purchase.productId] ?? 0) + purchase.qty;
        return { ...purchase, status: "received" };
      }
      return { ...purchase, status: "in_transit" };
    });
    const bag: Mutable = {
      inventory: next.inventory,
      ledger: next.ledger,
      visitors: next.visitors,
      adSpendByDay: next.adSpendByDay,
      orderSeq: next.orderSeq,
    };
    const weight = 0.9 + ((day * 17) % 10) / 25;
    sellListings(bag, day, next.listings, next.campaigns, params, weight);
    const accrued = accrueCampaigns(next.campaigns, day, next.listings);
    next.campaigns = accrued.campaigns;
    next.adSpendByDay[day] = accrued.spendToday;
    next.orderSeq = bag.orderSeq;
    next.simDay = day;
    next.alerts = buildAlerts(next.listings, next.inventory, day);
  }
  next.ledger = next.ledger.sort(compareLedger);
  return next;
}

export function priceForMargin(product: Product, params: SimParams, margin: number) {
  const keep = 1 - params.referralRate - margin;
  if (keep <= 0.08) return round2(product.price);
  return round2((product.unitCost + product.fbaFee) / keep);
}

export function marketDemand(market: Marketplace) {
  return MARKETS[market].demand;
}
