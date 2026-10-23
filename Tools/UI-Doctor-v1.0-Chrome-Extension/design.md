# UI Doctor — Design

![UI Doctor — Visual Debugger & Responsive Tester feature showcase](./UI%20Doctor%20Chrome%20Extension%20Showcase.png)

*Conceptual feature poster illustrating inspection, responsive testing, contrast, spacing and typography workflows.*

## Product
UI Doctor is a developer tool. The interface favours density, precision and calm: compact technical panels, clear severity colours and no decorative motion.

## Design system

### Colour tokens (dark, default)
| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0B1020` | Background |
| `--surface` | `#151C30` | Cards |
| `--surface-2` | `#1B2540` | Nested blocks, chips |
| `--border` | `#26304D` | Subtle borders |
| `--accent` | `#8B5CF6` | Primary actions, active tab |
| `--inspect` | `#22D3EE` | Inspector accent, links, focus ring |
| `--ok` / `--warn` / `--err` | `#22C55E` / `#F59E0B` / `#EF4444` | Pass, warning and error states |
| `--text` / `--muted` | `#F8FAFC` / `#94A3B8` | Primary and secondary text |

The light theme (`:root[data-theme="light"]`) redefines the same tokens with AA-oriented contrast. The theme follows the operating system unless set in Settings.

### Overlay colours (on the inspected page)
Margin `#F59E0B`, padding `#22C55E`, content `#22D3EE`, border/hover `#8B5CF6`, pinned/measure `#E879F9`. Margin, padding and content are configurable in Settings.

### Typography and spacing
System UI font stack, 13px base, 12px labels, 11px monospace for selectors and values. Cards use 12px radius and 12px padding. The side panel is designed for widths from roughly 300px.

### Components
- **Tabs**: horizontal scrolling pill tabs, so all sections stay reachable in a narrow panel.
- **Cards**: uppercase section label, subtle border, compact key/value tables.
- **Findings**: left severity border, severity badge, certainty tag, monospace selector, explanation, suggested CSS in a code block with *Copy CSS*.
- **Buttons**: primary (accent fill), default (surface), ghost, danger.
- **Focus**: 2px cyan outline with offset on every interactive element.

### Motion
Transitions are short and optional. `prefers-reduced-motion` and the Settings toggle remove them.

## Layout
- **Popup (300px wide)**: header, current host, four actions, status line, footer links.
- **Side panel**: top bar (brand and live status), horizontal tab strip, scrollable content, shortcut hint footer, toast.

## Architecture

```
  Side panel ──┐                        ┌── content/ui-doctor.js (per page)
  Popup ───────┼── runtime messages ──► service worker ── tabs.sendMessage ──┤   overlays, inspector,
               │                        │   injection, commands,              │   spacing, diagnostics,
               │                        │   Responsive Lab window             │   contrast, playground
               └── UD_EVENT (push) ◄────┴──────────────────────────────────────┘
```

- The service worker injects the engine on demand with `chrome.scripting.executeScript`, which requires `activeTab` or granted site access, and relays messages to the page.
- The page engine answers requests (`UD_*` message types) and pushes selection snapshots (`UD_EVENT`) to the side panel.
- The side panel renders from state and never inserts page text as HTML without escaping.
- Settings, favourites and recent results live in `chrome.storage`. Test-window identity lives in `chrome.storage.session`.

## File responsibilities

| File | Responsibility |
| --- | --- |
| `manifest.json` | Permissions, optional host access, side panel, popup, commands, icons |
| `background/service-worker.js` | Injection and verification, Responsive Lab (create, size, measure, sweep, close), commands, cleanup when a window closes |
| `content/ui-doctor.js` | Hover and click inspection, overlay rendering in a fixed `pointer-events:none` root, box model and spacing geometry, computed-style snapshots, WCAG contrast with alpha compositing, diagnostics engine with cause and fix mapping, reversible playground changes |
| `sidepanel/panel.js` | All screens, actions, settings persistence, theme, report building, JSON and HTML export, safe escaping |
| `sidepanel/panel.css` | Theme tokens (dark and light), components, reduced-motion rules |
| `popup/popup.js` | Quick actions; opens the side panel synchronously within the click gesture |
| `shared/utils.js` | Settings defaults and merge, HTML escaping, recent-results helper |
| `shared/presets.js` | The nine breakpoint presets from the specification |
| `icons/make_icons.py` | Standard-library PNG encoder that generates the four icons |

### Deliberate structure notes
The specification suggested separate `modules/`, `inspector.js`, `overlays.js`, `diagnostics.js` and `shared/messaging.js` files. For V1 the page logic is consolidated into `content/ui-doctor.js` and the panel logic into `sidepanel/panel.js`. Content scripts injected with `executeScript` share one scope, which keeps the injection simple and avoids module loading in content scripts. Each section is still clearly separated in code.

## Performance
- Inspection listeners exist only while inspection is on. Hover updates are throttled with `requestAnimationFrame`.
- Diagnostics scan at most 8,000 elements and report at most 300 findings, then stop.
- Overlays are rebuilt only on hover, selection, scroll and resize.
- No `MutationObserver` or continuous polling.

## Security
- Manifest V3 with no remote code, no `eval`, no third-party scripts.
- Page-derived values are escaped before any HTML is generated. The HTML report sets a Content-Security-Policy that blocks scripts.
- Playground values are checked against an allow-list of properties and a character whitelist, and are set through the CSSOM rather than HTML.
- Restricted pages are detected and reported as unsupported.

## Localization

The interface supports English (`en`, default), German (`de`), Turkish (`tr`) and French (`fr`). `shared/i18n.js` provides a local translation dictionary; `shared/utils.js` persists `settings.language`. The side panel re-renders when language changes and the popup reads the same preference. Dynamic CSS values and untrusted page data are intentionally not translated. Not every long diagnostic explanation has a translation yet; missing entries fall back to English. No translation network service is used.
