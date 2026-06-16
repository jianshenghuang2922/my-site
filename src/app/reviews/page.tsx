import Link from "next/link";

import { ReviewCard } from "@/components/ReviewCard";
import { getReviews, getUniversities } from "@/lib/reviews";
import { universityToSlug } from "@/lib/university";

export const revalidate = 86_400;

export default async function ReviewsPage() {
  const [reviews, universities] = await Promise.all([
    getReviews(),
    getUniversities(),
  ]);

  return (
    <div className="min-h-full bg-zinc-50">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            大学评价
          </h1>
          <p className="mt-2 text-zinc-500">
            来自社区的真实就读体验，共 {reviews.length} 条评价
          </p>
        </header>

        {universities.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-medium text-zinc-700">按学校浏览</h2>
            <div className="flex flex-wrap gap-2">
              {universities.map((university) => (
                <Link
                  key={university}
                  href={`/reviews/${universityToSlug(university)}`}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900"
                >
                  {university}
                </Link>
              ))}
            </div>
          </section>
        )}

        {reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
            暂无评价，请在 <code className="text-sm">content/reviews/</code>{" "}
            目录下添加 Markdown 文件。
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {reviews.map((review) => (
              <li key={review.slug}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
