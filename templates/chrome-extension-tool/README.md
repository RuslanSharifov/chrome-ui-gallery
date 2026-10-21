# Tool starter template

A minimal, no-dependency Chrome Manifest V3 popup extension.

## How to create your own tool

1. Copy the contents of this directory to **Tools/your-tool-name/**.
2. Change the manifest name, description and version.
3. Replace the sample UI, logic and README with your actual tool; describe the permissions you need.
4. Add icons only if you reference those paths in the manifest.
5. Test with **chrome://extensions → Developer mode → Load unpacked**.
6. Optionally copy [gallery.example.json](./gallery.example.json) to **gallery.json** (in your new tool folder), then update the example author and content.
7. To show a picture on the live gallery card, add a local PNG/JPG/WebP/SVG file (for example `preview.png`) and set `"preview": "preview.png"` in the new tool's `gallery.json`. See the [DevLens example](../../Tools/devlens/preview.png).
8. Open a pull request. **The website discovers your tool automatically** after review and merge. No website JavaScript or HTML changes are required.

## Sample files

- [manifest.json](./manifest.json)
- [popup.html](./popup.html)
- [popup.js](./popup.js)
- [styles.css](./styles.css)

**License:** [MIT](../../LICENSE) for new contributions submitted under the repository's standard terms.

This directory is a **template**, not a published tool listing.

[Automatic gallery guide](../../docs/README.md) · [Optional metadata specification](../../docs/CATALOG.md) · [DevLens as a submitted tool example](../../Tools/devlens/README.md) · [All tools](../../Tools/README.md).
