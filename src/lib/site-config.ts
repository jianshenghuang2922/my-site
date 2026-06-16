/** Cloudflare Turnstile 官方测试 Site Key，本地开发可用 */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

export const isStaticExport =
  process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export function getTurnstileSiteKey(): string {
  const configured = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "development") {
    return TURNSTILE_TEST_SITE_KEY;
  }

  return "";
}

export function getApiBasePath(): string {
  if (isStaticExport) {
    return "";
  }

  return "";
}
