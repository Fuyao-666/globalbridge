import { currentAccount, isStaff } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AdminScreen } from "./screen";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const account = await currentAccount();
  if (!account || !isStaff(account.role)) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-xl font-semibold">管理后台</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          当前是学员账号{account ? ` ${account.name}` : ""}。管理员不能在这里注册，只能由超级管理员在后台添加。请退出后使用管理员账号登录。
        </p>
        <form className="mt-4" action="/api/auth/logout" method="post">
          <Button className="h-9" type="submit">退出登录</Button>
        </form>
      </div>
    );
  }
  return <AdminScreen superadmin={account.role === "superadmin"} />;
}
