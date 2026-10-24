# Quick QR

![Quick QR](./icon.svg)

QR sharing for everyone: turn the current browser tab or typed text into a scannable QR code, copy text, or save the QR as PNG. No account or external QR API; generation happens locally.

## Install

1. Open `chrome://extensions`, enable **Developer mode**.
2. Click **Load unpacked** and select `Tools/quick-qr`.
3. Open the popup and choose **Use current tab**, or enter custom text and click **Generate QR**.
4. Scan the image or click **Download PNG**.

The code is generated locally using the MIT-licensed [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) library; see [vendor/LICENSE](./vendor/LICENSE). The optional Ko-fi card reads the public project config only when online. Your entered URL/text is never sent to a QR API.

## Files

- [Popup](./popup.html) · [Popup script](./popup.js) · [Style](./popup.css)
- [Extension manifest](./manifest.json)
- [QR engine](./vendor/qrcode.js) · [MIT license](./vendor/LICENSE)
