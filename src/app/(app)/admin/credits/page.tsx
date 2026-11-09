import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth";
import { CreditDesk } from "./desk";

export const dynamic = "force-dynamic";

export default async function CreditsPage() {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (account.role !== "superadmin") redirect("/admin");
  return <CreditDesk />;
}
