"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export type SessionAccount = {
  id: string;
  email: string;
  name: string;
  role: "learner" | "admin";
};

const SessionContext = createContext<SessionAccount | null>(null);

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Missing session");
  return value;
}

export function SessionBridge({ account, children }: { account: SessionAccount; children: React.ReactNode }) {
  const [readyId, setReadyId] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    setReadyId(null);
    (async () => {
      useStore.persist.setOptions({ name: `globalbridge-account-${account.id}` });
      await useStore.persist.rehydrate();
      if (cancel) return;
      useStore.setState({
        role: account.role,
        profile: { name: account.name.slice(0, 24), handle: account.name.slice(0, 24) },
      });
      setReadyId(account.id);
    })();
    return () => {
      cancel = true;
    };
  }, [account.id, account.name, account.role]);

  if (readyId !== account.id) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">GlobalBridge</div>;
  }
  return <SessionContext.Provider value={account}>{children}</SessionContext.Provider>;
}
