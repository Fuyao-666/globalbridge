"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { downloadCsv, formatInt, formatPct, formatSimDate, formatSimStamp } from "@/lib/format";
import { summarizeRange } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChainBar, ExactMoney, PageIntro } from "@/components/widgets";

const COLORS = ["#7c3aed", "#2563eb", "#14b8a6", "#f59e0b", "#94a3b8"];

export default function DashboardPage() {
  const locale = useStore((state) => state.locale);
  const market = useStore((state) => state.marketplace);
  const sim = useStore((state) => state.sim);
  const reset = useStore((state) => state.resetSimulation);
  const [span, setSpan] = useState<"7" | "14" | "all">("7");
  const [page, setPage] = useState(1);
  const length = span === "7" ? 7 : span === "14" ? 14 : null;
  const earliest = sim.ledger.reduce((min, row) => Math.min(min, row.day), sim.simDay);
  const from = length === null ? earliest : sim.simDay - length + 1;
  const summary = useMemo(() => summarizeRange(sim.ledger, sim.visitors, sim.adSpendByDay, from, sim.simDay), [sim, from]);
  const previous = useMemo(
    () => (length === null ? null : summarizeRange(sim.ledger, sim.visitors, sim.adSpendByDay, from - length, from - 1)),
    [sim, from, length],
  );
  const rows = sim.ledger.filter((row) => row.day >= from && row.day <= sim.simDay);
  const pageSize = 5;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const slice = rows.slice((page - 1) * pageSize, page * pageSize);
  const costs = [
    { key: "cogs", zh: "采购成本", en: "Cost of goods", value: summary.cogs },
    { key: "ads", zh: "营销与广告", en: "Marketing and ads", value: summary.ads },
    { key: "pay", zh: "支付处理", en: "Payment processing", value: summary.payment },
    { key: "ship", zh: "物流履约", en: "Shipping and fulfillment", value: summary.shipping },
    { key: "other", zh: "其他运营", en: "Other operating costs", value: summary.other },
  ].filter((item) => item.value > 0);
  const chart = summary.byDay.map((point) => ({
    name: formatSimDate(point.day, locale).replace(/年|月/g, "/").replace("日", ""),
    revenue: Math.round(point.revenue),
  }));

  function exportCsv() {
    downloadCsv(`globalbridge-ledger-${from}-${sim.simDay}.csv`, [
      ["day", "time", "order", "customer", "type", "product", "qty", "amount_usd", "cogs_usd", "payment_usd", "shipping_usd", "other_usd", "method"],
      ...rows.map((row) => [
        formatSimDate(row.day, "en"),
        String(row.minutes),
        row.orderId,
        row.customerId,
        row.type,
        row.title.en,
        String(row.qty),
        row.amount.toFixed(2),
        row.cogs.toFixed(2),
        row.payment.toFixed(2),
        row.shipping.toFixed(2),
        row.other.toFixed(2),
        row.method,
      ]),
    ]);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <PageIntro
          title={locale === "zh" ? "数据看板" : "Simulation dashboard"}
          body={locale === "zh" ? "四张卡、折线和流水来自同一批订单。广告花费按天计入成本环，不从每笔订单里再扣一次。" : "The four cards, the line, and the ledger come from the same orders. Daily ad spend is added in the cost ring and is not deducted again on each order."}
        />
        <div className="flex gap-2">
          <Select value={span} onValueChange={(value) => { setSpan(value as "7" | "14" | "all"); setPage(1); }}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{locale === "zh" ? "近 7 天" : "Last 7 days"}</SelectItem>
              <SelectItem value="14">{locale === "zh" ? "近 14 天" : "Last 14 days"}</SelectItem>
              <SelectItem value="all">{locale === "zh" ? "全部" : "All"}</SelectItem>
            </SelectContent>
          </Select>
          <Button className="h-9" onClick={exportCsv}>{locale === "zh" ? "下载流水" : "Download ledger"}</Button>
        </div>
      </div>
      <ChainBar />
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-2 rounded-full bg-emerald-500" />
        {locale === "zh" ? "模拟进行中" : "Simulation active"} · {formatSimDate(from, locale)} – {formatSimDate(sim.simDay, locale)} · {formatInt(summary.visitors, locale)} {locale === "zh" ? "访客" : "visitors"}
        <button className="ml-auto text-primary" onClick={reset}>{locale === "zh" ? "重置演示店" : "Reset demo store"}</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title={locale === "zh" ? "销售额" : "Revenue"} value={<ExactMoney usd={summary.gross} />} note={`${formatPct(summary.conversion * 100)} CVR`} delta={change(summary.gross, previous?.gross)} compare={compareLabel(previous, locale)} />
        <Kpi title={locale === "zh" ? "订单" : "Orders"} value={formatInt(summary.orders, locale)} note={`${formatInt(summary.refundCount, locale)} ${locale === "zh" ? "笔退款" : "refunds"}`} delta={change(summary.orders, previous?.orders)} compare={compareLabel(previous, locale)} />
        <Kpi title={locale === "zh" ? "客单价" : "AOV"} value={<ExactMoney usd={summary.aov} />} note={locale === "zh" ? "销售额 / 订单" : "Revenue / orders"} delta={change(summary.aov, previous?.aov)} compare={compareLabel(previous, locale)} />
        <Kpi title={locale === "zh" ? "转化率" : "Conversion"} value={formatPct(summary.conversion * 100)} note={`${formatInt(summary.visitors, locale)} ${locale === "zh" ? "访客" : "visitors"}`} delta={change(summary.conversion, previous?.conversion)} compare={compareLabel(previous, locale)} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <section className="rounded-2xl border bg-card p-4 lg:col-span-3">
          <h2 className="font-medium">{locale === "zh" ? "销售额趋势" : "Revenue over time"}</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl border bg-card p-4 lg:col-span-2">
          <h2 className="font-medium">{locale === "zh" ? "成本拆解" : "Cost breakdown"}</h2>
          <div className="relative mt-2 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costs} dataKey="value" nameKey={locale} innerRadius={52} outerRadius={72} paddingAngle={2}>
                  {costs.map((entry, index) => <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[11px] text-muted-foreground">{locale === "zh" ? "总成本" : "Total cost"}</div>
              <div className="text-sm font-semibold"><ExactMoney usd={summary.totalCost} /></div>
            </div>
          </div>
          <ul className="space-y-1 text-xs">
            {costs.map((entry, index) => (
              <li key={entry.key} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />{locale === "zh" ? entry.zh : entry.en}</span>
                <span><ExactMoney usd={entry.value} /> · {summary.totalCost ? formatPct((entry.value / summary.totalCost) * 100) : "—"}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>{locale === "zh" ? "成本占销售额" : "Cost / revenue"}</span>
              <span>{formatPct(summary.costRatio * 100)} · {locale === "zh" ? "利润" : "Profit"} <ExactMoney usd={summary.profit} /></span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-violet-600" style={{ width: `${Math.max(0, Math.min(100, summary.costRatio * 100))}%` }} />
            </div>
          </div>
        </section>
      </div>
      <section className="mt-4 overflow-auto rounded-2xl border bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="font-medium">{locale === "zh" ? "资金流水" : "Transaction ledger"}</h2>
          <span className="text-xs text-muted-foreground">{locale === "zh" ? `当前站点 ${market}，金额按汇率展示，记账货币为美元` : `Marketplace ${market}. Amounts convert for display. The book is USD.`}</span>
        </div>
        <table className="w-full min-w-[860px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{locale === "zh" ? "时间" : "When"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "订单" : "Order"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "买家" : "Customer"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "类型" : "Type"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "商品" : "Product"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "金额" : "Amount"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "利润" : "Profit"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "支付" : "Method"}</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((row) => {
              const profit = row.amount - row.cogs - row.payment - row.shipping - row.other;
              return (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">{formatSimStamp(row.day, row.minutes, locale)}</td>
                  <td className="px-3 py-2">{row.orderId}</td>
                  <td className="px-3 py-2">{row.customerId}</td>
                  <td className={row.type === "refund" ? "px-3 py-2 text-amber-600" : "px-3 py-2 text-emerald-600"}>{row.type === "refund" ? (locale === "zh" ? "退款" : "Refund") : (locale === "zh" ? "销售" : "Sale")}</td>
                  <td className="px-3 py-2">{row.title[locale]}</td>
                  <td className="px-3 py-2"><ExactMoney usd={row.amount} /></td>
                  <td className={profit < 0 ? "px-3 py-2 text-destructive" : "px-3 py-2 text-emerald-600"}><ExactMoney usd={profit} /></td>
                  <td className="px-3 py-2">{row.method}</td>
                </tr>
              );
            })}
            {slice.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">{locale === "zh" ? "这个范围没有流水。" : "No rows in this range."}</td></tr>}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
          <span>{rows.length ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, rows.length)} / ${rows.length}` : "0"}</span>
          <span className="flex gap-2">
            <Button variant="outline" className="h-7" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>{locale === "zh" ? "上一页" : "Prev"}</Button>
            <Button variant="outline" className="h-7" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>{locale === "zh" ? "下一页" : "Next"}</Button>
          </span>
        </div>
      </section>
    </div>
  );
}

function shortDay(day: number, locale: "zh" | "en") {
  const full = formatSimDate(day, locale);
  return locale === "zh" ? full.replace(/^\d+年/, "") : full.replace(/, \d{4}$/, "");
}

function change(current: number, prior: number | undefined) {
  if (prior === undefined || prior === 0) return null;
  return (current - prior) / Math.abs(prior);
}

function compareLabel(previous: { byDay: { day: number }[] } | null, locale: "zh" | "en") {
  if (!previous || previous.byDay.length === 0) return "";
  const start = previous.byDay[0].day;
  const end = previous.byDay[previous.byDay.length - 1].day;
  const a = shortDay(start, locale);
  const b = shortDay(end, locale);
  return locale === "zh" ? `较 ${a}–${b}` : `vs ${a} – ${b}`;
}

function Kpi({ title, value, note, delta, compare }: { title: string; value: React.ReactNode; note: string; delta?: number | null; compare?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{note}</div>
      {delta != null && Number.isFinite(delta) && (
        <div className={cnDelta(delta)}>
          {delta >= 0 ? "▲" : "▼"} {formatPct(Math.abs(delta) * 100)}
          {compare && <span className="ml-1 font-normal text-muted-foreground">{compare}</span>}
        </div>
      )}
    </div>
  );
}

function cnDelta(delta: number) {
  return delta >= 0 ? "mt-2 text-xs font-medium text-emerald-600" : "mt-2 text-xs font-medium text-destructive";
}
