import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell";
import { SessionBridge } from "@/components/session-bridge";
import { currentAccount } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const account = await currentAccount();
  if (!account) redirect("/login");
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted-foreground">GlobalBridge</div>}>
      <SessionBridge account={account}>
        <AppShell>{children}</AppShell>
      </SessionBridge>
    </Suspense>
  );
}
