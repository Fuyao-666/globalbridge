import { currentAccount } from "@/lib/auth";
import { grantLearner } from "@/lib/credit-db";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const privateHeaders = { "cache-control": "private, no-store" };

export async function PUT(request: Request) {
  const account = await currentAccount();
  if (!account) return Response.json({ error: "unauthorized" }, { status: 401, headers: privateHeaders });
  if (account.role !== "learner") return Response.json({ error: "forbidden" }, { status: 403, headers: privateHeaders });
  let body: { lessonsDone?: unknown; simDay?: unknown; revenue?: unknown; orders?: unknown; profit?: unknown; purchases?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
  }
  const lessonsDone = clampInt(body.lessonsDone, 0, 10000);
  const simDay = clampInt(body.simDay, -30, 5000);
  const orders = clampInt(body.orders, 0, 1_000_000);
  const purchases = clampInt(body.purchases, 0, 100_000);
  const revenue = clampNum(body.revenue);
  const profit = clampNum(body.profit);
  await grantLearner(account.id);
  await sql(
    `update learner_profiles
     set lessons_done = $2, sim_day = $3, revenue = $4, orders = $5, profit = $6, purchases = $7, updated_at = now()
     where account_id = $1`,
    [account.id, lessonsDone, simDay, revenue, orders, profit, purchases],
  );
  return Response.json({ ok: true }, { headers: privateHeaders });
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
