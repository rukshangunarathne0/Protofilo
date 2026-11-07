# Protofilo

Portfolio site for **Tharindu Rukshan** — Web Developer, Digital Marketer & AI Content Creator.

Source of the live preview:
<https://01a1b4d5-616a-74f7-80ba-d5059fdbea4f.arena.site/>

## Structure

- `index.html` — the single-page site (HTML/CSS/JS)
- `images/` — portrait, project and contact imagery
- `scripts/fetch_site.py` — re-downloads the site from the Arena preview
- `.github/workflows/fetch-site.yml` — GitHub Action that runs the fetcher

## Re-fetching the site

Push a commit whose message contains the marker `[fetch-site]` (or run the
**Fetch site source** workflow manually from the Actions tab). The workflow
downloads `index.html` plus every local asset it references and commits the
result.

## Local preview

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```
