"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { productById } from "./catalog";
import { COURSE_DONE, COURSES, courseLessons } from "./data/courses";
import { SEED_POSTS } from "./data/content";
import { DEFAULT_PARAMS, clampParams, compositeRisk } from "./economics";
import { uid } from "./format";
import { advanceDays, buildAlerts, buildOpeningStore, type SimData } from "./sim";
import { supplierById } from "./suppliers";
import type {
  Bi,
  FilterState,
  GlossaryTerm,
  Locale,
  Marketplace,
  Post,
  Reply,
  Role,
  SavedFilter,
  SimParams,
} from "./types";

export const DEFAULT_FILTER: FilterState = {
  category: "home",
  price: [10, 80],
  stars4: true,
  stars3: true,
  stars2: true,
  unrated: false,
  demand: [30, 90],
  competition: [20, 70],
  margin: [20, 50],
  sort: "overall",
  view: "grid",
};

function seedLessons() {
  const ids: string[] = [];
  for (const course of COURSES) {
    const lessons = courseLessons(course);
    const done = COURSE_DONE[course.id] ?? 0;
    for (let i = 0; i < done && i < lessons.length; i++) ids.push(`${course.id}:${lessons[i].id}`);
  }
  return ids;
}

type Persisted = {
  locale: Locale;
  role: Role;
  profile: { name: string; handle: string };
  marketplace: Marketplace;
  params: SimParams;
  shortlist: string[];
  savedFilters: SavedFilter[];
  completedLessons: string[];
  completedAt: Record<string, string>;
  bookmarks: string[];
  coursePublished: Record<string, boolean>;
  courseTitles: Record<string, Bi>;
  termEdits: Record<string, Partial<GlossaryTerm>>;
  customTerms: GlossaryTerm[];
  hiddenTerms: string[];
  favoriteTerms: string[];
  termHistory: string[];
  posts: Post[];
  readAlerts: string[];
  sim: SimData;
};

type Actions = {
  setLocale: (locale: Locale) => void;
  setRole: (role: Role) => void;
  setProfile: (profile: { name: string; handle: string }) => void;
  setMarketplace: (marketplace: Marketplace) => void;
  setParams: (params: SimParams) => void;
  resetParams: () => void;
  toggleShortlist: (productId: string) => void;
  saveFilter: (name: string, filter: FilterState) => void;
  deleteFilter: (id: string) => void;
  placeOrder: (input: { productId: string; supplierId: string; qty: number; acknowledge: boolean }) => { ok: true } | { ok: false; error: string };
  createDrafts: (productIds: string[], margin: number) => void;
  updateListing: (id: string, patch: { title?: string; price?: number }) => void;
  publishListings: (ids: string[]) => { published: number; suppressed: number };
  createCampaign: (input: { name: string; type: "SP" | "SB" | "SD"; dailyBudget: number; productIds: string[] }) => void;
  setCampaignStatus: (ids: string[], status: "enabled" | "paused") => void;
  duplicateCampaign: (id: string) => void;
  advance: (days: number) => void;
  toggleLesson: (courseId: string, lessonId: string) => void;
  toggleBookmark: (courseId: string, lessonId: string) => void;
  setCoursePublished: (courseId: string, published: boolean) => void;
  setCourseTitle: (courseId: string, title: Bi) => void;
  completeCourse: (courseId: string) => void;
  saveTerm: (term: GlossaryTerm, isNew: boolean) => void;
  hideTerm: (id: string) => void;
  toggleFavoriteTerm: (id: string) => void;
  touchTerm: (id: string) => void;
  addPost: (input: { title: string; body: string; tag: string }) => void;
  addReply: (postId: string, body: string) => void;
  markAlertsRead: () => void;
  resetSimulation: () => void;
  resetProgress: () => void;
};

export type Store = Persisted & Actions;

function opening(): Persisted {
  return {
    locale: "zh",
    role: "learner",
    profile: { name: "探索者_88", handle: "探索者_88" },
    marketplace: "US",
    params: DEFAULT_PARAMS,
    shortlist: ["p-colander", "p-thermo", "p-soap", "g-home-6"],
    savedFilters: [],
    completedLessons: seedLessons(),
    completedAt: {},
    bookmarks: [],
    coursePublished: {},
    courseTitles: {},
    termEdits: {},
    customTerms: [],
    hiddenTerms: [],
    favoriteTerms: [],
    termHistory: [],
    posts: SEED_POSTS,
    readAlerts: [],
    sim: buildOpeningStore(DEFAULT_PARAMS),
  };
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...opening(),
      setLocale: (locale) => set({ locale }),
      setRole: (role) => set({ role }),
      setProfile: (profile) => set({ profile: { name: profile.name.slice(0, 24), handle: profile.handle.slice(0, 24) } }),
      setMarketplace: (marketplace) => set({ marketplace }),
      setParams: (params) => set({ params: clampParams(params) }),
      resetParams: () => set({ params: DEFAULT_PARAMS }),
      toggleShortlist: (productId) =>
        set({
          shortlist: get().shortlist.includes(productId)
            ? get().shortlist.filter((id) => id !== productId)
            : [...get().shortlist, productId],
        }),
      saveFilter: (name, filter) =>
        set({
          savedFilters: [{ id: uid("flt"), name: name.slice(0, 40), filter }, ...get().savedFilters].slice(0, 12),
        }),
      deleteFilter: (id) => set({ savedFilters: get().savedFilters.filter((filter) => filter.id !== id) }),
      placeOrder: ({ productId, supplierId, qty, acknowledge }) => {
        const product = productById(productId);
        if (!product) return { ok: false, error: "missing" };
        const supplier = supplierById(product, supplierId);
        if (!supplier) return { ok: false, error: "missing" };
        if (!Number.isFinite(qty) || qty < supplier.moq) return { ok: false, error: "moq" };
        if (qty > 20000) return { ok: false, error: "qty" };
        const risk = compositeRisk(supplier, get().params.riskWeights);
        if (risk >= 60 && !acknowledge) return { ok: false, error: "risk" };
        const sim = get().sim;
        const purchase = {
          id: uid("po"),
          productId,
          supplierId,
          supplierName: supplier.name,
          qty: Math.round(qty),
          unitCost: supplier.unitCost,
          risk,
          orderedDay: sim.simDay,
          etaDay: sim.simDay + supplier.leadDays,
          status: "in_transit" as const,
          highRisk: risk >= 60,
        };
        set({ sim: { ...sim, purchases: [purchase, ...sim.purchases] } });
        return { ok: true };
      },
      createDrafts: (productIds, margin) => {
        const sim = get().sim;
        const params = get().params;
        let listings = sim.listings.map((listing) => ({ ...listing }));
        for (const productId of productIds) {
          const product = productById(productId);
          if (!product) continue;
          const price = priceFromMargin(product.unitCost, product.fbaFee, params.referralRate, margin, product.price);
          const title = `${product.name.en} | ${product.subcategory.en}`;
          const index = listings.findIndex((listing) => listing.productId === productId && listing.status !== "suppressed");
          if (index >= 0) {
            listings[index] = { ...listings[index], title, price };
            continue;
          }
          const stock = sim.inventory[productId] ?? 0;
          listings = [
            {
              id: uid("lst"),
              productId,
              sku: `US-${product.id.slice(-6).toUpperCase()}-${String(listings.length + 1).padStart(2, "0")}`,
              title,
              price,
              status: "draft",
              createdDay: sim.simDay,
              reason: stock <= 0 ? { zh: "还没有入库库存，只能保存草稿。", en: "No received stock yet, so this stays a draft." } : undefined,
            },
            ...listings,
          ];
        }
        set({ sim: { ...sim, listings } });
      },
      updateListing: (id, patch) =>
        set({
          sim: {
            ...get().sim,
            listings: get().sim.listings.map((listing) => (listing.id === id ? { ...listing, ...patch } : listing)),
          },
        }),
      publishListings: (ids) => {
        const sim = get().sim;
        let published = 0;
        let suppressed = 0;
        const listings = sim.listings.map((listing) => {
          if (!ids.includes(listing.id)) return listing;
          if (listing.seed && listing.status === "suppressed") return listing;
          const stock = sim.inventory[listing.productId] ?? 0;
          const latest = sim.purchases
            .filter((purchase) => purchase.productId === listing.productId && purchase.status === "received")
            .sort((a, b) => b.etaDay - a.etaDay || b.orderedDay - a.orderedDay)[0];
          if (latest?.highRisk && (stock > 0 || listing.status === "live")) {
            suppressed += 1;
            return {
              ...listing,
              status: "suppressed" as const,
              reason: {
                zh: "最近一批入库来自高合规风险供应商，链接已抑制。",
                en: "The latest receipt came from a high compliance-risk supplier, so the listing is suppressed.",
              },
            };
          }
          if (listing.status === "live") return listing;
          if (stock <= 0) return listing;
          published += 1;
          return { ...listing, status: "live" as const, reason: undefined };
        });
        set({
          sim: {
            ...sim,
            listings,
            alerts: buildAlerts(listings, sim.inventory, sim.simDay),
          },
        });
        return { published, suppressed };
      },
      createCampaign: ({ name, type, dailyBudget, productIds }) => {
        const sim = get().sim;
        const campaign = {
          id: uid("cmp"),
          name: name.slice(0, 60),
          type,
          status: "enabled" as const,
          productIds,
          dailyBudget,
          impressions: 0,
          clicks: 0,
          spend: 0,
          sales: 0,
        };
        set({ sim: { ...sim, campaigns: [campaign, ...sim.campaigns] } });
      },
      setCampaignStatus: (ids, status) =>
        set({
          sim: {
            ...get().sim,
            campaigns: get().sim.campaigns.map((campaign) => (ids.includes(campaign.id) ? { ...campaign, status } : campaign)),
          },
        }),
      duplicateCampaign: (id) => {
        const sim = get().sim;
        const source = sim.campaigns.find((campaign) => campaign.id === id);
        if (!source) return;
        set({
          sim: {
            ...sim,
            campaigns: [
              {
                ...source,
                id: uid("cmp"),
                name: `${source.name} copy`.slice(0, 60),
                status: "paused",
                impressions: 0,
                clicks: 0,
                spend: 0,
                sales: 0,
                seed: false,
              },
              ...sim.campaigns,
            ],
          },
        });
      },
      advance: (days) => set({ sim: advanceDays(get().sim, days, get().params) }),
      toggleLesson: (courseId, lessonId) => {
        const key = `${courseId}:${lessonId}`;
        const has = get().completedLessons.includes(key);
        set({
          completedLessons: has ? get().completedLessons.filter((id) => id !== key) : [...get().completedLessons, key],
          completedAt: has ? get().completedAt : { ...get().completedAt, [key]: new Date().toISOString() },
        });
      },
      toggleBookmark: (courseId, lessonId) => {
        const key = `${courseId}:${lessonId}`;
        set({
          bookmarks: get().bookmarks.includes(key) ? get().bookmarks.filter((id) => id !== key) : [...get().bookmarks, key],
        });
      },
      setCoursePublished: (courseId, published) =>
        set({ coursePublished: { ...get().coursePublished, [courseId]: published } }),
      setCourseTitle: (courseId, title) => set({ courseTitles: { ...get().courseTitles, [courseId]: title } }),
      completeCourse: (courseId) => {
        const course = COURSES.find((item) => item.id === courseId);
        if (!course) return;
        const keys = courseLessons(course).map((lesson) => `${courseId}:${lesson.id}`);
        const now = new Date().toISOString();
        const completedAt = { ...get().completedAt };
        for (const key of keys) if (!completedAt[key]) completedAt[key] = now;
        set({ completedLessons: Array.from(new Set([...get().completedLessons, ...keys])), completedAt });
      },
      saveTerm: (term, isNew) => {
        if (isNew) set({ customTerms: [term, ...get().customTerms.filter((item) => item.id !== term.id)] });
        else set({ termEdits: { ...get().termEdits, [term.id]: term } });
      },
      hideTerm: (id) =>
        set({
          hiddenTerms: get().hiddenTerms.includes(id) ? get().hiddenTerms : [...get().hiddenTerms, id],
          customTerms: get().customTerms.filter((term) => term.id !== id),
        }),
      toggleFavoriteTerm: (id) =>
        set({
          favoriteTerms: get().favoriteTerms.includes(id)
            ? get().favoriteTerms.filter((termId) => termId !== id)
            : [...get().favoriteTerms, id],
        }),
      touchTerm: (id) => set({ termHistory: [id, ...get().termHistory.filter((termId) => termId !== id)].slice(0, 20) }),
      addPost: ({ title, body, tag }) => {
        const post: Post = {
          id: uid("post"),
          author: get().profile.handle || "探索者_88",
          title: title.slice(0, 80),
          body: body.slice(0, 2000),
          tag: tag.slice(0, 12),
          createdAt: new Date().toISOString(),
          replies: [],
        };
        set({ posts: [post, ...get().posts] });
      },
      addReply: (postId, body) => {
        const reply: Reply = {
          id: uid("reply"),
          author: get().profile.handle || "探索者_88",
          body: body.slice(0, 1000),
          createdAt: new Date().toISOString(),
        };
        set({
          posts: get().posts.map((post) => (post.id === postId ? { ...post, replies: [...post.replies, reply] } : post)),
        });
      },
      markAlertsRead: () => set({ readAlerts: get().sim.alerts.map((alert) => alert.id) }),
      resetSimulation: () => set({ sim: buildOpeningStore(get().params), shortlist: ["p-colander", "p-thermo", "p-soap", "g-home-6"], readAlerts: [] }),
      resetProgress: () =>
        set({
          completedLessons: [],
          completedAt: {},
          bookmarks: [],
          favoriteTerms: [],
          termHistory: [],
        }),
    }),
    {
      name: "globalbridge-account-pending",
      skipHydration: true,
      version: 2,
      partialize: (state) => ({
        locale: state.locale,
        role: state.role,
        profile: state.profile,
        marketplace: state.marketplace,
        params: state.params,
        shortlist: state.shortlist,
        savedFilters: state.savedFilters,
        completedLessons: state.completedLessons,
        completedAt: state.completedAt,
        bookmarks: state.bookmarks,
        coursePublished: state.coursePublished,
        courseTitles: state.courseTitles,
        termEdits: state.termEdits,
        customTerms: state.customTerms,
        hiddenTerms: state.hiddenTerms,
        favoriteTerms: state.favoriteTerms,
        termHistory: state.termHistory,
        posts: state.posts,
        readAlerts: state.readAlerts,
        sim: state.sim,
      }),
    },
  ),
);

function priceFromMargin(unitCost: number, fba: number, referral: number, margin: number, fallback: number) {
  const keep = 1 - referral - margin;
  if (keep <= 0.08) return Math.round(fallback * 100) / 100;
  return Math.round(((unitCost + fba) / keep) * 100) / 100;
}

export function lessonDone(completed: string[], courseId: string, lessonId: string) {
  return completed.includes(`${courseId}:${lessonId}`);
}

export function xpFrom(state: Pick<Store, "completedLessons" | "sim">) {
  const extraListings = state.sim.listings.filter((listing) => !listing.seed && listing.status === "live").length;
  const extraCampaigns = state.sim.campaigns.filter((campaign) => !campaign.seed).length;
  return 650 + state.completedLessons.length * 10 + state.sim.purchases.length * 20 + extraListings * 15 + extraCampaigns * 10;
}

export function levelFrom(xp: number) {
  return Math.max(1, Math.floor(xp / 500) + 1);
}
