import { currentAccount, normalizeEmail, validEmail } from "@/lib/auth";
import { asFields, grantLearner, setBalance } from "@/lib/credit-db";
import { sql } from "@/lib/db";
import type { CustomField } from "@/lib/credit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const privateHeaders = { "cache-control": "private, no-store" };

async function requireSuperadmin() {
  const account = await currentAccount();
  if (!account) return Response.json({ error: "unauthorized" }, { status: 401, headers: privateHeaders });
  if (account.role !== "superadmin") return Response.json({ error: "forbidden" }, { status: 403, headers: privateHeaders });
  return account;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await requireSuperadmin();
  if (gate instanceof Response) return gate;
  const { id } = await context.params;
  const existing = await sql<{ id: string }>("select id from accounts where id = $1 and role = 'learner'", [id]);
  if (!existing[0]) return Response.json({ error: "missing" }, { status: 404, headers: privateHeaders });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  if (name.length < 2 || name.length > 24) return Response.json({ error: "name" }, { status: 400, headers: privateHeaders });
  if (!validEmail(email)) return Response.json({ error: "email" }, { status: 400, headers: privateHeaders });
  const balance = Number(body.balance);
  if (!Number.isFinite(balance) || balance < -100_000_000 || balance > 100_000_000) {
    return Response.json({ error: "balance" }, { status: 400, headers: privateHeaders });
  }
  const custom = cleanFields(body.custom);
  if (!custom) return Response.json({ error: "custom" }, { status: 400, headers: privateHeaders });
  const lessonsDone = clampInt(body.lessonsDone, 0, 10000);
  const simDay = clampInt(body.simDay, -30, 5000);
  const orders = clampInt(body.orders, 0, 1_000_000);
  const purchases = clampInt(body.purchases, 0, 100_000);
  const revenue = clampNum(body.revenue);
  const profit = clampNum(body.profit);
  try {
    await sql("update accounts set name = $2, email = $3 where id = $1 and role = 'learner'", [id, name, email]);
  } catch (error) {
    if (isUnique(error)) return Response.json({ error: "taken" }, { status: 409, headers: privateHeaders });
    return Response.json({ error: "unavailable" }, { status: 500, headers: privateHeaders });
  }
  await grantLearner(id);
  await setBalance(id, balance);
  await sql(
    `update learner_profiles
     set lessons_done = $2, sim_day = $3, revenue = $4, orders = $5, profit = $6, purchases = $7, custom = $8::jsonb, updated_at = now()
     where account_id = $1`,
    [id, lessonsDone, simDay, revenue, orders, profit, purchases, JSON.stringify(custom)],
  );
  return Response.json({ ok: true }, { headers: privateHeaders });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await requireSuperadmin();
  if (gate instanceof Response) return gate;
  const { id } = await context.params;
  const existing = await sql<{ id: string }>("select id from accounts where id = $1 and role = 'learner'", [id]);
  if (!existing[0]) return Response.json({ error: "missing" }, { status: 404, headers: privateHeaders });
  await sql("delete from credit_requests where account_id = $1", [id]);
  await sql("delete from credit_accounts where account_id = $1", [id]);
  await sql("delete from learner_profiles where account_id = $1", [id]);
  await sql("delete from sessions where account_id = $1", [id]);
  await sql("delete from accounts where id = $1 and role = 'learner'", [id]);
  return Response.json({ ok: true }, { headers: privateHeaders });
}

function cleanFields(value: unknown): CustomField[] | null {
  const fields = asFields(value);
  if (!Array.isArray(value)) return null;
  if (fields.length !== value.length || fields.length > 40) return null;
  if (fields.some((field) => field.key.length > 24 || field.value.length > 80 || field.id.length > 40)) return null;
  return fields;
}

function clampInt(value: unknown, min: number, max: number) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

function clampNum(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(50_000_000, Math.max(-50_000_000, Math.round(number * 100) / 100));
}

function isUnique(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505") return true;
  return error instanceof Error && /unique|duplicate/i.test(error.message);
}
