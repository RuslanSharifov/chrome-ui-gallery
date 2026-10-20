# 🚀 Getting started — no coding required

[← Home](./README.md) · [All tools](./Tools/README.md) · [DevLens](./Tools/devlens/README.md) · [Azərbaycan dili](./GETTING_STARTED.az.md) · [All setup languages](./setup/README.md)

You can install the gallery's extensions without writing code.

## Step 1 — Find what you want

- **Appearance and themes?** Open the [UI gallery](./ui/README.md).
- **Useful utilities?** Open the [Tools directory](./Tools/README.md). For example, [DevLens](./Tools/devlens/README.md) is a developer diagnostics extension.

Choose a design/tool and open its documentation before installing.

## Step 2 — Download the files

1. On the [GitHub repository page](https://github.com/RuslanSharifov/chrome-ui-gallery), click the green **Code** button.
2. Click **Download ZIP**, then extract the ZIP somewhere easy to find, for example your Desktop.
3. Open the extracted **chrome-ui-gallery-main** folder.
4. Follow the links in the UI or Tools directory to find the extension you want. For DevLens, choose [Tools/devlens/](./Tools/devlens/) (the folder with its [manifest.json](./Tools/devlens/manifest.json)).

> Do not select the entire gallery as the extension folder. Choose only the individual project directory that contains **manifest.json**.

## Step 3 — Install in Chrome

1. Open a new Chrome tab and type **chrome://extensions** in the address bar.
2. Switch on **Developer mode** at the top right.
3. Click **Load unpacked**.
4. Select the specific extension folder containing **manifest.json**.
5. If installation succeeds, pin the extension using the puzzle-piece icon, then refresh the affected website.

## Step 4 — Update or remove

- To reload after changing local files: open **chrome://extensions** and press **Reload** under the extension.
- To remove: use **Remove** on the extension card.
- ZIP copies are not updated automatically: download the newer version and reload it as needed.

## Troubleshooting

| Problem | What to check |
| :--- | :--- |
| Manifest is missing | You selected the wrong folder; open the folder with **manifest.json** directly. |
| Nothing changes | Enable the extension and refresh its supported website. |
| Extension has errors | Read **Errors** on chrome://extensions; check its README for platform compatibility. |
| Icons are missing | Check that icon files referenced by **manifest.json** exist. |
| Permission warning | Read the project's manifest and README. Only install code you trust. |

**Developer?** Read [CONTRIBUTING.md](./CONTRIBUTING.md) to fork the project and submit your changes.
