export type Locale = "zh" | "en";
export type Role = "learner" | "admin";
export type Marketplace = "US" | "UK" | "DE" | "JP";

export type Bi = { zh: string; en: string };

export type CategoryId =
  | "home"
  | "sports"
  | "beauty"
  | "pet"
  | "electronics"
  | "office"
  | "baby"
  | "tools";

export type BadgeKind = "bestseller" | "trending" | "highDemand" | "niche";

export type Product = {
  id: string;
  name: Bi;
  category: CategoryId;
  subcategory: Bi;
  price: number;
  rating: number;
  reviews: number;
  demand: number;
  competition: number;
  monthlySales: number;
  unitCost: number;
  fbaFee: number;
  inbound: number;
  leadDays: number;
  badge?: BadgeKind;
  /** Curated score. Generated products compute one. */
  overallScore?: number;
  featured?: boolean;
  lowStock?: boolean;
};

export type RiskKey = "quality" | "delivery" | "compliance" | "capital" | "logistics";

export type Supplier = {
  id: string;
  productId: string;
  archetype: "steady" | "rapid" | "bargain";
  name: Bi;
  region: Bi;
  unitCost: number;
  moq: number;
  leadDays: number;
  paymentTerms: Bi;
  risks: Record<RiskKey, number>;
  certifications: string[];
  note: Bi;
};

export type SimParams = {
  referralRate: number;
  returnRate: number;
  refundLossRate: number;
  returnHandling: number;
  adRate: number;
  opsPerUnit: number;
  capitalAnnual: number;
  opportunityRate: number;
  coverDays: number;
  riskWeights: Record<RiskKey, number>;
};

export type FilterState = {
  category: CategoryId | "all";
  price: [number, number];
  stars4: boolean;
  stars3: boolean;
  stars2: boolean;
  unrated: boolean;
  demand: [number, number];
  competition: [number, number];
  margin: [number, number];
  sort: "overall" | "demand" | "competition" | "margin" | "profit" | "price";
  view: "grid" | "list";
};

export type SavedFilter = {
  id: string;
  name: string;
  filter: FilterState;
};

export type Purchase = {
  id: string;
  productId: string;
  supplierId: string;
  supplierName: Bi;
  qty: number;
  unitCost: number;
  risk: number;
  orderedDay: number;
  etaDay: number;
  status: "in_transit" | "received";
  highRisk: boolean;
};

export type Listing = {
  id: string;
  productId: string;
  sku: string;
  title: string;
  price: number;
  status: "draft" | "live" | "suppressed";
  reason?: Bi;
  createdDay: number;
  seed?: boolean;
};

export type CampaignType = "SP" | "SB" | "SD";

export type Campaign = {
  id: string;
  name: string;
  type: CampaignType;
  status: "enabled" | "paused";
  productIds: string[];
  dailyBudget: number;
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  seed?: boolean;
};

export type LedgerEntry = {
  id: string;
  day: number;
  minutes: number;
  orderId: string;
  customerId: string;
  type: "sale" | "refund";
  productId: string;
  title: Bi;
  qty: number;
  amount: number;
  cogs: number;
  payment: number;
  shipping: number;
  other: number;
  method: string;
};

export type SimAlert = {
  id: string;
  kind: "orders" | "returns" | "inventory" | "listing";
  title: Bi;
  detail: Bi;
  day: number;
};

export type Lesson = {
  id: string;
  title: Bi;
  minutes: number;
  summary: Bi;
  points: Bi[];
  formula?: {
    title: Bi;
    expression: string;
    expanded: string;
    note: Bi;
    highlights: Bi[];
    parts: { title: Bi; detail: Bi }[];
  };
  simHref: string;
  simLabel: Bi;
};

export type Chapter = {
  id: string;
  title: Bi;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: Bi;
  summary: Bi;
  level: "foundation" | "practice" | "advanced";
  icon: "market" | "sourcing" | "store" | "growth" | "logistics" | "finance" | "data" | "service" | "ip" | "capstone";
  chapters: Chapter[];
};

export type GlossaryCategory =
  | "ads"
  | "logistics"
  | "finance"
  | "catalog"
  | "ops"
  | "compliance"
  | "metrics";

export type GlossaryTerm = {
  id: string;
  abbr: string;
  name: Bi;
  category: GlossaryCategory;
  summary: Bi;
  detail: Bi;
  formula?: string;
  example?: Bi;
};

export type Article = {
  id: string;
  title: Bi;
  summary: Bi;
  minutes: number;
  body: Bi[];
  termIds: string[];
};

export type CaseStudy = {
  id: string;
  title: Bi;
  tag: Bi;
  result: "win" | "loss" | "mixed";
  summary: Bi;
  context: Bi;
  steps: Bi[];
  lesson: Bi;
  simHref: string;
};

export type Faq = { id: string; q: Bi; a: Bi };

export type Reply = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type Post = {
  id: string;
  author: string;
  title: string;
  body: string;
  tag: string;
  createdAt: string;
  replies: Reply[];
};

export type Classmate = {
  handle: string;
  xp: number;
  lessons: number;
  lastActive: string;
};
