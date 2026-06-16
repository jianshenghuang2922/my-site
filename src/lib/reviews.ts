import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  filterReviewsByUniversity,
  sortReviewsByDate,
} from "@/lib/review-parser";
import { loadAllReviews } from "@/lib/review-source";
import { findUniversityBySlug, universityToSlug } from "@/lib/university";
import type { GetReviewsOptions, Review } from "@/types/review";

async function loadReviewsUncached(university?: string): Promise<Review[]> {
  const reviews = await loadAllReviews();
  return sortReviewsByDate(filterReviewsByUniversity(reviews, university));
}

const getAllReviewsCached = unstable_cache(
  async () => loadReviewsUncached(),
  ["reviews-all"],
  { tags: [CACHE_TAGS.reviews, CACHE_TAGS.universities] },
);

export async function getReviews(
  options: GetReviewsOptions = {},
): Promise<Review[]> {
  const { university } = options;

  if (!university) {
    return getAllReviewsCached();
  }

  const slug = universityToSlug(university);

  const cachedLoader = unstable_cache(
    async () => loadReviewsUncached(university),
    ["reviews-by-university", slug],
    {
      tags: [
        CACHE_TAGS.reviews,
        CACHE_TAGS.university(slug),
        CACHE_TAGS.universities,
      ],
    },
  );

  return cachedLoader();
}

export async function getUniversities(): Promise<string[]> {
  const reviews = await getAllReviewsCached();
  const universities = new Set(reviews.map((review) => review.university));

  return [...universities].sort((a, b) => a.localeCompare(b));
}

export async function getUniversityBySlug(
  slug: string,
): Promise<{ name: string; reviews: Review[] } | null> {
  const universities = await getUniversities();
  const name = findUniversityBySlug(universities, slug);

  if (!name) {
    return null;
  }

  const reviews = await getReviews({ university: name });

  return { name, reviews };
}

export async function getUniversitySlugs(): Promise<string[]> {
  const universities = await getUniversities();
  return universities.map((university) => universityToSlug(university));
}
