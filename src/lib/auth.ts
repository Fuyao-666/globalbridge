import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { sql } from "./db";

const scrypt = promisify(scryptCallback);
const COOKIE = "gb_session";
const SESSION_MS = 14 * 24 * 60 * 60 * 1000;

export type AccountRole = "learner" | "admin" | "superadmin";

export type Account = {
  id: string;
  email: string;
  username: string | null;
  name: string;
  role: AccountRole;
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 120;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derived = (await scrypt(password, salt, 32)) as Buffer;
  return `scrypt$${salt}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = (await scrypt(password, salt, 32)) as Buffer;
  const expected = Buffer.from(hash, "base64url");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(accountId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_MS);
  await sql("insert into sessions (token_hash, account_id, expires_at) values ($1, $2, $3)", [
    hashToken(token),
    accountId,
    expires.toISOString(),
  ]);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await sql("delete from sessions where token_hash = $1", [hashToken(token)]);
  jar.set(COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export async function currentAccount(): Promise<Account | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const rows = await sql<Account>(
    `select a.id, a.email, a.username, a.name, a.role
     from sessions s
     join accounts a on a.id = s.account_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [hashToken(token)],
  );
  const account = rows[0];
  if (!account || (account.role !== "learner" && account.role !== "admin" && account.role !== "superadmin")) return null;
  return account;
}

export function isStaff(role: AccountRole) {
  return role === "admin" || role === "superadmin";
}

export function newAccountId() {
  return `acc_${randomBytes(12).toString("base64url")}`;
}
