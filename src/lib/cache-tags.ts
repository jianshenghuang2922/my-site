export const CACHE_TAGS = {
  reviews: "reviews",
  universities: "universities",
  university: (slug: string) => `university-${slug}`,
} as const;

export const REVALIDATE_SECONDS = 86_400;
