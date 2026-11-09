"use client";

import { useState } from "react";
import { toast } from "sonner";
import { COURSES, courseLessons } from "@/lib/data/courses";
import { CLASSMATES } from "@/lib/data/content";
import { GLOSSARY, GLOSSARY_CATEGORIES } from "@/lib/data/glossary";
import { DEFAULT_PARAMS } from "@/lib/economics";
import { levelFrom, useStore, xpFrom } from "@/lib/store";
import type { GlossaryCategory, GlossaryTerm, SimParams } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PageIntro } from "@/components/widgets";

export default function AdminPage() {
  const locale = useStore((state) => state.locale);
  const role = useStore((state) => state.role);
  const setRole = useStore((state) => state.setRole);
  const [tab, setTab] = useState<"overview" | "courses" | "terms" | "params">("overview");
  if (role !== "admin") {
    return (
      <div className="rounded-2xl border bg-card p-8">
        <h1 className="text-xl font-semibold">{locale === "zh" ? "管理后台" : "Admin"}</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          {locale === "zh" ? "这是模拟里的角色，不是真实登录。切换后可以改佣金、退货率和课程发布状态，学员看到的利润会跟着变。" : "This role is part of the simulation, not a real login. Switching lets you change fees, return rate, and which courses are published."}
        </p>
        <Button className="mt-4 h-9" onClick={() => setRole("admin")}>{locale === "zh" ? "以管理员进入" : "Enter as admin"}</Button>
      </div>
    );
  }
  return (
    <div>
      <PageIntro title={locale === "zh" ? "管理后台" : "Admin"} body={locale === "zh" ? "参数会写进这台浏览器，并立即影响选品页的毛利和真实利润。" : "Parameters stay in this browser and immediately change gross margin and true profit."} />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["overview", "courses", "terms", "params"] as const).map((item) => (
          <Button key={item} variant={tab === item ? "default" : "outline"} className="h-8" onClick={() => setTab(item)}>
            {item === "overview" ? (locale === "zh" ? "概览" : "Overview") : item === "courses" ? (locale === "zh" ? "课程" : "Courses") : item === "terms" ? (locale === "zh" ? "术语" : "Glossary") : (locale === "zh" ? "模拟参数" : "Parameters")}
          </Button>
        ))}
      </div>
      {tab === "overview" && <Overview />}
      {tab === "courses" && <Courses />}
      {tab === "terms" && <Terms />}
      {tab === "params" && <Params />}
    </div>
  );
}

function Overview() {
  const locale = useStore((state) => state.locale);
  const completed = useStore((state) => state.completedLessons);
  const profile = useStore((state) => state.profile);
  const resetProgress = useStore((state) => state.resetProgress);
  const resetSimulation = useStore((state) => state.resetSimulation);
  const state = useStore();
  const xp = xpFrom(state);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4">
        <h2 className="font-medium">{profile.handle}</h2>
        <p className="text-sm text-muted-foreground">Lv.{levelFrom(xp)} · {xp} XP · {completed.length} {locale === "zh" ? "节已完成" : "lessons done"}</p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" className="h-8" onClick={resetProgress}>{locale === "zh" ? "清空学习进度" : "Clear progress"}</Button>
          <Button variant="outline" className="h-8" onClick={resetSimulation}>{locale === "zh" ? "重置演示店" : "Reset store"}</Button>
        </div>
      </div>
      <div className="overflow-auto rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr><th className="px-3 py-2">{locale === "zh" ? "同学（示例）" : "Classmates (sample)"}</th><th className="px-3 py-2">XP</th><th className="px-3 py-2">{locale === "zh" ? "课时" : "Lessons"}</th><th className="px-3 py-2">{locale === "zh" ? "最近活跃" : "Last active"}</th></tr>
          </thead>
          <tbody>
            {CLASSMATES.map((mate) => (
              <tr key={mate.handle} className="border-t"><td className="px-3 py-2">{mate.handle}</td><td className="px-3 py-2">{mate.xp}</td><td className="px-3 py-2">{mate.lessons}</td><td className="px-3 py-2">{mate.lastActive}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Courses() {
  const locale = useStore((state) => state.locale);
  const published = useStore((state) => state.coursePublished);
  const titles = useStore((state) => state.courseTitles);
  const setPublished = useStore((state) => state.setCoursePublished);
  const setTitle = useStore((state) => state.setCourseTitle);
  const completeCourse = useStore((state) => state.completeCourse);
  return (
    <div className="space-y-3">
      {COURSES.map((course) => {
        const isOn = published[course.id] !== false;
        const title = titles[course.id] ?? course.title;
        return (
          <div key={course.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">{course.title[locale]}</div>
              <Switch checked={isOn} onCheckedChange={(value) => setPublished(course.id, value)} />
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <Input value={title.zh} onChange={(event) => setTitle(course.id, { ...title, zh: event.target.value })} />
              <Input value={title.en} onChange={(event) => setTitle(course.id, { ...title, en: event.target.value })} />
            </div>
            <Button variant="outline" className="mt-3 h-8" onClick={() => { completeCourse(course.id); toast.success(locale === "zh" ? "已将该课全部标为完成" : "Course marked complete"); }}>
              {locale === "zh" ? `代为完成 ${courseLessons(course).length} 节` : `Mark all ${courseLessons(course).length} lessons complete`}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

function Terms() {
  const locale = useStore((state) => state.locale);
  const saveTerm = useStore((state) => state.saveTerm);
  const hideTerm = useStore((state) => state.hideTerm);
  const [form, setForm] = useState({ abbr: "", zh: "", en: "", summaryZh: "", summaryEn: "", category: "metrics" as GlossaryCategory });
  return (
    <div className="space-y-4">
      <form className="grid gap-2 rounded-2xl border bg-card p-4 md:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        if (!form.abbr.trim() || !form.zh.trim()) return;
        const term: GlossaryTerm = {
          id: `custom-${form.abbr.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          abbr: form.abbr.trim(),
          name: { zh: form.zh.trim(), en: form.en.trim() || form.zh.trim() },
          category: form.category,
          summary: { zh: form.summaryZh.trim() || form.zh.trim(), en: form.summaryEn.trim() || form.en.trim() || form.zh.trim() },
          detail: { zh: form.summaryZh.trim() || form.zh.trim(), en: form.summaryEn.trim() || form.en.trim() || form.zh.trim() },
        };
        saveTerm(term, true);
        setForm({ abbr: "", zh: "", en: "", summaryZh: "", summaryEn: "", category: "metrics" });
        toast.success(locale === "zh" ? "术语已加入" : "Term added");
      }}>
        <Input placeholder="ABBR" value={form.abbr} onChange={(event) => setForm({ ...form, abbr: event.target.value })} required />
        <select className="h-8 rounded-lg border bg-transparent px-2 text-sm" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as GlossaryCategory })}>
          {GLOSSARY_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{locale === "zh" ? item.zh : item.en}</option>)}
        </select>
        <Input placeholder={locale === "zh" ? "中文名" : "Chinese name"} value={form.zh} onChange={(event) => setForm({ ...form, zh: event.target.value })} required />
        <Input placeholder="English name" value={form.en} onChange={(event) => setForm({ ...form, en: event.target.value })} />
        <Textarea placeholder={locale === "zh" ? "中文解释" : "Chinese summary"} value={form.summaryZh} onChange={(event) => setForm({ ...form, summaryZh: event.target.value })} />
        <Textarea placeholder="English summary" value={form.summaryEn} onChange={(event) => setForm({ ...form, summaryEn: event.target.value })} />
        <Button type="submit" className="h-9 md:col-span-2">{locale === "zh" ? "添加术语" : "Add term"}</Button>
      </form>
      <div className="space-y-2">
        {GLOSSARY.slice(0, 12).map((term) => (
          <div key={term.id} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
            <span>{term.abbr} · {term.name[locale]}</span>
            <Button variant="ghost" className="h-7" onClick={() => hideTerm(term.id)}>{locale === "zh" ? "隐藏" : "Hide"}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Params() {
  const locale = useStore((state) => state.locale);
  const params = useStore((state) => state.params);
  const setParams = useStore((state) => state.setParams);
  const resetParams = useStore((state) => state.resetParams);
  function setNumber(key: keyof SimParams, value: number) {
    if (key === "riskWeights") return;
    setParams({ ...params, [key]: value });
  }
  return (
    <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-2">
      <Num label={locale === "zh" ? "平台佣金" : "Referral fee"} value={params.referralRate} onChange={(value) => setNumber("referralRate", value)} />
      <Num label={locale === "zh" ? "退货率" : "Return rate"} value={params.returnRate} onChange={(value) => setNumber("returnRate", value)} />
      <Num label={locale === "zh" ? "广告占标价" : "Ad ratio"} value={params.adRate} onChange={(value) => setNumber("adRate", value)} />
      <Num label={locale === "zh" ? "单件人工" : "Labor per unit"} value={params.opsPerUnit} onChange={(value) => setNumber("opsPerUnit", value)} />
      <Num label={locale === "zh" ? "资金年化" : "Capital annual rate"} value={params.capitalAnnual} onChange={(value) => setNumber("capitalAnnual", value)} />
      <Num label={locale === "zh" ? "机会成本率" : "Opportunity rate"} value={params.opportunityRate} onChange={(value) => setNumber("opportunityRate", value)} />
      <Num label={locale === "zh" ? "覆盖天数" : "Days of cover"} value={params.coverDays} onChange={(value) => setNumber("coverDays", value)} />
      <Num label={locale === "zh" ? "合规权重" : "Compliance weight"} value={params.riskWeights.compliance} onChange={(value) => setParams({ ...params, riskWeights: { ...params.riskWeights, compliance: value } })} />
      <div className="flex gap-2 md:col-span-2">
        <Button variant="outline" className="h-8" onClick={() => { resetParams(); toast(locale === "zh" ? "已恢复默认参数" : "Defaults restored"); }}>{locale === "zh" ? "恢复默认" : "Restore defaults"}</Button>
        <span className="self-center text-xs text-muted-foreground">{locale === "zh" ? `默认佣金 ${(DEFAULT_PARAMS.referralRate * 100).toFixed(0)}%` : `Default referral ${(DEFAULT_PARAMS.referralRate * 100).toFixed(0)}%`}</span>
      </div>
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="text-sm">
      {label}
      <Input className="mt-1" type="number" step="0.01" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
