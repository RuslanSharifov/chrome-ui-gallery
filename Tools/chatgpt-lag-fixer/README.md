# ChatGPT Lag Fixer

[← All tools](../README.md) · [Gallery home](../../README.md) · [DevLens](../devlens/README.md)

A Chrome extension that reduces freezing and lag in long ChatGPT conversations.

## Features

- **Viewport rendering:** uses `content-visibility: auto` so off-screen messages are not rendered.
- **Lightweight old messages:** removes animations, transitions and blur effects from older messages.
- **Cheap DOM observer:** debounced updates keep the page responsive while streaming.
- **Configurable:** toggle features and choose how many recent messages stay fully active.
- **Privacy-friendly:** no data collection, no network requests.

## Optional support

The extension popup includes a Ko-fi-style support button (blue `#72a4f2`) linking to [Support me on Ko-fi](https://ko-fi.com/U0D62868E3). Chrome Manifest V3 blocks remotely hosted JavaScript in extension pages, so the button is implemented locally instead of loading `Widget_2.js`. Opening Ko-fi is optional and does not affect the optimization features.

## Installation

See the [Installation Guide](INSTALL.md) for step-by-step instructions on loading the extension in Chrome.

## Usage

Click the extension icon to change settings. Changes apply immediately.

## Compatibility

Works on `chatgpt.com` and `chat.openai.com`. ChatGPT's HTML structure may change; if the fix stops working, check the `[data-message-author-role]` selector in `content.js`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Licensed under the [MIT License](LICENSE). Other license options are listed in [licenses/](licenses/README.md).
