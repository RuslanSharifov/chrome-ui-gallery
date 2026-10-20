# Chrome UI Gallery — Visual Showcase

[← Main README](../README.md) · [Open the showcase locally](./index.html) · [Browse UI designs](../ui/README.md) · [Browse tools](../Tools/README.md)

A fast, responsive, accessible **static catalog** for the gallery. It includes category and platform filters, search, project cards, keyboard search shortcut (/) and GitHub source/documentation links.

## Preview locally

Open [index.html](./index.html) in a modern browser. No build step, npm installation, backend or external dependency is required.

## Publish with GitHub Pages (maintainer action)

1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select **main** and **/docs**, then save.
4. GitHub will show the final public Pages URL when the initial deployment completes.

> Repository settings cannot be activated just by committing these files. Do not announce a live URL until GitHub Pages is enabled and the site is visited.

## Files

- [index.html](./index.html) — semantic page structure and accessible controls
- [styles.css](./styles.css) — responsive premium dark theme with reduced-motion support
- [app.js](./app.js) — deterministic project index and search/filter interactions
- [favicon.svg](./favicon.svg) — project mark

## Adding a new catalog item

When approving a new extension, update the **projects** array near the top of **app.js**, choosing a category **ui** or **tool**, correct platform, relative repository documentation and folder paths. Update the category totals in index.html if counts change.

All project links intentionally target GitHub directly so they work from local files and from Pages when deployed from /docs.
