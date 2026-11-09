"use client";

import { useState } from "react";
import { formatShanghai } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageIntro } from "@/components/widgets";

export default function CommunityPage() {
  const locale = useStore((state) => state.locale);
  const posts = useStore((state) => state.posts);
  const addPost = useStore((state) => state.addPost);
  const addReply = useStore((state) => state.addReply);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState(locale === "zh" ? "选品" : "Selection");
  const [reply, setReply] = useState<Record<string, string>>({});
  return (
    <div>
      <PageIntro title={locale === "zh" ? "社区讨论" : "Community"} body={locale === "zh" ? "帖子只存在这台浏览器，适合记下这次模拟的判断。不要粘贴说不清来源的图片。" : "Posts stay in this browser. Use them to record a decision from this simulation. Do not paste images you cannot source."} />
      <form className="mb-6 space-y-2 rounded-2xl border bg-card p-4" onSubmit={(event) => { event.preventDefault(); if (!title.trim() || !body.trim()) return; addPost({ title, body, tag }); setTitle(""); setBody(""); }}>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={locale === "zh" ? "标题" : "Title"} required />
        <Input value={tag} onChange={(event) => setTag(event.target.value)} placeholder={locale === "zh" ? "标签" : "Tag"} />
        <Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder={locale === "zh" ? "写下如果—就" : "Write the if-then"} required />
        <Button type="submit" className="h-9">{locale === "zh" ? "发布" : "Post"}</Button>
      </form>
      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="rounded-2xl border bg-card p-4">
            <div className="text-xs text-muted-foreground">{post.tag} · {post.author} · {formatShanghai(post.createdAt, locale)}</div>
            <h2 className="mt-1 font-semibold">{post.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">{post.body}</p>
            <div className="mt-3 space-y-2 border-t pt-3">
              {post.replies.map((item) => (
                <div key={item.id} className="text-sm">
                  <span className="font-medium">{item.author}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{formatShanghai(item.createdAt, locale)}</span>
                  <p className="whitespace-pre-wrap">{item.body}</p>
                </div>
              ))}
              <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); const text = reply[post.id]?.trim(); if (!text) return; addReply(post.id, text); setReply({ ...reply, [post.id]: "" }); }}>
                <Input value={reply[post.id] ?? ""} onChange={(event) => setReply({ ...reply, [post.id]: event.target.value })} placeholder={locale === "zh" ? "回复" : "Reply"} />
                <Button type="submit" variant="outline" className="h-8">{locale === "zh" ? "发送" : "Send"}</Button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
