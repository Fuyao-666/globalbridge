"use client";

import Link from "next/link";
import { useState } from "react";
import { COURSES, courseLessons, findLesson } from "@/lib/data/courses";
import { GLOSSARY } from "@/lib/data/glossary";
import { levelFrom, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageIntro } from "@/components/widgets";

export default function MePage() {
  const locale = useStore((state) => state.locale);
  const profile = useStore((state) => state.profile);
  const setProfile = useStore((state) => state.setProfile);
  const completed = useStore((state) => state.completedLessons);
  const bookmarks = useStore((state) => state.bookmarks);
  const history = useStore((state) => state.termHistory);
  const purchases = useStore((state) => state.sim.purchases.length);
  const [name, setName] = useState(profile.handle);
  const xp = 650 + completed.length * 10 + purchases * 20;
  const level = levelFrom(xp);
  const inProgress = COURSES.map((course) => {
    const lessons = courseLessons(course);
    const done = lessons.filter((lesson) => completed.includes(`${course.id}:${lesson.id}`)).length;
    const next = lessons.find((lesson) => !completed.includes(`${course.id}:${lesson.id}`));
    return { course, done, total: lessons.length, next };
  }).filter((item) => item.done > 0 && item.next);

  return (
    <div>
      <PageIntro title={locale === "zh" ? "我的学习" : "My learning"} body={locale === "zh" ? `Lv.${level} · 成长值 ${xp}。完成课时、采购和上架都会增加成长值。` : `Lv.${level} · ${xp} points. Lessons, purchases, and live listings add points.`} />
      <form className="mb-6 flex max-w-md gap-2" onSubmit={(event) => { event.preventDefault(); setProfile({ name, handle: name }); }}>
        <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={24} />
        <Button type="submit" className="h-8">{locale === "zh" ? "保存称呼" : "Save name"}</Button>
      </form>
      <h2 className="mb-2 font-semibold">{locale === "zh" ? "进行中的课程" : "In progress"}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {inProgress.map((item) => (
          <Link key={item.course.id} href={`/learn/${item.course.id}/${item.next!.id}`} className="rounded-2xl border bg-card p-4">
            <div className="font-medium">{item.course.title[locale]}</div>
            <div className="text-sm text-muted-foreground">{item.done}/{item.total} · {item.next!.title[locale]}</div>
          </Link>
        ))}
        {inProgress.length === 0 && <p className="text-sm text-muted-foreground">{locale === "zh" ? "没有进行中的课程。" : "Nothing in progress."}</p>}
      </div>
      <h2 className="mt-6 mb-2 font-semibold">{locale === "zh" ? "收藏的课时" : "Saved lessons"}</h2>
      <ul className="space-y-2 text-sm">
        {bookmarks.map((key) => {
          const [courseId, lessonId] = key.split(":");
          const found = findLesson(courseId, lessonId);
          if (!found) return null;
          return <li key={key}><Link className="text-primary" href={`/learn/${courseId}/${lessonId}`}>{found.lesson.title[locale]}</Link></li>;
        })}
        {bookmarks.length === 0 && <li className="text-muted-foreground">{locale === "zh" ? "还没有收藏。" : "No bookmarks yet."}</li>}
      </ul>
      <h2 className="mt-6 mb-2 font-semibold">{locale === "zh" ? "最近看过的术语" : "Recent terms"}</h2>
      <ul className="space-y-1 text-sm">
        {history.map((id) => {
          const term = GLOSSARY.find((item) => item.id === id);
          return <li key={id}><Link className="text-primary" href={`/glossary?term=${id}`}>{term ? `${term.abbr} · ${term.name[locale]}` : id}</Link></li>;
        })}
        {history.length === 0 && <li className="text-muted-foreground">{locale === "zh" ? "还没有浏览记录。" : "No history yet."}</li>}
      </ul>
    </div>
  );
}
