# Chrome UI Gallery

A collection of Chrome extensions and web UI experiments, organized by platform and visual style.

**Browse:** Repository → Platform → Style → Design documentation → Implementation files.

## Platforms

- [ChatGPT](./chatgpt/README.md)
- [Gemini](./gemini/README.md)
- [GitHub](./github/README.md)
- [Lovable](./lovable/README.md)

## Tools

- [Chrome Extension Tools](./Tools/README.md) — utilities independent of visual redesigns.

## Setup and documentation

- [Setup guides (6 languages)](./setup/README.md)
- To install any extension, load the **specific folder containing `manifest.json`** via `chrome://extensions` → Developer mode → Load unpacked.

## Repository conventions

1. Keep platforms in separate top-level folders, and group visual designs by style.
2. Preserve existing folders and filenames; place each new design in its own directory.
3. Every visual design should have a `design.md` describing its purpose, style, technologies, files, setup, and possible reuse.
4. Use relative Markdown links, and update the platform/style README navigation whenever adding a design.
5. Keep implementation assets alongside the extension's `manifest.json`.
6. Standalone utilities belong in [Tools](./Tools/README.md).

> **Note:** [ChatGPT Lag Fixer](./Tools/README.md#chatgpt-lag-fixer) is currently recorded as a Git submodule/gitlink in this repository, not as a normal folder of committed source files. See the Tools README for the required fix.
