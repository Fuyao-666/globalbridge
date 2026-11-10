"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  Bell,
  ChevronDown,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  Languages,
  Library,
  Map,
  Menu,
  Moon,
  Search,
  Store,
  Shield,
  Sun,
  UserRound,
  Wrench,
  MessagesSquare,
  Award,
  LayoutDashboard,
  Megaphone,
  Package,
  ShoppingCart,
  Tags,
  Users,
  Wallet,
} from "lucide-react";
import { CreditBanner, CreditPill, CreditSync } from "@/components/credit-dock";
import { PRODUCTS } from "@/lib/catalog";
import { COURSES, courseLessons } from "@/lib/data/courses";
import { GLOSSARY } from "@/lib/data/glossary";
import { useSession } from "@/components/session-bridge";
import { levelFrom, useStore } from "@/lib/store";
import { useHydrated } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const BUSINESS = [
  { href: "/sim", icon: Store, zh: "今日经营", en: "Today", exact: true },
  { href: "/sim/selection", icon: Search, zh: "选品", en: "Select", exact: false },
  { href: "/sim/procurement", icon: ShoppingCart, zh: "采购", en: "Buy", exact: false },
  { href: "/sim/listings", icon: Package, zh: "上架", en: "List", exact: false },
  { href: "/sim/ads", icon: Megaphone, zh: "广告", en: "Ads", exact: false },
  { href: "/sim/dashboard", icon: LayoutDashboard, zh: "经营看板", en: "Dashboard", exact: false },
];

const STUDY = [
  { href: "/learn", icon: GraduationCap, zh: "课程", en: "Lessons" },
  { href: "/map", icon: Map, zh: "课程地图", en: "Course map" },
  { href: "/glossary", icon: Tags, zh: "术语", en: "Glossary" },
  { href: "/cases", icon: FolderOpen, zh: "案例", en: "Cases" },
  { href: "/knowledge", icon: Library, zh: "知识库", en: "Notes" },
  { href: "/tools", icon: Wrench, zh: "工具箱", en: "Tools" },
  { href: "/community", icon: MessagesSquare, zh: "社区", en: "Community" },
];

const STAFF_LINKS = [
  { href: "/admin", icon: Shield, zh: "管理控制台", en: "Console", exact: true },
];

const SUPER_LINKS = [
  { href: "/admin/learners", icon: Users, zh: "学员数据", en: "Learners", exact: false },
  { href: "/admin/credits", icon: Wallet, zh: "额度申请", en: "Credit requests", exact: false },
];

function label(item: { zh: string; en: string }, locale: "zh" | "en") {
  return locale === "zh" ? item.zh : item.en;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const ready = useHydrated();
  const pathname = usePathname();
  const locale = useStore((state) => state.locale);
  const session = useSession();
  const staff = session.role !== "learner";
  const [open, setOpen] = useState(false);
  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        GlobalBridge
      </div>
    );
  }
  return (
    <div className={cn("min-h-screen", staff ? "bg-[#0f172a]" : "bg-background text-foreground")}>
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r md:flex", staff ? "border-slate-800 bg-[#0f172a] text-slate-100" : "border-sidebar-border bg-sidebar")}>
        <Sidebar pathname={pathname} onNavigate={() => undefined} />
      </aside>
      <div className={cn("md:pl-60", staff && "staff-main min-h-screen")}>
        <header className={cn("sticky top-0 z-20 flex h-14 items-center gap-2 border-b px-3 md:px-6", staff ? "border-slate-200 bg-white text-slate-900" : "bg-background/90 backdrop-blur")}>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className={cn("w-72 p-0", staff && "border-slate-800 bg-[#0f172a] text-slate-100")}>
              <Sidebar pathname={pathname} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          {staff && <span className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800 md:inline">{session.role === "superadmin" ? (locale === "zh" ? "超管控制台" : "Superadmin") : (locale === "zh" ? "管理端" : "Admin")}</span>}
          {!staff && <GlobalSearch />}
          {!staff && <CreditPill />}
          <div className="ml-auto flex items-center gap-1">
            <LanguageSwitch />
            <ThemeSwitch />
            {!staff && <AlertBell />}
          </div>
        </header>
        {!staff && <CreditBanner />}
        <main className="mx-auto w-full max-w-7xl px-3 py-5 md:px-6 md:py-6">{children}</main>
        <footer className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-3 pb-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <span>{locale === "zh" ? "© 2026 GlobalBridge 跨境电商模拟平台" : "© 2026 GlobalBridge simulation"}</span>
          <span className="flex gap-4">
            <Link href="/help#terms" className="hover:text-foreground">{locale === "zh" ? "使用条款" : "Terms"}</Link>
            <Link href="/help#privacy" className="hover:text-foreground">{locale === "zh" ? "隐私说明" : "Privacy"}</Link>
            <Link href="/help" className="hover:text-foreground">{locale === "zh" ? "联系我们" : "Contact"}</Link>
          </span>
        </footer>
        {!staff && <CreditSync />}
      </div>
    </div>
  );
}

function Sidebar({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  const locale = useStore((state) => state.locale);
  const session = useSession();
  const profile = useStore((state) => state.profile);
  const role = session.role;
  const staff = role !== "learner";
  const completed = useStore((state) => state.completedLessons);
  const purchases = useStore((state) => state.sim.purchases.length);
  const liveExtra = useStore((state) => state.sim.listings.filter((listing) => !listing.seed && listing.status === "live").length);
  const extraCampaigns = useStore((state) => state.sim.campaigns.filter((campaign) => !campaign.seed).length);
  const total = COURSES.reduce((sum, course) => sum + courseLessons(course).length, 0);
  const pct = Math.round((completed.length / total) * 100);
  const xp = 650 + completed.length * 10 + purchases * 20 + liveExtra * 15 + extraCampaigns * 10;
  const level = levelFrom(xp);
  return (
    <div className={cn("flex h-full flex-col", staff && "bg-[#0f172a] text-slate-100")}>
      <Link href={staff ? "/admin" : "/sim"} onClick={onNavigate} className="flex items-center gap-2 px-4 py-4">
        <span className={cn("grid size-9 place-items-center rounded-xl text-white", staff ? "bg-blue-600" : "bg-primary text-primary-foreground")}>
          {staff ? <Shield className="size-5" /> : <Store className="size-5" />}
        </span>
        <span>
          <span className="block text-sm font-semibold leading-tight">GlobalBridge</span>
          <span className={cn("block text-[11px]", staff ? "text-slate-400" : "text-muted-foreground")}>
            {staff ? (locale === "zh" ? "管理控制台" : "Admin console") : (locale === "zh" ? "跨境店铺模拟" : "Store simulation")}
          </span>
        </span>
      </Link>
      <nav className="flex-1 space-y-0.5 overflow-auto px-2">
        {staff ? (
          [...STAFF_LINKS, ...(role === "superadmin" ? SUPER_LINKS : [])].map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10",
                  active && "bg-blue-600 font-medium text-white hover:bg-blue-600",
                )}
              >
                <Icon className="size-4" />
                {label(item, locale)}
              </Link>
            );
          })
        ) : (
          <>
            <div className="px-3 pb-1 pt-2 text-[11px] font-medium tracking-wide text-muted-foreground">{locale === "zh" ? "店铺" : "STORE"}</div>
            {BUSINESS.map((item) => {
              const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent",
                    active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {label(item, locale)}
                </Link>
              );
            })}
            <div className="px-3 pb-1 pt-4 text-[11px] font-medium tracking-wide text-muted-foreground">{locale === "zh" ? "课程资料" : "LESSONS"}</div>
            {STUDY.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                    active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {label(item, locale)}
                </Link>
              );
            })}
          </>
        )}
        {!staff && <div className="mx-2 my-3 rounded-xl border bg-muted/40 p-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span>{locale === "zh" ? "课程进度" : "Lessons"}</span>
            <span className="font-medium text-primary">{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <Link href="/certificates" onClick={onNavigate} className="mt-2 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <Award className="size-3.5" />
            {locale === "zh" ? "证书中心" : "Certificates"}
          </Link>
          <Link href="/help" onClick={onNavigate} className="mt-1 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <HelpCircle className="size-3.5" />
            {locale === "zh" ? "帮助中心" : "Help"}
          </Link>
        </div>}
      </nav>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={cn("m-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-left", staff ? "border-slate-700 hover:bg-white/10" : "hover:bg-muted")}>
            <span className={cn("grid size-8 place-items-center rounded-full", staff ? "bg-blue-500/20 text-blue-100" : "bg-primary/10 text-primary")}>
              <UserRound className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{profile.handle}</span>
              <span className="block text-[11px] text-muted-foreground">Lv.{level} · {xp.toLocaleString()}</span>
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>
            <span className="block">{role === "superadmin" ? (locale === "zh" ? "超级管理员" : "Superadmin") : role === "admin" ? (locale === "zh" ? "管理员" : "Admin") : (locale === "zh" ? "学员" : "Learner")}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{session.username || session.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/me">{locale === "zh" ? "编辑资料" : "Edit profile"}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              void fetch("/api/auth/logout", { method: "POST", redirect: "manual" }).finally(() => {
                window.location.href = "/login";
              });
            }}
          >
            {locale === "zh" ? "退出登录" : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function GlobalSearch() {
  const locale = useStore((state) => state.locale);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    const courses = COURSES.filter((course) => `${course.title.zh} ${course.title.en}`.toLowerCase().includes(q)).slice(0, 4);
    const terms = GLOSSARY.filter((term) => `${term.abbr} ${term.name.zh} ${term.name.en}`.toLowerCase().includes(q)).slice(0, 4);
    const products = PRODUCTS.filter((product) => `${product.name.zh} ${product.name.en}`.toLowerCase().includes(q)).slice(0, 4);
    return [
      ...products.map((product) => ({ href: `/sim/selection?product=${product.id}`, title: product.name[locale], kind: locale === "zh" ? "商品" : "Product" })),
      ...terms.map((term) => ({ href: `/glossary?term=${term.id}`, title: `${term.abbr} · ${term.name[locale]}`, kind: locale === "zh" ? "术语" : "Term" })),
      ...courses.map((course) => ({ href: `/learn/${course.id}/${courseLessons(course)[0].id}`, title: course.title[locale], kind: locale === "zh" ? "课程" : "Course" })),
    ];
  }, [query, locale]);
  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={locale === "zh" ? "搜索商品、术语或课程" : "Search products, terms, or lessons"}
        className="h-9 pl-8"
        onKeyDown={(event) => {
          if (event.key === "Enter" && results[0]) {
            router.push(results[0].href);
            setQuery("");
          }
        }}
      />
      {results.length > 0 && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border bg-popover shadow-lg">
          {results.map((result) => (
            <button
              key={result.href + result.title}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                router.push(result.href);
                setQuery("");
              }}
            >
              <span className="truncate">{result.title}</span>
              <span className="ml-3 text-xs text-muted-foreground">{result.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LanguageSwitch() {
  const locale = useStore((state) => state.locale);
  const setLocale = useStore((state) => state.setLocale);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Languages className="size-3.5" />
          {locale === "zh" ? "中文" : "EN"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale("zh")}>中文（简体）</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("en")}>English</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const locale = useStore((state) => state.locale);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={locale === "zh" ? "主题" : "Theme"}>
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>{locale === "zh" ? "浅色" : "Light"}{theme === "light" ? " ·" : ""}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>{locale === "zh" ? "深色" : "Dark"}{theme === "dark" ? " ·" : ""}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>{locale === "zh" ? "跟随系统" : "System"}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AlertBell() {
  const locale = useStore((state) => state.locale);
  const alerts = useStore((state) => state.sim.alerts);
  const read = useStore((state) => state.readAlerts);
  const mark = useStore((state) => state.markAlertsRead);
  const unread = alerts.filter((alert) => !read.includes(alert.id)).length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={locale === "zh" ? "通知" : "Alerts"} onClick={() => mark()}>
          <Bell className="size-4" />
          {unread > 0 && <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] text-white">{unread}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{locale === "zh" ? "模拟告警" : "Simulation alerts"}</DropdownMenuLabel>
        {alerts.length === 0 && <div className="px-2 py-3 text-sm text-muted-foreground">{locale === "zh" ? "目前没有告警。" : "No alerts."}</div>}
        {alerts.slice(0, 6).map((alert) => (
          <DropdownMenuItem key={alert.id} className="flex flex-col items-start gap-0.5">
            <span className="text-sm">{alert.title[locale]}</span>
            <span className="text-xs whitespace-normal text-muted-foreground">{alert.detail[locale]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
