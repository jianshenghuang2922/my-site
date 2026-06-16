"use client";

import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

import type { SubmitReviewResponse } from "@/types/review";
import { getTurnstileSiteKey, isStaticExport } from "@/lib/site-config";

const TURNSTILE_SITE_KEY = getTurnstileSiteKey();

interface FormState {
  university: string;
  major: string;
  rating: number;
  title: string;
  content: string;
}

const initialFormState: FormState = {
  university: "",
  major: "",
  rating: 0,
  title: "",
  content: "",
};

function StarRatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;
        const active = star <= (hovered || value);

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            aria-label={`评分 ${star} 星`}
            className={`text-2xl transition-colors ${
              active ? "text-amber-400" : "text-zinc-300"
            } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110"}`}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => !disabled && setHovered(0)}
            onClick={() => !disabled && onChange(star)}
          >
            ★
          </button>
        );
      })}
      <span className="ml-2 text-sm text-zinc-500">
        {value > 0 ? `${value} / 5` : "请选择评分"}
      </span>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-zinc-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50";

export function ReviewSubmitForm() {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    pullRequestUrl?: string;
  } | null>(null);

  const siteKeyMissing = !TURNSTILE_SITE_KEY;

  if (isStaticExport) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
        <p className="font-medium">此为 GitHub Pages 离线阅读版</p>
        <p className="mt-2 leading-relaxed">
          浏览评价可离线查看。提交新评价请前往完整版网站，或通过 GitHub
          仓库直接贡献 Markdown 文件。
        </p>
        <a
          href="https://github.com/jianshenghuang2922/my-site"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block font-medium underline"
        >
          前往 GitHub 仓库
        </a>
      </div>
    );
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetTurnstile() {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (form.rating < 1 || form.rating > 5) {
      setFeedback({ type: "error", message: "请选择 1 到 5 星的评分。" });
      return;
    }

    if (!turnstileToken) {
      setFeedback({ type: "error", message: "请先完成人机验证。" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          university: form.university,
          major: form.major,
          rating: form.rating,
          title: form.title,
          content: form.content,
          turnstileToken,
        }),
      });

      const data = (await response.json()) as SubmitReviewResponse;

      if (!response.ok || !data.success) {
        setFeedback({
          type: "error",
          message: data.message ?? "提交失败，请稍后重试。",
        });
        resetTurnstile();
        return;
      }

      setFeedback({
        type: "success",
        message: data.message,
        pullRequestUrl: data.pullRequestUrl,
      });
      setForm(initialFormState);
      resetTurnstile();
    } catch {
      setFeedback({ type: "error", message: "网络错误，请检查连接后重试。" });
      resetTurnstile();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="university" required>
            学校
          </FieldLabel>
          <input
            id="university"
            type="text"
            required
            disabled={isSubmitting}
            placeholder="例如：UC Berkeley"
            className={inputClassName}
            value={form.university}
            onChange={(e) => updateField("university", e.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="major" required>
            专业
          </FieldLabel>
          <input
            id="major"
            type="text"
            required
            disabled={isSubmitting}
            placeholder="例如：Computer Science"
            className={inputClassName}
            value={form.major}
            onChange={(e) => updateField("major", e.target.value)}
          />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="rating" required>
          评分
        </FieldLabel>
        <StarRatingInput
          value={form.rating}
          onChange={(rating) => updateField("rating", rating)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <FieldLabel htmlFor="title" required>
          标题
        </FieldLabel>
        <input
          id="title"
          type="text"
          required
          disabled={isSubmitting}
          placeholder="一句话概括你的体验"
          className={inputClassName}
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>

      <div>
        <FieldLabel htmlFor="content" required>
          正文
        </FieldLabel>
        <textarea
          id="content"
          required
          disabled={isSubmitting}
          rows={8}
          placeholder="分享你的就读体验、课程难度、校园氛围等……"
          className={`${inputClassName} resize-y`}
          value={form.content}
          onChange={(e) => updateField("content", e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="mb-3 text-sm text-zinc-600">
          提交前请完成人机验证，以防止恶意灌水。
        </p>

        {siteKeyMissing ? (
          <p className="text-sm text-red-600">
            缺少 NEXT_PUBLIC_TURNSTILE_SITE_KEY 环境变量，无法加载验证组件。
          </p>
        ) : (
          <Turnstile
            ref={turnstileRef}
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
            options={{ theme: "light", size: "flexible" }}
          />
        )}
      </div>

      {feedback && (
        <div
          role="alert"
          className={`rounded-lg px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <p>{feedback.message}</p>
          {feedback.pullRequestUrl && (
            <a
              href={feedback.pullRequestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-medium underline"
            >
              查看 Pull Request
            </a>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || siteKeyMissing || !turnstileToken}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:w-auto"
      >
        {isSubmitting ? "提交中…" : "提交评价"}
      </button>
    </form>
  );
}
