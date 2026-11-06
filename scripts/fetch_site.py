#!/usr/bin/env python3
"""Fetch the Arena-hosted portfolio site into this repository.

Used by .github/workflows/fetch-site.yml (GitHub runners have open internet).
Writes fetch.log with full diagnostics; never raises — exits 0 when
index.html was saved, 1 otherwise (the workflow commits the log either way).
"""

import html as htmllib
import json
import os
import pathlib
import posixpath
import re
import traceback
import urllib.error
import urllib.parse
import urllib.request

SITE = os.environ.get(
    "SITE",
    "https://01a1ab49-9a25-770e-8a54-37c3d4e40218.arena.site",
).rstrip("/")
ORIGIN = urllib.parse.urlsplit(SITE).netloc
UA = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}
SKIP_PREFIX = ("#", "data:", "mailto:", "tel:", "javascript:", "about:")
MAX_ASSET_BYTES = 20 * 1024 * 1024
LOG_LINES: list[str] = []


def log(msg: str) -> None:
    print(msg, flush=True)
    LOG_LINES.append(msg)


def fetch(url: str, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = resp.read(MAX_ASSET_BYTES + 1)
        log(f"  GET {url} -> {resp.status} {len(data)} bytes")
        return data


def looks_like_wrapper(text: str) -> bool:
    """True if this is the Arena preview chrome instead of the real site."""
    return "preview-iframe" in text or "floating-banner" in text


def extract_iframe_url(wrapper: str) -> str | None:
    """Find the preview iframe's src (absolute) in the wrapper HTML."""
    for tag in re.findall(r"<iframe\b[^>]*>", wrapper, re.I):
        sm = re.search(r'\bsrc\s*=\s*"([^"]+)"', tag, re.I)
        if sm:
            src = sm.group(1).strip()
            if src and not src.startswith("about:"):
                return urllib.parse.urljoin(SITE + "/", src)
        sd = re.search(r"\bsrcdoc\s*=", tag, re.I)
        if sd:
            log("  iframe uses srcdoc (inline), not a URL")
    # JS-assigned src: iframe.src = "..."
    sm = re.search(r'preview-iframe["\']?\s*\)?\s*(?:\.src|setAttribute\(["\']src["\'])\s*[=(]\s*["\']([^"\']+)["\']', wrapper)
    if sm:
        return urllib.parse.urljoin(SITE + "/", sm.group(1).strip())
    return None


def fetch_via_allorigins(url: str) -> bytes | None:
    """Fallback: raw HTML through the allorigins JSON API."""
    proxy = "https://api.allorigins.win/get?url=" + urllib.parse.quote(url, safe="")
    try:
        raw = fetch(proxy, timeout=90)
    except Exception as exc:  # noqa: BLE001
        log(f"  allorigins failed for {url}: {exc}")
        return None
    try:
        payload = json.loads(raw.decode("utf-8", "replace"))
    except json.JSONDecodeError as exc:
        log(f"  allorigins returned non-JSON for {url}: {exc}")
        return None
    contents = payload.get("contents")
    status = payload.get("status", {})
    log(
        f"  allorigins {url} -> http={status.get('http_code')} "
        f"len={len(contents) if contents else 0}"
    )
    if not contents:
        return None
    return contents.encode("utf-8")


def get_page() -> tuple[bytes, str] | None:
    """Return (page_bytes, page_url) for the real site, not the wrapper."""
    candidates: list[str] = []

    # 1) Wrapper page: discover the iframe src.
    wrapper = None
    for label, url in (("direct", SITE + "/"), ("allorigins", None)):
        try:
            if url is None:
                data = fetch_via_allorigins(SITE + "/")
            else:
                data = fetch(url)
            if data:
                wrapper = data.decode("utf-8", "replace")
                log(f"wrapper fetched via {label} ({len(data)} bytes)")
                break
        except Exception as exc:  # noqa: BLE001
            log(f"wrapper fetch via {label} failed: {exc}")
    if wrapper:
        pathlib.Path("debug-wrapper.html").write_text(wrapper, encoding="utf-8")
        iframe_url = extract_iframe_url(wrapper)
        log(f"iframe url: {iframe_url!r}")
        if iframe_url:
            candidates.append(iframe_url)

    # 2) Well-known URLs.
    candidates += [
        SITE + "/?embed=true",
        SITE + "/index.html",
        SITE + "/",
    ]

    seen: set[str] = set()
    for url in candidates:
        if url in seen:
            continue
        seen.add(url)
        # direct fetch
        try:
            data = fetch(url)
            text = data.decode("utf-8", "replace")
            if not looks_like_wrapper(text):
                log(f"page fetched directly from {url}")
                return data, url
            log(f"  {url} is the wrapper, trying next")
            pathlib.Path("debug-wrapper-embed.html").write_text(text, encoding="utf-8")
        except Exception as exc:  # noqa: BLE001
            log(f"  direct fetch of {url} failed: {exc}")
        # allorigins fallback
        data = fetch_via_allorigins(url)
        if data:
            text = data.decode("utf-8", "replace")
            if not looks_like_wrapper(text):
                log(f"page fetched via allorigins from {url}")
                return data, url
            log(f"  allorigins {url} is the wrapper, trying next")
    return None


def local_urls(text: str) -> list[str]:
    found: list[str] = []
    patterns = [
        r'\b(?:src|href)\s*=\s*"([^"]+)"',
        r"\b(?:src|href)\s*=\s*'([^']+)'",
        r'url\(\s*[\'"]?([^\'")]+)[\'"]?\s*\)',
        r'\bcontent\s*=\s*"(https?://[^"]+)"',  # og:image etc.
        # JS/JSX object style: src:"images/x.jpg" or href:'images/x.jpg'
        # (also image:/poster:/thumbnail: keys used by project cards)
        r'\b(?:src|href|image|poster|thumbnail)\s*:\s*"([^"]+)"',
        r"\b(?:src|href|image|poster|thumbnail)\s*:\s*'([^']+)'",
        # setAttribute("src", "images/x.jpg")
        r'setAttribute\(\s*["\'](?:src|href)["\']\s*,\s*["\']([^"\']+)["\']',
    ]
    for pat in patterns:
        for m in re.finditer(pat, text, re.I):
            found.append(m.group(1).strip())
    return found


def is_local(url: str) -> bool:
    if not url or url.startswith(SKIP_PREFIX) or url.startswith("//"):
        return False
    # JS string-concatenation fragments: "'+r+'", "'+Be(t)+'", "${...}"
    if "'+" in url or '+ "' in url or "${" in url or "`" in url:
        return False
    parts = urllib.parse.urlsplit(url)
    if parts.scheme in ("http", "https"):
        return parts.netloc == ORIGIN
    return True  # relative path


def save_asset(url: str, page_url: str) -> None:
    full = urllib.parse.urljoin(page_url, url)
    parts = urllib.parse.urlsplit(full)
    if parts.netloc and parts.netloc != ORIGIN:
        return
    path = posixpath.normpath(urllib.parse.unquote(parts.path)).lstrip("/")
    if not path or path.endswith("/") or path.startswith(".git/"):
        return
    dest = pathlib.Path(path)
    if dest.exists() and dest.stat().st_size > 0:
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        data = fetch(full)
    except Exception as exc:  # noqa: BLE001
        log(f"warning: could not fetch {full}: {exc}")
        return
    if len(data) > MAX_ASSET_BYTES:
        log(f"warning: {full} too large, skipped")
        return
    head = data[:64].lstrip().lower()
    if head.startswith((b"<!doctype", b"<html", b"not found")):
        log(f"warning: {full} returned HTML instead of an asset, skipped")
        return
    dest.write_bytes(data)
    log(f"saved {path} ({len(data)} bytes)")


def make_relative(text: str) -> str:
    """Rewrite same-origin absolute URLs so the site works on any host."""
    text = text.replace(f"{SITE}/", "")
    text = re.sub(r"(['\"])/?\?embed=true#", r"\1#", text)
    text = re.sub(r"(['\"])/?\?embed=true(['\"])", r"\1#\2", text)
    return text


def main() -> int:
    exit_code = 1
    try:
        log(f"SITE={SITE}")
        result = get_page()
        if result is None:
            log("ERROR: could not obtain the site page")
        else:
            page, page_url = result
            text = page.decode("utf-8", "replace")

            seen: set[str] = set()
            for url in local_urls(text):
                if url in seen or not is_local(url):
                    continue
                seen.add(url)
                save_asset(url, page_url)

            text = make_relative(text)
            pathlib.Path("index.html").write_text(text, encoding="utf-8")
            log(f"saved index.html ({len(text)} bytes)")
            # Drop leftover debug artifacts from earlier failed runs.
            for stale in ("debug-wrapper.html", "debug-wrapper-embed.html"):
                p = pathlib.Path(stale)
                if p.exists():
                    p.unlink()
                    log(f"removed {stale}")
            exit_code = 0
    except Exception:  # noqa: BLE001
        log("UNCAUGHT EXCEPTION:\n" + traceback.format_exc())
    finally:
        pathlib.Path("fetch.log").write_text("\n".join(LOG_LINES) + "\n", encoding="utf-8")
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
