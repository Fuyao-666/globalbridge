import { createHash } from "node:crypto";
import { sql } from "./db";

const IP_LIMIT = 8;
const GLOBAL_LIMIT = 60;
const LEARNER_CAP = 1000;

export async function registrationAllowed(request: Request) {
  const countRows = await sql<{ count: string | number }>("select count(*) as count from accounts where role = 'learner'");
  if (Number(countRows[0]?.count ?? 0) >= LEARNER_CAP) return false;
  const ipHits = await bump(bucketFor(clientAddress(request)));
  const allHits = await bump("reg:all");
  return ipHits <= IP_LIMIT && allHits <= GLOBAL_LIMIT;
}

function clientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const real = request.headers.get("x-real-ip")?.trim() ?? "";
  const value = (forwarded || real).slice(0, 80);
  return value || "unknown";
}

function bucketFor(address: string) {
  return `reg:${createHash("sha256").update(address).digest("hex")}`;
}

async function bump(bucket: string) {
  const rows = await sql<{ hits: number | string }>(
    `insert into register_limits (bucket, hits, window_started)
     values ($1, 1, now())
     on conflict (bucket) do update set
       hits = case
         when register_limits.window_started < now() - interval '1 hour' then 1
         else register_limits.hits + 1
       end,
       window_started = case
         when register_limits.window_started < now() - interval '1 hour' then now()
         else register_limits.window_started
       end
     returning hits`,
    [bucket],
  );
  return Number(rows[0]?.hits ?? 1);
}
