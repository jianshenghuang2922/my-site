/** Cloudflare Turnstile 官方测试 Site Key（兜底用） */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

export const isStaticExport =
  process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export function getTurnstileSiteKey(): string {
  const configured = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  if (configured) {
    return configured;
  }

  // 当环境变量缺失时回退到测试 Key，保证组件可加载。
  // 生产环境请务必配置正式 Key。
  return TURNSTILE_TEST_SITE_KEY;
}

export function getApiBasePath(): string {
  if (isStaticExport) {
    return "";
  }

  return "";
}
