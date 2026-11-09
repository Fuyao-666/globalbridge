"use client";

import { useState } from "react";
import { toast } from "sonner";
import { productById } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChainBar, EmptyState, PageIntro } from "@/components/widgets";
import { cn } from "@/lib/utils";

export default function ListingsPage() {
  const locale = useStore((state) => state.locale);
  const shortlist = useStore((state) => state.shortlist);
  const listings = useStore((state) => state.sim.listings);
  const inventory = useStore((state) => state.sim.inventory);
  const createDrafts = useStore((state) => state.createDrafts);
  const updateListing = useStore((state) => state.updateListing);
  const publishListings = useStore((state) => state.publishListings);
  const [picked, setPicked] = useState<string[]>([]);
  const [margin, setMargin] = useState(0.35);
  const [selected, setSelected] = useState<string[]>([]);
  const candidates = shortlist.map((id) => productById(id)).filter((item) => item !== undefined);

  return (
    <div>
      <PageIntro
        title={locale === "zh" ? "批量上架" : "Batch listing"}
        body={locale === "zh" ? "用目标毛利率反推标价。没有入库库存的商品只能存草稿。最近一批货如果来自高风险供应商，发布后会被抑制。" : "Price is backed out from a target gross margin. Without received stock the row stays a draft. A high-risk receipt is suppressed on publish."}
      />
      <ChainBar />
      <section className="rounded-2xl border bg-card p-4">
        <h2 className="font-medium">{locale === "zh" ? "从选品清单生成" : "Generate from the shortlist"}</h2>
        {candidates.length === 0 ? (
          <div className="mt-3">
            <EmptyState title={locale === "zh" ? "没有可选商品" : "Nothing to generate"} body={locale === "zh" ? "先把商品放进选品清单。" : "Add products to the shortlist first."} href="/sim/selection" action={locale === "zh" ? "去选品" : "Select products"} />
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-3">
              {candidates.map((product) => (
                <label key={product.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  <Checkbox checked={picked.includes(product.id)} onCheckedChange={(value) => setPicked((current) => value === true ? [...current, product.id] : current.filter((id) => id !== product.id))} />
                  <span>{product.name[locale]}</span>
                  <span className="text-xs text-muted-foreground">{locale === "zh" ? "库存" : "Stock"} {inventory[product.id] ?? 0}</span>
                </label>
              ))}
            </div>
            <label className="mt-4 block max-w-xs text-sm">
              {locale === "zh" ? "目标毛利率" : "Target gross margin"} {Math.round(margin * 100)}%
              <Input className="mt-1" type="number" min={5} max={70} value={Math.round(margin * 100)} onChange={(event) => setMargin(Number(event.target.value) / 100)} />
            </label>
            <Button className="mt-3 h-9" disabled={picked.length === 0} onClick={() => { createDrafts(picked, margin); toast.success(locale === "zh" ? "已生成草稿，发布前请读一遍标题" : "Drafts generated. Read the titles before publishing."); }}>
              {locale === "zh" ? "生成草稿" : "Generate drafts"}
            </Button>
          </>
        )}
      </section>
      <section className="mt-5 overflow-auto rounded-2xl border">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2"></th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">{locale === "zh" ? "标题" : "Title"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "标价" : "Price"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "库存" : "Stock"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "状态" : "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => {
              const product = productById(listing.productId);
              return (
                <tr key={listing.id} className="border-t align-top">
                  <td className="px-3 py-2">
                    <Checkbox checked={selected.includes(listing.id)} onCheckedChange={(value) => setSelected((current) => value === true ? [...current, listing.id] : current.filter((id) => id !== listing.id))} />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{listing.sku}</td>
                  <td className="px-3 py-2">
                    <Input value={listing.title} onChange={(event) => updateListing(listing.id, { title: event.target.value.slice(0, 120) })} />
                    <div className="mt-1 text-xs text-muted-foreground">{product?.name[locale]}</div>
                    {listing.reason && <div className="mt-1 text-xs text-destructive">{listing.reason[locale]}</div>}
                  </td>
                  <td className="px-3 py-2">
                    <Input type="number" value={listing.price} onChange={(event) => updateListing(listing.id, { price: Number(event.target.value) })} />
                  </td>
                  <td className="px-3 py-2">{inventory[listing.productId] ?? 0}</td>
                  <td className={cn("px-3 py-2", listing.status === "suppressed" && "text-destructive", listing.status === "live" && "text-emerald-600")}>
                    {listing.status === "live" ? (locale === "zh" ? "在售" : "Live") : listing.status === "draft" ? (locale === "zh" ? "草稿" : "Draft") : (locale === "zh" ? "抑制" : "Suppressed")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <div className="mt-3 flex justify-end">
        <Button className="h-9" disabled={selected.length === 0} onClick={() => {
          const result = publishListings(selected);
          if (result.published === 0 && result.suppressed === 0) toast.error(locale === "zh" ? "没有可发布的行。草稿需要库存，演示店里被抑制的链接不能从这里恢复。" : "Nothing published. Drafts need stock, and seeded suppressed listings stay suppressed.");
          else toast.success(locale === "zh" ? `在售 ${result.published}，抑制 ${result.suppressed}` : `Live ${result.published}, suppressed ${result.suppressed}`);
          setSelected([]);
        }}>{locale === "zh" ? "发布选中" : "Publish selected"}</Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {locale === "zh" ? "标价低于成本时，系统不会自动改价。去工具箱看这个价格下的真实利润。" : "A price below cost is not auto-corrected. Check that price in the calculator."}
      </p>
    </div>
  );
}
