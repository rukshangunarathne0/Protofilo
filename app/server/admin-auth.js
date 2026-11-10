import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const ADMIN_EMAIL = "admin@rsd.com";
const COOKIE_NAME = "__Host-rsd_admin_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const failures = new Map();

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function getSessionSecret() {
  const secret = process.env.RSD_ADMIN_SESSION_SECRET;
  return typeof secret === "string" && secret.length >= 32 ? secret : null;
}

function sign(value) {
  const secret = getSessionSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqualText(left, right) {
  const a = Buffer.from(left || "");
  const b = Buffer.from(right || "");
  return a.length === b.length && timingSafeEqual(a, b);
}

function parsePasswordHash(value) {
  if (typeof value !== "string") return null;
  const parts = value.trim().split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  const [, nText, rText, pText, saltText, digestText] = parts;
  const N = Number(nText);
  const r = Number(rText);
  const p = Number(pText);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return null;
  try {
    const salt = Buffer.from(saltText, "base64url");
    const digest = Buffer.from(digestText, "base64url");
    if (salt.length < 16 || digest.length < 16) return null;
    return { N, r, p, salt, digest };
  } catch {
    return null;
  }
}

export function hashPassword(password, salt = randomBytes(16)) {
  const N = 16384;
  const r = 8;
  const p = 1;
  const digest = scryptSync(password, salt, 32, { N, r, p, maxmem: 32 * 1024 * 1024 });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64url")}$${digest.toString("base64url")}`;
}

function verifyPassword(password) {
  const parsed = parsePasswordHash(process.env.RSD_ADMIN_PASSWORD_HASH);
  if (!parsed || typeof password !== "string") return false;
  try {
    const digest = scryptSync(password, parsed.salt, parsed.digest.length, {
      N: parsed.N,
      r: parsed.r,
      p: parsed.p,
      maxmem: 32 * 1024 * 1024,
    });
    return timingSafeEqual(digest, parsed.digest);
  } catch {
    return false;
  }
}

function getClientAddress(req) {
  const forwarded = req.headers["x-forwarded-for"];
  return String(forwarded || req.socket?.remoteAddress || "unknown").split(",")[0].trim().slice(0, 120);
}

function failureKey(req, email) {
  return `${getClientAddress(req)}:${email}`;
}

function isLockedOut(key) {
  const record = failures.get(key);
  if (!record) return false;
  if (record.lockedUntil > Date.now()) return true;
  if (record.lockedUntil) failures.delete(key);
  return false;
}

function recordFailure(key) {
  const current = failures.get(key) || { count: 0, lockedUntil: 0 };
  current.count += 1;
  if (current.count >= MAX_FAILURES) current.lockedUntil = Date.now() + LOCKOUT_MS;
  failures.set(key, current);
}

function clearFailures(key) {
  failures.delete(key);
}

function requestIsSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
    return host && originUrl.host === host;
  } catch {
    return false;
  }
}

export function setSecurityHeaders(res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
}

export function sendJson(res, status, payload) {
  setSecurityHeaders(res);
  res.status(status).json(payload);
}

export function methodNotAllowed(req, res, allowed = "POST") {
  res.setHeader("Allow", allowed);
  sendJson(res, 405, { error: "Method not allowed." });
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

export function createSessionCookie(res) {
  const secret = getSessionSecret();
  if (!secret) return false;
  const payload = base64url(JSON.stringify({
    email: ADMIN_EMAIL,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    nonce: randomBytes(16).toString("base64url"),
  }));
  const signature = sign(payload);
  if (!signature) return false;
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${payload}.${signature}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`
  );
  return true;
}

function readCookie(req) {
  const raw = req.headers.cookie || "";
  const match = raw.split(";").map(part => part.trim()).find(part => part.startsWith(`${COOKIE_NAME}=`));
  return match ? match.slice(COOKIE_NAME.length + 1) : null;
}

export function readSession(req) {
  const token = readCookie(req);
  const secret = getSessionSecret();
  if (!token || !secret) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqualText(sign(payload), signature)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.email !== ADMIN_EMAIL || !Number.isInteger(data.exp) || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return { email: ADMIN_EMAIL };
  } catch {
    return null;
  }
}

export function authenticateAdmin(req, res) {
  if (req.method !== "POST") {
    methodNotAllowed(req, res);
    return false;
  }
  if (!requestIsSameOrigin(req)) {
    sendJson(res, 403, { error: "Request rejected." });
    return false;
  }
  const body = typeof req.body === "string" ? (() => {
    try { return JSON.parse(req.body); } catch { return {}; }
  })() : (req.body || {});
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const key = failureKey(req, email || "unknown");

  if (isLockedOut(key)) {
    sendJson(res, 429, { error: "Too many attempts. Try again later." });
    return false;
  }

  // Do not distinguish an unknown email, a wrong password, or missing server
  // configuration in the public response.
  if (email !== ADMIN_EMAIL || password.length < 1 || password.length > 512 || !verifyPassword(password)) {
    recordFailure(key);
    sendJson(res, 401, { error: "Invalid administrator credentials." });
    return false;
  }
  if (!createSessionCookie(res)) {
    sendJson(res, 503, { error: "Administrator sign-in is temporarily unavailable." });
    return false;
  }
  clearFailures(key);
  sendJson(res, 200, { ok: true });
  return true;
}
