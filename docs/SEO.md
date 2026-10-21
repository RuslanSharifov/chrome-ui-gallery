# Google Search Console and indexing

[← Documentation](./README.md) · [Live gallery](https://ruslansharifov.github.io/chrome-ui-gallery/) · [Home](../README.md)

## Submit the sitemap

1. Open [Google Search Console](https://search.google.com/search-console/) and select the **URL-prefix property** `https://ruslansharifov.github.io/chrome-ui-gallery/`.
2. Open **Sitemaps**, enter `sitemap.xml` in **Add a new sitemap**, and click **Submit**. Full URL: [https://ruslansharifov.github.io/chrome-ui-gallery/sitemap.xml](https://ruslansharifov.github.io/chrome-ui-gallery/sitemap.xml).
3. Open **URL inspection**, enter `https://ruslansharifov.github.io/chrome-ui-gallery/`, and press Enter.
4. If the page is not indexed, click **Request indexing** when available.
5. Revisit **Page indexing** and **Performance** over time to see discovered URLs, impressions and clicks.

## What is included

- `docs/sitemap.xml` lists the single existing canonical HTML landing page.
- `docs/index.html` has descriptive title/description, canonical URL, Open Graph tags and WebSite JSON-LD data.
- The existing [HTML ownership verification](./google46a2f216e136ff0b.html) remains intact. Its corresponding verification meta tag is in the HTML `<head>`.

The gallery's tool and design cards are generated dynamically in the single HTML landing page; filtering uses the same document, not independently published HTML detail URLs. We intentionally avoid fake per-project URLs and fragment-only sitemap entries. Future standalone pages with unique substantial content should be added to the sitemap once actually published.

## Robots.txt and GitHub Pages

This is a GitHub Pages **project site** on a shared hostname. Crawlers look for robots policy at `https://ruslansharifov.github.io/robots.txt`, **not** `/chrome-ui-gallery/robots.txt`. Placing a robots.txt in this repository's `docs/` subfolder would not control host crawling, so no misleading subpath robots.txt is generated.

## Expectations

Ownership verification is not search indexing. A sitemap and **Request indexing** help discovery, but neither Google inclusion nor higher ranking is guaranteed. Prioritize clear original content, real links, useful tool documentation and accessibility. Never delete the verification file while using that ownership method.
