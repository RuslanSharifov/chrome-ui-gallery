# Technical Design Documentation

## Architecture Overview

### Files Structure
```
manifest.json          - Chrome extension manifest
index.html            - Settings popup UI
script.js             - Popup controller & settings manager
content.js            - GitHub page injector & effect applier
glass.css             - Visual effects stylesheet
style.css             - Popup UI styles
README.md             - User documentation
```

## Core Systems

### 1. Settings Management

**DEFAULTS object** contains all default values:
- 15 glass effect parameters
- 8 3D/depth parameters
- 6 motion/animation parameters
- 5 visual enhancement parameters

**Presets system** stores 6 curated theme combinations that can be instantly applied.

### 2. Glass Physics System

#### CSS Variables (--gug-* namespace)
- `--gug-blur`: Backdrop filter blur amount
- `--gug-alpha`: Overall opacity/transparency
- `--gug-shine`: Edge highlight intensity
- `--gug-radius`: Border radius
- `--gug-sat`: Color saturation boost
- `--gug-contrast`: Text contrast filter

#### Glass Effect Application
```css
backdrop-filter: blur(var(--gug-blur)) saturate(var(--gug-sat));
-webkit-backdrop-filter: blur(var(--gug-blur)) saturate(var(--gug-sat));
```

### 3. 3D Depth & Proximity System (ENHANCED)

#### Proximity Detection Algorithm
```javascript
function calculateProximity(element, mouseX, mouseY){
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width/2;
  const centerY = rect.top + rect.height/2;
  const dist = Math.hypot(mouseX - centerX, mouseY - centerY);
  return Math.max(0, 1 - (dist / settings.proximityDistance));
}
```

**How it works**:
1. Calculate distance from cursor to element center
2. Convert distance to proximity factor (0-1)
3. Apply effect strength based on proximity factor
4. Effects activate within `proximityDistance` radius

#### 3D Transform Application
```css
transform: perspective(var(--gug-perspective)) 
           rotateX(var(--gug-rx)) 
           rotateY(var(--gug-ry)) 
           translateZ(var(--gug-tz));
transform-style: preserve-3d;
```

**Variables**:
- `--gug-rx`: Rotation X (pitch) in degrees
- `--gug-ry`: Rotation Y (yaw) in degrees  
- `--gug-tz`: Translation Z (depth) in pixels

### 4. Mouse Light System

#### Spotlight Effect
```css
radial-gradient(circle at var(--gug-mx) var(--gug-my),
                rgb(255 255 255 / calc(.28 * var(--gug-lightStrength))),
                transparent var(--gug-lightSize))
```

**CSS Variables**:
- `--gug-mx`: Mouse X position in pixels
- `--gug-my`: Mouse Y position in pixels
- `--gug-lightSize`: Gradient radius
- `--gug-lightStrength`: Opacity multiplier

### 5. Matrix Background System

#### Canvas-based Animation
- Renders to canvas element with 2D context
- Uses monospace font for character rendering
- Characters fall down screen at configurable speed
- Density controls column count
- Mix-blend-mode: screen for lighting effect

### 6. Event System

#### Pointer Movement Handling
```javascript
addEventListener('pointermove', pointerMove, {passive:true});
```

Uses `requestAnimationFrame` to batch DOM updates and maintain 60fps:
1. Collect mouse coordinates
2. Query all card elements
3. Calculate proximity to each
4. Update CSS variables

#### Mutation Observation
Watches DOM for new elements and applies load animations when content appears.

## UI Architecture

### Settings Popup Structure

**Tabs**:
1. Theme - Color and ambient effects
2. Glass - Blur, opacity, radius, shine
3. 3D/Proximity - Depth effects and proximity detection
4. Motion - Animations and matrix effects

### Control Types

**Slider Control**
```javascript
slider(parent, key, label, unit, min, max, step=1)
```
- Creates range input with output display
- Updates settings on input
- Broadcasts changes to content script

**Toggle Control**
```javascript
toggle(parent, key, label, desc='')
```
- Boolean switch element
- Shows description text
- Updates settings immediately

**Select Control**
```javascript
select(parent, key, label, options)
```
- Dropdown selection
- Takes array of [value, label] pairs
- Updates settings on change

## Communication Flow

### Settings → Content Script Pipeline
```
User adjusts setting
→ render() updates UI
→ broadcast() sends message
→ chrome.tabs.sendMessage() delivers update
→ content.js receives and calls apply()
→ CSS variables updated
→ Visual effects change instantly
```

### Storage Persistence
```javascript
chrome.storage.local.set({githubGlass: settings})
```
- Automatically syncs with Chrome's local storage
- Loads on extension start
- Persists across browser sessions

## Performance Optimizations

### 1. RAF Batching
Combines multiple pointer moves into single animation frame update to avoid thrashing.

### 2. CSS Variable Updates
Uses root-level CSS variables instead of individual element updates for efficiency.

### 3. Transform Will-Change
```css
will-change: transform;
```
Hints browser to optimize transform animations.

### 4. Passive Event Listeners
```javascript
{passive: true}
```
Prevents blocking scroll with pointer events.

### 5. Conditional Rendering
Matrix canvas only created if enabled, matrix theme selected, or not minimal theme.

### 6. Element Filtering
Skips elements smaller than 30x30px to avoid processing micro-elements.

## Theme System

### Theme-Specific Styles
Each theme has customized ambient lighting:

**Aurora**: Blue/purple gradients with cyan accents
```css
radial-gradient(circle at 12% 5%, rgb(88 166 255/.22), transparent 28%)
```

**Ice**: Cool blue and cyan
```css
radial-gradient(circle at 18% 12%, rgb(180 235 255/.25), transparent 30%)
```

**Neon**: Cyan and magenta with high saturation
```css
radial-gradient(circle at 18% 18%, rgb(0 255 210/.17), transparent 30%)
```

**Midnight**: Deep blue with minimal light
```css
radial-gradient(circle at 50% 0%, rgb(70 110 255/.14), transparent 34%)
```

**Minimal**: No ambient lighting
```css
background: #080b10;
```

**Matrix**: Green-tinted ambient for hacker aesthetic
```css
radial-gradient(circle at 12% 5%, rgba(74,255,142,.15), transparent 28%)
```

## Accessibility Features

### 1. Reduced Motion Support
```css
@media(prefers-reduced-motion: reduce) {
  /* Animations disabled */
}
```

### 2. Focus Indicators
```css
button:focus-visible {
  outline: 2px solid rgba(88, 166, 255, .65);
  outline-offset: 2px;
}
```

### 3. ARIA Labels
- `role="switch"` for toggle buttons
- `aria-checked` for state indication
- `aria-selected` for tab selection
- `aria-hidden` for decorative elements

### 4. Semantic HTML
Uses proper heading hierarchy and labels.

## Browser Compatibility

### Required Features
- CSS Grid
- CSS Variables (Custom Properties)
- `backdrop-filter` (with `-webkit-` prefix)
- `requestAnimationFrame`
- `getBoundingClientRect()`
- Chrome Storage API (Manifest V3)

### Fallbacks
- Solid background fallback for `backdrop-filter`
- No effect reduction for older browsers (graceful degradation)

## Manifest V3 Compliance

### Permissions Used
- `storage`: Save/load settings
- `activeTab`: Access current tab
- `scripting`: Allowed by default (not needed for CSS injection)

### Content Script Settings
- Runs at `document_start` for early injection
- Uses `css` field for stylesheet injection
- Uses `js` field for script execution
- Matches only `https://github.com/*`

## Future Enhancement Ideas

1. **Custom Presets**: Allow users to save and name custom configurations
2. **Keyboard Shortcuts**: Toggle effects or switch themes with hotkeys
3. **Per-Page Settings**: Different settings for different GitHub pages
4. **Export/Import**: Share preset configurations
5. **Animation Recording**: Record and replay proximity effects
6. **Theme Editor**: Visual theme color picker
7. **Performance Metrics**: Show FPS and performance stats
8. **Profiles**: Multiple saved configurations

## Debugging Tips

### Check CSS Variables
```javascript
getComputedStyle(document.documentElement).getPropertyValue('--gug-blur')
```

### Monitor Proximity Calculations
Add console.log in `pointerMove` function to see distance calculations.

### Test Theme Switching
Use preset buttons to quickly test different combinations.

### Performance Profiling
Use Chrome DevTools Performance tab to monitor frame rate and paint times.

## Known Limitations

1. **Canvas Matrix**: Heavy on older GPUs at high density
2. **3D Transforms**: May have performance impact on many elements
3. **Blur**: High blur values can impact performance on large monitors
4. **Sidebar**: Some GitHub sidebar features may need additional targeting

---

**Last Updated**: October 2026
**Version**: 4.0.0
**Status**: Production Ready

## v4.1.0 Additive Hardening Layer

The v4.1.0 layer is intentionally additive: the original visual rules remain in place and the new runtime/CSS rules are appended after them.

### Runtime improvements
- Proximity sensitivity is applied as a bounded multiplier to the calculated proximity factor.
- Card lift contributes positive Z translation instead of being exposed only as a UI setting.
- A cached card list is invalidated by DOM mutations, reducing repeated selector queries during GitHub's SPA-style navigation.
- Off-screen/small elements are skipped by the additive pointer pass.
- Reduced-motion preference disables additive transforms and matrix animation.
- Popup values are normalized and clamped to their documented slider ranges before persistence and messaging.

### Packaging improvements
- Added the 16/32/48/128px icon assets already referenced by the manifest.
- Added `QA.md` with manual smoke-test steps and maintenance notes.

## v4.1.0 Compatibility Principle

No external library, remote script, analytics service, or new host domain was introduced. The extension continues to use Manifest V3 content scripts and `chrome.storage.local` for local settings.
