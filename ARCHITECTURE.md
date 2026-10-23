# Repository architecture

[← Home](./README.md) · [UI Catalog](./ui/README.md) · [Tool Catalog](./Tools/README.md)

## Design principle: easy to browse, safe to extend

The gallery separates **UI themes** from **independent browser tools** at the entry point:

~~~text
chrome-ui-gallery/
├── README.md                    # Home / choose category
├── ui/README.md                 # UI themes catalog
├── chatgpt/                     # Existing platform source (stable public paths)
│   ├── README.md
│   ├── glassmorphism/
│   ├── claymorphism/
│   └── DARK GPT/
├── gemini/                      # Platform source
├── github/                      # Platform source
├── lovable/                     # Platform source
├── Tools/                       # Independent browser utilities
│   ├── README.md
│   ├── chatgpt-lag-fixer/
│   ├── cookie-manager-pro/
│   └── devlens/
├── templates/                   # Extension and documentation starters
├── docs/                        # Standalone, searchable showcase website
├── scripts/                     # Zero-dependency repository verification
├── .github/                     # Contributor UX and CI
└── setup/                       # Multilingual setup guides
~~~

Browse [all tools](./Tools/README.md), inspect the community-submitted [DevLens tool](./Tools/devlens/README.md), or return to the [main navigation](./README.md).

## Why no mass rename to ui/platform?

Existing projects already have public links to paths like **chatgpt/glassmorphism/**. Moving all code into **ui/chatgpt/** would break bookmarks, raw GitHub URLs, download references and third-party installs. **ui/README.md is the dedicated UI portal**, while physical source paths remain stable. New designs should follow the existing platform path convention until a separately announced versioned migration.

The capitalized **Tools/** path is also preserved for compatibility. Folder names are case sensitive in GitHub links; always copy their exact case.

## Rules

- **UI source:** platform/style/unique-design folder, each with design.md.
- **Tools source:** Tools/unique-tool-name folder, each with README.md, working manifest.json and permissions disclosure.
- **Documentation:** relative Markdown links; no dead paths.
- **Starter templates:** templates/ instead of copy-pasting existing projects.
- **Submodules:** do not add unconfigured gitlinks or nested .git directories; self-contained tool ZIPs must be installable.
- **Review:** pull requests plus automated validation and a human permissions/license check.

## Code ownership and licensing

Refer to [LICENSES.md](./LICENSES.md). Keep separately licensed components and attribution with the code. No project structure can replace an actual provenance review.

## Automatic publishing pipeline

Projects are discovered from existing extension manifest.json files by [scripts/build-catalog.mjs](./scripts/build-catalog.mjs), with optional per-project gallery.json metadata. [Validate gallery](.github/workflows/validate.yml) checks contribution folders and automatic discovery; [Publish automatic gallery](.github/workflows/publish-gallery.yml) builds the latest catalog and deploys only merged main. GitHub Pages must use **Source: GitHub Actions** (see [docs/README.md](./docs/README.md)). No auto-commits to a protected main branch are needed.
