import type { Review } from "@/types/review";

interface ReviewCardProps {
  review: Review;
}

function formatDate(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function RatingStars({ rating }: { rating: number }) {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`评分 ${clamped} / 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={index < clamped ? "text-amber-500" : "text-zinc-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">{review.title}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {review.university} · {review.major}
          </p>
        </div>
        <time className="shrink-0 text-sm text-zinc-400" dateTime={review.date}>
          {formatDate(review.date)}
        </time>
      </header>

      <RatingStars rating={review.rating} />

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-zinc-600">
        {review.content}
      </p>
    </article>
  );
}
