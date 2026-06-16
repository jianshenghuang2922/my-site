import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewCard } from "@/components/ReviewCard";
import { getUniversityBySlug, getUniversitySlugs } from "@/lib/reviews";

export const revalidate = 86_400;

export async function generateStaticParams() {
  const slugs = await getUniversitySlugs();

  return slugs.map((universitySlug) => ({ universitySlug }));
}

interface UniversityReviewsPageProps {
  params: Promise<{ universitySlug: string }>;
}

export default async function UniversityReviewsPage({
  params,
}: UniversityReviewsPageProps) {
  const { universitySlug } = await params;
  const university = await getUniversityBySlug(universitySlug);

  if (!university) {
    notFound();
  }

  const { name, reviews } = university;

  return (
    <div className="min-h-full bg-zinc-50">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-10">
          <Link
            href="/reviews"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-800"
          >
            ← 全部评价
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
            {name}
          </h1>
          <p className="mt-2 text-zinc-500">共 {reviews.length} 条评价</p>
        </header>

        {reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
            这所学校暂无评价。
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
