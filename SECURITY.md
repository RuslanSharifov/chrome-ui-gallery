# Security policy

[← Home](./README.md) · [Contributing](./CONTRIBUTING.md)

## Supported code

Community browser extensions and themes are updated independently. No support or security patch SLA is guaranteed; check each extension README and commit history.

## Report a vulnerability privately

**Do not publish working exploits, credentials, security tokens, browser cookies, or personal data in public issues.**

1. Visit the [repository Security page](https://github.com/RuslanSharifov/chrome-ui-gallery/security).
2. If **Private vulnerability reporting** is available, use it to submit a private report. The repository owner may need to enable it in Settings.
3. Otherwise, use the owner's private GitHub contact channel; avoid posting exploit details in public issues.

Include the affected folder, extension version, how to reproduce safely, impact and suggested fix when known. Do not test on accounts, devices or data you do not own.

## Maintainer checklist

- Review any new host permissions, especially **<all_urls>**, cookies, scripting, tabs, downloads or browsingData.
- Reject hardcoded secrets, data exfiltration, hidden network beacons, remote executable code and unauthorized tracking.
- Avoid loading JavaScript from a CDN into extension contexts; follow Manifest V3 remote code restrictions.
- Verify packaged file paths and source provenance.
- Keep third-party licenses and notices.

## User safety

Read an extension's **manifest.json** before loading it. Chrome's Load unpacked feature is intended for local development/testing; only run code you trust.
