"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { productById } from "@/lib/catalog";
import { formatInt, formatPct, formatSimDate } from "@/lib/format";
import { acosOf, inventoryHealth, recentSlice, roasOf, summarizeRange } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import type { CampaignType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChainBar, ExactMoney, PageIntro } from "@/components/widgets";
import { cn } from "@/lib/utils";

export default function AdsPage() {
  const locale = useStore((state) => state.locale);
  const sim = useStore((state) => state.sim);
  const setStatus = useStore((state) => state.setCampaignStatus);
  const duplicate = useStore((state) => state.duplicateCampaign);
  const createCampaign = useStore((state) => state.createCampaign);
  const [tab, setTab] = useState<"all" | CampaignType>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "SP" as CampaignType, budget: 20, productIds: [] as string[] });
  const from = Math.max(0, sim.simDay - 6);
  const summary = summarizeRange(sim.ledger, sim.visitors, sim.adSpendByDay, from, sim.simDay);
  const health = inventoryHealth(sim.listings, sim.inventory, sim.ledger, sim.simDay);
  const recent = recentSlice(sim.ledger, sim.simDay);
  const recentOrders = recent.filter((row) => row.type === "sale").length;
  const recentRefunds = recent.filter((row) => row.type === "refund").length;
  const low = sim.alerts.filter((alert) => alert.kind === "inventory").length;
  const suppressed = sim.listings.filter((listing) => listing.status === "suppressed").length;
  const accountSpend = sim.campaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
  const accountSales = sim.campaigns.reduce((sum, campaign) => sum + campaign.sales, 0);
  const accountAcos = accountSales > 0 ? (accountSpend / accountSales) * 100 : null;
  const rows = useMemo(() => {
    return sim.campaigns.filter((campaign) => (tab === "all" || campaign.type === tab) && campaign.name.toLowerCase().includes(query.trim().toLowerCase()));
  }, [sim.campaigns, tab, query]);
  const pageSize = 5;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const slice = rows.slice((page - 1) * pageSize, page * pageSize);
  const live = sim.listings.filter((listing) => listing.status === "live");

  return (
    <div>
      <PageIntro
        title={locale === "zh" ? "广告与运营" : "Advertising and operations"}
        body={locale === "zh" ? `活动表是累计归因。成本环使用 ${formatSimDate(from, locale)} 至 ${formatSimDate(sim.simDay, locale)} 的广告花费，两个口径故意分开。` : `The table is cumulative attribution. The cost ring uses ad spend from ${formatSimDate(from, locale)} to ${formatSimDate(sim.simDay, locale)}. The two definitions stay separate on purpose.`}
      />
      <ChainBar />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title={locale === "zh" ? "销售额" : "Total revenue"} value={<ExactMoney usd={summary.gross} />} note={locale === "zh" ? "所选 7 天的销售流水" : "Sales in the last 7 days"} />
        <Kpi title={locale === "zh" ? "订单" : "Total orders"} value={formatInt(summary.orders, locale)} note={locale === "zh" ? "不含退款行" : "Refund rows excluded"} />
        <Kpi title="ACoS" value={accountAcos === null ? "—" : formatPct(accountAcos)} note={locale === "zh" ? "全部活动累计" : "All campaigns, cumulative"} warn={accountAcos !== null && accountAcos > 25} />
        <Kpi title={locale === "zh" ? "库存健康" : "Inventory health"} value={String(health.score)} note={health.labelKey === "good" ? (locale === "zh" ? "良好" : "Good") : health.labelKey === "watch" ? (locale === "zh" ? "留意" : "Watch") : (locale === "zh" ? "危险" : "Poor")} />
      </div>
      <section className="mt-5 rounded-2xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center">
          <h2 className="font-semibold">{locale === "zh" ? "广告活动" : "Advertising campaigns"}</h2>
          <div className="flex flex-wrap gap-1 text-sm">
            {(["all", "SP", "SB", "SD"] as const).map((item) => (
              <button key={item} className={cn("rounded-full px-3 py-1", tab === item ? "bg-primary text-primary-foreground" : "hover:bg-muted")} onClick={() => { setTab(item); setPage(1); }}>
                {item === "all" ? (locale === "zh" ? "全部" : "All") : item === "SP" ? (locale === "zh" ? "商品推广" : "Sponsored Products") : item === "SB" ? (locale === "zh" ? "品牌推广" : "Sponsored Brands") : (locale === "zh" ? "展示推广" : "Sponsored Display")}
              </button>
            ))}
          </div>
          <div className="md:ml-auto flex gap-2">
            <Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={locale === "zh" ? "搜索活动" : "Search campaigns"} className="h-8 w-40" />
            <Button className="h-8" onClick={() => setOpen(true)}>{locale === "zh" ? "新建" : "Create"}</Button>
          </div>
        </div>
        {picked.length > 0 && (
          <div className="flex gap-2 border-b px-4 py-2">
            <Button variant="outline" className="h-8" onClick={() => { setStatus(picked, "paused"); toast(locale === "zh" ? "已暂停" : "Paused"); }}>{locale === "zh" ? "暂停" : "Pause"}</Button>
            <Button variant="outline" className="h-8" onClick={() => { setStatus(picked, "enabled"); toast(locale === "zh" ? "已开启" : "Enabled"); }}>{locale === "zh" ? "开启" : "Enable"}</Button>
          </div>
        )}
        <div className="overflow-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2"></th>
                <th className="px-3 py-2">{locale === "zh" ? "活动" : "Campaign"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "类型" : "Type"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "状态" : "Status"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "曝光" : "Impressions"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "点击" : "Clicks"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "花费" : "Spend"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "归因销售" : "Ad sales"}</th>
                <th className="px-3 py-2">ACoS</th>
                <th className="px-3 py-2">ROAS</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {slice.map((campaign) => {
                const acos = acosOf(campaign);
                const roas = roasOf(campaign);
                return (
                  <tr key={campaign.id} className="border-t">
                    <td className="px-3 py-2"><Checkbox checked={picked.includes(campaign.id)} onCheckedChange={(value) => setPicked((current) => value === true ? [...current, campaign.id] : current.filter((id) => id !== campaign.id))} /></td>
                    <td className="px-3 py-2 font-medium">{campaign.name}</td>
                    <td className="px-3 py-2">{campaign.type === "SP" ? (locale === "zh" ? "商品推广" : "Sponsored Products") : campaign.type === "SB" ? (locale === "zh" ? "品牌推广" : "Sponsored Brands") : (locale === "zh" ? "展示推广" : "Sponsored Display")}</td>
                    <td className="px-3 py-2"><span className={cn("inline-flex items-center gap-1", campaign.status === "enabled" ? "text-emerald-600" : "text-amber-600")}>● {campaign.status === "enabled" ? (locale === "zh" ? "开启" : "Enabled") : (locale === "zh" ? "暂停" : "Paused")}</span></td>
                    <td className="px-3 py-2">{formatInt(campaign.impressions, locale)}</td>
                    <td className="px-3 py-2">{formatInt(campaign.clicks, locale)}</td>
                    <td className="px-3 py-2"><ExactMoney usd={campaign.spend} /></td>
                    <td className="px-3 py-2"><ExactMoney usd={campaign.sales} /></td>
                    <td className={cn("px-3 py-2", acos !== null && acos > 25 && "text-destructive")}>{acos === null ? "—" : formatPct(acos)}</td>
                    <td className="px-3 py-2 text-emerald-600">{roas === null ? "—" : `${roas.toFixed(2)}x`}</td>
                    <td className="px-3 py-2 text-right">
                      <button className="text-xs text-primary" onClick={() => setStatus([campaign.id], campaign.status === "enabled" ? "paused" : "enabled")}>{campaign.status === "enabled" ? (locale === "zh" ? "暂停" : "Pause") : (locale === "zh" ? "开启" : "Enable")}</button>
                      <button className="ml-2 text-xs text-muted-foreground" onClick={() => duplicate(campaign.id)}>{locale === "zh" ? "复制" : "Copy"}</button>
                    </td>
                  </tr>
                );
              })}
              {slice.length === 0 && <tr><td colSpan={11} className="px-3 py-8 text-center text-muted-foreground">{locale === "zh" ? "没有匹配的活动。" : "No campaigns match."}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
          <span>{locale === "zh" ? `显示 ${(page - 1) * pageSize + (rows.length ? 1 : 0)}–${Math.min(page * pageSize, rows.length)} / ${rows.length}` : `Showing ${(page - 1) * pageSize + (rows.length ? 1 : 0)}–${Math.min(page * pageSize, rows.length)} of ${rows.length}`}</span>
          <span className="flex gap-2">
            <Button variant="outline" className="h-7" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>{locale === "zh" ? "上一页" : "Prev"}</Button>
            <Button variant="outline" className="h-7" disabled={page === pages} onClick={() => setPage((value) => value + 1)}>{locale === "zh" ? "下一页" : "Next"}</Button>
          </span>
        </div>
      </section>
      <section className="mt-5">
        <h2 className="mb-3 font-semibold">{locale === "zh" ? "平台动态" : "Platform activity"}</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Activity title={locale === "zh" ? "新订单" : "Orders"} value={recentOrders} note={locale === "zh" ? "最近一个模拟日 16:00 之后" : "After 16:00 on the latest sim day"} />
          <Activity title={locale === "zh" ? "退货" : "Returns"} value={recentRefunds} note={locale === "zh" ? "同一窗口内的退款行" : "Refund rows in that window"} />
          <Activity title={locale === "zh" ? "库存告警" : "Inventory alerts"} value={low} note={locale === "zh" ? "在售且库存不超过 5" : "Live listings with 5 or fewer units"} />
          <Activity title={locale === "zh" ? "链接问题" : "Listing issues"} value={suppressed} note={locale === "zh" ? "被抑制的链接" : "Suppressed listings"} />
        </div>
      </section>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{locale === "zh" ? "新建广告活动" : "New campaign"}</DialogTitle></DialogHeader>
          <label className="text-sm">{locale === "zh" ? "名称" : "Name"}<Input className="mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label className="mt-3 block text-sm">{locale === "zh" ? "类型" : "Type"}
            <Select value={form.type} onValueChange={(type) => setForm({ ...form, type: type as CampaignType })}>
              <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SP">{locale === "zh" ? "商品推广" : "Sponsored Products"}</SelectItem>
                <SelectItem value="SB">{locale === "zh" ? "品牌推广" : "Sponsored Brands"}</SelectItem>
                <SelectItem value="SD">{locale === "zh" ? "展示推广" : "Sponsored Display"}</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="mt-3 block text-sm">{locale === "zh" ? "日预算（美元）" : "Daily budget (USD)"}<Input className="mt-1" type="number" min={1} value={form.budget} onChange={(event) => setForm({ ...form, budget: Number(event.target.value) })} /></label>
          <div className="mt-3 max-h-40 space-y-1 overflow-auto text-sm">
            {live.map((listing) => {
              const product = productById(listing.productId);
              return (
                <label key={listing.id} className="flex items-center gap-2">
                  <Checkbox checked={form.productIds.includes(listing.productId)} onCheckedChange={(value) => setForm({ ...form, productIds: value === true ? [...form.productIds, listing.productId] : form.productIds.filter((id) => id !== listing.productId) })} />
                  {product?.name[locale] ?? listing.title}
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              if (!form.name.trim() || !(form.budget > 0)) {
                toast.error(locale === "zh" ? "请填写名称和大于 0 的预算" : "Name and a budget above zero are required");
                return;
              }
              if (form.type !== "SB" && form.productIds.length === 0) {
                toast.error(locale === "zh" ? "商品推广和展示推广至少选择一个在售链接" : "Pick at least one live listing for SP or SD");
                return;
              }
              createCampaign({ name: form.name.trim(), type: form.type, dailyBudget: form.budget, productIds: form.type === "SB" ? [] : form.productIds });
              setOpen(false);
              setForm({ name: "", type: "SP", budget: 20, productIds: [] });
              toast.success(locale === "zh" ? "活动已开启。推进一天后才会有曝光。" : "Campaign enabled. Impressions appear after you advance a day.");
            }}>{locale === "zh" ? "创建" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Kpi({ title, value, note, warn }: { title: string; value: React.ReactNode; note: string; warn?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className={cn("mt-1 text-2xl font-semibold", warn && "text-destructive")}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{note}</div>
    </div>
  );
}

function Activity({ title, value, note }: { title: string; value: number; note: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{note}</div>
    </div>
  );
}
