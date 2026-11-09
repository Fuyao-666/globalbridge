"use client";

import Link from "next/link";
import { CASES } from "@/lib/data/content";
import { useStore } from "@/lib/store";
import { PageIntro } from "@/components/widgets";
import { cn } from "@/lib/utils";

export default function CasesPage() {
  const locale = useStore((state) => state.locale);
  return (
    <div>
      <PageIntro title={locale === "zh" ? "案例库" : "Cases"} body={locale === "zh" ? "三件在模拟器里走得通的事：验算毛利、停掉高 ACoS、以及低价货上不了架。" : "Three paths you can actually walk: check a margin, pause a high ACoS, and watch a cheap batch get suppressed."} />
      <div className="grid gap-3">
        {CASES.map((item) => (
          <Link key={item.id} href={`/cases/${item.id}`} className="rounded-2xl border bg-card p-4 hover:border-primary/40">
            <div className={cn("text-xs font-medium", item.result === "win" ? "text-emerald-600" : item.result === "loss" ? "text-destructive" : "text-amber-600")}>{item.tag[locale]}</div>
            <h2 className="mt-1 font-semibold">{item.title[locale]}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.summary[locale]}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
