import { Octokit } from "@octokit/rest";
import { RequestError } from "@octokit/request-error";
import { NextResponse } from "next/server";

import type { SubmitReviewPayload } from "@/types/review";

const BASE_BRANCH = "main";
const REVIEWS_PATH_PREFIX = "content/reviews";
const MAX_FIELD_LENGTH = 500;
const MAX_CONTENT_LENGTH = 10_000;

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

interface ValidationResult {
  ok: true;
  data: SubmitReviewPayload;
}

interface ValidationError {
  ok: false;
  message: string;
}

function getGitHubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return null;
  }

  return { token, owner, repo };
}

function readStringField(
  body: Record<string, unknown>,
  field: keyof SubmitReviewPayload,
): string | null {
  const value = body[field];

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed;
}

function validatePayload(body: unknown): ValidationResult | ValidationError {
  if (typeof body !== "object" || body === null) {
    return { ok: false, message: "请求体必须是 JSON 对象。" };
  }

  const record = body as Record<string, unknown>;

  const university = readStringField(record, "university");
  const major = readStringField(record, "major");
  const title = readStringField(record, "title");
  const content = readStringField(record, "content");

  if (!university || !major || !title || !content) {
    return {
      ok: false,
      message: "university、major、title、content 均为必填字符串字段。",
    };
  }

  if (
    university.length > MAX_FIELD_LENGTH ||
    major.length > MAX_FIELD_LENGTH ||
    title.length > MAX_FIELD_LENGTH
  ) {
    return {
      ok: false,
      message: `university、major、title 长度不能超过 ${MAX_FIELD_LENGTH} 字符。`,
    };
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return {
      ok: false,
      message: `content 长度不能超过 ${MAX_CONTENT_LENGTH} 字符。`,
    };
  }

  const rating = record.rating;

  if (typeof rating !== "number" || !Number.isInteger(rating)) {
    return { ok: false, message: "rating 必须是整数。" };
  }

  if (rating < 1 || rating > 5) {
    return { ok: false, message: "rating 必须在 1 到 5 之间。" };
  }

  return {
    ok: true,
    data: { university, major, rating, title, content },
  };
}

function escapeYamlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return slug || "review";
}

function buildReviewMarkdown(payload: SubmitReviewPayload): string {
  const date = new Date().toISOString().slice(0, 10);

  return `---
university: "${escapeYamlString(payload.university)}"
major: "${escapeYamlString(payload.major)}"
rating: ${payload.rating}
title: "${escapeYamlString(payload.title)}"
date: "${date}"
---

${payload.content}
`;
}

function buildFileName(payload: SubmitReviewPayload): string {
  return `${slugify(payload.university)}-${slugify(payload.major)}-${Date.now()}.md`;
}

function mapGitHubError(error: RequestError): { status: number; message: string } {
  if (error.status === 401 || error.status === 403) {
    return {
      status: 502,
      message: "GitHub 认证失败，请检查服务端 Token 权限配置。",
    };
  }

  if (error.status === 404) {
    return {
      status: 502,
      message: "GitHub 仓库或分支不存在，请检查 GITHUB_OWNER / GITHUB_REPO 配置。",
    };
  }

  if (error.status === 422) {
    return {
      status: 409,
      message: "提交内容与仓库状态冲突，请稍后重试。",
    };
  }

  return {
    status: 502,
    message: "GitHub API 请求失败，请稍后重试。",
  };
}

export async function POST(request: Request) {
  try {
    const config = getGitHubConfig();

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          message: "服务端 GitHub 配置不完整，请联系管理员。",
        },
        { status: 500 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "请求体必须是合法的 JSON。" },
        { status: 400 },
      );
    }

    const validation = validatePayload(body);

    if (!validation.ok) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 },
      );
    }

    const payload = validation.data;
    const branchName = `review-${Date.now()}`;
    const fileName = buildFileName(payload);
    const filePath = `${REVIEWS_PATH_PREFIX}/${fileName}`;
    const markdown = buildReviewMarkdown(payload);

    const octokit = new Octokit({ auth: config.token });

    const { data: baseRef } = await octokit.git.getRef({
      owner: config.owner,
      repo: config.repo,
      ref: `heads/${BASE_BRANCH}`,
    });

    await octokit.git.createRef({
      owner: config.owner,
      repo: config.repo,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    });

    await octokit.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path: filePath,
      message: `feat: add review for ${payload.university} - ${payload.major}`,
      content: Buffer.from(markdown, "utf8").toString("base64"),
      branch: branchName,
    });

    const { data: pullRequest } = await octokit.pulls.create({
      owner: config.owner,
      repo: config.repo,
      title: `[Review] ${payload.university} - ${payload.major}: ${payload.title}`,
      head: branchName,
      base: BASE_BRANCH,
      body: [
        "## 新评价提交",
        "",
        `- **学校**: ${payload.university}`,
        `- **专业**: ${payload.major}`,
        `- **评分**: ${payload.rating} / 5`,
        `- **标题**: ${payload.title}`,
        "",
        "### 正文预览",
        "",
        payload.content,
        "",
        "---",
        "",
        "此 PR 由网站自动创建，请审核后合并。",
      ].join("\n"),
    });

    return NextResponse.json(
      {
        success: true,
        message: "评价已提交，Pull Request 创建成功。",
        pullRequestUrl: pullRequest.html_url,
        branch: branchName,
        filePath,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[submit-review] Unexpected error:", error);

    if (error instanceof RequestError) {
      const mapped = mapGitHubError(error);

      return NextResponse.json(
        { success: false, message: mapped.message },
        { status: mapped.status },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "服务器内部错误，请稍后重试。",
      },
      { status: 500 },
    );
  }
}
