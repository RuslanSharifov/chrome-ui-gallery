# Installation Guide

This guide explains how to load ChatGPT Lag Fixer into Chrome manually, without the Chrome Web Store.

## Requirements

- Google Chrome (or any Chromium browser such as Edge, Brave or Opera)
- The project folder (either cloned from GitHub or extracted from the ZIP file)

## Step 1: Get the files

**Option A: Clone with Git**

```bash
git clone https://github.com/<your-username>/chatgpt-lag-fixer.git
```

**Option B: Download the ZIP**

1. Download the repository as a ZIP file.
2. Extract it to a permanent location, for example `Documents/chatgpt-lag-fixer`.

> Keep this folder where it is. Chrome loads the extension from this folder, so deleting or moving it later will disable the extension.

## Step 2: Open the Extensions page

1. Open Chrome.
2. Type `chrome://extensions` in the address bar and press **Enter**.

Alternatively, click the puzzle-piece icon in the toolbar, then **Manage extensions**.

## Step 3: Enable Developer mode

1. Find the **Developer mode** toggle in the top-right corner of the Extensions page.
2. Switch it **on**.

A new toolbar with **Load unpacked**, **Pack extension** and **Update** buttons will appear.

## Step 4: Load the extension

1. Click **Load unpacked**.
2. In the file dialog, select the folder that **directly contains** `manifest.json`.
3. Click **Select Folder** (or **Open** on macOS).

The extension "ChatGPT Lag Fixer" should now appear in the list.

> Select the folder that contains `manifest.json`, not a parent folder and not the `.zip` file itself.

## Step 5: Pin the extension (optional)

1. Click the puzzle-piece icon in the Chrome toolbar.
2. Find **ChatGPT Lag Fixer** and click the pin icon next to it.

The icon will stay visible on the toolbar for quick access to settings.

## Step 6: Verify it works

1. Open [chatgpt.com](https://chatgpt.com) (or `chat.openai.com`).
2. Open a long conversation.
3. Click the extension icon and confirm the settings panel opens.

## Updating the extension

When you download or pull a new version:

1. Replace the old files with the new ones, keeping the same folder.
2. Go to `chrome://extensions`.
3. Click the **reload** icon (↻) on the ChatGPT Lag Fixer card.
4. Refresh any open ChatGPT tabs.

## Uninstalling

1. Go to `chrome://extensions`.
2. Click **Remove** on the ChatGPT Lag Fixer card.

## Troubleshooting

| Problem | Solution |
| --- | --- |
| "Manifest file is missing or unreadable" | You selected the wrong folder. Select the folder that directly contains `manifest.json`. |
| "Load unpacked" button is missing | Turn on **Developer mode** first. |
| Icon does not appear | Reload the extension, or restart Chrome. Chrome sometimes caches icons. |
| Changes in the code are not applied | Click **reload** on the extension card, then refresh the ChatGPT tab. |
| Extension stops working after moving the folder | Chrome lost the path. Remove the extension and load it again from the new location. |
| Settings do not affect the page | Refresh the ChatGPT tab after changing a setting, and confirm the **Enabled** option is checked. |

## Other Chromium browsers

The steps are the same in other Chromium browsers. Replace the address with:

- Edge: `edge://extensions`
- Brave: `brave://extensions`
- Opera: `opera://extensions`
