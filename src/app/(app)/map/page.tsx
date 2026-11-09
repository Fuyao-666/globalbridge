"use client";

import Link from "next/link";
import { COURSES, courseLessons } from "@/lib/data/courses";
import { useStore } from "@/lib/store";
import { PageIntro } from "@/components/widgets";

export default function MapPage() {
  const locale = useStore((state) => state.locale);
  const completed = useStore((state) => state.completedLessons);
  const published = useStore((state) => state.coursePublished);
  return (
    <div>
      <PageIntro title={locale === "zh" ? "课程地图" : "Course map"} body={locale === "zh" ? "建议从市场调研走到实战项目。课程没有锁，你可以跳着看，但证书只在一门课全部完成时出现。" : "The suggested path runs from market research to the capstone. Nothing is locked. A certificate appears only when a course is fully complete."} />
      <ol className="space-y-3">
        {COURSES.filter((course) => published[course.id] !== false).map((course, index) => {
          const lessons = courseLessons(course);
          const done = lessons.filter((lesson) => completed.includes(`${course.id}:${lesson.id}`)).length;
          const next = lessons.find((lesson) => !completed.includes(`${course.id}:${lesson.id}`)) ?? lessons[0];
          const state = done === 0 ? (locale === "zh" ? "未开始" : "Not started") : done === lessons.length ? (locale === "zh" ? "已完成" : "Complete") : (locale === "zh" ? "进行中" : "In progress");
          return (
            <li key={course.id} className="grid grid-cols-[auto_1fr] gap-3">
              <div className="flex flex-col items-center">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-sm text-primary-foreground">{index + 1}</span>
                {index < COURSES.length - 1 && <span className="w-px flex-1 bg-border" />}
              </div>
              <Link href={`/learn/${course.id}/${next.id}`} className="mb-3 rounded-2xl border bg-card p-4 hover:border-primary/40">
                <div className="text-xs text-primary">{state}</div>
                <h2 className="font-semibold">{course.title[locale]}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{course.summary[locale]}</p>
                <div className="mt-2 text-xs">{done}/{lessons.length}</div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
