# 🧰 Chrome Extension Tools

[← Home](../README.md) · [UI Gallery →](../ui/README.md) · [Contribute a tool →](../CONTRIBUTING.md#add-a-new-tool)

Tools are **standalone extensions**, separate from visual UI redesigns. Each tool includes its own installation instructions, source files and license information.

## Discover tools

| Tool | Category | Description | Source |
| :--- | :--- | :--- | :--- |
| **[ChatGPT Lag Fixer](./chatgpt-lag-fixer/README.md)** | Performance | Reduce lag in long ChatGPT chats | [Open folder](./chatgpt-lag-fixer/) |
| **[Cookie Manager Pro](./cookie-manager-pro/README.md)** | Browser utility | View, edit, clear and organize cookies | [Open folder](./cookie-manager-pro/) |

## Install a tool

1. Download the repository using **Code → Download ZIP** and extract it.
2. Open **chrome://extensions** in Chrome or a compatible browser.
3. Turn on **Developer mode**, click **Load unpacked**, and select the tool's folder with its **manifest.json**.
4. Open the extension's toolbar button if it provides one.

**[Step-by-step beginner guide →](../GETTING_STARTED.md)**

## Submit your own tool

1. **[Read the rules](../CONTRIBUTING.md#add-a-new-tool)**.
2. Copy **[the extension starter template](../templates/chrome-extension-tool/README.md)** into a new folder at **Tools/your-tool-name/**.
3. Add your source files, **README.md**, working **manifest.json**, license information and screenshots (if useful).
4. Test with **Load unpacked**; open a pull request using **[the checklist](../.github/PULL_REQUEST_TEMPLATE.md)**.

Please do not place nested .git folders inside submissions or commit API tokens, passwords, session data or user cookies.

## Trust and licenses

Always review extension permissions. A listing here is not an independent safety certification. [Security policy](../SECURITY.md) · [License inventory](../LICENSES.md).

> **ChatGPT Lag Fixer packaging fixed:** Its files are now part of the gallery as ordinary tracked files, so ZIP downloads include the extension. Its original [standalone repository](https://github.com/RuslanSharifov/chatgpt-lag-fixer) remains available.
