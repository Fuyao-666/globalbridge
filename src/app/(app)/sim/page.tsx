"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Megaphone, Package, Search, ShoppingCart } from "lucide-react";
import { formatCredit } from "@/lib/credit";
import { formatSimDate } from "@/lib/format";
import { summarizeRange } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import { useCredit } from "@/components/credit-dock";
import { Button } from "@/components/ui/button";
import { ChainBar, ExactMoney, PageIntro } from "@/components/widgets";

export default function SimHome() {
  const locale = useStore((state) => state.locale);
  const zh = locale === "zh";
  const sim = useStore((state) => state.sim);
  const shortlist = useStore((state) => state.shortlist.length);
  const balance = useCredit((state) => state.balance);
  const from = sim.simDay - 6;
  const week = useMemo(
    () => summarizeRange(sim.ledger, sim.visitors, sim.adSpendByDay, from, sim.simDay),
    [sim, from],
  );
  const inTransit = sim.purchases.filter((purchase) => purchase.status === "in_transit").length;
  const live = sim.listings.filter((listing) => listing.status === "live").length;
  const next = inTransit > 0
    ? {
        href: "/sim/procurement",
        title: zh ? `${inTransit} 张采购单还在路上` : `${inTransit} purchase orders are still in transit`,
        body: zh ? "推进模拟日，到货之后才能上架。课程先不用打开。" : "Advance the sim day. The goods can be listed after they arrive.",
        cta: zh ? "处理采购" : "Open procurement",
      }
    : shortlist > 0
      ? {
          href: "/sim/procurement",
          title: zh ? "清单里的商品还没下单" : "The shortlist has not been ordered",
          body: zh ? "先比对供应商再扣实训额度。高风险订单要勾选确认。" : "Compare suppliers before training credit is spent. High-risk orders need a confirmation.",
          cta: zh ? "去采购" : "Buy",
        }
      : {
          href: "/sim/selection",
          title: zh ? "先决定下一件要卖的商品" : "Pick the next product to sell",
          body: zh ? "在选品里看需求分和真实利润，放进清单后再采购。" : "Check demand and true profit, add it to the shortlist, then buy.",
          cta: zh ? "去选品" : "Select",
        };

  return (
    <div>
      <PageIntro
        kicker={zh ? `模拟日 ${formatSimDate(sim.simDay, locale)}` : formatSimDate(sim.simDay, locale)}
        title={zh ? "今日经营" : "Today in the store"}
        body={zh ? "先看这一周的销售额、订单和利润，再决定选品、补货、上架或广告。课程资料用来对照数字。" : "Read this week's revenue, orders, and profit, then select, restock, list, or advertise. Lesson notes are there when a number needs an explanation."}
      />
      <ChainBar />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={zh ? "近 7 天销售额" : "7-day revenue"} value={<ExactMoney usd={week.gross} />} />
        <Stat label={zh ? "近 7 天订单" : "7-day orders"} value={String(week.orders)} />
        <Stat label={zh ? "近 7 天利润" : "7-day profit"} value={<ExactMoney usd={week.profit} />} />
        <Stat label={zh ? "实训额度" : "Training credit"} value={balance === null ? "—" : formatCredit(balance)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <section className="rounded-2xl border bg-card p-5">
          <div className="text-xs font-medium text-primary">{zh ? "下一步" : "Next"}</div>
          <h2 className="mt-1 text-lg font-semibold">{next.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{next.body}</p>
          <Button asChild className="mt-4 h-9">
            <Link href={next.href}>{next.cta}<ArrowRight className="size-4" /></Link>
          </Button>
        </section>
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold">{zh ? "店铺现在" : "The store now"}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label={zh ? "选品清单" : "Shortlist"} value={String(shortlist)} href="/sim/selection" />
            <Row label={zh ? "在途采购" : "In transit"} value={String(inTransit)} href="/sim/procurement" />
            <Row label={zh ? "在售链接" : "Live listings"} value={String(live)} href="/sim/listings" />
            <Row label={zh ? "在投广告" : "Live campaigns"} value={String(sim.campaigns.filter((campaign) => campaign.status === "enabled").length)} href="/sim/ads" />
          </dl>
        </section>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <WorkLink href="/sim/selection" icon={Search} title={zh ? "选品" : "Select"} body={zh ? "看需求和真实利润，放进清单。" : "Read demand and true profit, then shortlist."} />
        <WorkLink href="/sim/procurement" icon={ShoppingCart} title={zh ? "采购" : "Buy"} body={zh ? "货款从实训额度扣除。" : "Goods value comes out of training credit."} />
        <WorkLink href="/sim/listings" icon={Package} title={zh ? "上架" : "List"} body={zh ? "没库存只能存草稿。" : "No stock stays a draft."} />
        <WorkLink href="/sim/ads" icon={Megaphone} title={zh ? "广告" : "Advertise"} body={zh ? "暂停后，下一天不再花钱。" : "A pause stops spend the next day."} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {zh ? "数字对不上时再看课。" : "Open a lesson when a number does not add up."}{" "}
        <Link href="/learn/sourcing/src-22" className="text-primary">{zh ? "真实利润公式" : "True-profit formula"}</Link>
        {" · "}
        <Link href="/sim/dashboard" className="text-primary">{zh ? "完整看板" : "Full dashboard"}</Link>
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function Row({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd><Link href={href} className="font-medium text-primary">{value}</Link></dd>
    </div>
  );
}

function WorkLink({ href, icon: Icon, title, body }: { href: string; icon: typeof Search; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-2xl border bg-card p-4 hover:border-primary/40">
      <Icon className="size-4 text-primary" />
      <div className="mt-2 font-medium">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}
