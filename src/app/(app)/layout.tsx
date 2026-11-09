import { Suspense } from "react";
import { AppShell } from "@/components/shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted-foreground">GlobalBridge</div>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
