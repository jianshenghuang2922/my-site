export function universityToSlug(university: string): string {
  const slug = university
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "unknown";
}

export function findUniversityBySlug(
  universities: string[],
  slug: string,
): string | undefined {
  const normalized = slug.toLowerCase();

  return universities.find(
    (university) => universityToSlug(university) === normalized,
  );
}
