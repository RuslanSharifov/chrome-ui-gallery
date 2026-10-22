# Automatic Gallery Catalog

[← Main README](../README.md) · [Browse tools](../Tools/README.md) · [DevLens](../Tools/devlens/README.md) · [Showcase HTML](./index.html) · [Contributor instructions](../CONTRIBUTING.md) · [Metadata specification](./CATALOG.md)

**No manual HTML or JavaScript project arrays.** Every approved extension appears automatically.

## Search indexing

[Search Console and sitemap setup](./SEO.md) · [Published sitemap](https://ruslansharifov.github.io/chrome-ui-gallery/sitemap.xml).

## How updates work

1. Add **Tools/new-tool/manifest.json** with **README.md**, or a UI design under a platform/style folder with **design.md**.
2. Pull Request runs **Validate gallery** and automatic-discovery integration tests.
3. A maintainer reviews the contribution and merges it to **main**.
4. **Publish automatic gallery** rebuilds **catalog.json** from all approved folders and deploys via GitHub Actions.
5. GitHub Pages shows the new card, search results, platform filters and updated project counts.

Only **merged** projects appear. A Pull Request alone does not publish new code.

## Example: accepted developer tool

**[DevLens](../Tools/devlens/README.md)** is a merged example in [Tools/](../Tools/README.md). Its [manifest.json](../Tools/devlens/manifest.json) and [gallery.json](../Tools/devlens/gallery.json) demonstrate how the automatic catalog creates a tool card and source/documentation links without editing the website JavaScript.

## One-time Pages setup — required

Open [Settings → Pages](https://github.com/RuslanSharifov/chrome-ui-gallery/settings/pages).
Change **Build and deployment → Source** from **Deploy from a branch** to **GitHub Actions**.
Then use [Actions → Publish automatic gallery](https://github.com/RuslanSharifov/chrome-ui-gallery/actions/workflows/publish-gallery.yml) → **Run workflow** → **main**, once.

After that, every merge to main automatically generates and deploys the current catalog. If Pages remains configured for **main /docs**, the site can use only the committed catalog.json snapshot, not the new catalog generated during Actions.

**Troubleshooting a missing project:** First check that its `manifest.json` and `README.md` are merged into `main`. The checked-in [`docs/catalog.json`](./catalog.json) must also contain the project, because **Deploy from a branch → main /docs** publishes this committed snapshot. A successful **Publish automatic gallery** workflow does not guarantee that the branch-based Pages site serves its generated artifact. This repository now checks that the committed catalog matches the generated catalog in CI. For a single consistent deployment method, choose **GitHub Actions** as the Pages source; do not keep branch-based publishing enabled alongside the workflow.

## How to test locally

Requires Node.js 22 or newer. In repository root:

~~~bash
node scripts/build-catalog.mjs
node scripts/test-catalog.mjs
node scripts/validate.mjs
node scripts/serve-gallery.mjs
~~~

Open **http://127.0.0.1:4173** and press Ctrl+C to stop the server.

Opening index.html via a file:// URL is not supported because the page loads catalog.json using the browser's fetch API.

## Source files

- [build-catalog.mjs](../scripts/build-catalog.mjs) — discovers project manifests
- [catalog.json](./catalog.json) — initial compatibility snapshot for branch-based Pages
- [app.js](./app.js) — renders data-driven cards, counters and filters
- [index.html](./index.html) · [styles.css](./styles.css) — website
- [test-catalog.mjs](../scripts/test-catalog.mjs) — adds temporary test projects to verify discovery
- [Validate workflow](../.github/workflows/validate.yml) — CI on Pull Requests
- [Publish workflow](../.github/workflows/publish-gallery.yml) — rebuild and deploy on main
- [Metadata options](./CATALOG.md) — extra appearance and author information

## Submit an extension

~~~text
Tools/
└── your-new-tool/
    ├── manifest.json
    ├── README.md
    ├── popup.html
    ├── popup.js
    └── gallery.json  # optional
~~~

No app.js edit and no hardcoded HTML counts. Security, copyright and privacy reviews remain necessary even when structural validation passes.

## Download ZIP, contributors and filters

- Every deployment builds `docs/downloads/<catalog-id>.zip` from the matching approved extension folder using [package-downloads.py](../scripts/package-downloads.py). ZIP files contain only that extension directory and are not committed to Git. The Download ZIP button requires a successful GitHub Pages deployment.
- Contributors are fetched from GitHub's public repository contributor endpoint at runtime. API rate limits or network failures show a link to GitHub instead; counts are not fabricated.
- Style filters and sorting use catalog metadata, and reset clears all filters. No contributor approval or extension permissions are changed.

## Interactive visual effects

The site includes a lightweight loading animation, scroll reveals, mouse-responsive 3D hero, particle background, dynamic logo and cursor glow. Effects live in [motion.js](./motion.js) and [styles.css](./styles.css). The illustrative Before / After section has been removed. Reduced-motion preferences disable these effects; touch devices skip pointer interactions.

## Floating glass navigation

The header uses two independently floating glassmorphism islands: a left brand island and a right GitHub/menu island. Scrolling condenses both islands into rounded pills. The three-dot control expands the right island to the left with staggered navigation links; its X control and Escape key close the menu. Outside clicks and navigation also close it. Keyboard focus and reduced-motion preferences are supported. See [header.js](./header.js), [index.html](./index.html), and [styles.css](./styles.css).

## Pages (multi-page layout)

- [index.html](./index.html) — particle-3D intro, the latest 6 repositories (`data-limit` on `#project-grid`), a **View all repositories** button, getting started, contributors and contribute call-to-action.
- [gallery.html](./gallery.html) — every repository with category, platform and style filters, search and sorting. Supports `?category=ui|tool`, `?platform=chatgpt` and `?q=text`.
- [hero.js](./hero.js) — canvas particle cube model for the intro (touch/pointer reactive, honors reduced-motion). [logo.svg](./logo.svg) / [favicon.svg](./favicon.svg) — the cube mark.
- "Latest" order: an optional ISO `added` date on catalog entries; when absent, the last catalog entries count as newest.

- [guide.html](./guide.html) — install / how it works / submit / metadata / local testing / maintainer setup / FAQ, with copy buttons and a sticky table of contents.
- [bg.js](./bg.js) — shared dynamic background on every page: a drifting "git graph" (branch lanes, commit nodes, merge pulses, pointer glow) plus a soft animated aurora; disabled under reduced motion.
