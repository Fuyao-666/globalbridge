import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">GlobalBridge</h1>
        <p className="mt-2 text-sm text-slate-500">这个页面不在模拟链路里。</p>
        <Link href="/learn" className="mt-4 inline-block text-sm text-blue-600">返回学习中心</Link>
      </div>
    </div>
  );
}
