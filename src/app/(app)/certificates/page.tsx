"use client";

import { COURSES, courseLessons } from "@/lib/data/courses";
import { formatShanghai } from "@/lib/format";
import { useStore } from "@/lib/store";
import { PageIntro } from "@/components/widgets";

export default function CertificatesPage() {
  const locale = useStore((state) => state.locale);
  const completed = useStore((state) => state.completedLessons);
  const completedAt = useStore((state) => state.completedAt);
  const profile = useStore((state) => state.profile);
  return (
    <div>
      <PageIntro title={locale === "zh" ? "证书中心" : "Certificates"} body={locale === "zh" ? "证书只证明这门课的每一节都被标记完成。它不是平台绩效，也不能当成真实资质。" : "A certificate only means every lesson was marked complete. It is not marketplace performance and it is not a credential."} />
      <div className="grid gap-4 md:grid-cols-2">
        {COURSES.map((course) => {
          const lessons = courseLessons(course);
          const keys = lessons.map((lesson) => `${course.id}:${lesson.id}`);
          const done = keys.every((key) => completed.includes(key));
          const when = keys.map((key) => completedAt[key]).filter(Boolean).sort().at(-1);
          return (
            <article key={course.id} className={done ? "rounded-2xl border bg-gradient-to-br from-sky-50 to-white p-5 dark:from-slate-900 dark:to-slate-950" : "rounded-2xl border border-dashed p-5 text-muted-foreground"}>
              <div className="text-xs uppercase tracking-wide">{done ? "GlobalBridge" : (locale === "zh" ? "未完成" : "Incomplete")}</div>
              <h2 className="mt-2 text-lg font-semibold text-foreground">{course.title[locale]}</h2>
              {done ? (
                <>
                  <p className="mt-3 text-sm">{profile.handle}</p>
                  <p className="text-xs text-muted-foreground">{when ? formatShanghai(when, locale) : ""} · Asia/Shanghai</p>
                </>
              ) : (
                <p className="mt-2 text-sm">{keys.filter((key) => completed.includes(key)).length}/{lessons.length}</p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
