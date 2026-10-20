# ChatGPT Lag Fixer

A Chrome extension that reduces freezing and lag in long ChatGPT conversations.

## Features

- **Viewport rendering:** uses `content-visibility: auto` so off-screen messages are not rendered.
- **Lightweight old messages:** removes animations, transitions and blur effects from older messages.
- **Cheap DOM observer:** debounced updates keep the page responsive while streaming.
- **Configurable:** toggle features and choose how many recent messages stay fully active.
- **Privacy-friendly:** no data collection, no network requests.

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
