# ChatGPT Lag Fixer

[← All tools](../README.md) · [Gallery home](../../README.md) · [DevLens](../devlens/README.md)

A Chrome extension that reduces freezing and lag in long ChatGPT conversations.

## Features

- **Viewport rendering:** uses `content-visibility: auto` so off-screen messages are not rendered.
- **Lightweight old messages:** removes animations, transitions and blur effects from older messages.
- **Cheap DOM observer:** debounced updates keep the page responsive while streaming.
- **Configurable:** toggle features and choose how many recent messages stay fully active.
- **Privacy-friendly:** no data collection, no network requests.

## Optional support\n\nThe extension popup can display a **Support on Ko-fi** link when enabled by the gallery's shared public `support-config.json`. The link is hidden if offline or disabled. No account or usage data is sent to Ko-fi; only clicking the link opens Ko-fi.\n\n## Installation

See the [Installation Guide](INSTALL.md) for step-by-step instructions on loading the extension in Chrome.

## Usage

Click the extension icon to change settings. Changes apply immediately.

## Compatibility

Works on `chatgpt.com` and `chat.openai.com`. ChatGPT's HTML structure may change; if the fix stops working, check the `[data-message-author-role]` selector in `content.js`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Licensed under the [MIT License](LICENSE). Other license options are listed in [licenses/](licenses/README.md).
