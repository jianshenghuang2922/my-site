import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { universityToSlug } from "@/lib/university";

/** Webhook 场景：立即失效缓存，下次请求拉取最新 GitHub 数据 */
const REVALIDATE_PROFILE = { expire: 0 } as const;

interface RevalidateRequestBody {
  paths?: string[];
  tags?: string[];
  universities?: string[];
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  const headerToken = request.headers.get("x-revalidate-secret");

  return bearerToken === secret || headerToken === secret;
}

function revalidateUniversity(university: string): string[] {
  const slug = universityToSlug(university);
  const revalidated: string[] = [];

  revalidateTag(CACHE_TAGS.university(slug), REVALIDATE_PROFILE);
  revalidated.push(`tag:${CACHE_TAGS.university(slug)}`);

  const universityPath = `/reviews/${slug}`;
  revalidatePath(universityPath);
  revalidated.push(`path:${universityPath}`);

  return revalidated;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: RevalidateRequestBody = {};

  try {
    const text = await request.text();

    if (text) {
      body = JSON.parse(text) as RevalidateRequestBody;
    }
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const revalidated: string[] = [];

  try {
    const tags = new Set(body.tags ?? []);

    if (tags.size === 0 && !body.paths?.length && !body.universities?.length) {
      tags.add(CACHE_TAGS.reviews);
      tags.add(CACHE_TAGS.universities);
    }

    for (const tag of tags) {
      revalidateTag(tag, REVALIDATE_PROFILE);
      revalidated.push(`tag:${tag}`);
    }

    for (const university of body.universities ?? []) {
      revalidated.push(...revalidateUniversity(university));
    }

    const defaultPaths = ["/", "/reviews"];
    const paths = body.paths ?? defaultPaths;

    for (const pagePath of paths) {
      revalidatePath(pagePath);
      revalidated.push(`path:${pagePath}`);
    }

    return NextResponse.json({
      success: true,
      message: "Revalidation triggered",
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[revalidate] Failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Revalidation failed",
      },
      { status: 500 },
    );
  }
}
