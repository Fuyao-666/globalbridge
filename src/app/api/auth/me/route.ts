import { currentAccount } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const account = await currentAccount();
  if (!account) return Response.json({ error: "unauthorized" }, { status: 401, headers: { "cache-control": "private, no-store" } });
  return Response.json(account, { headers: { "cache-control": "private, no-store" } });
}

export async function PATCH(request: Request) {
  const account = await currentAccount();
  if (!account) return Response.json({ error: "unauthorized" }, { status: 401, headers: { "cache-control": "private, no-store" } });
  let body: { name?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400, headers: { "cache-control": "private, no-store" } });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 24) {
    return Response.json({ error: "name" }, { status: 400, headers: { "cache-control": "private, no-store" } });
  }
  const { sql } = await import("@/lib/db");
  await sql("update accounts set name = $1 where id = $2", [name, account.id]);
  return Response.json({ ...account, name }, { headers: { "cache-control": "private, no-store" } });
}
