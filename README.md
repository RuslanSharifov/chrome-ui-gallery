<div align="center">

# ✦ Chrome UI Gallery

### Reimagine the browser. Explore the code. Build something better.

**An open-source gallery of experimental browser interfaces, Chrome extensions, developer tools, and a companion desktop application.**

[**Live Gallery**](https://ruslansharifov.github.io/chrome-ui-gallery/) · [**UI Designs**](./ui-designs/README.md) · [**Developer Tools**](./Tools/README.md) · [**Desktop App Setup**](https://ruslansharifov.github.io/chrome-ui-gallery/desktop.html) · [**Desktop App Source**](./apps/desktop/README.md) · [**Releases**](https://github.com/RuslanSharifov/chrome-ui-gallery/releases)

![License](https://img.shields.io/badge/license-MIT-8fe8cb?style=flat-square) ![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-b9a6ff?style=flat-square) ![Open Source](https://img.shields.io/badge/open%20source-community-8ebfff?style=flat-square)

</div>

---

## Table of contents

- [About](#about)
- [Explore the collections](#explore-the-collections)
- [Project navigation](#project-navigation)
- [Live website and automatic catalog](#live-website-and-automatic-catalog)
- [Installing Chrome extensions](#installing-chrome-extensions)
- [Desktop application](#desktop-application)
- [Repository structure](#repository-structure)
- [Development and testing](#development-and-testing)
- [Support the project](#-support-the-project)
- [Open source and contributing](#open-source-and-contributing)
- [Security and privacy](#security-and-privacy)
- [License and trademarks](#license-and-trademarks)
- [Community and support](#community-and-support)

## About

**Chrome UI Gallery** is an independent, open-source workspace for exploring how familiar websites and browser experiences could look, feel, and work differently. Rather than showing only design mockups, the repository brings together **actual source code, Chrome extensions, visual previews, documentation, and developer utilities**.

Our goals are to make interface experimentation accessible, help developers learn from working examples, provide practical browser tools, and maintain a transparent place where contributions can be reviewed. Visitors can browse the public website, inspect a project on GitHub, or install extensions they trust.

Chrome UI Gallery is **not affiliated with or endorsed by** the companies whose products appear in the design experiments.

## Explore the collections

### 🎨 UI design experiments

Themes and functional interface concepts are grouped by platform and design style. Collections include glassmorphism, claymorphism, dark interfaces, 3D concepts, and other visual experiments.

| Platform | Source and documentation |
| --- | --- |
| ChatGPT | [ChatGPT designs](./ui-designs/chatgpt/README.md) |
| Gemini | [Gemini designs](./ui-designs/gemini/README.md) |
| GitHub | [GitHub designs](./ui-designs/github/README.md) |
| Lovable | [Lovable designs](./ui-designs/lovable/README.md) |
| All collections | [UI Designs](./ui-designs/README.md) |

Each project keeps its own implementation and design documentation, with links to relevant HTML, CSS, JavaScript, extension manifests, screenshots, and other files where provided.

### 🧰 Browser and developer tools

The project also hosts standalone extensions, separate from visual redesigns.

| Tool | Purpose |
| --- | --- |
| [Viewport Studio](./Tools/viewport-studio/README.md) | Compare responsive phone, tablet and desktop views in floating draggable windows — [poster](./Tools/viewport-studio/viewport-studio-poster.svg) |
| [UI Doctor](./Tools/UI-Doctor-v1.0-Chrome-Extension/README.md) | Visual debugging, responsive testing, layout and CSS inspection |
| [DevLens](./Tools/devlens/README.md) | Page diagnostics, console activity, JavaScript errors and network monitoring |
| [ChatGPT Lag Fixer](./Tools/chatgpt-lag-fixer/README.md) | Performance utilities for lengthy conversations |
| [Cookie Manager Pro](./Tools/cookie-manager-pro/README.md) | Browser cookie inspection and management |
| [TabPocket](./Tools/tabpocket/README.md) | Save, organize, search and restore tab collections |

Explore the [complete Tools directory](./Tools/README.md). Each extension has its own purpose, usage instructions and permission requirements; consult its README before installation.

## Project navigation

| Area | What you will find |
| --- | --- |
| [Live Gallery](https://ruslansharifov.github.io/chrome-ui-gallery/) | Searchable, responsive project showcase with previews and filters |
| [UI Designs](./ui-designs/README.md) | Platform-based collections of custom browser interfaces |
| [Tools](./Tools/README.md) | Standalone extensions and browser utilities |
| [Applications](./apps/README.md) | Website and desktop application overview |
| [Desktop App](./apps/desktop/README.md) | Electron/React source code, setup and release information |
| [Browser Companion](./browser-bridge/manager-extension/README.md) | Local connection between Chrome and the Desktop Manager |
| [Setup Guides](./setup/README.md) | Installation and project usage instructions |
| [Templates](./templates/README.md) | Starting points for new contributions |
| [Contributor Guide](./CONTRIBUTING.md) | Contribution workflow and project requirements |
| [GitHub Releases](https://github.com/RuslanSharifov/chrome-ui-gallery/releases) | Published downloadable versions, when available |

## Live website and automatic catalog

**[Open the public gallery →](https://ruslansharifov.github.io/chrome-ui-gallery/)**

The gallery presents interactive project cards, visual previews, categories, searchable metadata, platform and style filters, and direct GitHub source links. A visitor can explore a design, read its documentation, or download an available extension ZIP.

The website is **data-driven**. Instead of manually adding entries to website JavaScript, approved Chrome projects are discovered from their committed `manifest.json` files. Optional `gallery.json` files provide extra presentation information such as name, category, palette, tags and preview images.

The automated publishing workflow follows four steps:

1. Add a new project in its correct source folder with the required manifest and README/design documentation.
2. Open a Pull Request so the structural and catalog validations can run.
3. After review, merge the approved changes into `main`.
4. GitHub Actions generates the new catalog, prepares downloadable extension ZIPs and publishes the GitHub Pages website.

A submitted Pull Request alone does not publish the project.

Read the [website guide](./docs/README.md), [catalog specification](./docs/CATALOG.md), and [gallery publishing workflow](./.github/workflows/publish-gallery.yml).

## Installing Chrome extensions

Chrome UI Gallery hosts source-first projects. To try an extension locally:

1. Select a project from the [gallery](https://ruslansharifov.github.io/chrome-ui-gallery/) or a source collection.
2. Download its provided ZIP and extract it, or clone the repository.
3. Visit `chrome://extensions` in Chrome and enable **Developer mode**.
4. Select **Load unpacked**, then choose the exact folder containing the project's `manifest.json`.
5. Check Chrome's permission requests, and use the project's README to configure or operate it.

**Only install code you trust.** Developer-mode extensions are intended for local testing; permissions, support and browser compatibility vary across projects. See [Getting Started](./GETTING_STARTED.md) and [Setup Guides](./setup/README.md).

## Desktop application

The **Chrome UI Gallery Desktop Manager** is an open-source **Electron + React** application that brings the same project discovery workflow to your desktop.

Features implemented in the source include project search, platform filters, preview cards, expanded details, documentation/source links, a connection panel and update checking. With the optional [Chrome Companion](./browser-bridge/manager-extension/README.md) installed and paired, the app can list locally installed Chrome extensions and request enable/disable actions for those Chrome allows it to manage.

**Important limits:** Chrome must be running for live extension management. The companion requires the `management` permission, and pairing is local. Without the companion, the desktop application works as a browsable gallery rather than an extension controller.

### Start locally

Requires Node.js 22+.

```bash
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery/apps/desktop
npm install
npm run dev
```

The desktop code includes an **electron-updater** integration for compatible published GitHub Releases. This does not mean a signed installer is already available. Public downloads depend on building, signing, publishing and verifying installer releases. Visit the [release page](https://github.com/RuslanSharifov/chrome-ui-gallery/releases) to check availability.

Learn more in [Desktop README](./apps/desktop/README.md), [Release Instructions](./apps/desktop/RELEASING.md), and [Applications](./apps/README.md).

## Repository structure

```text
chrome-ui-gallery/
├── ui-designs/
│   ├── chatgpt/
│   ├── gemini/
│   ├── github/
│   └── lovable/
├── Tools/                  # Standalone Chrome extensions
├── apps/
│   ├── desktop/            # Electron + React Desktop Manager
│   └── website/            # Website entry documentation
├── browser-bridge/
│   └── manager-extension/  # Optional Chrome companion
├── docs/                   # GitHub Pages website and catalog
├── scripts/                # Catalog and validation automation
├── setup/                  # Installation guides
├── templates/              # Starter templates
├── .github/workflows/      # CI, deployment and desktop releases
├── README.md
├── LICENSE
└── LICENSES.md
```

Documentation stays close to each implementation: platform READMEs provide navigation, individual UI projects include design documentation, and tools and apps have their own README files. The root README is the entry point, not a replacement for project-specific instructions.

## Development and testing

Run the repository checks from its root:

```bash
node scripts/build-catalog.mjs
node scripts/test-catalog.mjs
node scripts/validate.mjs
```

These commands build the catalog, verify automatic project discovery and validate paths and extension structure. **They do not constitute a security audit.** Test any browser extension manually before submitting it.

The desktop renderer has a separate [CI build](./.github/workflows/desktop-check.yml). Its [Windows release workflow](./.github/workflows/desktop-release.yml) supports packaging and GitHub publishing, subject to proper release configuration and signing. See the [architecture notes](./ARCHITECTURE.md) for additional project context.

## Open source and contributing

Chrome UI Gallery is developed openly and welcomes UI designers, extension developers, accessibility contributors, documentation writers and reviewers. You can study implementations, report bugs, propose improvements, contribute visual experiments, or submit a standalone tool.

Typical contribution workflow:

1. Fork the repository and create a descriptive feature branch.
2. Add your work in the appropriate platform/style or tool folder without overwriting unrelated projects.
3. Include a clear README or design document, required manifests, previews where useful, attribution and license notices.
4. Validate your files and test the project locally.
5. Open a Pull Request describing the change, permissions, dependencies and testing performed.

Do **not** commit API keys, authentication cookies, browser data, passwords or other secrets. Only contribute assets and source files you have permission to distribute.

Start with [CONTRIBUTING.md](./CONTRIBUTING.md), [Code of Conduct](./CODE_OF_CONDUCT.md), [Governance](./GOVERNANCE.md), or browse [open issues](https://github.com/RuslanSharifov/chrome-ui-gallery/issues).

## Security and privacy

Some browser extensions have access to sensitive capabilities depending on the permissions they request. Inspect `manifest.json`, review the project's purpose and evaluate third-party dependencies before installation.

The Desktop Companion pairs with a local process using `127.0.0.1`. It does not grant unrestricted remote administration, bypass Chrome permission restrictions, or function while Chrome is closed. Local pairing and permission design should still be evaluated carefully before using it with important browsing profiles.

For vulnerabilities, **never post working exploits, credentials or private information in a public issue**. Read [SECURITY.md](./SECURITY.md) to learn about responsible, private reporting options. Source availability and automated validation do not guarantee that an extension is secure.

## License and trademarks

The repository's **original project-owned code and documentation** are offered under the [MIT License](./LICENSE). MIT permits use, modification and redistribution of covered materials, including commercial use, subject to retaining required copyright and license notices. The software is provided **as is**, without warranty.

**Not everything visible in the repository is automatically MIT-licensed.** Third-party libraries, imported files, fonts, illustrations, screenshots, brand assets and separately licensed contributions can have other legal conditions. Review [LICENSES.md](./LICENSES.md) and project-level notices for attribution and provenance before reuse or redistribution.

Chrome, ChatGPT, Gemini, GitHub, Lovable and other platform names or marks belong to their respective owners. Gallery themes and tools are independent experiments and do not imply partnership, sponsorship or endorsement.

## 💜 Support the project

<div align="center">

### Small support. Big impact.

Chrome UI Gallery is built in the open — free UI experiments, useful browser tools, and resources for everyone.

If the project has helped you, consider buying the creator a coffee. It's completely optional, and every bit of support helps make future releases possible.

<a href="https://ko-fi.com/ruslansharifov"><img src="https://img.shields.io/badge/Ko--fi-Support%20the%20project-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Support Chrome UI Gallery on Ko-fi"></a>

<a href="https://ko-fi.com/ruslansharifov"><img src="https://img.shields.io/badge/%E2%99%A5%20-Buy%20me%20a%20coffee-b9a6ff?style=flat-square" alt="Buy me a coffee"></a>
<a href="https://github.com/RuslanSharifov/chrome-ui-gallery/stargazers"><img src="https://img.shields.io/badge/%E2%98%85-Star%20this%20repository-8fe8cb?style=flat-square" alt="Star this repository"></a>

*No paywalls, no obligation — just a way to say thanks.*

</div>

---

## Community and support

| Resource | Link |
| --- | --- |
| Support the project | [Support on Ko-fi](https://ko-fi.com/ruslansharifov) |
| Public website | [Chrome UI Gallery](https://ruslansharifov.github.io/chrome-ui-gallery/) |
| Source repository | [GitHub](https://github.com/RuslanSharifov/chrome-ui-gallery) |
| Report issues and request features | [Issues](https://github.com/RuslanSharifov/chrome-ui-gallery/issues) |
| Browse or submit changes | [Pull Requests](https://github.com/RuslanSharifov/chrome-ui-gallery/pulls) |
| Release downloads | [Releases](https://github.com/RuslanSharifov/chrome-ui-gallery/releases) |
| Security reports | [Security Policy](./SECURITY.md) |
| Licensing details | [License](./LICENSE) · [Attribution Inventory](./LICENSES.md) |

---

<div align="center">

**Explore the design. Inspect the source. Build your own.**

[Back to top ↑](#-chrome-ui-gallery)

</div>
