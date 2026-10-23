# Desktop releases and updates

Electron's `electron-updater` is wired to GitHub Releases for installed builds. The app checks on launch, downloads newer releases and offers to restart to install them.

## Windows release

1. Configure code-signing secrets `WINDOWS_CSC_LINK` and `WINDOWS_CSC_KEY_PASSWORD` in GitHub Actions for a trusted signed build.
2. Update `apps/desktop/package.json` version to the next version (for example `0.2.0`).
3. Tag the version `desktop-v0.2.0` and push the tag. The [release workflow](../../.github/workflows/desktop-release.yml) builds an NSIS installer and publishes the installer and update metadata to GitHub Releases.
4. Test installation and update from the previous release before promoting to users.

For an initial release without a signing certificate, Windows may show SmartScreen warnings; production distribution should use signed binaries. The workflow permits unsigned release builds when secrets aren't configured, but these are not recommended for public distribution.

## macOS

Run `npm run dist:mac` on a macOS machine with Apple Developer signing and notarization configured. Unsigned and unnotarized installers are not suitable for public distribution. macOS release automation is intentionally not enabled until signing credentials are provisioned.

Never commit certificates, private keys, API tokens or credentials into this repository. Releases and updates are not magically enabled by source code alone; installers must first be published.
