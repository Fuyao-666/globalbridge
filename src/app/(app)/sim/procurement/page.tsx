"use client";

import { useState } from "react";
import { toast } from "sonner";
import { productById } from "@/lib/catalog";
import { compositeRisk, riskTone } from "@/lib/economics";
import { formatSimDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { suppliersFor } from "@/lib/suppliers";
import type { Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { postPnl, spendCredit, useCredit } from "@/components/credit-dock";
import { useSession } from "@/components/session-bridge";
import { ChainBar, EmptyState, ExactMoney, PageIntro, ProductArt } from "@/components/widgets";
import { cn } from "@/lib/utils";

export default function ProcurementPage() {
  const locale = useStore((state) => state.locale);
  const shortlist = useStore((state) => state.shortlist);
  const params = useStore((state) => state.params);
  const purchases = useStore((state) => state.sim.purchases);
  const inventory = useStore((state) => state.sim.inventory);
  const simDay = useStore((state) => state.sim.simDay);
  const placeOrder = useStore((state) => state.placeOrder);
  const session = useSession();
  const [target, setTarget] = useState<{ productId: string; supplier: Supplier } | null>(null);
  const [qty, setQty] = useState(100);
  const [ack, setAck] = useState(false);

  return (
    <div>
      <PageIntro
        title={locale === "zh" ? "采购与供应商风险" : "Procurement and supplier risk"}
        body={locale === "zh" ? "风险分由质量、交期、合规、资金和物流加权。60 分以上必须确认才下单。低价工贸的合规风险会在上架时抑制链接。" : "The score weights quality, delivery, compliance, capital, and logistics. At 60 or above you must confirm the order. The bargain trader's compliance risk suppresses the listing later."}
      />
      <ChainBar />
      {shortlist.length === 0 ? (
        <EmptyState title={locale === "zh" ? "清单是空的" : "The shortlist is empty"} body={locale === "zh" ? "先在选品页把通过真实利润检查的商品加进来。" : "Add a product that survived the true-profit check."} href="/sim/selection" action={locale === "zh" ? "去选品" : "Go to selection"} />
      ) : (
        <div className="space-y-6">
          {shortlist.map((productId) => {
            const product = productById(productId);
            if (!product) return null;
            return (
              <section key={productId} className="rounded-2xl border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-16"><ProductArt id={product.id} category={product.category} /></div>
                  <div>
                    <h2 className="font-semibold">{product.name[locale]}</h2>
                    <p className="text-xs text-muted-foreground">
                      {locale === "zh" ? "默认采购单价" : "Default unit cost"} <ExactMoney usd={product.unitCost} />
                      {(inventory[product.id] ?? 0) <= 0 && (locale === "zh" ? " · 还没入库，适合走完整上架" : " · No stock yet. Use this one for the full listing path.")}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  {suppliersFor(product).map((supplier) => {
                    const risk = compositeRisk(supplier, params.riskWeights);
                    const tone = riskTone(risk);
                    return (
                      <article key={supplier.id} className="rounded-xl border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{supplier.name[locale]}</h3>
                            <p className="text-xs text-muted-foreground">{supplier.region[locale]}</p>
                          </div>
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", tone === "high" ? "bg-destructive/10 text-destructive" : tone === "mid" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{risk}</span>
                        </div>
                        <dl className="mt-3 space-y-1 text-sm">
                          <Row k={locale === "zh" ? "单价" : "Unit cost"} v={<ExactMoney usd={supplier.unitCost} />} />
                          <Row k="MOQ" v={String(supplier.moq)} />
                          <Row k={locale === "zh" ? "交期" : "Lead"} v={`${supplier.leadDays} ${locale === "zh" ? "天" : "days"}`} />
                          <Row k={locale === "zh" ? "账期" : "Terms"} v={supplier.paymentTerms[locale]} />
                        </dl>
                        <div className="mt-3 space-y-1">
                          {(["quality", "delivery", "compliance", "capital", "logistics"] as const).map((key) => (
                            <div key={key} className="grid grid-cols-[72px_1fr_28px] items-center gap-2 text-[11px] text-muted-foreground">
                              <span>{labelRisk(key, locale)}</span>
                              <span className="h-1.5 overflow-hidden rounded-full bg-muted"><span className={cn("block h-full", supplier.risks[key] >= 60 ? "bg-destructive" : "bg-primary")} style={{ width: `${supplier.risks[key]}%` }} /></span>
                              <span>{supplier.risks[key]}</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{supplier.certifications.length ? supplier.certifications.join(" · ") : (locale === "zh" ? "没有可核验证照" : "No certificates on file")}</p>
                        <p className="mt-1 text-xs">{supplier.note[locale]}</p>
                        <Button className="mt-3 h-8 w-full" variant={tone === "high" ? "outline" : "default"} onClick={() => { setTarget({ productId, supplier }); setQty(supplier.moq); setAck(false); }}>
                          {locale === "zh" ? "下采购单" : "Place order"}
                        </Button>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
      <h2 className="mt-8 mb-3 font-semibold">{locale === "zh" ? "采购单" : "Purchase orders"}</h2>
      {purchases.length === 0 ? (
        <p className="text-sm text-muted-foreground">{locale === "zh" ? "还没有采购单。" : "No purchase orders yet."}</p>
      ) : (
        <div className="overflow-auto rounded-2xl border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">{locale === "zh" ? "商品" : "Product"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "供应商" : "Supplier"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "数量" : "Qty"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "风险" : "Risk"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "状态" : "Status"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "预计入库" : "ETA"}</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => {
                const product = productById(purchase.productId);
                return (
                  <tr key={purchase.id} className="border-t">
                    <td className="px-3 py-2">{product?.name[locale]}</td>
                    <td className="px-3 py-2">{purchase.supplierName[locale]}</td>
                    <td className="px-3 py-2">{purchase.qty}</td>
                    <td className={cn("px-3 py-2", purchase.highRisk && "text-destructive")}>{purchase.risk}</td>
                    <td className="px-3 py-2">{purchase.status === "received" ? (locale === "zh" ? "已入库" : "Received") : (locale === "zh" ? "在途" : "In transit")}</td>
                    <td className="px-3 py-2">{formatSimDate(purchase.etaDay, locale)}{purchase.etaDay > simDay ? ` · ${purchase.etaDay - simDay}${locale === "zh" ? " 天后" : "d"}` : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "zh" ? "确认采购单" : "Confirm purchase"}</DialogTitle>
          </DialogHeader>
          {target && (
            <OrderForm
              qty={qty}
              setQty={setQty}
              ack={ack}
              setAck={setAck}
              supplier={target.supplier}
              onCancel={() => setTarget(null)}
              onSubmit={() => {
                void (async () => {
                  const cost = Math.round(target.supplier.unitCost * qty * 100) / 100;
                  const learner = session.role === "learner";
                  if (learner) {
                    const spent = await spendCredit(cost);
                    if (!spent.ok) {
                      toast.error(locale === "zh" ? "实训额度不够支付这笔货款，请先申请充值。" : "Training credit cannot cover this purchase. Request a top-up first.");
                      useCredit.getState().setOpenApply(true);
                      return;
                    }
                  }
                  const result = placeOrder({ productId: target.productId, supplierId: target.supplier.id, qty, acknowledge: ack });
                  if (!result.ok) {
                    if (learner) await postPnl(cost);
                    const message = result.error === "moq"
                      ? (locale === "zh" ? `数量不能低于 MOQ ${target.supplier.moq}` : `Quantity is below MOQ ${target.supplier.moq}`)
                      : result.error === "risk"
                        ? (locale === "zh" ? "高风险订单需要勾选确认" : "High-risk orders need the confirmation")
                        : (locale === "zh" ? "无法创建订单" : "Could not create the order");
                    toast.error(message);
                    return;
                  }
                  toast.success(learner
                    ? (locale === "zh" ? "采购单已创建，货款已从实训额度扣减。推进模拟日直到入库。" : "Purchase created. The goods value was deducted from training credit. Advance days until it is received.")
                    : (locale === "zh" ? "采购单已创建，推进模拟日直到入库" : "Purchase created. Advance days until it is received."));
                  setTarget(null);
                })();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderForm({ qty, setQty, ack, setAck, supplier, onSubmit, onCancel }: { qty: number; setQty: (n: number) => void; ack: boolean; setAck: (v: boolean) => void; supplier: Supplier; onSubmit: () => void; onCancel: () => void }) {
  const locale = useStore((state) => state.locale);
  const params = useStore((state) => state.params);
  const risk = compositeRisk(supplier, params.riskWeights);
  return (
    <>
      <p className="text-sm text-muted-foreground">{supplier.name[locale]} · MOQ {supplier.moq}</p>
      <label className="mt-3 block text-sm">
        {locale === "zh" ? "数量" : "Quantity"}
        <Input className="mt-1" type="number" min={supplier.moq} value={qty} onChange={(event) => setQty(Number(event.target.value))} />
      </label>
      <p className="mt-2 text-sm">{locale === "zh" ? "货款约" : "Goods value"} <ExactMoney usd={supplier.unitCost * (Number.isFinite(qty) ? qty : 0)} />{locale === "zh" ? "。学员下单会从实训额度里扣掉这笔货款。" : ". Learners pay this from training credit."}</p>
      {risk >= 60 && (
        <label className="mt-3 flex items-start gap-2 text-sm">
          <Checkbox checked={ack} onCheckedChange={(value) => setAck(value === true)} />
          <span>{locale === "zh" ? "我知道这家供应商风险分不低于 60，仍然下单。这会被记在采购单上。" : "I know this supplier scores 60 or higher and I still want the order. The flag stays on the purchase."}</span>
        </label>
      )}
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel}>{locale === "zh" ? "取消" : "Cancel"}</Button>
        <Button onClick={onSubmit}>{locale === "zh" ? "创建采购单" : "Create order"}</Button>
      </DialogFooter>
    </>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-2"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>;
}

function labelRisk(key: string, locale: "zh" | "en") {
  const map: Record<string, [string, string]> = {
    quality: ["质量", "Quality"],
    delivery: ["交期", "Delivery"],
    compliance: ["合规", "Compliance"],
    capital: ["资金", "Capital"],
    logistics: ["物流", "Logistics"],
  };
  const pair = map[key];
  return locale === "zh" ? pair[0] : pair[1];
}
