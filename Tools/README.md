# Chrome UI Gallery — Tools

Utilities are grouped here separately from platform-specific visual designs.

## Cookie Manager Pro
- [Tool documentation](./cookie-manager-pro/README.md)
- [Manifest](./cookie-manager-pro/manifest.json)
- [Popup](./cookie-manager-pro/popup.html)

## ChatGPT Lag Fixer
The entry at `Tools/chatgpt-lag-fixer` is currently a **Git submodule/gitlink**, not ordinary source files in this repository. Its standalone source repository is [chatgpt-lag-fixer](https://github.com/RuslanSharifov/chatgpt-lag-fixer).

**Important:** A copied folder containing its own `.git` directory may be committed as a gitlink (`mode 160000`). Without a matching `.gitmodules` configuration, cloning this gallery won't populate that folder automatically. To include the complete source as regular files, remove the nested Git metadata locally and re-add the folder intentionally; or configure a proper submodule instead. Avoid deleting your standalone project.

## Installation
For tools committed as regular folders:
1. Visit `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the specific tool folder containing its `manifest.json`.

[← Repository](../README.md)
