"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CASES } from "@/lib/data/content";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function CasePage() {
  const params = useParams<{ id: string }>();
  const locale = useStore((state) => state.locale);
  const item = CASES.find((entry) => entry.id === params.id);
  if (!item) return <p className="text-sm text-muted-foreground">{locale === "zh" ? "没有这个案例。" : "Case not found."}</p>;
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/cases" className="text-sm text-muted-foreground">{locale === "zh" ? "返回案例库" : "Back"}</Link>
      <h1 className="mt-2 text-2xl font-semibold">{item.title[locale]}</h1>
      <p className="mt-3 text-sm leading-6">{item.context[locale]}</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
        {item.steps.map((step) => <li key={step.zh}>{step[locale]}</li>)}
      </ol>
      <p className="mt-4 rounded-xl bg-primary/5 p-3 text-sm">{item.lesson[locale]}</p>
      <Button asChild className="mt-4 h-9"><Link href={item.simHref}>{locale === "zh" ? "去模拟器里走一遍" : "Walk it in the simulator"}</Link></Button>
    </article>
  );
}
