# 🧰 Chrome Extension Tools

[← Home](../README.md) · [UI Gallery →](../ui/README.md) · [DevLens →](./devlens/README.md) · [Contribute a tool →](../CONTRIBUTING.md#add-a-new-tool)

Tools are **standalone extensions**, separate from visual UI redesigns. Each tool includes its own installation instructions, source files and license information.

## Browse every approved tool

**[Open the searchable live gallery](https://ruslansharifov.github.io/chrome-ui-gallery/)** — this catalog is generated automatically from every approved Tool directory. The table below links to the currently documented extensions. The live website's full catalog is built automatically when new tools are merged.

## Tool directory

| Tool | Category | Description | Source |
| :--- | :--- | :--- | :--- |
| **[ChatGPT Lag Fixer](./chatgpt-lag-fixer/README.md)** | Performance | Reduce lag in long ChatGPT chats | [Open folder](./chatgpt-lag-fixer/) |
| **[Cookie Manager Pro](./cookie-manager-pro/README.md)** | Browser utility | View, edit, clear and organize cookies | [Open folder](./cookie-manager-pro/) |
| **[DevLens](./devlens/README.md)** | Developer diagnostics | Floating console/error HUD, page fetch/XHR monitoring and searchable diagnostics panel; broad site access | [Preview](./devlens/preview.png) · [Source files](./devlens/) · [Manifest](./devlens/manifest.json) |
| **[UI Doctor](./UI-Doctor-v1.0-Chrome-Extension/README.md)** | Developer diagnostics | Visual inspection, spacing, responsive testing, layout diagnostics and temporary CSS playground | [Source files](./UI-Doctor-v1.0-Chrome-Extension/) · [Manifest](./UI-Doctor-v1.0-Chrome-Extension/manifest.json) |
| **[TabPocket](./tabpocket/README.md)** | Productivity | Save, search, organize and restore tab collections; local storage | [Source files](./tabpocket/) · [Manifest](./tabpocket/manifest.json) |

## Install a tool

1. Download the repository using **Code → Download ZIP** and extract it.
2. Open **chrome://extensions** in Chrome or a compatible browser.
3. Turn on **Developer mode**, click **Load unpacked**, and select the tool's folder with its **manifest.json**.
4. Open the extension's toolbar button if it provides one.

**[Step-by-step beginner guide →](../GETTING_STARTED.md)** · **[DevLens installation →](./devlens/README.md#-installation)**

## Submit your own tool

1. **[Read the rules](../CONTRIBUTING.md#add-a-new-tool)**.
2. Copy **[the extension starter template](../templates/chrome-extension-tool/README.md)** into a new folder at **Tools/your-tool-name/**.
3. Add your source files, **README.md**, working **manifest.json**, license information and screenshots (if useful). Optionally add [gallery.json](../docs/CATALOG.md) to customize the card and author credit.
4. Test with **Load unpacked**; open a pull request using **[the checklist](../.github/PULL_REQUEST_TEMPLATE.md)**.

Please do not place nested .git folders inside submissions or commit API tokens, passwords, session data or user cookies.

## Trust and licenses

Always review extension permissions. A listing here is not an independent safety certification. [Security policy](../SECURITY.md) · [License inventory](../LICENSES.md).

> **ChatGPT Lag Fixer packaging fixed:** Its files are now part of the gallery as ordinary tracked files, so ZIP downloads include the extension. Its original [standalone repository](https://github.com/RuslanSharifov/chatgpt-lag-fixer) remains available.

The website discovers new tool folders automatically when a reviewed Pull Request is merged. [How automatic publishing works](../docs/README.md).
