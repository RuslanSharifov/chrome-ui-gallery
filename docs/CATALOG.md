# Gallery metadata — optional

[← Automatic catalog](./README.md) · [Contribute](../CONTRIBUTING.md)

A valid extension is published from its **manifest.json** and required README/design documentation even without gallery.json. See the real [DevLens gallery.json](../Tools/devlens/gallery.json) and [tool documentation](../Tools/devlens/README.md) and [preview image](../Tools/devlens/preview.png) as an example. Add **gallery.json** next to the manifest only to customize its card.

~~~json
{
  "name": "Focus Tabs",
  "description": "A simple tab organizer for deep work.",
  "platform": "browser",
  "style": "Productivity Tool",
  "tags": ["Tabs", "Productivity", "Lightweight"],
  "icon": "FT",
  "palette": ["#152d36", "#1e5160", "#79d9c9"],
  "author": {
    "name": "Your GitHub username",
    "url": "https://github.com/your-username"
  },
  "preview": "screenshots/preview.png",
  "previews": ["screenshots/preview.png", "screenshots/details.png", "screenshots/demo.gif"]
}
~~~

## Field reference

| Field | Required? | Default |
| :--- | :--- | :--- |
| name | No | manifest.name |
| description | No | manifest.description |
| platform | No | Parent UI platform, or inferred site/browse category for Tools |
| style | No | Platform's style folder / Browser Tool |
| tags | No | Category and style |
| icon | No | Platform monogram |
| palette | No | Three deterministic hex gradient colors |
| author | No | No author claim unless explicitly provided |
| preview | No | Generated gradient illustration |
| previews | No | Additional gallery images/GIFs (maximum 20) |

Rules: maximum six tags, three 6-digit hex palette colors, GitHub profile URL for author.url, and local PNG/JPG/WebP/SVG/GIF preview files inside the extension folder only. All optional fields are verified by the generator. Never submit secrets or misleading author attribution.

The generated catalog automatically links to the project's README.md or design.md and GitHub source folder. The starter template under [templates](../templates/README.md) is excluded.

## Usage

Add the tool/design and documentation, optionally gallery.json, and open a pull request. You never need to modify docs/app.js, docs/index.html or platform filter buttons.

~~~bash
node scripts/build-catalog.mjs
node scripts/test-catalog.mjs
node scripts/validate.mjs
~~~

After merge, GitHub Actions regenerates the JSON and republishes the website.

## Gallery card media and detail view

Clicking a gallery card opens a responsive detail view. Desktop uses an animated centered dialog; mobile uses a bottom sheet. Cards can cycle through multiple images using a slow opacity crossfade, while the detail view provides previous/next buttons, thumbnails, and touch swipes. Media loading and reduced-motion preferences are respected.

To add several images or GIFs to a card, add `previews` to its local `gallery.json` (up to 20 paths). Keep `preview` as the preferred first image. Paths are relative to the design or extension folder; files must exist in that folder. The catalog generator validates media paths and publishes them into `docs/catalog.json`. GIF animation runs natively in the browser.

Example:

```json
{
  "preview": "screenshots/overview.png",
  "previews": ["screenshots/overview.png", "screenshots/details.png", "screenshots/animation.gif"]
}
```

Do not manually edit generated `docs/catalog.json`. Run `node scripts/build-catalog.mjs` and commit its generated output when changing metadata.
