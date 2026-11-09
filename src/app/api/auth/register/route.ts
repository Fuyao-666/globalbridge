import { createSession, hashPassword, newAccountId, normalizeEmail, validEmail, type AccountRole } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const privateHeaders = { "cache-control": "private, no-store" };

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; password?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role: AccountRole | null = body.role === "learner" || body.role === "admin" ? body.role : null;
  if (name.length < 2 || name.length > 24) return Response.json({ error: "name" }, { status: 400, headers: privateHeaders });
  if (!validEmail(email)) return Response.json({ error: "email" }, { status: 400, headers: privateHeaders });
  if (password.length < 8 || password.length > 72) return Response.json({ error: "password" }, { status: 400, headers: privateHeaders });
  if (!role) return Response.json({ error: "role" }, { status: 400, headers: privateHeaders });
  const id = newAccountId();
  try {
    await sql("insert into accounts (id, email, name, role, password_hash) values ($1, $2, $3, $4, $5)", [
      id,
      email,
      name,
      role,
      await hashPassword(password),
    ]);
  } catch (error) {
    if (isUnique(error)) return Response.json({ error: "taken" }, { status: 409, headers: privateHeaders });
    return Response.json({ error: "unavailable" }, { status: 500, headers: privateHeaders });
  }
  await createSession(id);
  return Response.json({ id, email, name, role }, { headers: privateHeaders });
}

function isUnique(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}
