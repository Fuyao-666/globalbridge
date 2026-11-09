import { currentAccount } from "@/lib/auth";
import { money2 } from "@/lib/credit";
import { addBalance } from "@/lib/credit-db";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const privateHeaders = { "cache-control": "private, no-store" };

type RequestRow = {
  id: string;
  account_id: string;
  name: string;
  email: string;
  amount: string | number;
  note: string;
  status: string;
  granted: string | number | null;
  balance: string | number | null;
  created_at: string;
  resolved_at: string | null;
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
  const rows = await sql<RequestRow>(`
    select r.id, r.account_id, a.name, a.email, r.amount, r.note, r.status, r.granted, c.balance, r.created_at, r.resolved_at
    from credit_requests r
    join accounts a on a.id = r.account_id
    left join credit_accounts c on c.account_id = r.account_id
    order by case when r.status = 'pending' then 0 else 1 end, r.created_at desc
  `);
  return Response.json(
    rows.map((row) => ({
      id: row.id,
      accountId: row.account_id,
      name: row.name,
      email: row.email,
      amount: Number(row.amount),
      note: row.note,
      status: row.status,
      granted: row.granted === null ? null : Number(row.granted),
      balance: row.balance === null ? null : Number(row.balance),
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
    })),
    { headers: privateHeaders },
  );
}

export async function POST(request: Request) {
  const gate = await requireSuperadmin();
  if (gate instanceof Response) return gate;
  let body: { id?: unknown; action?: unknown; granted?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return Response.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
  if (body.action === "reject") {
    const rows = await sql<{ id: string }>(
      "update credit_requests set status = 'rejected', resolved_at = now() where id = $1 and status = 'pending' returning id",
      [id],
    );
    if (!rows[0]) return Response.json({ error: "missing" }, { status: 404, headers: privateHeaders });
    return Response.json({ ok: true }, { headers: privateHeaders });
  }
  if (body.action !== "approve") return Response.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
  const granted = Number(body.granted);
  if (!Number.isFinite(granted) || granted <= 0 || granted > 5_000_000) {
    return Response.json({ error: "amount" }, { status: 400, headers: privateHeaders });
  }
  const rows = await sql<{ account_id: string }>(
    "update credit_requests set status = 'approved', granted = $2, resolved_at = now() where id = $1 and status = 'pending' returning account_id",
    [id, money2(granted)],
  );
  if (!rows[0]) return Response.json({ error: "missing" }, { status: 404, headers: privateHeaders });
  const balance = await addBalance(rows[0].account_id, granted);
  return Response.json({ ok: true, balance }, { headers: privateHeaders });
}
