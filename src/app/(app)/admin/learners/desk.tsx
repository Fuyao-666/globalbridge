"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatCredit, type CustomField } from "@/lib/credit";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageIntro } from "@/components/widgets";

type Learner = {
  id: string;
  email: string;
  username: string | null;
  name: string;
  balance: number;
  lessonsDone: number;
  simDay: number;
  revenue: number;
  orders: number;
  profit: number;
  purchases: number;
  custom: CustomField[];
  pending: boolean;
};

const emptyForm = { name: "", username: "", email: "", password: "" };

export function LearnerDesk() {
  const locale = useStore((state) => state.locale);
  const zh = locale === "zh";
  const [rows, setRows] = useState<Learner[] | null>(null);
  const [error, setError] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Learner | null>(null);

  async function load() {
    const response = await fetch("/api/admin/learners");
    if (!response.ok) {
      setError(true);
      return;
    }
    setError(false);
    setRows(await response.json());
  }

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, []);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/learners", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      toast.error(zh ? "学员没有添加成功。检查邮箱、用户名和至少 8 位密码。" : "Could not add the learner. Check the email, username, and an 8+ character password.");
      return;
    }
    setForm(emptyForm);
    toast.success(zh ? "已添加学员，起始额度 US$500,000。" : "Learner added with US$500,000.");
    await load();
  }

  const list = rows ?? [];
  const balance = list.reduce((sum, row) => sum + row.balance, 0);
  const pending = list.filter((row) => row.pending).length;

  return (
    <div>
      <PageIntro
        kicker={zh ? "超级管理员" : "Superadmin"}
        title={zh ? "学员数据" : "Learner data"}
        body={zh ? "这里看每位学员的学习和模拟结果。称呼、邮箱、实训额度和自定义字段以这里保存的为准。课时、模拟日、销售额、订单、利润和采购单可以改，学员下次打开模拟后会按他浏览器里的进度刷新。" : "Review each learner's study and simulation numbers. Name, email, training credit, and custom fields stay as saved here. Lessons, sim day, revenue, orders, profit, and purchases can be edited, then refresh from that learner's browser the next time they open the simulator."}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label={zh ? "学员人数" : "Learners"} value={rows ? String(list.length) : "—"} />
        <Stat label={zh ? "额度合计" : "Credit total"} value={rows ? formatCredit(balance) : "—"} />
        <Stat label={zh ? "待充值" : "Waiting top-ups"} value={rows ? String(pending) : "—"} />
      </div>
      <form className="mb-4 grid gap-2 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-2" onSubmit={create}>
        <p className="text-sm text-slate-600 md:col-span-2">{zh ? "直接添加学员。新账号起始实训额度为 US$500,000。" : "Add a learner directly. New accounts start with US$500,000 of training credit."}</p>
        <Input placeholder={zh ? "称呼" : "Name"} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <Input placeholder={zh ? "用户名，可留空" : "Username, optional"} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
        <Input type="email" placeholder={zh ? "邮箱" : "Email"} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <Input type="password" placeholder={zh ? "初始密码" : "Initial password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        <Button type="submit" className="h-9 md:col-span-2">{zh ? "添加学员" : "Add learner"}</Button>
      </form>
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {zh ? "学员数据没有载入。" : "Learner data did not load."}
          <Button variant="outline" className="ml-3 h-8" onClick={() => void load()}>{zh ? "重试" : "Retry"}</Button>
        </div>
      )}
      {!error && rows === null && <p className="text-sm text-slate-500">{zh ? "正在读取学员数据。" : "Loading learner data."}</p>}
      {!error && rows && rows.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-sm text-slate-600">{zh ? "还没有学员。学员注册后会出现在这里。" : "No learners yet. They appear here after they register."}</div>
      )}
      {rows && rows.length > 0 && (
        <div className="overflow-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-slate-100 text-left text-xs text-slate-600">
              <tr>
                <th className="px-3 py-2">{zh ? "学员" : "Learner"}</th>
                <th className="px-3 py-2">{zh ? "实训额度" : "Credit"}</th>
                <th className="px-3 py-2">{zh ? "课时" : "Lessons"}</th>
                <th className="px-3 py-2">{zh ? "模拟日" : "Sim day"}</th>
                <th className="px-3 py-2">{zh ? "销售额" : "Revenue"}</th>
                <th className="px-3 py-2">{zh ? "订单" : "Orders"}</th>
                <th className="px-3 py-2">{zh ? "利润" : "Profit"}</th>
                <th className="px-3 py-2">{zh ? "采购单" : "POs"}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.email}</div>
                  </td>
                  <td className={row.balance <= 0 ? "px-3 py-2 font-medium text-rose-700" : "px-3 py-2"}>{formatCredit(row.balance)}{row.pending ? (zh ? " · 待充值" : " · pending") : ""}</td>
                  <td className="px-3 py-2">{row.lessonsDone}</td>
                  <td className="px-3 py-2">{row.simDay}</td>
                  <td className="px-3 py-2">{formatCredit(row.revenue)}</td>
                  <td className="px-3 py-2">{row.orders}</td>
                  <td className="px-3 py-2">{formatCredit(row.profit)}</td>
                  <td className="px-3 py-2">{row.purchases}</td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="outline" className="h-8" onClick={() => setEditing(row)}>{zh ? "编辑" : "Edit"}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <Editor learner={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Editor({ learner, onClose, onSaved }: { learner: Learner; onClose: () => void; onSaved: () => void }) {
  const locale = useStore((state) => state.locale);
  const zh = locale === "zh";
  const [draft, setDraft] = useState(learner);
  const [fieldKey, setFieldKey] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof Learner>(key: K, value: Learner[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setBusy(true);
    const response = await fetch(`/api/admin/learners/${learner.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    setBusy(false);
    if (!response.ok) {
      toast.error(zh ? "没有保存。邮箱可能已被占用，额度需要是数字。" : "Not saved. The email may be taken, and credit must be a number.");
      return;
    }
    toast.success(zh ? "学员资料已更新" : "Learner updated");
    onSaved();
  }

  async function remove() {
    if (!window.confirm(zh ? `删除学员 ${draft.name}？登录和额度会一起清掉。` : `Delete ${draft.name}? Their login and credit go with them.`)) return;
    const response = await fetch(`/api/admin/learners/${learner.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error(zh ? "没有删除。" : "Not deleted.");
      return;
    }
    toast.success(zh ? "已删除学员" : "Learner deleted");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{zh ? "编辑学员" : "Edit learner"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label={zh ? "称呼" : "Name"} value={draft.name} onChange={(value) => set("name", value)} />
          <Field label={zh ? "邮箱" : "Email"} value={draft.email} onChange={(value) => set("email", value)} />
          <Field label={zh ? "实训额度" : "Credit"} value={String(draft.balance)} onChange={(value) => set("balance", Number(value))} />
          <Field label={zh ? "完成课时" : "Lessons done"} value={String(draft.lessonsDone)} onChange={(value) => set("lessonsDone", Number(value))} />
          <Field label={zh ? "模拟日" : "Sim day"} value={String(draft.simDay)} onChange={(value) => set("simDay", Number(value))} />
          <Field label={zh ? "销售额" : "Revenue"} value={String(draft.revenue)} onChange={(value) => set("revenue", Number(value))} />
          <Field label={zh ? "订单数" : "Orders"} value={String(draft.orders)} onChange={(value) => set("orders", Number(value))} />
          <Field label={zh ? "利润" : "Profit"} value={String(draft.profit)} onChange={(value) => set("profit", Number(value))} />
          <Field label={zh ? "采购单" : "Purchases"} value={String(draft.purchases)} onChange={(value) => set("purchases", Number(value))} />
        </div>
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium text-slate-900">{zh ? "自定义字段" : "Custom fields"}</div>
          {draft.custom.length === 0 && <p className="text-sm text-slate-500">{zh ? "还没有自定义字段。" : "No custom fields yet."}</p>}
          <div className="space-y-2">
            {draft.custom.map((field) => (
              <div key={field.id} className="flex gap-2">
                <Input value={field.key} onChange={(event) => set("custom", draft.custom.map((item) => item.id === field.id ? { ...item, key: event.target.value } : item))} />
                <Input value={field.value} onChange={(event) => set("custom", draft.custom.map((item) => item.id === field.id ? { ...item, value: event.target.value } : item))} />
                <Button variant="outline" className="h-9" onClick={() => set("custom", draft.custom.filter((item) => item.id !== field.id))}>{zh ? "删除" : "Delete"}</Button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Input placeholder={zh ? "字段名" : "Field"} value={fieldKey} onChange={(event) => setFieldKey(event.target.value)} />
            <Input placeholder={zh ? "内容" : "Value"} value={fieldValue} onChange={(event) => setFieldValue(event.target.value)} />
            <Button
              variant="outline"
              className="h-9"
              onClick={() => {
                const key = fieldKey.trim();
                if (!key) return;
                set("custom", [...draft.custom, { id: `fld_${Math.random().toString(36).slice(2, 10)}`, key, value: fieldValue.trim() }]);
                setFieldKey("");
                setFieldValue("");
              }}
            >
              {zh ? "添加" : "Add"}
            </Button>
          </div>
        </div>
        <DialogFooter className="mt-4 sm:justify-between">
          <Button variant="outline" className="text-rose-700" onClick={() => void remove()}>{zh ? "删除学员" : "Delete learner"}</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>{zh ? "取消" : "Cancel"}</Button>
            <Button disabled={busy} onClick={() => void save()}>{zh ? "保存" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-slate-700">
      {label}
      <Input className="mt-1" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
