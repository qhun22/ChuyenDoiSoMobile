const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const allowDevelopmentBypass = process.env.TURNSTILE_DEV_BYPASS !== 'false';

  if (isDevelopment && allowDevelopmentBypass) {
    return true;
  }

  if (!secret) {
    console.error('Missing TURNSTILE_SECRET_KEY environment variable');
    return false;
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });

    if (!response.ok) return false;

    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}
