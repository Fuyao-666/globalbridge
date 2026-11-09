"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { productById } from "@/lib/catalog";
import { unitEconomics } from "@/lib/economics";
import { useStore } from "@/lib/store";
import type { Product, SimParams } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExactMoney, PageIntro } from "@/components/widgets";

export default function ToolsPage() {
  const locale = useStore((state) => state.locale);
  const params = useStore((state) => state.params);
  const productId = useSearchParams().get("product");
  const product = productId ? productById(productId) : undefined;
  return (
    <div>
      <PageIntro
        title={locale === "zh" ? "真实利润计算器" : "True-profit calculator"}
        body={locale === "zh" ? "和课程 2.2 同一条公式。这里改的是这一次试算，不会改全店参数。全店参数在管理后台。" : "The same formula as lesson 2.2. Changes here are one calculation. Store-wide parameters live in admin."}
      />
      <Calculator params={params} product={product} />
      <p className="mt-4 text-sm">
        <Link href="/learn/sourcing/src-22" className="text-primary">{locale === "zh" ? "回到公式课" : "Back to the formula lesson"}</Link>
      </p>
    </div>
  );
}

function Calculator({ params, product }: { params: SimParams; product?: Product }) {
  const locale = useStore((state) => state.locale);
  const [form, setForm] = useState(() => ({
    price: product?.price ?? 19.99,
    unitCost: product?.unitCost ?? 5,
    fbaFee: product?.fbaFee ?? 3.2,
    inbound: product?.inbound ?? 1,
    leadDays: product?.leadDays ?? 30,
    monthlySales: product?.monthlySales ?? 100,
    referralRate: params.referralRate,
    adRate: params.adRate,
    opsPerUnit: params.opsPerUnit,
    returnRate: params.returnRate,
    capitalAnnual: params.capitalAnnual,
    opportunityRate: params.opportunityRate,
    coverDays: params.coverDays,
  }));
  const eco = useMemo(() => {
    const standIn: Product = {
      id: "calc",
      name: { zh: "试算", en: "Trial" },
      category: "home",
      subcategory: { zh: "", en: "" },
      price: num(form.price),
      rating: 0,
      reviews: 0,
      demand: 0,
      competition: 0,
      monthlySales: num(form.monthlySales),
      unitCost: num(form.unitCost),
      fbaFee: num(form.fbaFee),
      inbound: num(form.inbound),
      leadDays: num(form.leadDays),
    };
    return unitEconomics(standIn, {
      ...params,
      referralRate: num(form.referralRate),
      adRate: num(form.adRate),
      opsPerUnit: num(form.opsPerUnit),
      returnRate: num(form.returnRate),
      capitalAnnual: num(form.capitalAnnual),
      opportunityRate: num(form.opportunityRate),
      coverDays: num(form.coverDays),
    });
  }, [form, params]);

  function set<K extends keyof typeof form>(key: K, value: number) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2">
        <Field label={locale === "zh" ? "标价" : "Price"} value={form.price} onChange={(value) => set("price", value)} />
        <Field label={locale === "zh" ? "采购单价" : "Unit cost"} value={form.unitCost} onChange={(value) => set("unitCost", value)} />
        <Field label="FBA" value={form.fbaFee} onChange={(value) => set("fbaFee", value)} />
        <Field label={locale === "zh" ? "头程 / 件" : "Inbound / unit"} value={form.inbound} onChange={(value) => set("inbound", value)} />
        <Field label={locale === "zh" ? "交期天数" : "Lead days"} value={form.leadDays} onChange={(value) => set("leadDays", value)} />
        <Field label={locale === "zh" ? "月销量" : "Monthly units"} value={form.monthlySales} onChange={(value) => set("monthlySales", value)} />
        <Field label={locale === "zh" ? "佣金比例" : "Referral rate"} value={form.referralRate} step={0.01} onChange={(value) => set("referralRate", value)} />
        <Field label={locale === "zh" ? "广告占标价" : "Ad ratio"} value={form.adRate} step={0.01} onChange={(value) => set("adRate", value)} />
        <Field label={locale === "zh" ? "单件人工" : "Labor / unit"} value={form.opsPerUnit} step={0.1} onChange={(value) => set("opsPerUnit", value)} />
        <Field label={locale === "zh" ? "退货率" : "Return rate"} value={form.returnRate} step={0.01} onChange={(value) => set("returnRate", value)} />
        <Field label={locale === "zh" ? "资金年化" : "Capital annual"} value={form.capitalAnnual} step={0.01} onChange={(value) => set("capitalAnnual", value)} />
        <Field label={locale === "zh" ? "机会成本率" : "Opportunity rate"} value={form.opportunityRate} step={0.01} onChange={(value) => set("opportunityRate", value)} />
        <div className="sm:col-span-2">
          <Button variant="outline" className="h-8" onClick={() => setForm((current) => ({ ...current, referralRate: params.referralRate, adRate: params.adRate, opsPerUnit: params.opsPerUnit, returnRate: params.returnRate, capitalAnnual: params.capitalAnnual, opportunityRate: params.opportunityRate, coverDays: params.coverDays }))}>
            {locale === "zh" ? "恢复全店参数" : "Use store parameters"}
          </Button>
        </div>
      </div>
      <div className="rounded-2xl border bg-card p-4">
        <p className="font-mono text-sm">真实利润 = 销售额 − 采购 − 运营 − 物流 − 退货 − 资金 − 机会</p>
        <dl className="mt-4 space-y-2 text-sm">
          <Line k={locale === "zh" ? "到手销售额" : "Net revenue"} v={eco.netRevenue} />
          <Line k={locale === "zh" ? "采购" : "Procurement"} v={-eco.procurement} />
          <Line k={locale === "zh" ? "运营" : "Operating"} v={-eco.operating} />
          <Line k={locale === "zh" ? "物流" : "Logistics"} v={-eco.logistics} />
          <Line k={locale === "zh" ? "退货" : "Returns"} v={-eco.returns} />
          <Line k={locale === "zh" ? "资金" : "Capital"} v={-eco.capital} />
          <Line k={locale === "zh" ? "机会" : "Opportunity"} v={-eco.opportunity} />
        </dl>
        <div className="mt-4 border-t pt-3">
          <div className="text-sm text-muted-foreground">{locale === "zh" ? "单件真实利润" : "True profit / unit"}</div>
          <div className={eco.trueProfit < 0 ? "text-2xl font-semibold text-destructive" : "text-2xl font-semibold text-emerald-600"}><ExactMoney usd={eco.trueProfit} /></div>
          <div className="mt-2 text-sm">{locale === "zh" ? "毛利率" : "Gross margin"} {Math.round(eco.grossMargin * 100)}% · {locale === "zh" ? "真实利润率" : "True margin"} {Math.round(eco.trueMargin * 100)}%</div>
          <div className="mt-1 text-sm">{locale === "zh" ? "按月销量估算的真实利润" : "Monthly true profit"} <ExactMoney usd={eco.trueProfit * num(form.monthlySales)} /></div>
        </div>
      </div>
    </div>
  );
}

function num(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function Field({ label, value, onChange, step = 0.01 }: { label: string; value: number; onChange: (value: number) => void; step?: number }) {
  return (
    <label className="text-sm">
      {label}
      <Input className="mt-1" type="number" step={step} value={Number.isFinite(value) ? value : 0} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Line({ k, v }: { k: string; v: number }) {
  return <div className="flex justify-between"><dt>{k}</dt><dd><ExactMoney usd={v} /></dd></div>;
}
