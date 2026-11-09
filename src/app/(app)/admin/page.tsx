import { currentAccount } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AdminScreen } from "./screen";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const account = await currentAccount();
  if (!account || account.role !== "admin") {
    return (
      <div className="rounded-2xl border bg-card p-8">
        <h1 className="text-xl font-semibold">管理后台</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          当前登录的是学员{account ? ` ${account.name}` : ""}。请先退出，再用管理员账号登录。还没有管理员账号时，退出后在登录页选择「注册管理员」。
          This account is a learner. Log out, then sign in as an admin.
        </p>
        <form className="mt-4" action="/api/auth/logout" method="post">
          <Button className="h-9" type="submit">退出登录</Button>
        </form>
      </div>
    );
  }
  return <AdminScreen />;
}
