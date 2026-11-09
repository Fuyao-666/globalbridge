import { createHash } from "node:crypto";
import { createSession, normalizeEmail, verifyPassword } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const privateHeaders = { "cache-control": "private, no-store" };

export async function POST(request: Request) {
  let body: { account?: unknown; email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
  }
  const raw = typeof body.account === "string" ? body.account : typeof body.email === "string" ? body.email : "";
  const accountName = raw.trim();
  const password = typeof body.password === "string" ? body.password : "";
  if (!accountName || accountName.length > 120 || password.length < 8 || password.length > 72) {
    return Response.json({ error: "invalid" }, { status: 401, headers: privateHeaders });
  }
  const bucket = createHash("sha256").update(accountName.toLowerCase()).digest("hex");
  if (await isLocked(bucket)) return Response.json({ error: "locked" }, { status: 429, headers: privateHeaders });
  const email = normalizeEmail(accountName);
  const username = accountName.toLowerCase();
  const rows = await sql<{ id: string; email: string; name: string; role: "learner" | "admin" | "superadmin"; password_hash: string }>(
    "select id, email, name, role, password_hash from accounts where email = $1 or username = $2",
    [email, username],
  );
  const account = rows[0];
  if (!account || !(await verifyPassword(password, account.password_hash))) {
    await noteFailure(bucket);
    return Response.json({ error: "invalid" }, { status: 401, headers: privateHeaders });
  }
  await sql("delete from auth_attempts where bucket = $1", [bucket]);
  await createSession(account.id);
  return Response.json(
    { id: account.id, email: account.email, name: account.name, role: account.role },
    { headers: privateHeaders },
  );
}

async function isLocked(bucket: string) {
  const rows = await sql<{ locked_until: string | null }>("select locked_until from auth_attempts where bucket = $1", [bucket]);
  const until = rows[0]?.locked_until;
  return Boolean(until && new Date(until).getTime() > Date.now());
}

async function noteFailure(bucket: string) {
  await sql(
    `insert into auth_attempts (bucket, failures, locked_until)
     values ($1, 1, null)
     on conflict (bucket) do update set
       failures = auth_attempts.failures + 1,
       locked_until = case
         when auth_attempts.failures + 1 >= 8 then now() + interval '15 minutes'
         else auth_attempts.locked_until
       end`,
    [bucket],
  );
}
