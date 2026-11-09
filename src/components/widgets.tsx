"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { formatMoney, formatMoneyExact, formatPct, formatSimDate } from "@/lib/format";
import { summarizeRange } from "@/lib/selectors";
import { postPnl, useCredit } from "@/components/credit-dock";
import { useSession } from "@/components/session-bridge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Money({ usd, digits }: { usd: number; digits?: number }) {
  const locale = useStore((state) => state.locale);
  const market = useStore((state) => state.marketplace);
  return <>{formatMoney(usd, market, locale, digits)}</>;
}

export function ExactMoney({ usd }: { usd: number }) {
  const locale = useStore((state) => state.locale);
  const market = useStore((state) => state.marketplace);
  return <>{formatMoneyExact(usd, market, locale)}</>;
}

export function Pct({ value, digits = 1 }: { value: number; digits?: number }) {
  return <>{formatPct(value, digits)}</>;
}

export function EmptyState({ title, body, href, action }: { title: string; body: string; href?: string; action?: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      {href && action && (
        <Button asChild className="mt-4 h-9">
          <Link href={href}>{action}</Link>
        </Button>
      )}
    </div>
  );
}

export function ChainBar() {
  const locale = useStore((state) => state.locale);
  const advance = useStore((state) => state.advance);
  const simDay = useStore((state) => state.sim.simDay);
  const session = useSession();
  async function pushDays(days: number) {
    if (session.role !== "learner") {
      advance(days);
      return;
    }
    const current = useCredit.getState().balance ?? await useCredit.getState().refresh();
    if (current !== null && current <= 0) {
      toast.error(locale === "zh" ? "实训额度已用完，请先申请充值。" : "Training credit is used up. Request a top-up first.");
      useCredit.getState().setOpenApply(true);
      return;
    }
    const from = useStore.getState().sim.simDay;
    advance(days);
    const sim = useStore.getState().sim;
    const summary = summarizeRange(sim.ledger, sim.visitors, sim.adSpendByDay, from + 1, sim.simDay);
    const cash = summary.gross + summary.refunds - summary.payment - summary.shipping - summary.other - summary.ads;
    await postPnl(Math.round(cash * 100) / 100);
    const next = useCredit.getState().balance;
    if (next !== null && next <= 0) useCredit.getState().setOpenApply(true);
  }
  const steps = [
    { href: "/sim/selection", zh: "选品", en: "Select" },
    { href: "/sim/procurement", zh: "采购", en: "Buy" },
    { href: "/sim/listings", zh: "上架", en: "List" },
    { href: "/sim/ads", zh: "广告", en: "Ads" },
    { href: "/sim/dashboard", zh: "看板", en: "Board" },
  ];
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-card p-3 md:flex-row md:items-center">
      <div className="text-xs text-muted-foreground">
        {locale === "zh" ? "模拟日" : "Sim day"} · {formatSimDate(simDay, locale)}
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-1 text-sm">
        {steps.map((step, index) => (
          <span key={step.href} className="flex items-center gap-1">
            <Link href={step.href} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/15">
              {index + 1}. {locale === "zh" ? step.zh : step.en}
            </Link>
            {index < steps.length - 1 && <span className="text-muted-foreground">→</span>}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="h-8" onClick={() => void pushDays(1)}>{locale === "zh" ? "推进 1 天" : "Advance 1 day"}</Button>
        <Button className="h-8" onClick={() => void pushDays(7)}>{locale === "zh" ? "推进 7 天" : "Advance 7 days"}</Button>
      </div>
    </div>
  );
}

const ART_HUE: Record<string, string> = {
  home: "#dbeafe",
  sports: "#d1fae5",
  beauty: "#ffe4e6",
  pet: "#ffedd5",
  electronics: "#e0e7ff",
  office: "#e2e8f0",
  baby: "#fae8ff",
  tools: "#ecfccb",
};

function artSeed(id: string) {
  let h = 2166136261;
  for (const char of id) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function ProductArt({ id, category }: { id: string; category: string }) {
  const hero = HERO_ART[id];
  const seed = artSeed(id);
  const bg = ART_HUE[category] ?? ART_HUE.home;
  return (
    <div className="aspect-square overflow-hidden rounded-xl" style={{ background: bg }}>
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
        {hero ?? <GenericShape seed={seed} category={category} />}
      </svg>
    </div>
  );
}

function GenericShape({ seed, category }: { seed: number; category: string }) {
  const kind = seed % 3;
  const accent = category === "beauty" ? "#e11d48" : category === "sports" ? "#059669" : category === "electronics" ? "#4f46e5" : "#2563eb";
  if (kind === 0) {
    return (
      <>
        <rect x="34" y="28" width="52" height="64" rx="8" fill="#fff" />
        <rect x="42" y="40" width="36" height="8" rx="3" fill={accent} opacity="0.85" />
        <rect x="42" y="54" width="28" height="4" rx="2" fill="#cbd5e1" />
        <rect x="42" y="62" width="22" height="4" rx="2" fill="#cbd5e1" />
      </>
    );
  }
  if (kind === 1) {
    return (
      <>
        <ellipse cx="60" cy="86" rx="28" ry="8" fill="#000" opacity="0.06" />
        <path d="M40 78c0-22 8-40 20-40s20 18 20 40" fill="#fff" />
        <rect x="52" y="30" width="16" height="12" rx="3" fill={accent} />
        <rect x="56" y="22" width="8" height="10" rx="2" fill="#94a3b8" />
      </>
    );
  }
  return (
    <>
      <ellipse cx="60" cy="78" rx="34" ry="16" fill="#fff" />
      <ellipse cx="60" cy="70" rx="34" ry="14" fill="#fff" stroke={accent} strokeWidth="3" />
      <ellipse cx="60" cy="70" rx="16" ry="6" fill={accent} opacity="0.25" />
    </>
  );
}

const HERO_ART: Record<string, ReactNode> = {
  "p-colander": (
    <>
      <ellipse cx="60" cy="96" rx="30" ry="7" fill="#000" opacity="0.06" />
      <path d="M28 58c0 22 14 36 32 36s32-14 32-36" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M26 58h68" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <circle cx="48" cy="72" r="3" fill="#93c5fd" />
      <circle cx="60" cy="78" r="3" fill="#93c5fd" />
      <circle cx="72" cy="72" r="3" fill="#93c5fd" />
      <circle cx="54" cy="86" r="2.5" fill="#93c5fd" />
      <circle cx="68" cy="86" r="2.5" fill="#93c5fd" />
    </>
  ),
  "p-grinder": (
    <>
      <ellipse cx="60" cy="98" rx="22" ry="6" fill="#000" opacity="0.08" />
      <rect x="42" y="36" width="36" height="58" rx="8" fill="#1f2937" />
      <rect x="46" y="28" width="28" height="14" rx="4" fill="#9ca3af" />
      <circle cx="60" cy="24" r="6" fill="#d1d5db" />
      <rect x="50" y="58" width="20" height="3" rx="1.5" fill="#4b5563" />
    </>
  ),
  "p-thermo": (
    <>
      <rect x="46" y="34" width="28" height="18" rx="4" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
      <rect x="50" y="38" width="16" height="8" rx="1" fill="#111827" />
      <path d="M58 52h4l10 40h-24z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
      <path d="M70 70l18-16" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="90" cy="52" r="3" fill="#ef4444" />
    </>
  ),
  "p-plant": (
    <>
      <path d="M36 92h48l-6-28H42z" fill="#d6d3d1" />
      <rect x="40" y="88" width="40" height="6" rx="1" fill="#a8a29e" />
      <path d="M60 64c-14-4-22-18-16-28 8 2 16 12 16 28z" fill="#16a34a" />
      <path d="M60 64c14-2 24-14 18-26-8 4-16 14-18 26z" fill="#22c55e" />
      <path d="M60 66c-2-16 6-26 8-32-10 2-12 16-8 32z" fill="#15803d" />
    </>
  ),
  "p-soap": (
    <>
      <ellipse cx="60" cy="98" rx="16" ry="5" fill="#000" opacity="0.08" />
      <path d="M46 46h28v48a14 14 0 0 1-28 0z" fill="#b45309" />
      <path d="M48 50h24v20a12 12 0 0 1-24 0z" fill="#d97706" opacity="0.55" />
      <rect x="54" y="28" width="12" height="18" rx="2" fill="#e7e5e4" />
      <rect x="50" y="24" width="20" height="8" rx="3" fill="#a8a29e" />
    </>
  ),
  "p-blanket": (
    <>
      <path d="M24 40h72v18H24z" fill="#f5f5f4" stroke="#d6d3d1" />
      <path d="M28 58h68l-8 28H36z" fill="#fff" stroke="#d6d3d1" />
      <path d="M36 66h48M40 74h40M44 82h32" stroke="#e7e5e4" strokeWidth="3" />
    </>
  ),
  "p-jar": (
    <>
      <ellipse cx="60" cy="98" rx="20" ry="6" fill="#000" opacity="0.08" />
      <rect x="40" y="40" width="40" height="54" rx="10" fill="#e5e7eb" />
      <rect x="44" y="48" width="32" height="36" rx="6" fill="#9ca3af" />
      <rect x="46" y="30" width="28" height="12" rx="3" fill="#6b7280" />
      <rect x="52" y="24" width="16" height="8" rx="2" fill="#d1d5db" />
    </>
  ),
  "p-cable": (
    <>
      <rect x="28" y="46" width="64" height="40" rx="8" fill="#111827" />
      <rect x="36" y="54" width="48" height="10" rx="3" fill="#374151" />
      <path d="M44 64c6 10 8 10 14 0" stroke="#9ca3af" strokeWidth="2" fill="none" />
      <rect x="48" y="36" width="24" height="10" rx="2" fill="#1f2937" />
    </>
  ),
};

export function ScorePill({ score }: { score: number }) {
  const tone = score >= 80 ? "bg-emerald-500" : "bg-amber-500";
  return <span className={cn("grid size-9 place-items-center rounded-lg text-sm font-semibold text-white", tone)}>{score}</span>;
}

export function PageIntro({ kicker, title, body }: { kicker?: string; title: string; body?: string }) {
  return (
    <div className="mb-5">
      {kicker && <div className="text-xs font-medium tracking-wide text-primary uppercase">{kicker}</div>}
      <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
      {body && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{body}</p>}
    </div>
  );
}
