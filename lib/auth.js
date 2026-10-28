// Signed-cookie admin session. Uses Web Crypto so it runs in middleware (Edge) and Node routes.
const enc = new TextEncoder();
export const COOKIE = "admin_session";
export const SESSION_DAYS = 7;

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";

export async function hmac(msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function safeEq(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function createSession() {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  return `${exp}.${await hmac("admin." + exp)}`;
}

export async function verifySession(token) {
  if (!token || !secret()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEq(sig, await hmac("admin." + exp));
}
