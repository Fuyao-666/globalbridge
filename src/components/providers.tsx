"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/lib/store";

function LangSync() {
  const locale = useStore((state) => state.locale);
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <LangSync />
        {children}
        <Toaster position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export function useHydrated() {
  const locale = useStore((state) => state.locale);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const finish = () => setReady(true);
    const unsub = useStore.persist.onFinishHydration(finish);
    if (useStore.persist.hasHydrated()) finish();
    return unsub;
  }, [locale]);
  return ready;
}
