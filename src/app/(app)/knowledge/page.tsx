"use client";

import Link from "next/link";
import { ARTICLES } from "@/lib/data/content";
import { useStore } from "@/lib/store";
import { PageIntro } from "@/components/widgets";

export default function KnowledgePage() {
  const locale = useStore((state) => state.locale);
  return (
    <div>
      <PageIntro title={locale === "zh" ? "知识库" : "Knowledge base"} body={locale === "zh" ? "短文解释模拟器里几个容易看错的口径。每篇都链到术语。" : "Short notes on the definitions that are easy to misread. Each one links to glossary terms."} />
      <div className="grid gap-3 md:grid-cols-2">
        {ARTICLES.map((article) => (
          <Link key={article.id} href={`/knowledge/${article.id}`} className="rounded-2xl border bg-card p-4 hover:border-primary/40">
            <div className="text-xs text-muted-foreground">{article.minutes} {locale === "zh" ? "分钟" : "min"}</div>
            <h2 className="mt-1 font-semibold">{article.title[locale]}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{article.summary[locale]}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
