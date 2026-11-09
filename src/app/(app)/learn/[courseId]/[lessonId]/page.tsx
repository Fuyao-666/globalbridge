"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Bookmark, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { courseLessons, findLesson } from "@/lib/data/courses";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LessonPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const found = findLesson(params.courseId, params.lessonId);
  const locale = useStore((state) => state.locale);
  const completed = useStore((state) => state.completedLessons);
  const bookmarks = useStore((state) => state.bookmarks);
  const toggleLesson = useStore((state) => state.toggleLesson);
  const toggleBookmark = useStore((state) => state.toggleBookmark);
  const titles = useStore((state) => state.courseTitles);
  if (!found) {
    return <div className="text-sm text-muted-foreground">{locale === "zh" ? "没有这一课。" : "This lesson does not exist."}</div>;
  }
  const { course, lessons, index, lesson } = found;
  const doneCount = lessons.filter((item) => completed.includes(`${course.id}:${item.id}`)).length;
  const pct = Math.round((doneCount / lessons.length) * 100);
  const key = `${course.id}:${lesson.id}`;
  const done = completed.includes(key);
  const saved = bookmarks.includes(key);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const title = titles[course.id]?.[locale] ?? course.title[locale];

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
        <Link href="/map" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          {locale === "zh" ? "返回学习路径" : "Back to the path"}
        </Link>
        <div className="rounded-2xl border bg-card p-4">
          <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">Σ</div>
          <h1 className="mt-3 font-semibold">{title}</h1>
          <div className="mt-1 text-xs text-muted-foreground">{lessons.length} {locale === "zh" ? "节" : "lessons"}</div>
          <div className="mt-3 text-xs">{locale === "zh" ? "学习进度" : "Progress"} {pct}%</div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {course.chapters.map((chapter) => {
            const chapterDone = chapter.lessons.filter((item) => completed.includes(`${course.id}:${item.id}`)).length;
            return (
              <div key={chapter.id}>
                <div className="mb-1 flex items-center justify-between px-1 text-xs text-muted-foreground">
                  <span>{chapter.title[locale]}</span>
                  <span>{chapterDone}/{chapter.lessons.length}</span>
                </div>
                <div className="space-y-0.5">
                  {chapter.lessons.map((item) => {
                    const on = item.id === lesson.id;
                    const checked = completed.includes(`${course.id}:${item.id}`);
                    return (
                      <Link
                        key={item.id}
                        href={`/learn/${course.id}/${item.id}`}
                        className={cn("flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted", on && "bg-primary/10 text-primary")}
                      >
                        <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border", checked && "border-emerald-500 bg-emerald-500 text-white")}>
                          {checked && <Check className="size-3" />}
                        </span>
                        <span>{item.title[locale]}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
      <article className="min-w-0">
        <div className="mb-2 text-sm text-muted-foreground">
          <Link href="/learn" className="hover:text-foreground">{locale === "zh" ? "课程中心" : "Courses"}</Link>
          <span> / {title} / {lesson.title[locale]}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{lesson.title[locale]}</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{lesson.summary[locale]}</p>
          </div>
          <Button
            variant="outline"
            className="h-9"
            onClick={() => {
              toggleBookmark(course.id, lesson.id);
              toast(saved ? (locale === "zh" ? "已取消收藏" : "Bookmark removed") : (locale === "zh" ? "已收藏本节" : "Lesson saved"));
            }}
          >
            <Bookmark className={cn("size-4", saved && "fill-current")} />
            {locale === "zh" ? "收藏本节" : "Save"}
          </Button>
        </div>

        {lesson.formula && (
          <section className="mt-5 rounded-2xl border bg-card p-4 md:p-6">
            <div className="text-sm font-medium text-primary">Σ {lesson.formula.title[locale]}</div>
            <p className="mt-2 text-base font-medium">{lesson.formula.expression}</p>
            <div className="mt-4 rounded-xl bg-muted/60 p-4">
              <div className="text-xs font-medium text-muted-foreground">{locale === "zh" ? "公式总览" : "Expanded"}</div>
              <p className="mt-1 font-medium">{lesson.formula.expanded}</p>
              <p className="mt-2 text-sm text-muted-foreground">{lesson.formula.note[locale]}</p>
            </div>
            <h3 className="mt-5 text-sm font-semibold">{locale === "zh" ? "关键要点" : "Key points"}</h3>
            <ul className="mt-2 space-y-2">
              {lesson.formula.highlights.map((item) => (
                <li key={item.zh} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{item[locale]}</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-5 text-sm font-semibold">{locale === "zh" ? "公式拆解（从左到右）" : "The terms, left to right"}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {lesson.formula.parts.map((part) => (
                <div key={part.title.zh} className="rounded-xl border p-3">
                  <div className="text-sm font-medium">{part.title[locale]}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{part.detail[locale]}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-5 rounded-2xl border bg-card p-4 md:p-6">
          <h3 className="text-sm font-semibold">{locale === "zh" ? "本节检查项" : "Checks"}</h3>
          <ul className="mt-3 space-y-2">
            {lesson.points.map((point) => (
              <li key={point.zh} className="flex gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{point[locale]}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3 rounded-xl bg-primary/5 p-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm">{locale === "zh" ? "掌握核算之后，用模拟器验证，而不是停在阅读。" : "After the formula, check it in the simulator instead of stopping at the page."}</p>
            <Button asChild className="h-9">
              <Link href={lesson.simHref}>{lesson.simLabel[locale]} →</Link>
            </Button>
          </div>
        </section>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant={done ? "outline" : "default"}
            className="h-9"
            onClick={() => {
              toggleLesson(course.id, lesson.id);
              toast(done ? (locale === "zh" ? "已标为未完成" : "Marked incomplete") : (locale === "zh" ? "本节已完成" : "Lesson completed"));
            }}
          >
            {done ? (locale === "zh" ? "标为未完成" : "Mark incomplete") : (locale === "zh" ? "完成本节" : "Mark complete")}
          </Button>
          <div className="flex gap-2 text-sm">
            {prev ? (
              <Link href={`/learn/${course.id}/${prev.id}`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 hover:bg-muted">
                <ChevronLeft className="size-4" />
                {prev.title[locale]}
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/learn/${course.id}/${next.id}`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 hover:bg-muted">
                {next.title[locale]}
                <ChevronRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          {locale === "zh" ? `全课 ${courseLessons(course).length} 节都标记完成后，证书中心会出现这门课的证书。` : "A certificate appears after every lesson in the course is marked complete."}
        </p>
      </article>
    </div>
  );
}
