import { randomBytes } from "node:crypto";
import { hashPassword } from "./auth";

type Query = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>;

/** Creates the superadmin from operator environment variables. No account is shipped with the app. */
export async function ensureOwnerAdmin(query: Query) {
  const username = process.env.SUPERADMIN_USERNAME?.trim().toLowerCase() ?? "";
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const password = process.env.SUPERADMIN_PASSWORD ?? "";
  if (!username && !email && !password) return;
  if (!/^[a-z0-9_]{3,24}$/.test(username)) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return;
  if (password.length < 8 || password.length > 72) return;
  const name = (process.env.SUPERADMIN_NAME?.trim() || "超级管理员").slice(0, 24);
  const existing = await query<{ id: string; role: string }>(
    "select id, role from accounts where username = $1 or email = $2",
    [username, email],
  );
  if (existing.length > 1) return;
  const passwordHash = await hashPassword(password);
  if (existing[0]) {
    if (existing[0].role !== "superadmin") return;
    await query(
      "update accounts set email = $2, username = $3, name = $4, password_hash = $5 where id = $1 and role = 'superadmin'",
      [existing[0].id, email, username, name, passwordHash],
    );
    return;
  }
  const id = `acc_${randomBytes(9).toString("base64url")}`;
  await query(
    "insert into accounts (id, email, username, name, role, password_hash) values ($1, $2, $3, $4, 'superadmin', $5)",
    [id, email, username, name, passwordHash],
  );
}
