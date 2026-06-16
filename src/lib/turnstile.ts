interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY is not configured");
    return { ok: false, message: "人机验证服务未配置，请联系管理员。" };
  }

  if (!token.trim()) {
    return { ok: false, message: "缺少人机验证 Token。" };
  }

  const params = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    params.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      },
    );

    if (!response.ok) {
      return { ok: false, message: "人机验证服务暂时不可用，请稍后重试。" };
    }

    const data = (await response.json()) as TurnstileVerifyResponse;

    if (!data.success) {
      console.warn("[turnstile] Verification failed:", data["error-codes"]);
      return { ok: false, message: "人机验证未通过，请重新验证后再提交。" };
    }

    return { ok: true };
  } catch (error) {
    console.error("[turnstile] Verification request failed:", error);
    return { ok: false, message: "人机验证服务请求失败，请稍后重试。" };
  }
}

export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }

  return request.headers.get("x-real-ip") ?? undefined;
}
