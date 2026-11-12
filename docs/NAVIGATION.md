# Repository navigation and folder organization

[← Home](../README.md) · [All platforms](../ui-designs/README.md) · [All tools](../Tools/README.md) · [Automatic catalog](./README.md)

## Navigation route

**Root README → UI Designs / Tools → platform → style or utility category → specific design → source code.**

Each supported platform has one canonical home under `ui-designs/<platform>/`. Do not duplicate a platform at the repository root. Every platform and style folder needs a Markdown index that points directly to its current projects.

## Canonical YouTube example

```text
chrome-ui-gallery/
├── README.md
├── ui-designs/
│   ├── README.md
│   ├── chatgpt/
│   ├── gemini/
│   ├── github/
│   ├── lovable/
│   └── youtube/
│       ├── README.md
│       ├── glassmorphism/
│       │   ├── README.md
│       │   └── youtube-ambient-light/
│       │       ├── README.md
│       │       ├── design.md
│       │       └── manifest.json
│       └── utilities/
│           ├── README.md
│           └── youtube-ad-guard/
│               ├── README.md
│               ├── design.md
│               └── manifest.json
├── Tools/
│   └── README.md
└── docs/
    └── NAVIGATION.md
```

- General browser utilities are stored in [Tools/](../Tools/README.md).
- Platform-specific browser utilities stay under the relevant platform (for example `ui-designs/youtube/utilities`).
- A project under `ui-designs/` can set `"category": "tool"` in `gallery.json` to appear in the site's Tool filter without losing its platform structure.
- The [catalog generator](../scripts/build-catalog.mjs) discovers projects from `manifest.json`; the Markdown index hierarchy is maintained explicitly.

## New design checklist

1. Find or create `ui-designs/<platform>/README.md`.
2. Choose the appropriate style/category folder and add its `README.md`.
3. Create a uniquely named leaf folder; do not overwrite another design.
4. Keep `manifest.json`, a practical `README.md`, `design.md` and the design's source files together.
5. Link from the style index to the project, from the platform index to the style, and from [UI Designs](../ui-designs/README.md) to any **new** platform.
6. Use relative links to actual files and describe install steps, permissions, functionality, limitations and preview assets.
7. Run the checks, open a Pull Request, then merge only after validation. Never maintain a second copy of an extension.

## Validate

From the root directory:

```sh
node scripts/build-catalog.mjs
node scripts/test-catalog.mjs
node scripts/test-navigation.mjs
node scripts/validate.mjs
```

[Gallery metadata specification](./CATALOG.md) · [Contributor guide](../CONTRIBUTING.md) · [Site publishing](./README.md).
