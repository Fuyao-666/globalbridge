"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatCredit } from "@/lib/credit";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageIntro } from "@/components/widgets";

type CreditRequest = {
  id: string;
  name: string;
  email: string;
  amount: number;
  note: string;
  status: string;
  granted: number | null;
  balance: number | null;
  createdAt: string;
};

export function CreditDesk() {
  const locale = useStore((state) => state.locale);
  const zh = locale === "zh";
  const [rows, setRows] = useState<CreditRequest[] | null>(null);
  const [error, setError] = useState(false);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");

  async function load() {
    const response = await fetch("/api/admin/credits");
    if (!response.ok) {
      setError(true);
      return;
    }
    const data = (await response.json()) as CreditRequest[];
    setError(false);
    setRows(data);
    setAmounts((current) => {
      const next = { ...current };
      for (const row of data) {
        if (next[row.id] === undefined) next[row.id] = String(row.amount);
      }
      return next;
    });
  }

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, []);

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    const response = await fetch("/api/admin/credits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action, granted: Number(amounts[id]) }),
    });
    setBusy("");
    if (!response.ok) {
      toast.error(zh ? "没有处理成功。充值金额需要大于 0。" : "That did not go through. The top-up must be greater than 0.");
      return;
    }
    toast.success(action === "approve" ? (zh ? "已充值" : "Credit added") : (zh ? "已驳回" : "Rejected"));
    await load();
  }

  const pending = (rows ?? []).filter((row) => row.status === "pending").length;

  return (
    <div>
      <PageIntro
        kicker={zh ? "超级管理员" : "Superadmin"}
        title={zh ? "额度申请" : "Credit requests"}
        body={zh ? "学员的实训额度用完或亏损到 0 以后，会在这里留下申请。填写充值金额后提交，额度立即加回该学员账号。" : "Learners leave a request here after their training credit is used up or falls to zero. Enter a top-up and it is added to that account immediately."}
      />
      <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-xs text-slate-500">{zh ? "待处理" : "Pending"}</div>
        <div className="mt-1 text-xl font-semibold text-slate-900">{rows ? pending : "—"}</div>
      </div>
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {zh ? "申请列表没有载入。" : "Requests did not load."}
          <Button variant="outline" className="ml-3 h-8" onClick={() => void load()}>{zh ? "重试" : "Retry"}</Button>
        </div>
      )}
      {!error && rows === null && <p className="text-sm text-slate-500">{zh ? "正在读取申请。" : "Loading requests."}</p>}
      {!error && rows && rows.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-sm text-slate-600">{zh ? "还没有额度申请。" : "No credit requests yet."}</div>
      )}
      {rows && rows.length > 0 && (
        <div className="overflow-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-100 text-left text-xs text-slate-600">
              <tr>
                <th className="px-3 py-2">{zh ? "学员" : "Learner"}</th>
                <th className="px-3 py-2">{zh ? "当前额度" : "Balance"}</th>
                <th className="px-3 py-2">{zh ? "申请" : "Request"}</th>
                <th className="px-3 py-2">{zh ? "状态" : "Status"}</th>
                <th className="px-3 py-2">{zh ? "充值" : "Top-up"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.email}</div>
                    {row.note && <div className="mt-1 text-xs text-slate-600">{row.note}</div>}
                  </td>
                  <td className="px-3 py-2">{row.balance === null ? "—" : formatCredit(row.balance)}</td>
                  <td className="px-3 py-2">{formatCredit(row.amount)}</td>
                  <td className="px-3 py-2">{statusLabel(row.status, zh)}{row.granted !== null ? ` · ${formatCredit(row.granted)}` : ""}</td>
                  <td className="px-3 py-2">
                    {row.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <Input className="h-8 w-28" type="number" min={1} value={amounts[row.id] ?? ""} onChange={(event) => setAmounts({ ...amounts, [row.id]: event.target.value })} />
                        <Button className="h-8" disabled={busy === row.id} onClick={() => void act(row.id, "approve")}>{zh ? "充值" : "Top up"}</Button>
                        <Button variant="outline" className="h-8" disabled={busy === row.id} onClick={() => void act(row.id, "reject")}>{zh ? "驳回" : "Reject"}</Button>
                      </div>
                    ) : (
                      <span className="text-slate-500">{new Date(row.createdAt).toLocaleString(zh ? "zh-CN" : "en-US", { timeZone: "Asia/Shanghai" })}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function statusLabel(status: string, zh: boolean) {
  if (status === "pending") return zh ? "待处理" : "Pending";
  if (status === "approved") return zh ? "已充值" : "Topped up";
  return zh ? "已驳回" : "Rejected";
}
