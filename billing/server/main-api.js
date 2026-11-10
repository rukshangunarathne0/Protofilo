const MAIN_API_ORIGIN = (process.env.RSD_MAIN_API_ORIGIN || "https://rsd-watches-main.vercel.app").replace(/\/$/, "");

function requestBody(req) {
  if (req.body === undefined || req.body === null) return undefined;
  if (typeof req.body === "string") return req.body;
  return JSON.stringify(req.body);
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

export async function forwardJson(req, res, path, method = req.method) {
  if (!requestIsSameOrigin(req)) {
    res.status(403).json({ error: "Request rejected." });
    return;
  }
  const headers = {};
  const cookie = req.headers.cookie;
  if (cookie) headers.cookie = cookie;
  if (method !== "GET" && method !== "HEAD") headers["content-type"] = "application/json";

  try {
    const upstream = await fetch(`${MAIN_API_ORIGIN}${path}`, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : requestBody(req),
    });
    const contentType = upstream.headers.get("content-type") || "application/json; charset=utf-8";
    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) res.setHeader("Set-Cookie", setCookie);
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Content-Type", contentType);
    res.status(upstream.status).send(await upstream.text());
  } catch {
    res.status(502).json({ error: "The billing service could not reach the R.S.D. database service." });
  }
}
