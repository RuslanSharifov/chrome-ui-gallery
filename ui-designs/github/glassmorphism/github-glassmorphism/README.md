# GitHub Glassmorphism Pro Ultra v4.0

Advanced glassmorphism effects with 3D depth, mouse proximity detection, and customizable physics for GitHub.

## ✨ Key Features

### Glass Effects (NEW)
- **Blur Control**: Adjust glass blur from 6px to 46px
- **Opacity Slider**: Fine-tune transparency (25-82%)
- **Corner Radius**: Customize rounded corners (6-30px)
- **Edge Shine**: Adjust edge highlights (0-120%)
- **Background Dim**: Darken/lighten the background (0-45%)
- **Glass Borders**: Toggle luminous outlines

### 3D Depth & Proximity Effects (ENHANCED)
- **Proximity-based 3D**: Elements react when mouse gets near (not just on hover)
- **Proximity Distance**: Control how far the effect reaches (80-400px)
- **Proximity Sensitivity**: Adjust effect intensity (50-300%)
- **Depth Strength**: Control 3D rotation amount (0-28%)
- **Perspective Distance**: Set 3D perspective (500-1600px)
- **Card Tilt**: Cards tilt toward your cursor
- **Card Lift**: Elements lift up on proximity (0-14px)

### Advanced Mouse Effects
- **Mouse Spotlight**: Follows your cursor with dynamic lighting
- **Light Size**: Adjust spotlight area (160-800px)
- **Light Strength**: Control brightness (0-100%)

### Motion & Animations
- **Smooth Transitions**: Buttons and cards animate smoothly
- **Motion Speed**: Control animation timing (0-100%)
- **Load Animations**: Content reveals on page load
- **Matrix Background**: Optional animated falling code effect

### Visual Enhancements
- **Neon Glow**: Interactive glow effects with intensity control
- **Color Intensity**: Boost saturation (90-210%)
- **Text Contrast**: Enhance text readability (70-120%)
- **Ambient Glow**: Soft layered background lighting

## 🎨 Quick Themes

- **Aurora**: Balanced glass with blue/purple ambient lighting
- **Matrix**: Green hacker-style effects with animated background
- **Ice**: Cool blues and whites with sharp glass
- **Neon**: Vibrant cyan and magenta with intense glow
- **Midnight**: Deep blue theme with subtle effects
- **Minimal**: Lightweight effects with minimal visual overhead

## 🚀 Installation

1. Download the extension folder
2. Open `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the folder
5. Visit github.com to see effects

## ⚙️ Settings Tabs

### Theme Tab
- Visual theme selection
- Color intensity and text contrast
- Ambient light toggle

### Glass Tab (NEW)
- Blur amount
- Opacity/transparency
- Corner radius
- Edge shine effects
- Border visibility
- Background dim level

### 3D/Proximity Tab (ENHANCED)
- 3D effect toggle
- Proximity-based reaction settings
- Card tilt and lift effects
- Mouse light configuration
- Glow effects and intensity

### Motion Tab
- Animation speed
- Load animations
- Matrix background effects
- Motion smoothness

## 🎯 Proximity System Explained

The proximity system allows elements to react to your cursor even before you hover directly on them:

- **Proximity Distance**: How far away (in px) elements can detect your cursor
- **Proximity Sensitivity**: How strong the effect is (100% = normal, 150% = stronger)

For example:
- Set Distance to 200px to get effects from far away
- Set Sensitivity to 200% for dramatic reactions
- Decrease both for subtle, minimal effects

## 🌈 Tips for Best Results

1. **For Professional Look**: Use Minimal or Ice theme with proximity sensitivity at 100%
2. **For Gaming Vibes**: Use Neon theme with high glow intensity and motion speed
3. **For Matrix Fan**: Select Matrix theme and enable animated background
4. **For Performance**: Reduce blur amount and disable matrix background if experiencing lag
5. **For Precision Work**: Lower proximity distance so effects only show on direct hover

## 🔧 Performance Tips

- Reduce blur amount if experiencing lag
- Disable matrix background if CPU usage is high
- Lower motion speed for smoother animations
- Disable 3D depth effects if needed
- Decrease proximity distance for better performance

## 🐛 Known Issues & Solutions

**Issue**: Effects not showing on GitHub sidebar
- **Solution**: Extension was fixed to properly handle GitHub's left navigation

**Issue**: Text is hard to read
- **Solution**: Increase contrast slider in Theme tab or reduce opacity

**Issue**: Effects lag on older computers
- **Solution**: Reduce blur amount, disable matrix, lower motion speed, disable 3D effects

**Issue**: Effects disappear after page navigation
- **Solution**: Effects are reapplied automatically, but extension may need to be toggled if manually disabled

## 🎮 Keyboard Shortcuts

Currently, use the extension popup to control settings. Quick access:
1. Click extension icon in toolbar
2. Toggle on/off with the main switch
3. Change theme from Quick themes
4. Adjust settings in tabs

## 💡 Advanced Customization

You can customize presets by:
1. Adjusting all settings to your preference
2. Settings are saved automatically when you click "Save"
3. The current preset name will show as "Custom"

## 🌍 Browser Support

- Chrome 111+
- Edge 111+
- Any Chromium-based browser supporting Manifest V3

## 📊 What's New in v4.0

✅ Proximity-based 3D effects (react before hover)
✅ New Glass Effects tab with detailed controls
✅ Enhanced sidebar handling for GitHub's left navigation
✅ Glow intensity slider
✅ Proximity distance and sensitivity controls
✅ Improved performance optimization
✅ Better theme color preservation
✅ Enhanced motion animations
✅ More granular settings for power users

## 🙏 Notes

- This is a visual-only extension - it doesn't access GitHub's API
- All changes are applied live on github.com
- Settings are saved in Chrome's local storage
- No data is sent anywhere - everything is local only

## 📝 Version History

**v4.0.0** - Proximity effects, glass tab, enhanced 3D
**v3.0.0** - Original release with core effects

Enjoy enhanced GitHub! 🎨

## 🔒 v4.1.0 Hardening

This build keeps the original visual system intact and adds a compatibility/runtime layer without removing the existing style rules.

- Added the missing icon assets referenced by the Manifest.
- Proximity sensitivity now scales the actual depth response.
- Card lift now contributes to positive 3D Z translation.
- Added reduced-motion runtime handling in addition to the existing CSS fallback.
- Added DOM card-cache invalidation to reduce repeated selector work during GitHub's dynamic navigation.
- Added defensive settings normalization/clamping before persistence and messaging.
- Added graceful storage-error handling in the popup.
- Added `QA.md` with verification steps and maintenance notes.

### Research note
The implementation follows current Chrome Manifest V3 guidance for content scripts, host permissions, messaging, and `chrome.storage.local`. No remote code, analytics, tracking, or external data service was introduced.
