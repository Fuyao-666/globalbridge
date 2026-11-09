"use client";

import Link from "next/link";
import { LayoutDashboard, Megaphone, Package, Search, ShoppingCart } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageIntro } from "@/components/widgets";

const CARDS = [
  { href: "/sim/selection", icon: Search, zh: "选品模拟", en: "Product selection", detailZh: "按类目、价格、评分、需求和毛利率筛选，打开瀑布看真实利润。", detailEn: "Filter by category, price, rating, demand, and gross margin, then open the true-profit waterfall." },
  { href: "/sim/procurement", icon: ShoppingCart, zh: "采购与供应商风险", en: "Procurement risk", detailZh: "同一商品对比三家供应商。高风险可以下单，但必须留下确认。", detailEn: "Compare three suppliers. A high-risk order is allowed only after you confirm it." },
  { href: "/sim/listings", icon: Package, zh: "批量上架", en: "Batch listing", detailZh: "按目标毛利率生成标题和标价。没有库存只能存草稿，高合规风险会被抑制。", detailEn: "Generate titles and prices from a target margin. No stock stays a draft. High compliance risk is suppressed." },
  { href: "/sim/ads", icon: Megaphone, zh: "广告活动", en: "Advertising", detailZh: "看 ACoS、ROAS 和平台动态。暂停后，下一天不再增加花费。", detailEn: "Read ACoS, ROAS, and platform activity. A paused campaign stops adding spend the next day." },
  { href: "/sim/dashboard", icon: LayoutDashboard, zh: "数据看板", en: "Dashboard", detailZh: "销售额、订单、客单价、转化率都从同一段流水计算。", detailEn: "Revenue, orders, AOV, and conversion are computed from the same ledger." },
];

export default function SimHome() {
  const locale = useStore((state) => state.locale);
  const shortlist = useStore((state) => state.shortlist.length);
  const purchases = useStore((state) => state.sim.purchases.length);
  const live = useStore((state) => state.sim.listings.filter((listing) => listing.status === "live").length);
  return (
    <div>
      <PageIntro
        kicker="GlobalBridge"
        title={locale === "zh" ? "模拟实训" : "Simulator"}
        body={locale === "zh" ? "一条链路：选品、采购、上架、广告、看板。演示店已经有期初库存和广告，方便先看结果；你自己的商品要从清单走完。" : "One chain: select, buy, list, advertise, review. The demo store already has opening stock and ads. Your own product still has to walk the chain."}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label={locale === "zh" ? "选品清单" : "Shortlist"} value={String(shortlist)} />
        <Stat label={locale === "zh" ? "采购单" : "Purchase orders"} value={String(purchases)} />
        <Stat label={locale === "zh" ? "在售链接" : "Live listings"} value={String(live)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="rounded-2xl border bg-card p-4 hover:border-primary/40">
              <Icon className="size-5 text-primary" />
              <h2 className="mt-3 font-semibold">{locale === "zh" ? card.zh : card.en}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{locale === "zh" ? card.detailZh : card.detailEn}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
