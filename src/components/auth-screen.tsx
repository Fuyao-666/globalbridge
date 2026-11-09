"use client";

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
  role: { zh: "请选择学员或管理员。", en: "Choose learner or admin." },
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
  const [email, setEmail] = useState("");
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
        body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password, role }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string; role?: "learner" | "admin" };
      if (!response.ok) {
        setError(payload.error || "unavailable");
        setPending(false);
        return;
      }
      router.replace(payload.role === "admin" ? "/admin" : "/learn");
      router.refresh();
    } catch {
      setError("unavailable");
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
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
              ? (zh ? "学员和管理员使用各自的邮箱进入。登录后只能看到自己的进度和店铺。" : "Learners and admins sign in with their own email. Progress and the store stay with that account.")
              : role === "admin"
                ? (zh ? "管理员可以改佣金、退货率、课程发布和术语。这不会变成学员账号。" : "Admins change fees, returns, course publishing, and glossary terms. This account is not a learner account.")
                : (zh ? "学员进入学习中心和模拟实训。管理后台需要另一个管理员账号。" : "Learners use the courses and the simulator. The admin console needs a separate admin account.")}
          </p>
          <form className="mt-5 space-y-3" onSubmit={submit}>
            {mode === "register" && (
              <label className="block text-sm">
                {zh ? "称呼" : "Name"}
                <Input className="mt-1 h-10" value={name} onChange={(event) => setName(event.target.value)} autoComplete="nickname" required />
              </label>
            )}
            <label className="block text-sm">
              {zh ? "邮箱" : "Email"}
              <Input className="mt-1 h-10" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
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
              <div className="flex gap-3">
                <Link className="text-primary" href="/register?role=learner">{zh ? "注册学员" : "Register as learner"}</Link>
                <Link className="text-primary" href="/register?role=admin">{zh ? "注册管理员" : "Register as admin"}</Link>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Link className="text-primary" href="/login">{zh ? "已有账号，去登录" : "I already have an account"}</Link>
              <Link className="text-primary" href={role === "admin" ? "/register?role=learner" : "/register?role=admin"}>
                {role === "admin" ? (zh ? "改为注册学员" : "Register as learner instead") : (zh ? "改为注册管理员" : "Register as admin instead")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RoleChooser() {
  const locale = useStore((state) => state.locale);
  const zh = locale === "zh";
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-sm font-semibold">GlobalBridge</span>
        </div>
        <h1 className="text-2xl font-semibold">{zh ? "选择要注册的身份" : "Choose who you are registering"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{zh ? "两种账号分开注册、分开登录。学员不能打开管理参数。" : "Each role is a separate account. A learner cannot open the parameter console."}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Link href="/register?role=learner" className="rounded-2xl border bg-card p-5 hover:border-primary/40">
            <div className="font-semibold">{zh ? "学员" : "Learner"}</div>
            <p className="mt-2 text-sm text-muted-foreground">{zh ? "上课、选品、采购、上架、看自己的利润。" : "Lessons, selection, purchasing, listings, and your own profit."}</p>
          </Link>
          <Link href="/register?role=admin" className="rounded-2xl border bg-card p-5 hover:border-primary/40">
            <div className="font-semibold">{zh ? "管理员" : "Admin"}</div>
            <p className="mt-2 text-sm text-muted-foreground">{zh ? "调整佣金、退货率、课程发布和术语。登录后进入管理后台。" : "Fees, returns, course publishing, and glossary. Login opens the admin console."}</p>
          </Link>
        </div>
        <Link className="mt-4 inline-block text-sm text-primary" href="/login">{zh ? "已有账号，去登录" : "I already have an account"}</Link>
      </div>
    </div>
  );
}
