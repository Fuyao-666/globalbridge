"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { MARKETS } from "@/lib/format";
import { filterProducts, presentProduct, ratingCounts, sortProducts, type ProductView } from "@/lib/selectors";
import { DEFAULT_FILTER, useStore } from "@/lib/store";
import { suppliersFor } from "@/lib/suppliers";
import { compositeRisk, riskTone, unitEconomics } from "@/lib/economics";
import type { FilterState, Marketplace } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChainBar, ExactMoney, PageIntro, ProductArt, ScorePill } from "@/components/widgets";
import { cn } from "@/lib/utils";

export default function SelectionPage() {
  const locale = useStore((state) => state.locale);
  const market = useStore((state) => state.marketplace);
  const setMarket = useStore((state) => state.setMarketplace);
  const params = useStore((state) => state.params);
  const shortlist = useStore((state) => state.shortlist);
  const toggleShortlist = useStore((state) => state.toggleShortlist);
  const saved = useStore((state) => state.savedFilters);
  const saveFilter = useStore((state) => state.saveFilter);
  const deleteFilter = useStore((state) => state.deleteFilter);
  const focus = useSearchParams().get("focus");
  const focusProduct = useSearchParams().get("product");
  const [draft, setDraft] = useState<FilterState>(DEFAULT_FILTER);
  const [applied, setApplied] = useState<FilterState>(DEFAULT_FILTER);
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<ProductView | null>(null);
  const [naming, setNaming] = useState(false);
  const [filterName, setFilterName] = useState("");

  const views = useMemo(() => PRODUCTS.map((product) => presentProduct(product, params, market)), [params, market]);
  const inCategory = views.filter((product) => applied.category === "all" || product.category === applied.category);
  const counts = ratingCounts(inCategory);
  const filtered = sortProducts(filterProducts(views, applied), applied.sort);
  const pageSize = 8;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);
  const marketSize = applied.category === "all" ? CATEGORIES.reduce((sum, category) => sum + category.market, 0) : CATEGORIES.find((category) => category.id === applied.category)?.market ?? 0;

  function apply() {
    setApplied(draft);
    setPage(1);
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <PageIntro
          title={locale === "zh" ? "选品推荐" : "Product recommendations"}
          body={locale === "zh" ? "分数和利润都按当前参数现算。卡片上的是毛利，详情里的瀑布才是真实利润。" : "Scores and profit are calculated from the current parameters. The card shows gross margin. The waterfall in the detail is true profit."}
        />
        <div className="flex gap-2">
          <Select value={market} onValueChange={(value) => setMarket(value as Marketplace)}>
            <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(MARKETS) as Marketplace[]).map((id) => (
                <SelectItem key={id} value={id}>{MARKETS[id].flag} {locale === "zh" ? MARKETS[id].zh : MARKETS[id].en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-9" onClick={() => { setDraft(DEFAULT_FILTER); setApplied(DEFAULT_FILTER); setPage(1); }}>
            <RotateCcw className="size-4" />
            {locale === "zh" ? "重新搜索" : "New search"}
          </Button>
        </div>
      </div>
      {focus === "profit" && (
        <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          {locale === "zh" ? "你从真实利润公式过来。打开任意商品，对比绿色毛利率和瀑布底部的真实利润。两者不一致是课程要你看见的事。" : "You came from the true-profit lesson. Open any product and compare the green gross margin with the true profit at the bottom of the waterfall."}
        </div>
      )}
      <ChainBar />
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-2xl border bg-card p-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">{locale === "zh" ? "筛选" : "Filters"}</h2>
            <button className="text-xs text-primary" onClick={() => setDraft(DEFAULT_FILTER)}>{locale === "zh" ? "重置" : "Reset all"}</button>
          </div>
          <label className="block text-sm">
            <span className="text-muted-foreground">{locale === "zh" ? "类目" : "Category"}</span>
            <Select value={draft.category} onValueChange={(value) => setDraft({ ...draft, category: value as FilterState["category"] })}>
              <SelectTrigger className="mt-1 h-9 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{locale === "zh" ? "全部类目" : "All categories"}</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>{locale === "zh" ? category.zh : category.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="mt-1 block text-xs text-muted-foreground">{marketSize.toLocaleString()} {locale === "zh" ? "个市场样本（示意规模，不是本目录条数）" : "market samples (scale, not this catalog)"}</span>
          </label>
          <Range label={locale === "zh" ? "价格（美元）" : "Price (USD)"} min={5} max={100} value={draft.price} onChange={(price) => setDraft({ ...draft, price: price as [number, number] })} format={(n) => `$${n}`} />
          <div>
            <div className="mb-2 text-sm text-muted-foreground">{locale === "zh" ? "评分" : "Average review"}</div>
            <CheckRow checked={draft.stars4} onChange={(stars4) => setDraft({ ...draft, stars4 })} label={`${locale === "zh" ? "4 星及以上" : "4 stars & up"} (${counts.stars4})`} />
            <CheckRow checked={draft.stars3} onChange={(stars3) => setDraft({ ...draft, stars3 })} label={`${locale === "zh" ? "3–4 星" : "3 stars & up"} (${counts.stars3})`} />
            <CheckRow checked={draft.stars2} onChange={(stars2) => setDraft({ ...draft, stars2 })} label={`${locale === "zh" ? "2–3 星" : "2 stars & up"} (${counts.stars2})`} />
            <CheckRow checked={draft.unrated} onChange={(unrated) => setDraft({ ...draft, unrated })} label={`${locale === "zh" ? "未评分" : "Unrated"} (${counts.unrated})`} />
          </div>
          <Range label={locale === "zh" ? "需求分" : "Demand score"} min={0} max={100} value={draft.demand} onChange={(demand) => setDraft({ ...draft, demand: demand as [number, number] })} />
          <Range label={locale === "zh" ? "竞争分" : "Competition score"} min={0} max={100} value={draft.competition} onChange={(competition) => setDraft({ ...draft, competition: competition as [number, number] })} />
          <Range label={locale === "zh" ? "毛利率" : "Gross margin"} min={0} max={100} value={draft.margin} onChange={(margin) => setDraft({ ...draft, margin: margin as [number, number] })} format={(n) => `${n}%`} />
          <Button className="h-10 w-full" onClick={apply}>{locale === "zh" ? "应用筛选" : "Apply filters"}</Button>
          <Button variant="outline" className="h-9 w-full" onClick={() => setNaming(true)}>{locale === "zh" ? "保存筛选" : "Save filter set"}</Button>
          {saved.length > 0 && (
            <div className="space-y-1">
              {saved.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                  <button className="truncate text-left text-primary" onClick={() => { setDraft(item.filter); setApplied(item.filter); setPage(1); }}>{item.name}</button>
                  <button className="text-muted-foreground" onClick={() => deleteFilter(item.id)}>×</button>
                </div>
              ))}
            </div>
          )}
        </aside>
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">
              {filtered.length === 0
                ? (locale === "zh" ? "没有符合条件的推荐" : "No recommendations")
                : locale === "zh"
                  ? `显示 ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} / ${filtered.length} 条`
                  : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-2">
              <Select value={applied.sort} onValueChange={(sort) => { const next = { ...applied, sort: sort as FilterState["sort"] }; setApplied(next); setDraft(next); }}>
                <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">{locale === "zh" ? "综合分" : "Overall score"}</SelectItem>
                  <SelectItem value="demand">{locale === "zh" ? "需求分" : "Demand"}</SelectItem>
                  <SelectItem value="competition">{locale === "zh" ? "竞争从低到高" : "Competition"}</SelectItem>
                  <SelectItem value="margin">{locale === "zh" ? "毛利率" : "Margin"}</SelectItem>
                  <SelectItem value="profit">{locale === "zh" ? "月毛利" : "Monthly gross"}</SelectItem>
                  <SelectItem value="price">{locale === "zh" ? "价格" : "Price"}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant={applied.view === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setApplied({ ...applied, view: "grid" })} aria-label="Grid"><LayoutGrid /></Button>
              <Button variant={applied.view === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setApplied({ ...applied, view: "list" })} aria-label="List"><List /></Button>
            </div>
          </div>
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
              {locale === "zh" ? "放宽价格、评分或毛利率后再应用。未评分商品默认被排除。" : "Widen price, rating, or margin, then apply. Unrated products are excluded by default."}
            </div>
          )}
          <div className={cn(applied.view === "grid" ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-4" : "space-y-3")}>
            {slice.map((product) => (
              <ProductCard key={product.id} product={product} listed={shortlist.includes(product.id)} highlight={focusProduct === product.id} onOpen={() => setActive(product)} />
            ))}
          </div>
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" className="h-8" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>{locale === "zh" ? "上一页" : "Prev"}</Button>
              <span className="text-sm">{page} / {pages}</span>
              <Button variant="outline" className="h-8" disabled={page === pages} onClick={() => setPage((value) => value + 1)}>{locale === "zh" ? "下一页" : "Next"}</Button>
            </div>
          )}
          <p className="mt-4 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            {locale === "zh" ? "分数按当前市场数据和参数模拟，不代表真实平台表现。" : "Scores are simulated from the current parameters. They are not a live marketplace."}
            <Link href="/learn/sourcing/src-22" className="ml-2 text-primary">{locale === "zh" ? "查看公式" : "Read the formula"}</Link>
          </p>
        </section>
      </div>
      <Sheet open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <SheetContent className="w-full overflow-auto sm:max-w-xl">
          {active && <ProductDetail product={active} listed={shortlist.includes(active.id)} onToggle={() => { toggleShortlist(active.id); toast(shortlist.includes(active.id) ? (locale === "zh" ? "已移出清单" : "Removed") : (locale === "zh" ? "已加入选品清单" : "Added to shortlist")); }} />}
        </SheetContent>
      </Sheet>
      <Dialog open={naming} onOpenChange={setNaming}>
        <DialogContent>
          <DialogHeader><DialogTitle>{locale === "zh" ? "保存当前筛选" : "Save this filter"}</DialogTitle></DialogHeader>
          <Input value={filterName} onChange={(event) => setFilterName(event.target.value)} placeholder={locale === "zh" ? "例如：家居 20%–50% 毛利" : "Example: Home 20–50% margin"} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNaming(false)}>{locale === "zh" ? "取消" : "Cancel"}</Button>
            <Button onClick={() => { if (!filterName.trim()) return; saveFilter(filterName.trim(), applied); setFilterName(""); setNaming(false); toast(locale === "zh" ? "筛选已保存" : "Filter saved"); }}>{locale === "zh" ? "保存" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Range({ label, min, max, value, onChange, format }: { label: string; min: number; max: number; value: [number, number]; onChange: (value: number[]) => void; format?: (n: number) => string }) {
  const text = format ?? ((n: number) => String(n));
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span>{text(value[0])} – {text(value[1])}</span>
      </div>
      <Slider min={min} max={max} step={1} value={value} onValueChange={onChange} />
    </div>
  );
}

function CheckRow({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="mb-1 flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} />
      {label}
    </label>
  );
}

const BADGE = {
  bestseller: { zh: "畅销", en: "Bestseller", className: "text-orange-600" },
  trending: { zh: "趋势", en: "Trending", className: "text-sky-600" },
  highDemand: { zh: "高需求", en: "High demand", className: "text-emerald-600" },
  niche: { zh: "利基", en: "Niche", className: "text-violet-600" },
};

function ProductCard({ product, listed, highlight, onOpen }: { product: ProductView; listed: boolean; highlight: boolean; onOpen: () => void }) {
  const locale = useStore((state) => state.locale);
  const category = CATEGORIES.find((item) => item.id === product.category);
  return (
    <button onClick={onOpen} className={cn("rounded-2xl border bg-card p-3 text-left shadow-sm hover:border-primary/40", highlight && "ring-2 ring-primary", listed && "border-primary/50")}>
      <div className="relative">
        <ProductArt id={product.id} category={product.category} />
        <span className="absolute top-2 left-2"><ScorePill score={product.overall} /></span>
      </div>
      <div className="mt-3 font-medium leading-snug">{product.name[locale]}</div>
      <div className="text-xs text-muted-foreground">{category ? (locale === "zh" ? category.zh : category.en) : ""} · {product.subcategory[locale]}</div>
      {product.badge && <div className={cn("text-xs font-medium", BADGE[product.badge].className)}>{locale === "zh" ? BADGE[product.badge].zh : BADGE[product.badge].en}</div>}
      <ul className="mt-2 space-y-1 text-xs">
        <Metric color="bg-emerald-500" label={locale === "zh" ? "需求分" : "Demand"} value={String(product.demandAdj)} />
        <Metric color="bg-sky-500" label={locale === "zh" ? "竞争分" : "Competition"} value={String(product.competition)} />
        <Metric color="bg-blue-500" label={locale === "zh" ? "毛利率" : "Gross margin"} value={`${Math.round(product.grossMargin * 100)}%`} />
        <Metric color="bg-amber-500" label={locale === "zh" ? "预估月毛利" : "Est. monthly gross"} value={<ExactMoney usd={product.monthlyProfitUsd} />} />
      </ul>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs"><span>{locale === "zh" ? "综合分" : "Overall"}</span><span>{product.overall}</span></div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full", product.overall >= 80 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${product.overall}%` }} /></div>
      </div>
    </button>
  );
}

function Metric({ color, label, value }: { color: string; label: string; value: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-muted-foreground"><span className={cn("size-1.5 rounded-full", color)} />{label}</span>
      <span className="font-medium">{value}</span>
    </li>
  );
}

function ProductDetail({ product, listed, onToggle }: { product: ProductView; listed: boolean; onToggle: () => void }) {
  const locale = useStore((state) => state.locale);
  const params = useStore((state) => state.params);
  const eco = unitEconomics(product, params);
  const lines = [
    { zh: "销售额（已扣佣金）", en: "Revenue after referral", value: eco.netRevenue },
    { zh: "采购成本", en: "Procurement", value: -eco.procurement },
    { zh: "运营费用（广告+人工）", en: "Operating (ads + labor)", value: -eco.operating },
    { zh: "物流与 fulfillment", en: "Logistics and fulfillment", value: -eco.logistics },
    { zh: "退货/纠纷", en: "Returns and claims", value: -eco.returns },
    { zh: "资金成本", en: "Capital cost", value: -eco.capital },
    { zh: "机会成本", en: "Opportunity cost", value: -eco.opportunity },
  ];
  return (
    <div>
      <SheetHeader>
        <SheetTitle>{product.name[locale]}</SheetTitle>
      </SheetHeader>
      <div className="mt-4"><ProductArt id={product.id} category={product.category} /></div>
      <p className="mt-3 text-sm text-muted-foreground">
        {locale === "zh" ? "卡片毛利率" : "Card gross margin"} {Math.round(product.grossMargin * 100)}% · {locale === "zh" ? "单件真实利润" : "True profit / unit"} <ExactMoney usd={eco.trueProfit} /> ({Math.round(eco.trueMargin * 100)}%)
      </p>
      <div className="mt-4 space-y-1 text-sm">
        {lines.map((line) => (
          <div key={line.zh} className="flex justify-between gap-3">
            <span>{locale === "zh" ? line.zh : line.en}</span>
            <span className={line.value < 0 ? "text-muted-foreground" : "font-medium"}><ExactMoney usd={line.value} /></span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>{locale === "zh" ? "真实利润" : "True profit"}</span>
          <span className={eco.trueProfit < 0 ? "text-destructive" : "text-emerald-600"}><ExactMoney usd={eco.trueProfit} /></span>
        </div>
      </div>
      <h3 className="mt-5 text-sm font-semibold">{locale === "zh" ? "供应商预览" : "Suppliers"}</h3>
      <div className="mt-2 space-y-2">
        {suppliersFor(product).map((supplier) => {
          const risk = compositeRisk(supplier, params.riskWeights);
          const tone = riskTone(risk);
          return (
            <div key={supplier.id} className="rounded-xl border p-2 text-sm">
              <div className="flex justify-between gap-2">
                <span>{supplier.name[locale]}</span>
                <span className={tone === "high" ? "text-destructive" : tone === "mid" ? "text-amber-600" : "text-emerald-600"}>{risk}</span>
              </div>
              <div className="text-xs text-muted-foreground"><ExactMoney usd={supplier.unitCost} /> · MOQ {supplier.moq} · {supplier.leadDays}{locale === "zh" ? " 天" : " days"}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <Button className="h-10" onClick={onToggle}>{listed ? (locale === "zh" ? "移出选品清单" : "Remove from shortlist") : (locale === "zh" ? "加入选品清单" : "Add to shortlist")}</Button>
        <Button variant="outline" className="h-9" asChild><Link href="/sim/procurement">{locale === "zh" ? "去比较供应商" : "Compare suppliers"}</Link></Button>
        <Button variant="outline" className="h-9" asChild><Link href={`/tools?product=${product.id}`}>{locale === "zh" ? "用计算器改参数" : "Open the calculator"}</Link></Button>
      </div>
    </div>
  );
}
