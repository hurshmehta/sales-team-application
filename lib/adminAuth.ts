import { createHmac } from "crypto";
import type { NextRequest } from "next/server";

// Simple password protection for /admin.
// The session cookie holds an HMAC of the admin password, signed with
// ADMIN_SESSION_SECRET. This is basic protection for an internal tool,
// not a substitute for real auth if the admin page ever holds sensitive data.

export const ADMIN_COOKIE = "admin_session";

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) {
    throw new Error("Missing ADMIN_SESSION_SECRET.");
  }
  return value;
}

export function makeSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Missing ADMIN_PASSWORD.");
  }
  return createHmac("sha256", secret()).update(password).digest("hex");
}

export function isAdminRequest(req: NextRequest): boolean {
  try {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) return false;
    return token === makeSessionToken();
  } catch {
    return false;
  }
}
