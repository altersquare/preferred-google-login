# Preferred Google Login

A Chrome extension that automatically adds the `authuser` parameter to Google domains, allowing you to set your preferred Google account for each service.

## Description

If you use multiple Google accounts, you know the frustration of constantly being logged into the wrong account when visiting different Google services. This extension solves that problem by automatically adding the appropriate `authuser` parameter to URLs based on the domain, ensuring you're always using your preferred account for each Google service.

## Features

- **Domain-Specific Account Selection**: Set different preferred accounts for different Google domains (e.g., YouTube, Gmail, Drive)
- **Auto-Redirect**: Automatically redirects to add the `authuser` parameter when you visit a configured Google domain
- **Smart Loop Prevention**: Intelligently prevents redirect loops by tracking modified URLs
- **Google Domain Autocomplete**: Includes autocomplete suggestions for popular Google domains
- **User-Friendly Interface**: Clean, modern UI with toggle to quickly enable/disable the extension
- **Multiple Account Support**: Easily manage multiple Google accounts across different services

## Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/) and search for "Preferred Google Login"
2. Click "Add to Chrome"

### Manual Installation (Developer Mode)
1. Download or clone this repository:
   ```bash
   git clone https://github.com/altersquareio/preferred-google-login.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the directory containing the extension files

## Usage

1. Click the extension icon in your browser toolbar
2. Toggle the extension on/off using the switch in the header
3. Add domain and email pairs:
   - Click "Add Domain" to create a new entry
   - Enter a Google domain (e.g., `youtube.com`, `mail.google.com`)
   - Enter the Gmail address you prefer to use for that domain
4. Click "Save Changes" to apply your settings
5. Visit any Google service - the extension will automatically redirect you to use your preferred account

## Domain Configuration Examples

| Domain | Email | Result |
|--------|-------|--------|
| youtube.com | work@gmail.com | YouTube always uses your work account |
| mail.google.com | personal@gmail.com | Gmail always opens with your personal account |
| drive.google.com | school@gmail.com | Google Drive defaults to your school account |

## Supported Google Domains

The extension includes autocomplete suggestions for many Google domains, including:
- google.com
- youtube.com
- mail.google.com
- drive.google.com
- docs.google.com
- cloud.google.com
- meet.google.com
- photos.google.com
- and many more!

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses Chrome's Storage API for persistent settings
- Content script runs at document start to ensure timely redirects
- Modern ES6+ JavaScript features for clean, maintainable code
- Responsive UI design that works across different screen sizes
- Code formatting with Prettier and linting with ESLint

## Privacy

This extension:
- Does NOT collect any user data
- Does NOT send any information to external servers
- Stores your domain-email preferences only in your browser's local storage
- Requires minimal permissions (only storage and scripting)

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

### Project Structure

```
├── .vscode            # VS Code configuration
├── icons              # Extension icons in various sizes
├── src                # Source code
│   ├── content.js     # Content script for adding authuser parameter
│   ├── popup.html     # Extension popup interface
│   └── popup.js       # Popup functionality
├── .gitignore         # Git ignore file
├── .prettierrc.js     # Prettier configuration
├── eslint.config.mjs  # ESLint configuration
├── LICENSE            # MIT License
├── manifest.json      # Chrome extension manifest
├── package.json       # NPM package configuration
└── README.md          # This file
```

### Getting Started

```bash
# Install dependencies
npm install

# Run lint checks
npm run lint

# Format code
npm run format
```

## License

```
MIT License

Copyright (c) 2025 Rohan Dhamapurkar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Contact

Rohan Dhamapurkar - dhamapurkar54@gmail.com  
Project: [https://github.com/altersquareio/preferred-google-login](https://github.com/altersquareio/preferred-google-login)
