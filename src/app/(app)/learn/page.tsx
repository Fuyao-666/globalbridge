"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  Compass,
  Megaphone,
  Rocket,
  Scale,
  Shield,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { COURSES, courseLessons, findLesson } from "@/lib/data/courses";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PageIntro } from "@/components/widgets";

const ICONS = {
  market: Compass,
  sourcing: Boxes,
  store: Store,
  growth: Megaphone,
  logistics: Truck,
  finance: Wallet,
  data: BarChart3,
  service: Shield,
  ip: Scale,
  capstone: Rocket,
};

export default function LearnPage() {
  const locale = useStore((state) => state.locale);
  const completed = useStore((state) => state.completedLessons);
  const published = useStore((state) => state.coursePublished);
  const titles = useStore((state) => state.courseTitles);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | "foundation" | "practice" | "advanced">("all");
  const courses = useMemo(() => {
    return COURSES.filter((course) => published[course.id] !== false)
      .filter((course) => level === "all" || course.level === level)
      .filter((course) => {
        const title = titles[course.id] ?? course.title;
        const text = `${title.zh} ${title.en} ${course.summary.zh} ${course.summary.en}`.toLowerCase();
        return text.includes(query.trim().toLowerCase());
      });
  }, [published, query, level, titles]);
  const formula = findLesson("sourcing", "src-22");

  return (
    <div>
      <PageIntro
        title={locale === "zh" ? "学习中心" : "Learning center"}
        body={locale === "zh" ? "通过真实跨境电商模拟场景，提升你的实战能力。" : "Practice the cross-border chain inside a simulator, then go back to the lesson that explains the number."}
      />
      {formula && (
        <Link href="/learn/sourcing/src-22" className="mb-5 flex flex-col gap-1 rounded-2xl border bg-primary/5 px-4 py-3 hover:bg-primary/10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-medium text-primary">{locale === "zh" ? "继续这一课" : "Continue here"}</div>
            <div className="font-medium">{formula.lesson.title[locale]}</div>
            <p className="text-sm text-muted-foreground">{locale === "zh" ? "毛利和真实利润不是同一个数。公式在这里，验算在选品页。" : "Gross margin and true profit are different numbers. The formula is here. The check is on the selection page."}</p>
          </div>
          <span className="text-sm font-medium text-primary">{locale === "zh" ? "打开课程" : "Open lesson"} →</span>
        </Link>
      )}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "zh" ? "筛选课程" : "Filter courses"} className="h-9 md:max-w-xs" />
        <div className="flex flex-wrap gap-2">
          {(["all", "foundation", "practice", "advanced"] as const).map((item) => (
            <Button key={item} variant={level === item ? "default" : "outline"} className="h-8" onClick={() => setLevel(item)}>
              {item === "all" ? (locale === "zh" ? "全部课程" : "All") : item === "foundation" ? (locale === "zh" ? "基础" : "Foundation") : item === "practice" ? (locale === "zh" ? "实操" : "Practice") : (locale === "zh" ? "进阶" : "Advanced")}
            </Button>
          ))}
        </div>
      </div>
      {courses.length === 0 && (
        <div className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {locale === "zh" ? "没有符合条件的课程。清空筛选，或让管理员重新发布。" : "No courses match. Clear the filter, or ask an admin to publish again."}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const lessons = courseLessons(course);
          const done = lessons.filter((lesson) => completed.includes(`${course.id}:${lesson.id}`)).length;
          const pct = Math.round((done / lessons.length) * 100);
          const next = lessons.find((lesson) => !completed.includes(`${course.id}:${lesson.id}`)) ?? lessons[0];
          const Icon = ICONS[course.icon];
          const title = titles[course.id]?.[locale] ?? course.title[locale];
          return (
            <article key={course.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 text-primary dark:from-slate-800 dark:to-slate-900">
                <Icon className="size-12" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.summary[locale]}</p>
                <div className="mt-3 text-xs text-muted-foreground">{locale === "zh" ? "进度" : "Progress"} {pct}% · {done}/{lessons.length} {locale === "zh" ? "课时" : "lessons"}</div>
                <Progress value={pct} className="mt-2 h-1.5" />
                <Button asChild variant="outline" className="mt-4 h-9">
                  <Link href={`/learn/${course.id}/${next.id}`}>{done === 0 ? (locale === "zh" ? "开始学习" : "Start") : done === lessons.length ? (locale === "zh" ? "复习" : "Review") : (locale === "zh" ? "继续学习" : "Continue")} →</Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
