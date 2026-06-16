import matter from "gray-matter";

import type { Review, ReviewFrontMatter } from "@/types/review";

export function isReviewFrontMatter(data: unknown): data is ReviewFrontMatter {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const record = data as Record<string, unknown>;

  return (
    typeof record.university === "string" &&
    typeof record.major === "string" &&
    typeof record.title === "string" &&
    typeof record.date === "string" &&
    typeof record.rating === "number" &&
    Number.isFinite(record.rating)
  );
}

export function parseReviewMarkdown(slug: string, raw: string): Review | null {
  const { data, content } = matter(raw);

  if (!isReviewFrontMatter(data)) {
    console.warn(`[reviews] Skipping invalid front matter: ${slug}`);
    return null;
  }

  return {
    slug,
    university: data.university.trim(),
    major: data.major.trim(),
    rating: data.rating,
    title: data.title.trim(),
    date: data.date.trim(),
    content: content.trim(),
  };
}

export function sortReviewsByDate(reviews: Review[]): Review[] {
  return [...reviews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function filterReviewsByUniversity(
  reviews: Review[],
  university?: string,
): Review[] {
  if (!university) {
    return reviews;
  }

  return reviews.filter(
    (review) => review.university.toLowerCase() === university.toLowerCase(),
  );
}
