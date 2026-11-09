"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ARTICLES } from "@/lib/data/content";
import { GLOSSARY } from "@/lib/data/glossary";
import { useStore } from "@/lib/store";

export default function ArticlePage() {
  const params = useParams<{ id: string }>();
  const locale = useStore((state) => state.locale);
  const article = ARTICLES.find((item) => item.id === params.id);
  if (!article) return <p className="text-sm text-muted-foreground">{locale === "zh" ? "没有这篇文章。" : "Article not found."}</p>;
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/knowledge" className="text-sm text-muted-foreground hover:text-foreground">{locale === "zh" ? "返回知识库" : "Back"}</Link>
      <h1 className="mt-2 text-2xl font-semibold">{article.title[locale]}</h1>
      <div className="mt-4 space-y-4 text-sm leading-6">
        {article.body.map((paragraph) => <p key={paragraph.zh}>{paragraph[locale]}</p>)}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {article.termIds.map((id) => {
          const term = GLOSSARY.find((item) => item.id === id);
          return <Link key={id} href={`/glossary?term=${id}`} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{term ? term.abbr : id}</Link>;
        })}
      </div>
    </article>
  );
}
