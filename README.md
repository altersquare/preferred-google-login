# Preferred Google Login

A Chrome extension that automatically adds the `authuser` parameter to Google domains, allowing you to set your preferred Google account for each service.

![Chrome Web Store](https://img.shields.io/chrome-web-store/v/preferred-google-login)
![License](https://img.shields.io/github/license/altersquareio/preferred-google-login)

## Overview

If you use multiple Google accounts (personal, work, school), you know the frustration of constantly being logged into the wrong account when visiting different Google services. This extension solves that problem by automatically adding the appropriate `authuser` parameter to URLs based on the domain, ensuring you're always using your preferred account for each Google service.

## Features

- **Domain-Specific Account Selection**: Set different preferred accounts for different Google domains (e.g., YouTube, Gmail, Drive)
- **Auto-Redirect**: Automatically redirects to add the `authuser` parameter when you visit a configured Google domain
- **Smart Loop Prevention**: Intelligently prevents redirect loops
- **Google Domain Autocomplete**: Includes autocomplete suggestions for popular Google domains
- **User-Friendly Interface**: Clean, modern UI with toggle to quickly enable/disable the extension
- **Multiple Account Support**: Easily manage multiple Google accounts across different services
- **Privacy-Focused**: No data collection, all settings stored locally in your browser

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
   - Enter a Google domain (or select from autocomplete suggestions)
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

The extension supports numerous Google domains, including:
- google.com
- youtube.com
- mail.google.com
- drive.google.com
- docs.google.com
- cloud.google.com
- meet.google.com
- photos.google.com
- gemini.google.com
- classroom.google.com
- and many more!

## How It Works

The extension:
1. Checks if the current website is a Google domain
2. Determines if you've configured a preferred account for that domain
3. Adds the appropriate `authuser` parameter to the URL
4. Implements safeguards to prevent redirect loops
5. Provides an intuitive UI for managing your preferences

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

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Rohan Dhamapurkar - dhamapurkar54@gmail.com  
Project: [https://github.com/altersquareio/preferred-google-login](https://github.com/altersquareio/preferred-google-login)
