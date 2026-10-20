# 🍪 Cookie Manager Pro

[← All tools](../README.md) · [← Gallery home](../../README.md) · [Beginner installation guide](../../GETTING_STARTED.md)

A Chrome Manifest V3 extension for viewing and managing browser cookies.

| Property | Details |
| :--- | :--- |
| **Version** | 2.1.0 (from [manifest.json](./manifest.json)) |
| **Category** | Browser utility |
| **Technology** | HTML, CSS, JavaScript, Chrome Extension Manifest V3 |
| **License** | [Gallery licensing policy](../../LICENSES.md) — no separate license file was present in this tool folder at audit |
| **Author** | Repository-maintained; contributors should document original authorship and provenance |

## Features

The extension manifest describes viewing, editing, adding, deleting cookies, saving profiles, auto-clear, refresh and localization. Its source includes a popup, options page and background service worker.

## Installation

1. Download the [gallery ZIP](https://github.com/RuslanSharifov/chrome-ui-gallery/archive/refs/heads/main.zip) and extract it.
2. Open **chrome://extensions** in Chrome.
3. Enable **Developer mode** and click **Load unpacked**.
4. Choose **Tools/cookie-manager-pro** — the directory containing [manifest.json](./manifest.json).
5. Pin the extension icon and open its popup. Configure additional behavior in the options page.

## Permissions and privacy review

This extension requests sensitive browser capabilities. **Review its actual source before use.**

| Declared permission | Why it is relevant |
| :--- | :--- |
| **cookies** | Read and modify cookies |
| **tabs**, **activeTab** | Identify or interact with the current tab |
| **storage** | Save settings or cookie-management preferences |
| **contextMenus** | Provide browser right-click actions |
| **browsingData** | Clear relevant browser data |
| **webNavigation** | React to navigation events |
| **<all_urls>** | Broad host access across sites; especially sensitive |

This table explains expected relevance based on the manifest; it is **not** a certification of the implementation's data-handling behavior.

## Source files

- [manifest.json](./manifest.json) — extension configuration and permissions
- [popup.html](./popup.html) · [popup.js](./popup.js) — main interaction UI
- [options.html](./options.html) · [options.js](./options.js) — settings
- [background.js](./background.js) — service worker
- [common.js](./common.js) — shared helpers
- [i18n.js](./i18n.js) — localization
- [styles.css](./styles.css) — styling
- [icon128.png](./icons/icon128.png) — toolbar artwork

## Troubleshooting

If Chrome says **Manifest file is missing**, select the **cookie-manager-pro** directory directly instead of the gallery root. For other errors, open **chrome://extensions → Errors**.

## Contribute

Follow the [contribution guide](../../CONTRIBUTING.md). Please disclose new permissions and third-party code in your pull request.
