# Central support settings

Edit only [support-config.json](./support-config.json) to change Ko-fi account or visibility:

```json
{"provider":"ko-fi","account":"ruslansharifov","enabled":true}
```

The website, gallery dialogs, Desktop App, DevLens and Cookie Manager Pro fetch the published config over HTTPS (no cached fallback) and show donation UI **only when reachable online and enabled**. Existing open dialogs may need to be closed and reopened after a configuration change. Chrome extension popup permissions include access to the published GitHub Pages host. No donation SDK runs in a browser extension.

**GitHub README and Sponsor metadata cannot run JavaScript**. Run `node scripts/sync-support.mjs` to synchronize them from this same JSON file. A GitHub Actions workflow also creates a pull request when this config changes on main; merge that PR to update README and FUNDING.yml. GitHub Actions repository settings must allow the workflow token to create pull requests.

If you modify the account, wait for GitHub Pages publication before expecting runtime surfaces to show the new link. Offline means the support UI stays hidden instead of using stale account information.
