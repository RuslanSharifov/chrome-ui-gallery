# Social Post Analytics Dashboard

[← Repository](../../README.md) · [Website](../index.html) · [Open dashboard](./index.html) · [HTML](./index.html) · [CSS](./style.css) · [JavaScript](./script.js)

## Design
- **Name:** Social Post Analytics
- **Platform:** Chrome UI Gallery promotion / cross-platform campaign tracking
- **Style:** Dark glass-inspired analytics dashboard
- **Technology:** Vanilla HTML, CSS, JavaScript and SVG; no dependencies
- **Purpose:** Filter promotional posts by channel, compare engagement metrics with bar/line charts, and manage verified post-level statistics.

## Tracked platforms
Peerlist, LinkedIn, X, Hashnode, Product Hunt (launch URL unconfirmed), DEV Community (publication unconfirmed). URLs are curated from known project promotion posts; unconfirmed publications are clearly labeled.

## Data accuracy
This page **does not automatically collect** platform metrics. Most social networks restrict analytics behind authenticated APIs or owner-only dashboards. Metrics are initially blank rather than invented. Use **Update metrics** to enter verified counts; blank means unavailable and 0 means confirmed zero. Aggregates show how many selected platforms reported a metric.

All edits persist in browser localStorage only. **Export JSON** to back up your values, and **Import JSON** to restore them on another device. The exported JSON contains only entered metric counts and no credentials. There is no server-side storage or cross-device synchronization.

## Files
- [index.html](./index.html) — layout, selectors, table, edit dialog
- [style.css](./style.css) — responsive dark interface
- [script.js](./script.js) — filters, SVG charts, local data, import/export

## Usage
Open the [deployed dashboard](https://ruslansharifov.github.io/chrome-ui-gallery/social-analytics/) after merging and publishing, or open index.html locally. Select one or more platform chips; choose metric and chart type; use Update metrics to record platform figures. You can export/import the metrics snapshot.

## Future integrations
Automated updates require a supported provider API, owner authorization, and a secure backend or scheduled workflow. Never embed platform tokens in this public JavaScript page. This version intentionally does not claim live cross-platform analytics.
