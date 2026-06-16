import Link from "next/link";

import { getReviews } from "@/lib/reviews";

export const revalidate = 86_400;

export default async function Home() {
  const reviews = await getReviews();
  const reviewCount = reviews.length;

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-6">
      <main className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          大学评价共创
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">
          汇聚真实就读体验，帮助后来者做出更明智的选择。数据以 Markdown
          形式存储，支持 GitOps 协作贡献。
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          当前共收录 {reviewCount} 条评价
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/reviews"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            浏览全部评价
          </Link>
          <Link
            href="/submit"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-8 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100"
          >
            提交评价
          </Link>
        </div>
      </main>
    </div>
  );
}
