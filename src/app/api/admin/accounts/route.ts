import { currentAccount, hashPassword, newAccountId, normalizeEmail, validEmail } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const privateHeaders = { "cache-control": "private, no-store" };

type ListedAccount = {
  id: string;
  email: string;
  username: string | null;
  name: string;
  role: string;
};

async function requireSuperadmin() {
  const account = await currentAccount();
  if (!account) return Response.json({ error: "unauthorized" }, { status: 401, headers: privateHeaders });
  if (account.role !== "superadmin") return Response.json({ error: "forbidden" }, { status: 403, headers: privateHeaders });
  return account;
}

export async function GET() {
  const gate = await requireSuperadmin();
  if (gate instanceof Response) return gate;
  const rows = await sql<ListedAccount>(
    "select id, email, username, name, role from accounts order by created_at asc",
  );
  return Response.json(rows, { headers: privateHeaders });
}

export async function POST(request: Request) {
  const gate = await requireSuperadmin();
  if (gate instanceof Response) return gate;
  let body: { name?: unknown; email?: unknown; username?: unknown; password?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
  }
  if (body.role === "superadmin" || body.role === "learner") {
    return Response.json({ error: "role" }, { status: 403, headers: privateHeaders });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (name.length < 2 || name.length > 24) return Response.json({ error: "name" }, { status: 400, headers: privateHeaders });
  if (!validEmail(email)) return Response.json({ error: "email" }, { status: 400, headers: privateHeaders });
  if (!/^[a-z0-9_]{3,24}$/.test(username)) return Response.json({ error: "username" }, { status: 400, headers: privateHeaders });
  if (password.length < 8 || password.length > 72) return Response.json({ error: "password" }, { status: 400, headers: privateHeaders });
  const id = newAccountId();
  try {
    await sql(
      "insert into accounts (id, email, username, name, role, password_hash) values ($1, $2, $3, $4, 'admin', $5)",
      [id, email, username, name, await hashPassword(password)],
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505") {
      return Response.json({ error: "taken" }, { status: 409, headers: privateHeaders });
    }
    return Response.json({ error: "unavailable" }, { status: 500, headers: privateHeaders });
  }
  return Response.json({ id, email, username, name, role: "admin" }, { status: 201, headers: privateHeaders });
}
