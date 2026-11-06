#!/usr/bin/env python3
"""Fetch the Arena-hosted portfolio site into this repository.

Used by .github/workflows/fetch-site.yml (GitHub runners have open internet).
Run locally only if your network can reach the Arena preview host.
"""

import html as htmllib
import os
import pathlib
import posixpath
import re
import sys
import urllib.parse
import urllib.request

SITE = os.environ.get(
    "SITE",
    "https://01a1ab49-9a25-770e-8a54-37c3d4e40218.arena.site",
).rstrip("/")
ORIGIN = urllib.parse.urlsplit(SITE).netloc
UA = {"User-Agent": "Mozilla/5.0 (compatible; ProtofiloFetch/1.0)"}
SKIP_PREFIX = ("#", "data:", "mailto:", "tel:", "javascript:", "about:")
MAX_ASSET_BYTES = 20 * 1024 * 1024


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=90) as resp:
        return resp.read(MAX_ASSET_BYTES + 1)


def looks_like_wrapper(text: str) -> bool:
    """True if this is the Arena preview chrome instead of the real site."""
    return "preview-iframe" in text or "floating-banner" in text


def get_page() -> tuple[bytes, str]:
    """Return (page_bytes, page_url) for the real site, not the wrapper."""
    candidates: list[str] = []

    # The preview page wraps the site in an iframe — discover its src/srcdoc.
    try:
        wrapper = fetch(SITE + "/").decode("utf-8", "replace")
    except Exception as exc:  # noqa: BLE001
        print(f"warning: wrapper fetch failed: {exc}")
        wrapper = ""
    if wrapper:
        m = re.search(r"<iframe\b[^>]*>", wrapper, re.I)
        if m:
            tag = m.group(0)
            sd = re.search(r'\bsrcdoc\s*=\s*"([^"]*)"', tag, re.I)
            if sd:
                page = htmllib.unescape(sd.group(1)).encode("utf-8")
                print(f"page extracted from iframe srcdoc ({len(page)} bytes)")
                return page, SITE + "/"
            sm = re.search(r'\bsrc\s*=\s*"([^"]*)"', tag, re.I)
            if sm:
                candidates.append(urllib.parse.urljoin(SITE + "/", sm.group(1)))

    candidates += [SITE + "/?embed=true", SITE + "/"]
    for url in dict.fromkeys(candidates):
        try:
            data = fetch(url)
        except Exception as exc:  # noqa: BLE001
            print(f"warning: fetch failed for {url}: {exc}")
            continue
        text = data.decode("utf-8", "replace")
        if not looks_like_wrapper(text):
            print(f"page fetched from {url} ({len(data)} bytes)")
            return data, url
        print(f"note: {url} returned the Arena wrapper, skipping")
    sys.exit("ERROR: could not obtain the site page")


def local_urls(text: str) -> list[str]:
    found: list[str] = []
    patterns = [
        r'\b(?:src|href)\s*=\s*"([^"]+)"',
        r"\b(?:src|href)\s*=\s*'([^']+)'",
        r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)",
        r'\bcontent\s*=\s*"(https?://[^"]+)"',  # og:image etc.
    ]
    for pat in patterns:
        for m in re.finditer(pat, text, re.I):
            found.append(m.group(1).strip())
    return found


def is_local(url: str) -> bool:
    if not url or url.startswith(SKIP_PREFIX) or url.startswith("//"):
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
        print(f"warning: could not fetch {full}: {exc}")
        return
    if len(data) > MAX_ASSET_BYTES:
        print(f"warning: {full} too large, skipped")
        return
    head = data[:64].lstrip().lower()
    if head.startswith((b"<!doctype", b"<html", b"not found")):
        print(f"warning: {full} returned HTML instead of an asset, skipped")
        return
    dest.write_bytes(data)
    print(f"saved {path} ({len(data)} bytes)")


def make_relative(text: str) -> str:
    """Rewrite same-origin absolute URLs so the site works on any host."""
    text = text.replace(f"{SITE}/", "")
    text = re.sub(r"(['\"])/?\?embed=true#", r"\1#", text)
    text = re.sub(r"(['\"])/?\?embed=true(['\"])", r"\1#\2", text)
    return text


def main() -> None:
    page, page_url = get_page()
    text = page.decode("utf-8", "replace")

    seen: set[str] = set()
    for url in local_urls(text):
        if url in seen or not is_local(url):
            continue
        seen.add(url)
        save_asset(url, page_url)

    text = make_relative(text)
    pathlib.Path("index.html").write_text(text, encoding="utf-8")
    print(f"saved index.html ({len(text)} bytes)")


if __name__ == "__main__":
    main()
