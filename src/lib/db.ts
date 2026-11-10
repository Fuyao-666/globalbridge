import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

const globalDb = globalThis as unknown as {
  gbPool?: pg.Pool;
  gbLocal?: Promise<PGlite>;
};

let bootPromise: Promise<void> | null = null;

export async function sql<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  bootPromise ??= ensureOnce().catch((error: unknown) => {
    bootPromise = null;
    throw error;
  });
  await bootPromise;
  return queryRaw<T>(text, params);
}

async function ensureOnce() {
  const { ensureOwnerAdmin } = await import("./bootstrap-admin");
  await ensureOwnerAdmin(queryRaw);
}

async function queryRaw<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  if (databaseUrl !== "") {
    globalDb.gbPool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await globalDb.gbPool.query(text, params)).rows as T[];
  }
  globalDb.gbLocal ??= startLocal().catch((error: unknown) => {
    globalDb.gbLocal = undefined;
    throw error;
  });
  return (await (await globalDb.gbLocal).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const db = new PGlite();
  const files = (await readdir("migrations").catch(() => [])).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  }
  return db;
}
