# 🤝 Contributing to Chrome UI Gallery

Thank you for helping build a browser gallery that is useful and easy to navigate. **Beginners and experienced developers are equally welcome.**

[← Home](./README.md) · [Azərbaycan dili](./CONTRIBUTING.az.md) · [Community conduct](./CODE_OF_CONDUCT.md)

## The easy contribution workflow

1. **Fork** this repository on GitHub.
2. **Clone your fork** locally and create a new branch.
3. Add one focused tool, design, bug fix or documentation improvement.
4. Test locally and run **node scripts/validate.mjs**.
5. Commit your changes and push the branch to your fork.
6. Open a **Pull Request** to **main**, complete the template, and respond to review comments.

~~~bash
git clone https://github.com/YOUR-USERNAME/chrome-ui-gallery.git
cd chrome-ui-gallery
git switch -c add/my-extension
# make changes and test
node scripts/validate.mjs
git add .
git commit -m "feat(tools): add my-extension"
git push -u origin add/my-extension
~~~

**Never commit credentials, auth cookies, access tokens, .env secrets, or personal browsing data.**

## Add a new tool

A tool is a standalone browser utility, not just a visual theme.

1. Create **Tools/your-tool-name/** (lowercase kebab-case; unique, descriptive).
2. Copy files from [the tool starter](./templates/chrome-extension-tool/README.md) and replace sample functionality with your own.
3. Include a **working Manifest V3 manifest.json**, all referenced assets and a **README.md**.
4. In your README include: purpose, author/GitHub handle, features, screenshots if available, exact permissions and why needed, installation, usage, limitations, tests and license.
5. Do not include a nested **.git/** folder, downloaded third-party binaries, obfuscated scripts, remote executable code, undisclosed analytics or tracking.
6. Document all network requests, external services, data storage and permissions clearly.
7. Update the table in [Tools/README.md](./Tools/README.md) to list your new tool.
8. Run the repository validator and test **Load unpacked** in a clean Chrome profile.

**Required layout:**

~~~text
Tools/
└── your-tool-name/
    ├── README.md
    ├── manifest.json
    ├── popup.html
    ├── popup.js
    ├── styles.css
    └── icons/       (if referenced by the manifest)
~~~

Files beyond those shown depend on your feature set. No build framework is required.

## Add a new UI design

A visual theme belongs in a platform's style collection. **Keep existing platform paths intact** so old links continue working.

1. Pick a platform folder, for example **chatgpt/**; if it does not exist, create a platform README and add it to [ui/README.md](./ui/README.md) and root README.
2. Under that platform, use an existing style (for example **glassmorphism/**), or create a clearly named style folder.
3. Give every new design its own unique directory. Do not overwrite a prior design.
4. Add **design.md**, **manifest.json**, source files, and optional previews.
5. Fill out [the design document template](./templates/ui-design/design-template.md) and list real paths for the files.
6. Update that platform's README, style README where used, and [UI directory](./ui/README.md).

**Example:** **chatgpt/glassmorphism/your-unique-design/design.md**.

## Review and acceptance criteria

A maintainer reviews functionality, documentation, permission scope, license/provenance, relative links and code safety. We may request changes; not every submission can be accepted. Contributors retain authorship of their original work while granting the project's stated license for contributions they submit, unless a separately disclosed compatible license is approved.

- One project per pull request when possible.
- Preserve existing user paths, features and settings unless change is intentional.
- Prefer no dependency, no bundler and limited permissions.
- Explain how to reproduce or manually test your change.
- For UI designs, include an accessibility/reduced-motion note.
- Respect trademarks: themes are **unofficial** and not endorsed by their target platforms.

## Licenses and third-party work

This project uses [MIT](./LICENSE) for project-owned original content. **Only submit code you own or are authorized to share under a compatible license.** Identify third-party assets, library versions, original authors, source links and relevant notices in your project README. Don't copy proprietary website code, branding assets or copyrighted images without permission. See [LICENSES.md](./LICENSES.md).

## Security reports

**Do not open public issues for active vulnerabilities or publish tokens.** Use [SECURITY.md](./SECURITY.md) for private reporting options.

## Help and discussion

- [Open an issue](https://github.com/RuslanSharifov/chrome-ui-gallery/issues/new/choose) for bugs, feature ideas and tool proposals.
- [Browse pull requests](https://github.com/RuslanSharifov/chrome-ui-gallery/pulls) to see ongoing work.
- [Read community governance](./GOVERNANCE.md).
