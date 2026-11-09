import { randomBytes } from "node:crypto";
import { currentAccount } from "@/lib/auth";
import { money2 } from "@/lib/credit";
import { addBalance, readBalance, spendBalance } from "@/lib/credit-db";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const privateHeaders = { "cache-control": "private, no-store" };

async function learner() {
  const account = await currentAccount();
  if (!account) return Response.json({ error: "unauthorized" }, { status: 401, headers: privateHeaders });
  if (account.role !== "learner") return Response.json({ error: "forbidden" }, { status: 403, headers: privateHeaders });
  return account;
}

export async function GET() {
  const gate = await learner();
  if (gate instanceof Response) return gate;
  const balance = await readBalance(gate.id);
  const pending = await sql<{ id: string }>(
    "select id from credit_requests where account_id = $1 and status = 'pending' limit 1",
    [gate.id],
  );
  return Response.json({ balance, pending: pending.length > 0 }, { headers: privateHeaders });
}

export async function POST(request: Request) {
  const gate = await learner();
  if (gate instanceof Response) return gate;
  let body: { op?: unknown; amount?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
  }
  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
  if (body.op === "spend") {
    if (!Number.isFinite(amount) || amount <= 0 || amount > 50_000_000) {
      return Response.json({ error: "amount" }, { status: 400, headers: privateHeaders });
    }
    const balance = await spendBalance(gate.id, amount);
    if (balance === null) return Response.json({ error: "short", balance: await readBalance(gate.id) }, { status: 409, headers: privateHeaders });
    return Response.json({ balance }, { headers: privateHeaders });
  }
  if (body.op === "pnl") {
    if (!Number.isFinite(amount) || Math.abs(amount) > 50_000_000) {
      return Response.json({ error: "amount" }, { status: 400, headers: privateHeaders });
    }
    if (Math.abs(amount) < 0.005) return Response.json({ balance: await readBalance(gate.id) }, { headers: privateHeaders });
    const balance = await addBalance(gate.id, amount);
    return Response.json({ balance }, { headers: privateHeaders });
  }
  if (body.op === "apply") {
    if (!Number.isFinite(amount) || amount < 1 || amount > 5_000_000) {
      return Response.json({ error: "amount" }, { status: 400, headers: privateHeaders });
    }
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 200) : "";
    const pending = await sql<{ id: string }>(
      "select id from credit_requests where account_id = $1 and status = 'pending' limit 1",
      [gate.id],
    );
    if (pending.length > 0) return Response.json({ error: "pending" }, { status: 409, headers: privateHeaders });
    const id = `req_${randomBytes(9).toString("base64url")}`;
    await sql(
      "insert into credit_requests (id, account_id, amount, note) values ($1, $2, $3, $4)",
      [id, gate.id, money2(amount), note],
    );
    return Response.json({ id, pending: true, balance: await readBalance(gate.id) }, { status: 201, headers: privateHeaders });
  }
  return Response.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
}
