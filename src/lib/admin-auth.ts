const SESSION_COOKIE = "krishilens_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function createSignature(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

export function getAdminSessionCookieName(): string {
  return SESSION_COOKIE;
}

export function getAdminSessionCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function createAdminSessionToken(): Promise<string | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;

  const payload = toBase64Url(
    new TextEncoder().encode(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }))
  );
  const signature = await createSignature(payload, secret);
  return `${payload}.${signature}`;
}

export async function isValidAdminSession(token: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  try {
    const expectedSignature = await createSignature(payload, secret);
    if (signature !== expectedSignature) return false;

    const parsedPayload: unknown = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (
      typeof parsedPayload !== "object" ||
      parsedPayload === null ||
      !("exp" in parsedPayload) ||
      typeof parsedPayload.exp !== "number"
    ) {
      return false;
    }

    return parsedPayload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
