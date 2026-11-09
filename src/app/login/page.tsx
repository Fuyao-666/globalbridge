import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth-screen";
import { currentAccount, isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const account = await currentAccount();
  if (account) redirect(isStaff(account.role) ? "/admin" : "/learn");
  return <AuthScreen mode="login" />;
}
