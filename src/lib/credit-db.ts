import { OPENING_CREDIT, money2, type CustomField } from "./credit";
import { sql } from "./db";

export async function grantLearner(accountId: string) {
  await sql(
    "insert into credit_accounts (account_id, balance) values ($1, $2) on conflict (account_id) do nothing",
    [accountId, OPENING_CREDIT],
  );
  await sql("insert into learner_profiles (account_id) values ($1) on conflict (account_id) do nothing", [accountId]);
}

export async function readBalance(accountId: string) {
  await grantLearner(accountId);
  const rows = await sql<{ balance: string | number }>("select balance from credit_accounts where account_id = $1", [accountId]);
  return money2(Number(rows[0]?.balance ?? 0));
}

export async function spendBalance(accountId: string, amount: number) {
  await grantLearner(accountId);
  const rows = await sql<{ balance: string | number }>(
    "update credit_accounts set balance = round(balance - $2, 2), updated_at = now() where account_id = $1 and balance >= $2 returning balance",
    [accountId, money2(amount)],
  );
  if (!rows[0]) return null;
  return money2(Number(rows[0].balance));
}

export async function addBalance(accountId: string, amount: number) {
  await grantLearner(accountId);
  const rows = await sql<{ balance: string | number }>(
    "update credit_accounts set balance = round(balance + $2, 2), updated_at = now() where account_id = $1 returning balance",
    [accountId, money2(amount)],
  );
  return money2(Number(rows[0]?.balance ?? 0));
}

export async function setBalance(accountId: string, balance: number) {
  await grantLearner(accountId);
  const rows = await sql<{ balance: string | number }>(
    "update credit_accounts set balance = $2, updated_at = now() where account_id = $1 returning balance",
    [accountId, money2(balance)],
  );
  return money2(Number(rows[0]?.balance ?? 0));
}

export function asFields(value: unknown): CustomField[] {
  const source = typeof value === "string" ? safeParse(value) : value;
  if (!Array.isArray(source)) return [];
  return source.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as { id?: unknown; key?: unknown; value?: unknown };
    const key = typeof row.key === "string" ? row.key : "";
    const id = typeof row.id === "string" ? row.id : "";
    const fieldValue = typeof row.value === "string" ? row.value : "";
    if (!id || !key) return [];
    return [{ id, key, value: fieldValue }];
  });
}

function safeParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return [];
  }
}
