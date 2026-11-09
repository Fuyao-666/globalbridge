import { createSession, normalizeEmail, verifyPassword } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const privateHeaders = { "cache-control": "private, no-store" };

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
  }
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || password.length < 8 || password.length > 72) {
    return Response.json({ error: "invalid" }, { status: 401, headers: privateHeaders });
  }
  const rows = await sql<{ id: string; name: string; role: "learner" | "admin"; password_hash: string }>(
    "select id, name, role, password_hash from accounts where email = $1",
    [email],
  );
  const account = rows[0];
  if (!account || !(await verifyPassword(password, account.password_hash))) {
    return Response.json({ error: "invalid" }, { status: 401, headers: privateHeaders });
  }
  await createSession(account.id);
  return Response.json(
    { id: account.id, email, name: account.name, role: account.role },
    { headers: privateHeaders },
  );
}
