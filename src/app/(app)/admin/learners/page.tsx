import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth";
import { LearnerDesk } from "./desk";

export const dynamic = "force-dynamic";

export default async function LearnersPage() {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (account.role !== "superadmin") redirect("/admin");
  return <LearnerDesk />;
}
