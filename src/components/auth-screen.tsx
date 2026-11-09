"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ERRORS: Record<string, { zh: string; en: string }> = {
  name: { zh: "称呼需要 2 到 24 个字。", en: "Use a name between 2 and 24 characters." },
  email: { zh: "请填写有效邮箱。", en: "Enter a valid email." },
  password: { zh: "密码至少 8 位，最长 72 位。", en: "Use 8 to 72 characters." },
  role: { zh: "管理员不能自行注册，请联系超级管理员添加。", en: "Admins cannot register themselves. A superadmin has to add the account." },
  username: { zh: "用户名用 3 到 24 位小写字母、数字或下划线。", en: "Usernames are 3 to 24 letters, numbers, or underscores." },
  locked: { zh: "尝试次数过多，请 15 分钟后再登录。", en: "Too many attempts. Wait 15 minutes and try again." },
  taken: { zh: "这个邮箱已经注册。请直接登录，或换一个邮箱。", en: "That email is already registered. Log in, or use another email." },
  invalid: { zh: "邮箱或密码不正确。", en: "Email or password is incorrect." },
  mismatch: { zh: "两次输入的密码不一致。", en: "The two passwords do not match." },
  unavailable: { zh: "暂时无法保存账号，请稍后再试。", en: "The account could not be saved. Try again." },
};

export function AuthScreen({ mode, role }: { mode: "login" | "register"; role?: "learner" | "admin" }) {
  const locale = useStore((state) => state.locale);
  const setLocale = useStore((state) => state.setLocale);
  const router = useRouter();
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const zh = locale === "zh";
  const roleLabel = role === "admin" ? (zh ? "管理员" : "Admin") : (zh ? "学员" : "Learner");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (mode === "register" && password !== confirm) {
      setError("mismatch");
      return;
    }
    setPending(true);
    try {
      const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(mode === "login" ? { account, password } : { name, email: account, password, role: "learner" }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string; role?: "learner" | "admin" | "superadmin" };
      if (!response.ok) {
        setError(payload.error || "unavailable");
        setPending(false);
        return;
      }
      router.replace(payload.role === "admin" || payload.role === "superadmin" ? "/admin" : "/learn");
      router.refresh();
    } catch {
      setError("unavailable");
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
      <div className="relative hidden min-h-[240px] lg:block">
        <Image src="/auth-harbor.jpg" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-slate-950/25" />
        <div className="absolute bottom-8 left-0 p-10 text-white">
          <div className="text-sm tracking-[0.18em] text-amber-100/90">GLOBALBRIDGE</div>
          <p className="mt-3 max-w-md text-2xl font-semibold leading-snug">{zh ? "从选品到回款，把一条跨境链路算清楚。" : "Follow one cross-border chain from selection to cash."}</p>
        </div>
      </div>
      <div className="grid place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Image src="/auth-harbor.jpg" alt="" width={1280} height={720} priority className="mb-6 h-36 w-full rounded-2xl object-cover lg:hidden" />
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">GlobalBridge</span>
              <span className="block text-xs text-muted-foreground">{zh ? "跨境电商全链路模拟" : "Cross-border simulation"}</span>
            </span>
          </div>
          <button className="text-xs text-muted-foreground" onClick={() => setLocale(zh ? "en" : "zh")}>{zh ? "EN" : "中文"}</button>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold">
            {mode === "login" ? (zh ? "登录" : "Log in") : (zh ? `注册${roleLabel}` : `Register as ${roleLabel}`)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? (zh ? "学员用邮箱登录。管理员用超级管理员分配的账号登录。两边的界面是分开的。" : "Learners sign in with email. Admins sign in with the account a superadmin created.")
              : (zh ? "这里只注册学员。管理员账号不能自行注册，由超级管理员在后台添加。" : "This page registers learners only. Admin accounts are added by a superadmin.")}
          </p>
          <form className="mt-5 space-y-3" onSubmit={submit}>
            {mode === "register" && (
              <label className="block text-sm">
                {zh ? "称呼" : "Name"}
                <Input className="mt-1 h-10" value={name} onChange={(event) => setName(event.target.value)} autoComplete="nickname" required />
              </label>
            )}
            <label className="block text-sm">
              {mode === "login" ? (zh ? "账号" : "Account") : (zh ? "邮箱" : "Email")}
              <Input className="mt-1 h-10" type={mode === "login" ? "text" : "email"} value={account} onChange={(event) => setAccount(event.target.value)} autoComplete={mode === "login" ? "username" : "email"} required />
            </label>
            <label className="block text-sm">
              {zh ? "密码" : "Password"}
              <Input className="mt-1 h-10" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required />
            </label>
            {mode === "register" && (
              <label className="block text-sm">
                {zh ? "再次输入密码" : "Confirm password"}
                <Input className="mt-1 h-10" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" required />
              </label>
            )}
            {error && <p className="text-sm text-destructive">{ERRORS[error]?.[locale] ?? (zh ? "没有完成，请重试。" : "That did not work. Try again.")}</p>}
            <Button className="h-10 w-full" type="submit" disabled={pending}>
              {pending ? (zh ? "请稍候…" : "Please wait…") : mode === "login" ? (zh ? "进入" : "Enter") : (zh ? `注册并进入` : "Create account")}
            </Button>
          </form>
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              <div>{zh ? "还没有账号？" : "No account yet?"}</div>
              <div>
                <Link className="text-primary" href="/register">{zh ? "注册学员" : "Register as a learner"}</Link>
              </div>
            </>
          ) : (
            <Link className="text-primary" href="/login">{zh ? "已有账号，去登录" : "I already have an account"}</Link>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
