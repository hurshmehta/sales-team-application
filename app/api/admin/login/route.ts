import { NextResponse } from "next/server";
import { ADMIN_COOKIE, makeSessionToken } from "@/lib/adminAuth";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// POST /api/admin/login { password } -> sets the admin session cookie.
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`admin-login:${ip}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { ok: false, error: "Admin password is not configured." },
      { status: 500 }
    );
  }

  if (typeof body.password !== "string" || body.password !== password) {
    return NextResponse.json(
      { ok: false, error: "Wrong password." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
