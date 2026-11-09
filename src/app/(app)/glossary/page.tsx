"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Star } from "lucide-react";
import { GLOSSARY, GLOSSARY_CATEGORIES } from "@/lib/data/glossary";
import { downloadCsv } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { GlossaryCategory, GlossaryTerm } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageIntro } from "@/components/widgets";
import { cn } from "@/lib/utils";

export default function GlossaryPage() {
  const locale = useStore((state) => state.locale);
  const edits = useStore((state) => state.termEdits);
  const custom = useStore((state) => state.customTerms);
  const hidden = useStore((state) => state.hiddenTerms);
  const favorites = useStore((state) => state.favoriteTerms);
  const history = useStore((state) => state.termHistory);
  const toggleFavorite = useStore((state) => state.toggleFavoriteTerm);
  const touch = useStore((state) => state.touchTerm);
  const initial = useSearchParams().get("term");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GlossaryCategory | "all">("all");
  const [view, setView] = useState<"all" | "saved" | "history">("all");
  const [active, setActive] = useState<string | null>(initial);
  const terms = useMemo(() => {
    const seed = GLOSSARY.map((term) => ({ ...term, ...edits[term.id] })) as GlossaryTerm[];
    return [...custom, ...seed].filter((term) => !hidden.includes(term.id));
  }, [edits, custom, hidden]);
  const visible = terms.filter((term) => {
    if (view === "saved" && !favorites.includes(term.id)) return false;
    if (view === "history" && !history.includes(term.id)) return false;
    if (category !== "all" && term.category !== category) return false;
    const blob = `${term.abbr} ${term.name.zh} ${term.name.en} ${term.summary.zh} ${term.summary.en}`.toLowerCase();
    return blob.includes(query.trim().toLowerCase());
  });
  const opened = terms.find((term) => term.id === active);

  function exportTerms() {
    downloadCsv("globalbridge-glossary.csv", [
      ["abbr", "name_zh", "name_en", "category", "summary_zh", "formula"],
      ...visible.map((term) => [term.abbr, term.name.zh, term.name.en, term.category, term.summary.zh, term.formula ?? ""]),
    ]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="space-y-1">
        <div className="mb-3">
          <div className="text-lg font-semibold">{locale === "zh" ? "术语" : "Glossary"}</div>
          <p className="text-xs text-muted-foreground">{locale === "zh" ? "亚马逊与跨境常用解释" : "Amazon and cross-border terms"}</p>
        </div>
        {(["all", "saved", "history"] as const).map((item) => (
          <button key={item} className={cn("block w-full rounded-lg px-3 py-2 text-left text-sm", view === item && "bg-primary/10 text-primary")} onClick={() => setView(item)}>
            {item === "all" ? (locale === "zh" ? "术语表" : "All terms") : item === "saved" ? (locale === "zh" ? "收藏" : "Saved") : (locale === "zh" ? "最近查看" : "History")}
          </button>
        ))}
        <p className="px-3 pt-4 text-xs text-muted-foreground">{locale === "zh" ? "点开卡片可以看到公式、示例和更长的解释。" : "Open a card for the formula, an example, and a longer note."}</p>
      </aside>
      <div>
        <PageIntro title={locale === "zh" ? "术语 glossary" : "Glossary"} body={locale === "zh" ? "解释和计算方式跟模拟器里的字段用的是同一套口径。" : "The definitions match the fields in the simulator."} />
        <div className="mb-4 flex flex-col gap-2 md:flex-row">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "zh" ? "搜索术语或中文解释" : "Search a term"} className="h-9" />
          <Select value={category} onValueChange={(value) => setCategory(value as GlossaryCategory | "all")}>
            <SelectTrigger className="h-9 md:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{locale === "zh" ? `全部 (${terms.length})` : `All (${terms.length})`}</SelectItem>
              {GLOSSARY_CATEGORIES.map((item) => (
                <SelectItem key={item.id} value={item.id}>{locale === "zh" ? item.zh : item.en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {visible.length === 0 && <div className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">{locale === "zh" ? "没有匹配的术语。" : "No terms match."}</div>}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((term) => (
            <button key={term.id} className="rounded-2xl border bg-card p-4 text-left hover:border-primary/40" onClick={() => { touch(term.id); setActive(term.id); }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{term.abbr}</div>
                  <div className="text-sm text-muted-foreground">{term.name[locale]}</div>
                </div>
                <Star className={cn("size-4", favorites.includes(term.id) && "fill-amber-400 text-amber-500")} />
              </div>
              <p className="mt-3 text-sm">{term.summary[locale]}</p>
              {term.formula && <p className="mt-3 text-xs text-primary">{locale === "zh" ? "计算公式：" : "Formula: "}{term.formula}</p>}
              {term.example && !term.formula && <p className="mt-3 text-xs text-primary">{term.example[locale]}</p>}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{locale === "zh" ? "术语会随课程更新。收藏保存在这台浏览器。" : "Terms follow the course. Favorites stay in this browser."}</span>
          <Button variant="outline" className="h-8" onClick={exportTerms}><Download className="size-3.5" /> CSV</Button>
        </div>
      </div>
      <Dialog open={!!opened} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent>
          {opened && (
            <>
              <DialogHeader>
                <DialogTitle>{opened.abbr} · {opened.name[locale]}</DialogTitle>
              </DialogHeader>
              <p className="text-sm">{opened.detail[locale]}</p>
              {opened.formula && <p className="rounded-lg bg-muted px-3 py-2 font-mono text-sm">{opened.formula}</p>}
              {opened.example && <p className="text-sm text-muted-foreground">{opened.example[locale]}</p>}
              <Button variant="outline" onClick={() => toggleFavorite(opened.id)}>{favorites.includes(opened.id) ? (locale === "zh" ? "取消收藏" : "Unsave") : (locale === "zh" ? "收藏" : "Save")}</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
