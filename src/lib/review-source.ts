import fs from "node:fs";
import path from "node:path";

import {
  parseReviewMarkdown,
  sortReviewsByDate,
} from "@/lib/review-parser";
import type { Review } from "@/types/review";

const REVIEWS_DIR = path.join(process.cwd(), "content", "reviews");

interface GitHubContentItem {
  name: string;
  path: string;
  type: "file" | "dir" | "submodule" | "symlink";
  download_url: string | null;
}

function shouldFetchFromGitHub(): boolean {
  return process.env.REVIEW_DATA_SOURCE === "github";
}

function getGitHubAuthHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function loadReviewsFromFilesystem(): Promise<Review[]> {
  if (!fs.existsSync(REVIEWS_DIR)) {
    return [];
  }

  const fileNames = fs
    .readdirSync(REVIEWS_DIR)
    .filter((fileName) => fileName.endsWith(".md"));

  const reviews = fileNames
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(REVIEWS_DIR, fileName), "utf8");
      return parseReviewMarkdown(slug, raw);
    })
    .filter((review): review is Review => review !== null);

  return sortReviewsByDate(reviews);
}

async function loadReviewsFromGitHub(): Promise<Review[]> {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_CONTENT_BRANCH ?? "main";

  if (!owner || !repo) {
    throw new Error(
      "REVIEW_DATA_SOURCE=github requires GITHUB_OWNER and GITHUB_REPO.",
    );
  }

  const listResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/content/reviews?ref=${encodeURIComponent(branch)}`,
    {
      headers: getGitHubAuthHeaders(),
      cache: "no-store",
    },
  );

  if (!listResponse.ok) {
    throw new Error(
      `Failed to list review files from GitHub: ${listResponse.status}`,
    );
  }

  const items = (await listResponse.json()) as GitHubContentItem[];

  if (!Array.isArray(items)) {
    throw new Error("Unexpected GitHub API response when listing reviews.");
  }

  const markdownFiles = items.filter(
    (item) => item.type === "file" && item.name.endsWith(".md"),
  );

  const reviews = await Promise.all(
    markdownFiles.map(async (item) => {
      if (!item.download_url) {
        return null;
      }

      const fileResponse = await fetch(item.download_url, {
        headers: getGitHubAuthHeaders(),
        cache: "no-store",
      });

      if (!fileResponse.ok) {
        console.warn(`[reviews] Failed to fetch ${item.path}`);
        return null;
      }

      const raw = await fileResponse.text();
      const slug = item.name.replace(/\.md$/, "");
      return parseReviewMarkdown(slug, raw);
    }),
  );

  return sortReviewsByDate(
    reviews.filter((review): review is Review => review !== null),
  );
}

export async function loadAllReviews(): Promise<Review[]> {
  if (shouldFetchFromGitHub()) {
    return loadReviewsFromGitHub();
  }

  return loadReviewsFromFilesystem();
}
