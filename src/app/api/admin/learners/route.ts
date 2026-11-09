import { currentAccount, hashPassword, newAccountId, normalizeEmail, validEmail } from "@/lib/auth";
import { asFields, grantLearner, setBalance } from "@/lib/credit-db";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const privateHeaders = { "cache-control": "private, no-store" };

type LearnerRow = {
  id: string;
  email: string;
  username: string | null;
  name: string;
  created_at: string;
  balance: string | number;
  lessons_done: number;
  sim_day: number;
  revenue: string | number;
  orders: number;
  profit: string | number;
  purchases: number;
  custom: unknown;
  pending: number;
};

async function requireSuperadmin() {
  const account = await currentAccount();
  if (!account) return Response.json({ error: "unauthorized" }, { status: 401, headers: privateHeaders });
  if (account.role !== "superadmin") return Response.json({ error: "forbidden" }, { status: 403, headers: privateHeaders });
  return account;
}

function present(row: LearnerRow) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    name: row.name,
    createdAt: row.created_at,
    balance: Number(row.balance),
    lessonsDone: Number(row.lessons_done),
    simDay: Number(row.sim_day),
    revenue: Number(row.revenue),
    orders: Number(row.orders),
    profit: Number(row.profit),
    purchases: Number(row.purchases),
    custom: asFields(row.custom),
    pending: Number(row.pending) > 0,
  };
}

const LIST_SQL = `
  select a.id, a.email, a.username, a.name, a.created_at,
    coalesce(c.balance, 500000) as balance,
    coalesce(p.lessons_done, 0) as lessons_done,
    coalesce(p.sim_day, 0) as sim_day,
    coalesce(p.revenue, 0) as revenue,
    coalesce(p.orders, 0) as orders,
    coalesce(p.profit, 0) as profit,
    coalesce(p.purchases, 0) as purchases,
    coalesce(p.custom, '[]'::jsonb) as custom,
    (select count(*) from credit_requests r where r.account_id = a.id and r.status = 'pending') as pending
  from accounts a
  left join credit_accounts c on c.account_id = a.id
  left join learner_profiles p on p.account_id = a.id
  where a.role = 'learner'
  order by a.created_at desc
`;

export async function GET() {
  const gate = await requireSuperadmin();
  if (gate instanceof Response) return gate;
  const rows = await sql<LearnerRow>(LIST_SQL);
  return Response.json(rows.map(present), { headers: privateHeaders });
}

export async function POST(request: Request) {
  const gate = await requireSuperadmin();
  if (gate instanceof Response) return gate;
  let body: { name?: unknown; email?: unknown; username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (name.length < 2 || name.length > 24) return Response.json({ error: "name" }, { status: 400, headers: privateHeaders });
  if (!validEmail(email)) return Response.json({ error: "email" }, { status: 400, headers: privateHeaders });
  if (username && !/^[a-z0-9_]{3,24}$/.test(username)) return Response.json({ error: "username" }, { status: 400, headers: privateHeaders });
  if (password.length < 8 || password.length > 72) return Response.json({ error: "password" }, { status: 400, headers: privateHeaders });
  const id = newAccountId();
  try {
    await sql(
      "insert into accounts (id, email, username, name, role, password_hash) values ($1, $2, $3, $4, 'learner', $5)",
      [id, email, username || null, name, await hashPassword(password)],
    );
    await grantLearner(id);
    await setBalance(id, 500000);
  } catch (error) {
    if (isUnique(error)) return Response.json({ error: "taken" }, { status: 409, headers: privateHeaders });
    return Response.json({ error: "unavailable" }, { status: 500, headers: privateHeaders });
  }
  return Response.json({ id, email, username: username || null, name, role: "learner", balance: 500000 }, { status: 201, headers: privateHeaders });
}

function isUnique(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505") return true;
  return error instanceof Error && /unique|duplicate/i.test(error.message);
}
