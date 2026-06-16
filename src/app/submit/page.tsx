import Link from "next/link";

import { ReviewSubmitForm } from "@/components/ReviewSubmitForm";

export default function SubmitPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-800"
          >
            ← 返回首页
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
            提交评价
          </h1>
          <p className="mt-2 text-zinc-500">
            你的评价将以 Pull Request 形式提交至仓库，经审核后合并发布。
          </p>
        </header>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <ReviewSubmitForm />
        </div>
      </main>
    </div>
  );
}
