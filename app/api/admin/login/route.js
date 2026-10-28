import { NextResponse } from "next/server";
import { COOKIE, SESSION_DAYS, createSession, hmac, safeEq } from "@/lib/auth";

export const dynamic = "force-dynamic";
const hits = new Map(); // naive in-memory throttle: 6 attempts per minute per IP

export async function POST(req) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "Admin is not set up. Add ADMIN_PASSWORD to .env.local and restart." }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 6) return NextResponse.json({ error: "Too many attempts. Wait a minute and try again." }, { status: 429 });
  recent.push(now);
  hits.set(ip, recent);

  const body = await req.json().catch(() => ({}));
  const given = String(body.password ?? "");
  const ok = safeEq(await hmac("pw:" + given), await hmac("pw:" + expected));
  if (!ok) return NextResponse.json({ error: "That password is not right." }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await createSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
