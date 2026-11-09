"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { create } from "zustand";
import { formatCredit } from "@/lib/credit";
import { summarizeRange } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import { useSession } from "@/components/session-bridge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CreditState = {
  balance: number | null;
  pending: boolean;
  openApply: boolean;
  setOpenApply: (open: boolean) => void;
  refresh: () => Promise<number | null>;
};

export const useCredit = create<CreditState>((set) => ({
  balance: null,
  pending: false,
  openApply: false,
  setOpenApply: (open) => set({ openApply: open }),
  refresh: async () => {
    const response = await fetch("/api/me/credit");
    if (!response.ok) return null;
    const data = (await response.json()) as { balance: number; pending: boolean };
    set({ balance: data.balance, pending: data.pending });
    return data.balance;
  },
}));

export async function spendCredit(amount: number) {
  const response = await fetch("/api/me/credit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op: "spend", amount }),
  });
  const data = (await response.json().catch(() => ({}))) as { balance?: number; error?: string };
  if (response.ok && typeof data.balance === "number") {
    useCredit.setState({ balance: data.balance });
    return { ok: true as const, balance: data.balance };
  }
  if (typeof data.balance === "number") useCredit.setState({ balance: data.balance });
  return { ok: false as const, error: data.error || "failed" };
}

export async function postPnl(amount: number) {
  if (!Number.isFinite(amount) || Math.abs(amount) < 0.005) return;
  const response = await fetch("/api/me/credit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op: "pnl", amount }),
  });
  if (!response.ok) return;
  const data = (await response.json()) as { balance?: number };
  if (typeof data.balance === "number") useCredit.setState({ balance: data.balance });
}

export function CreditPill() {
  const locale = useStore((state) => state.locale);
  const balance = useCredit((state) => state.balance);
  const setOpenApply = useCredit((state) => state.setOpenApply);
  if (balance === null) return null;
  const empty = balance <= 0;
  return (
    <button
      type="button"
      className={empty ? "rounded-full bg-rose-600 px-3 py-1 text-xs font-medium text-white" : "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-800"}
      onClick={() => empty && setOpenApply(true)}
    >
      {locale === "zh" ? "实训额度" : "Training credit"} {formatCredit(balance)}
      {empty ? (locale === "zh" ? " · 申请" : " · Apply") : ""}
    </button>
  );
}

export function CreditBanner() {
  const locale = useStore((state) => state.locale);
  const balance = useCredit((state) => state.balance);
  const pending = useCredit((state) => state.pending);
  const setOpenApply = useCredit((state) => state.setOpenApply);
  if (balance === null || balance > 0) return null;
  return (
    <div className="border-b border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-950 md:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3">
        <span>{locale === "zh" ? "实训额度已用完或已被亏损扣完，采购和推进模拟日已暂停。" : "Training credit is used up or wiped out by losses. Purchases and day advances are paused."}</span>
        <Button className="h-8" disabled={pending} onClick={() => setOpenApply(true)}>
          {pending ? (locale === "zh" ? "已提交，等待充值" : "Waiting for a top-up") : (locale === "zh" ? "申请额度" : "Request credit")}
        </Button>
      </div>
    </div>
  );
}

export function CreditSync() {
  const session = useSession();
  const sim = useStore((state) => state.sim);
  const lessons = useStore((state) => state.completedLessons.length);
  const refresh = useCredit((state) => state.refresh);
  const openApply = useCredit((state) => state.openApply);
  const setOpenApply = useCredit((state) => state.setOpenApply);
  const pending = useCredit((state) => state.pending);

  useEffect(() => {
    if (session.role !== "learner") return;
    void refresh();
  }, [refresh, session.role]);

  useEffect(() => {
    if (session.role !== "learner") return;
    const handle = setTimeout(() => {
      const summary = summarizeRange(sim.ledger, sim.visitors, sim.adSpendByDay, -7, sim.simDay);
      void fetch("/api/me/snapshot", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lessonsDone: lessons,
          simDay: sim.simDay,
          revenue: summary.gross,
          orders: summary.orders,
          profit: summary.profit,
          purchases: sim.purchases.length,
        }),
      });
    }, 700);
    return () => clearTimeout(handle);
  }, [lessons, session.role, sim]);

  if (session.role !== "learner") return null;
  return <ApplyDialog open={openApply} pending={pending} onOpenChange={setOpenApply} onDone={() => void refresh()} />;
}

function ApplyDialog({ open, pending, onOpenChange, onDone }: { open: boolean; pending: boolean; onOpenChange: (open: boolean) => void; onDone: () => void }) {
  const locale = useStore((state) => state.locale);
  const zh = locale === "zh";
  const [amount, setAmount] = useState("100000");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const response = await fetch("/api/me/credit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "apply", amount: Number(amount), note }),
    });
    setBusy(false);
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      toast.error(payload.error === "pending" ? (zh ? "已有一条待处理申请。" : "A request is already waiting.") : (zh ? "申请没有提交。" : "The request was not sent."));
      return;
    }
    toast.success(zh ? "申请已提交，超管充值后额度会恢复。" : "Request sent. Credit returns after the superadmin tops it up.");
    onOpenChange(false);
    onDone();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{zh ? "申请实训额度" : "Request training credit"}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {zh ? "起始额度为 US$500,000。采购按货款扣减，每天的经营现金流（不含已在采购时支付的货款）会计入额度。用完或亏损到 0 及以下后，在这里申请充值。" : "The opening balance is US$500,000. Purchases deduct goods value, and each day's operating cash flow is added. Apply here once it is used up or falls to zero."}
        </p>
        <label className="mt-3 block text-sm">
          {zh ? "申请金额（美元）" : "Amount (USD)"}
          <Input className="mt-1" type="number" min={1} value={amount} onChange={(event) => setAmount(event.target.value)} />
        </label>
        <label className="mt-3 block text-sm">
          {zh ? "说明" : "Note"}
          <Textarea className="mt-1" value={note} onChange={(event) => setNote(event.target.value)} placeholder={zh ? "例如：补货后额度用完" : "For example: restock used the balance"} />
        </label>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{zh ? "取消" : "Cancel"}</Button>
          <Button disabled={busy || pending} onClick={() => void submit()}>{pending ? (zh ? "已有待处理申请" : "Already pending") : (zh ? "提交申请" : "Submit")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
