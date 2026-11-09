import { redirect } from "next/navigation";
import { AuthScreen, RoleChooser } from "@/components/auth-screen";
import { currentAccount } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const account = await currentAccount();
  if (account) redirect(account.role === "admin" ? "/admin" : "/learn");
  const role = (await searchParams).role;
  if (role !== "learner" && role !== "admin") return <RoleChooser />;
  return <AuthScreen mode="register" role={role} />;
}
