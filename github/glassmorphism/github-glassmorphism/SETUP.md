# Setup & Installation Guide

## Quick Start (5 minutes)

### Step 1: Prepare Files
Ensure you have all these files in a folder:
- `manifest.json`
- `index.html`
- `script.js`
- `content.js`
- `glass.css`
- `style.css`
- `icons/` folder (with icon16.png, icon32.png, icon48.png, icon128.png)

### Step 2: Open Extensions Page
1. Open Chrome/Edge
2. Go to `chrome://extensions/` (type in address bar)
3. Look for the toggle in top-right labeled "Developer mode"
4. Click it to enable developer mode

### Step 3: Load Extension
1. Click blue "Load unpacked" button
2. Navigate to the folder containing the files
3. Click "Select Folder"
4. Extension should appear in your extensions list

### Step 4: Test It
1. Go to `github.com` in a new tab
2. Click the extension icon in your toolbar
3. You should see the settings popup
4. Make sure "Active on GitHub" shows in green

---

## Detailed Setup

### For Windows Users

1. **Create Folder**
   - Right-click desktop → New Folder
   - Name it "github-glassmorphism"
   - Place all files inside

2. **Extract Files**
   - Put all .js, .css, .html files in this folder
   - Create "icons" subfolder inside
   - Put .png icon files in "icons" subfolder

3. **Enable Developer Mode**
   - Open Chrome
   - Click three dots menu → More tools → Extensions
   - Toggle "Developer mode" in top right

4. **Load Extension**
   - Click "Load unpacked"
   - Navigate to "github-glassmorphism" folder
   - Click "Select Folder"

### For Mac Users

1. **Create Folder**
   - Open Finder
   - Create new folder in Documents: "github-glassmorphism"
   - Drag all files into this folder

2. **Open Chrome Extensions**
   - Chrome → Preferences
   - Extensions (left sidebar)
   - Toggle "Developer mode" (top right)

3. **Load Extension**
   - Click "Load unpacked"
   - Select the "github-glassmorphism" folder
   - Allow any permission requests

### For Linux Users

1. **Create Folder**
   ```bash
   mkdir -p ~/github-glassmorphism
   cd ~/github-glassmorphism
   ```

2. **Place Files**
   ```bash
   # Copy all .js, .css, .html files here
   mkdir icons
   # Copy icon files to icons/
   ```

3. **Load Extension**
   - Chrome: `chrome://extensions/`
   - Toggle Developer mode
   - Click "Load unpacked"
   - Select the folder

---

## Troubleshooting

### "Extension won't load"
**Problem**: Error when trying to load unpacked extension

**Solutions**:
1. Check all files are in the same folder
2. Verify `manifest.json` is valid JSON (no syntax errors)
3. Make sure icon files exist in `icons/` folder
4. Try refreshing `chrome://extensions/` page

### "No effects appearing on GitHub"
**Problem**: Settings popup works but no visual changes on GitHub

**Solutions**:
1. Make sure you're on `https://github.com/` (must use HTTPS)
2. Refresh the GitHub page (Ctrl+R or Cmd+R)
3. Check extension toggle is ON in popup
4. Check browser console for errors (F12)

### "Effects are laggy"
**Problem**: Computer getting slow when effects enabled

**Solutions**:
1. Reduce blur amount (slider in Glass tab)
2. Disable matrix background (Motion tab)
3. Lower motion speed (Motion tab)
4. Disable 3D depth effects (3D/Proximity tab)
5. Close other Chrome tabs

### "Text is hard to read"
**Problem**: Text color too faint or invisible

**Solutions**:
1. Increase "Text contrast" slider (Theme tab)
2. Lower "Glass opacity" (Glass tab)
3. Lower "Background dim" (Glass tab)
4. Try a different theme (Aurora, Ice, or Minimal)

### "Icons aren't showing"
**Problem**: Extension icon shows generic image

**Solutions**:
1. Verify icons are in `icons/` subfolder
2. Check file names match manifest exactly:
   - `icon16.png`
   - `icon32.png`
   - `icon48.png`
   - `icon128.png`
3. Unload and reload extension

### "Settings don't save"
**Problem**: Changes reset when browser restarts

**Solutions**:
1. Click "Save" button in extension popup
2. Check "Saved ✓" appears
3. Check browser allows local storage
4. Try resetting to defaults and saving

---

## Configuration Tips

### For Best GitHub Experience

**Professional Look:**
1. Open Settings popup
2. Go to Theme tab
3. Select "Minimal" or "Ice" theme
4. Lower blur to 14px
5. Set opacity to 50%
6. Disable matrix background

**Gaming/Cool Effects:**
1. Select "Neon" or "Aurora" theme
2. Increase blur to 30px
3. Increase opacity to 65%
4. Enable matrix background
5. Increase motion speed to 70%

**Performance/Minimal:**
1. Select "Minimal" theme
2. Set blur to 8px
3. Set opacity to 25%
4. Disable all effects
5. Disable matrix background

### Proximity Effect Tuning

**For laptop/trackpad use:**
- Set Proximity Distance to 250px
- Set Sensitivity to 150%
- Lower Card Lift to 2px

**For mouse use:**
- Set Proximity Distance to 300px
- Set Sensitivity to 180%
- Set Card Lift to 5px

**For precise work:**
- Set Proximity Distance to 80px
- Set Sensitivity to 100%
- Disable Card Tilt

---

## Using the Extension

### Main Toggle
- **Green light** = Effects active on GitHub
- **Gray light** = Effects disabled
- Click to toggle effects on/off

### Quick Themes
Click any preset button (Aurora, Matrix, Ice, etc.) to instantly apply that theme's settings.

### Setting Tabs

**Theme**
- Choose visual style
- Adjust colors and ambient lighting
- Control text contrast

**Glass**
- Fine-tune blur and transparency
- Adjust corner radius
- Control edge shine and brightness

**3D/Proximity**
- Enable/disable 3D depth effects
- Set proximity detection range
- Control mouse light effects
- Adjust glow intensity

**Motion**
- Control animation speed
- Toggle smooth transitions
- Enable/disable background matrix effect

### Saving Settings
1. Make changes in popup
2. Click blue "Save" button
3. Wait for "Saved ✓" message
4. Settings persist across browser sessions

### Reset to Defaults
1. Click "Reset" button
2. All settings return to Aurora defaults
3. Click "Save" to confirm

---

## Advanced Usage

### Custom Presets
Currently no UI for saving custom presets, but you can:
1. Adjust all settings to your preference
2. Note the exact values
3. Manually recreate by entering values again

### Keyboard Shortcuts
- No global shortcuts yet
- Use popup menu to control effects

### Multiple GitHub Projects
Effects apply globally to all github.com pages. Switching repos will maintain same effects.

### Testing on Different Monitors
- High resolution: Increase blur amount for smooth blur
- Low resolution: Decrease blur to avoid pixelation
- Small screen: Reduce proximity distance

---

## Performance Considerations

### GPU Impact
- **High**: High blur + matrix + glow + 3D effects
- **Medium**: Moderate settings across all tabs
- **Low**: Minimal theme, low blur, no effects

### CPU Impact
- **High**: Matrix background enabled
- **Medium**: 3D transforms on many elements
- **Low**: No matrix, no 3D effects

### Memory Impact
- **High**: Matrix canvas + 3D transforms on many elements
- **Medium**: Normal usage with all effects
- **Low**: Minimal theme or effects disabled

### Battery Impact (Laptops)
Enabling less effects = longer battery life. Matrix background in particular drains battery.

---

## Support & Issues

### Getting Help
1. Check Troubleshooting section above
2. Read README.md for feature explanations
3. Review DESIGN.md for technical details

### Reporting Issues
When reporting issues, include:
1. Chrome/Edge version
2. Operating system
3. What you expected vs. what happened
4. Steps to reproduce
5. Screenshot if relevant

### Performance Issues
If experiencing lag:
1. Lower blur amount first
2. Disable matrix background
3. Lower motion speed
4. Disable 3D effects
5. Disable proximity effects

---

## Updating the Extension

### Check for Updates
Extension updates are manual (not automatic in developer mode).

### To Update
1. Download new version files
2. Replace old files with new ones
3. Go to `chrome://extensions/`
4. Click reload icon on the extension
5. Effects will update

### Version Info
Current version shown in extension popup as "v4.0"

---

## Privacy & Security

### What Data is Collected
- **NONE** - This extension collects zero data
- No tracking
- No analytics
- No external connections

### What the Extension Can Access
- Current tab URL (only to detect github.com)
- Chrome storage (only for saving your settings)
- Visual rendering of github.com (effects only)

### Local Storage Only
All settings stored locally on your computer in Chrome's storage. Nothing sent to servers.

---

## Frequently Asked Questions

**Q: Will this slow down my computer?**
A: Minimal impact. Adjust blur/effects if you notice slowness.

**Q: Does this require internet?**
A: No. Works offline. Only needs active GitHub tab.

**Q: Can I use this with other extensions?**
A: Yes! Works with most extensions. May conflict with other GitHub theme extensions.

**Q: Will GitHub update break this?**
A: Possibly. GitHub changes may require extension updates. Check for updates periodically.

**Q: Can I use this on other websites?**
A: Currently limited to github.com. Could be extended to other sites in future versions.

**Q: How do I uninstall it?**
A: Go to `chrome://extensions/`, find extension, click trash icon.

---

## Next Steps

1. ✅ Install the extension
2. ✅ Test it on github.com
3. ✅ Adjust settings to your preference
4. ✅ Save your favorite configuration
5. ✅ Enjoy enhanced GitHub!

---

Need more help? Check README.md or DESIGN.md files included with the extension.

**Happy GitHub-ing! 🎨**

---

## v4.1.0 Verification

After loading the updated unpacked extension:

1. Confirm Chrome shows no manifest/icon errors on `chrome://extensions/`.
2. Open GitHub and verify the glass effect activates.
3. Open the popup and test all four tabs.
4. Move the pointer near cards and compare different proximity sensitivity values.
5. Increase Card lift and confirm the 3D depth response becomes more pronounced.
6. Enable Matrix, then enable your operating system/browser reduced-motion preference and confirm Matrix animation stops.
7. Navigate between GitHub repository pages and confirm effects continue to apply.
8. Reload the extension and confirm settings persist.

The original installation and troubleshooting instructions above remain valid.
