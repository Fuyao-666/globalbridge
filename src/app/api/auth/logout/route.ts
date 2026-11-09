import { destroySession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  await destroySession();
  return new Response(null, {
    status: 303,
    headers: { location: "/login", "cache-control": "private, no-store" },
  });
}
